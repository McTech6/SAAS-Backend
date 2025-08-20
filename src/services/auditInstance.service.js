// src/services/auditInstance.service.js
import AuditInstance from '../models/auditInstance.model.js';
import Company from '../models/company.model.js';
import User from '../models/user.model.js'; // <- Ensure this is imported
import companyService from './company.service.js';
import puppeteer from 'puppeteer';
import generateReportHtml from '../utils/reportGenerator.js';
import AuditTemplate from '../models/auditTemplate.model.js'; // <- Make sure your template model is imported

class AuditInstanceService {
  /* -------------------------------------------------- */
  /*  CREATE AUDIT INSTANCE                             */
  /* -------------------------------------------------- */
  async createAuditInstance(data, requestingUser) {
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

    // -------------------------------
    // Validate assigned auditors
    // Only auditors managed by the requesting user can be assigned
    let finalAssignedAuditors = [];
    if (assignedAuditorIds && assignedAuditorIds.length > 0) {
      const auditors = await User.find({
        _id: { $in: assignedAuditorIds },
        role: 'auditor',
        managerId: requestingUser.id
      });

      if (auditors.length !== assignedAuditorIds.length) {
        throw new Error('One or more provided auditor IDs are invalid or not under your management.');
      }

      finalAssignedAuditors = assignedAuditorIds;
    }
    // -------------------------------

    const newAuditInstance = new AuditInstance({
      company: companyId,
      template: auditTemplateId,
      templateNameSnapshot: auditTemplate.name,
      templateVersionSnapshot: auditTemplate.version,
      templateStructureSnapshot,
      assignedAuditors: finalAssignedAuditors,
      startDate: startDate || new Date(),
      endDate,
      status: 'Draft',
      responses: initialResponses,
      createdBy: requestingUser.id,
      lastModifiedBy: requestingUser.id
    });

    await newAuditInstance.save();
    return newAuditInstance.populate([
      { path: 'company', select: 'name industry contactPerson' },
      { path: 'template', select: 'name version' },
      { path: 'assignedAuditors', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName email' }
    ]);
  }

  /* -------------------------------------------------- */
  /*  GET ALL AUDIT INSTANCES                           */
  /* -------------------------------------------------- */
  async getAllAuditInstances(requestingUser) {
    let query = {};

    if (requestingUser.role === 'super_admin' || requestingUser.role === 'admin') {
      const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
      const managedAuditorIds = managedAuditors.map(a => a._id);

      query = {
        $or: [
          { createdBy: requestingUser.id },
          { assignedAuditors: { $in: [requestingUser.id, ...managedAuditorIds] } }
        ]
      };
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

    if (requestingUser.role === 'super_admin' && isCreator) return audit;
    if (requestingUser.role === 'admin' && isCreator) return audit;
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
    const audit = await AuditInstance.findById(auditInstanceId);
    if (!audit) throw new Error('Audit Instance not found.');

    const isCreator = audit.createdBy.toString() === requestingUser.id;

    if (requestingUser.role === 'auditor') throw new Error('Auditors cannot delete audits.');
    if (requestingUser.role === 'admin' && (!isCreator || ['Completed', 'Archived'].includes(audit.status))) {
      throw new Error('Admins can only delete their own non-completed audits.');
    }

    await AuditInstance.findByIdAndDelete(auditInstanceId);
  }

  /* -------------------------------------------------- */
  /*  ASSIGN AUDITORS  (single call, multiple ids)      */
  /* -------------------------------------------------- */
  async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
    const audit = await AuditInstance.findById(auditInstanceId);
    if (!audit) throw new Error('Audit instance not found.');

    // Ensure all ids are valid auditors created by the requester
    const filter = { _id: { $in: auditorIds }, role: 'auditor', managerId: requestingUserId };
    const auditors = await User.find(filter);
    if (auditors.length !== auditorIds.length) {
      throw new Error('One or more provided auditor IDs are invalid or not under your management.');
    }

    audit.assignedAuditors = auditorIds;
    audit.lastModifiedBy = requestingUserId;
    await audit.save();

    return audit.populate([
      { path: 'company', select: 'name' },
      { path: 'template', select: 'name version' },
      { path: 'assignedAuditors', select: 'firstName lastName email' },
      { path: 'createdBy', select: 'firstName lastName email' },
      { path: 'lastModifiedBy', select: 'firstName lastName email' }
    ]);
  }

  /**
   * Generates a PDF report for an audit instance.
   */
  async generateReport(auditInstanceId, requestingUser) {
    const audit = await AuditInstance.findById(auditInstanceId)
      .populate('company')
      .populate('createdBy', 'firstName lastName email')
      .populate('template', 'name version');

    if (!audit) throw new Error('Audit Instance not found.');
    if (audit.status !== 'Completed') throw new Error('Report can only be generated for completed audits.');

    const creatorId = audit.createdBy?._id ? audit.createdBy._id.toString() : audit.createdBy.toString();
    const requestingUserIdStr = requestingUser.id.toString();
    const isCreator = creatorId === requestingUserIdStr;
    const isAssignedAuditor = audit.assignedAuditors.some(auditorId =>
      auditorId.toString() === requestingUserIdStr
    );

    if (!isCreator && !isAssignedAuditor) {
      throw new Error('You are not authorized to generate a report for this audit instance.');
    }

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
      footerTemplate: `
        <div style="font-size:9pt;text-align:center;width:100%">
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
