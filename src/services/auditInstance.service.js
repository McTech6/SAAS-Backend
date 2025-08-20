// src/services/auditInstance.service.js
import AuditInstance from '../models/auditInstance.model.js';
import Company from '../models/company.model.js';
import AuditTemplate from '../models/auditTemplate.model.js';
import companyService from './company.service.js';
import puppeteer from 'puppeteer';
import generateReportHtml from '../utils/reportGenerator.js';

// Helper function to import User model when needed
async function getUserModel() {
  try {
    const { default: User } = await import('../models/user.model.js');
    return User;
  } catch (error) {
    console.error('Failed to import User model:', error.message);
    throw new Error(`User model not available: ${error.message}`);
  }
}

class AuditInstanceService {
  /* -------------------------------------------------- */
  /*  CREATE AUDIT INSTANCE                             */
  /* -------------------------------------------------- */
  async createAuditInstance(data, requestingUser) {
    console.log('[createAuditInstance] Data received:', data);
    console.log('[createAuditInstance] Requesting user:', requestingUser);

    const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate } = data;

    let companyId;
    if (companyDetails) {
      const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
      companyId = newCompany._id;
    } else if (existingCompanyId) {
      const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
      if (!existingCompany) throw new Error('Existing company not found or you do not have access to it.');
      companyId = existingCompany._id;
    } else {
      throw new Error('Either companyDetails or existingCompanyId must be provided.');
    }

    const auditTemplate = await AuditTemplate.findById(auditTemplateId);
    if (!auditTemplate) throw new Error('Audit Template not found.');

    const templateStructureSnapshot = JSON.parse(JSON.stringify(auditTemplate.sections.toObject()));

    const initialResponses = [];
    templateStructureSnapshot.forEach(section => {
      section.subSections.forEach(subSection => {
        subSection.questions.forEach(question => {
          initialResponses.push({
            questionId: question._id,
            questionTextSnapshot: question.text,
            questionTypeSnapshot: question.type,
            answerOptionsSnapshot: question.answerOptions,
            comment: '',
            includeCommentInReport: question.includeCommentInReportDefault,
            score: 0,
            auditorId: requestingUser.id,
            lastUpdated: new Date()
          });
        });
      });
    });

    const newAuditInstance = new AuditInstance({
      company: companyId,
      template: auditTemplateId,
      templateNameSnapshot: auditTemplate.name,
      templateVersionSnapshot: auditTemplate.version,
      templateStructureSnapshot,
      assignedAuditors: assignedAuditorIds || [],
      startDate: startDate || new Date(),
      endDate,
      status: 'Draft',
      responses: initialResponses,
      createdBy: requestingUser.id,
      lastModifiedBy: requestingUser.id
    });

    await newAuditInstance.save();
    console.log('[createAuditInstance] Audit instance created:', newAuditInstance._id);

    try {
      return await newAuditInstance.populate([
        { path: 'company', select: 'name industry contactPerson' },
        { path: 'template', select: 'name version' },
        { path: 'assignedAuditors', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName email' }
      ]);
    } catch (populateError) {
      console.error('[createAuditInstance] Population error:', populateError.message);
      // Return the audit instance without population if there's an issue
      return newAuditInstance;
    }
  }

  /* -------------------------------------------------- */
  /*  GET ALL AUDIT INSTANCES                           */
  /* -------------------------------------------------- */
  async getAllAuditInstances(requestingUser) {
    let query = {};

    if (requestingUser.role === 'super_admin' || requestingUser.role === 'admin') {
      try {
        const User = await getUserModel();
        const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
        const managedAuditorIds = managedAuditors.map(a => a._id);

        query = {
          $or: [
            { createdBy: requestingUser.id },
            { assignedAuditors: { $in: [requestingUser.id, ...managedAuditorIds] } }
          ]
        };
      } catch (error) {
        console.error('Error in getAllAuditInstances with User model:', error.message);
        // Fallback query without managed auditors
        query = {
          $or: [
            { createdBy: requestingUser.id },
            { assignedAuditors: requestingUser.id }
          ]
        };
      }
    } else if (requestingUser.role === 'auditor') {
      query = {
        $or: [
          { createdBy: requestingUser.id },
          { assignedAuditors: requestingUser.id }
        ]
      };
    } else {
      throw new Error('Unauthorized role to view audit instances.');
    }

    return AuditInstance.find(query)
      .populate('company', 'name industry')
      .populate('template', 'name version')
      .populate('assignedAuditors', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');
  }

  /* -------------------------------------------------- */
  /*  GET SINGLE AUDIT INSTANCE                         */
  /* -------------------------------------------------- */
  async getAuditInstanceById(auditInstanceId, requestingUser) {
    const audit = await AuditInstance.findById(auditInstanceId)
      .populate('company', 'name industry contactPerson address website')
      .populate('template', 'name version')
      .populate('assignedAuditors', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email');

    if (!audit) throw new Error('Audit Instance not found.');

    const isCreator = audit.createdBy.toString() === requestingUser.id;
    const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id);

    if ((requestingUser.role === 'super_admin' || requestingUser.role === 'admin') && isCreator) return audit;
    if (requestingUser.role === 'auditor' && (isCreator || isAssigned)) return audit;

    throw new Error('You are not authorized to view this audit instance.');
  }

  /* -------------------------------------------------- */
  /*  EDIT-PERMISSION HELPER                            */
  /* -------------------------------------------------- */
  _canEdit(audit, user) {
    const isCreator = audit.createdBy.toString() === user.id;
    const isAssigned = audit.assignedAuditors.some(a => a.toString() === user.id);
    return isCreator || isAssigned;
  }

  /* -------------------------------------------------- */
  /*  SUBMIT RESPONSES                                  */
  /* -------------------------------------------------- */
  async submitResponses(auditInstanceId, responsesData, requestingUser) {
    const audit = await AuditInstance.findById(auditInstanceId);
    if (!audit) throw new Error('Audit Instance not found.');
    if (!this._canEdit(audit, requestingUser)) throw new Error('You are not authorized to edit this audit.');

    if (audit.status === 'Completed' || audit.status === 'Archived') {
      throw new Error(`Cannot submit responses. Audit is already ${audit.status}.`);
    }

    if (audit.status === 'Draft' && responsesData?.length) audit.status = 'In Progress';

    for (const resp of responsesData) {
      const { questionId, selectedValue, comment, includeCommentInReport, evidenceUrls } = resp;
      let ex = audit.responses.find(r => r.questionId.toString() === questionId);
      const q = audit.templateStructureSnapshot
        .flatMap(s => s.subSections)
        .flatMap(ss => ss.questions)
        .find(q => q._id.toString() === questionId);

      if (!q) continue;
      const score = this._calcScore(q, selectedValue);

      if (ex) {
        Object.assign(ex, { selectedValue, comment, includeCommentInReport, evidenceUrls, auditorId: requestingUser.id, lastUpdated: new Date(), score });
      } else {
        audit.responses.push({
          questionId, questionTextSnapshot: q.text, questionTypeSnapshot: q.type,
          answerOptionsSnapshot: q.answerOptions, selectedValue, comment, includeCommentInReport,
          evidenceUrls, score, auditorId: requestingUser.id, lastUpdated: new Date()
        });
      }
    }

    audit.overallScore = this._calculateOverallScore(audit);
    audit.lastModifiedBy = requestingUser.id;
    await audit.save();
    return audit;
  }

  /* -------------------------------------------------- */
  /*  UPDATE STATUS                                     */
  /* -------------------------------------------------- */
  async updateAuditStatus(auditInstanceId, newStatus, requestingUser) {
    const audit = await AuditInstance.findById(auditInstanceId);
    if (!audit) throw new Error('Audit Instance not found.');
    if (!this._canEdit(audit, requestingUser)) throw new Error('You are not authorized to edit this audit.');

    const allowed = ['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'];
    if (!allowed.includes(newStatus)) throw new Error('Invalid status provided.');

    audit.status = newStatus;
    if (newStatus === 'Completed' && !audit.actualCompletionDate) audit.actualCompletionDate = new Date();
    else if (newStatus !== 'Completed') audit.actualCompletionDate = undefined;
    audit.lastModifiedBy = requestingUser.id;
    await audit.save();
    return audit;
  }

  /* -------------------------------------------------- */
  /*  DELETE AUDIT                                      */
  /* -------------------------------------------------- */
  async deleteAuditInstance(auditInstanceId, requestingUser) {
    console.log('[deleteAuditInstance] Requesting user:', requestingUser);
    const audit = await AuditInstance.findById(auditInstanceId);
    if (!audit) throw new Error('Audit Instance not found.');
    if (requestingUser.role !== 'super_admin' && requestingUser.role !== 'admin' && audit.createdBy.toString() !== requestingUser.id) {
      throw new Error('You are not authorized to delete this audit.');
    }
    await AuditInstance.findByIdAndDelete(auditInstanceId);
    console.log('[deleteAuditInstance] Audit deleted successfully.');
  }

  /* -------------------------------------------------- */
  /*  ASSIGN AUDITORS                                   */
  /* -------------------------------------------------- */
  async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
    try {
      console.log('[assignAuditors] auditInstanceId:', auditInstanceId, 'auditorIds:', auditorIds);
      
      const User = await getUserModel();
      console.log('[assignAuditors] User model loaded successfully');

      const audit = await AuditInstance.findById(auditInstanceId);
      if (!audit) throw new Error('Audit Instance not found.');

      if (requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
        throw new Error('You are not authorized to assign auditors.');
      }

      // Validate that all auditor IDs are valid users with auditor role
      const auditors = await User.find({
        _id: { $in: auditorIds },
        role: 'auditor'
      }).select('_id firstName lastName email managerId');

      console.log('[assignAuditors] Auditors found:', auditors.length);
      console.log('[assignAuditors] Auditors details:', auditors.map(a => ({ 
        id: a._id, 
        name: `${a.firstName} ${a.lastName}`,
        managerId: a.managerId 
      })));

      if (auditors.length === 0) {
        throw new Error('No valid auditors found with the provided IDs.');
      }

      if (auditors.length !== auditorIds.length) {
        throw new Error('Some of the provided auditor IDs are invalid or do not have auditor role.');
      }

      // For non-super_admin, check if all auditors are under their management
      if (requestingUserRole !== 'super_admin') {
        const unauthorizedAuditors = auditors.filter(auditor => 
          auditor.managerId?.toString() !== requestingUserId.toString()
        );
        
        if (unauthorizedAuditors.length > 0) {
          console.log('[assignAuditors] Unauthorized auditors:', unauthorizedAuditors.map(a => a._id));
          throw new Error('One or more auditors are not under your management.');
        }
      }

      audit.assignedAuditors = auditorIds;
      audit.lastModifiedBy = requestingUserId;
      await audit.save();

      console.log('[assignAuditors] Auditors assigned successfully.');
      return audit.populate([
        { path: 'company', select: 'name' },
        { path: 'template', select: 'name version' },
        { path: 'assignedAuditors', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'lastModifiedBy', select: 'firstName lastName email' }
      ]);
    } catch (error) {
      console.error('[assignAuditors] Error:', error.message);
      throw error;
    }
  }

  /* -------------------------------------------------- */
  /*  GENERATE PDF REPORT                                */
  /* -------------------------------------------------- */
  async generateReport(auditInstanceId, requestingUser) {
    console.log('[generateReport] auditInstanceId:', auditInstanceId);
    const audit = await this.getAuditInstanceById(auditInstanceId, requestingUser);
    const html = generateReportHtml(audit);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `<div style="font-size:9pt;text-align:center;width:100%">
                         <span class="pageNumber"></span> / <span class="totalPages"></span>
                       </div>`
    });
    await browser.close();
    return pdfBuffer;
  }

  /* -------------- internal helpers ------------------ */
  _calcScore(question, value) {
    if (!question) return 0;
    if (question.type === 'single_choice' || question.type === 'multi_choice') {
      const opt = question.answerOptions.find(o => o.value === value);
      return opt ? opt.score : 0;
    }
    if (question.type === 'numeric' && typeof value === 'number') return value;
    return 0;
  }

  _calculateOverallScore(audit) {
    if (!audit.responses || !audit.responses.length) return 0;
    let total = 0, max = 0;
    audit.responses.forEach(r => {
      const q = audit.templateStructureSnapshot
        .flatMap(s => s.subSections)
        .flatMap(ss => ss.questions)
        .find(q => q._id.toString() === r.questionId.toString());
      if (q) { total += r.score; max += q.weight || 1; }
    });
    return max ? (total / max) * 100 : 0;
  }
}

export default new AuditInstanceService();