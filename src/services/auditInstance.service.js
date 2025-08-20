// src/services/auditInstance.service.js

import AuditInstance from '../models/auditInstance.model.js';
import Company from '../models/company.model.js';
import AuditTemplate from '../models/auditTemplate.model.js';
import User from '../models/user.model.js';
import companyService from './company.service.js';
import puppeteer from 'puppeteer';
import generateReportHtml from '../utils/reportGenerator.js';

console.log('[AUDIT_SERVICE] User model imported:', User);
console.log('[AUDIT_SERVICE] User model type:', typeof User);
console.log('[AUDIT_SERVICE] User model constructor name:', User?.constructor?.name);

class AuditInstanceService {
  /* -------------------------------------------------- */
  /* CREATE AUDIT INSTANCE                             */
  /* -------------------------------------------------- */
  async createAuditInstance(data, requestingUser) {
    console.log('[createAuditInstance] START - Data received:', data);
    console.log('[createAuditInstance] START - Requesting user:', requestingUser);
    console.log('[createAuditInstance] START - User model available:', !!User);

    try {
      const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate } = data;

      console.log('[createAuditInstance] Extracted data:', {
        hasCompanyDetails: !!companyDetails,
        existingCompanyId,
        auditTemplateId,
        assignedAuditorIds,
        startDate,
        endDate
      });

      let companyId;
      if (companyDetails) {
        console.log('[createAuditInstance] Creating new company...');
        const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
        companyId = newCompany._id;
        console.log('[createAuditInstance] New company created with ID:', companyId);
      } else if (existingCompanyId) {
        console.log('[createAuditInstance] Using existing company ID:', existingCompanyId);
        const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
        if (!existingCompany) throw new Error('Existing company not found or you do not have access to it.');
        companyId = existingCompany._id;
        console.log('[createAuditInstance] Existing company verified with ID:', companyId);
      } else {
        throw new Error('Either companyDetails or existingCompanyId must be provided.');
      }

      console.log('[createAuditInstance] Finding audit template:', auditTemplateId);
      const auditTemplate = await AuditTemplate.findById(auditTemplateId);
      if (!auditTemplate) throw new Error('Audit Template not found.');
      console.log('[createAuditInstance] Audit template found:', auditTemplate.name);

      console.log('[createAuditInstance] Creating template structure snapshot...');
      const templateStructureSnapshot = JSON.parse(JSON.stringify(auditTemplate.sections.toObject()));
      console.log('[createAuditInstance] Template structure snapshot created, sections count:', templateStructureSnapshot.length);

      console.log('[createAuditInstance] Creating initial responses...');
      const initialResponses = [];
      templateStructureSnapshot.forEach((section, sectionIndex) => {
        console.log(`[createAuditInstance] Processing section ${sectionIndex + 1}/${templateStructureSnapshot.length}`);
        section.subSections.forEach((subSection, subSectionIndex) => {
          console.log(`[createAuditInstance] Processing subsection ${subSectionIndex + 1}/${section.subSections.length}`);
          subSection.questions.forEach((question, questionIndex) => {
            console.log(`[createAuditInstance] Processing question ${questionIndex + 1}/${subSection.questions.length}`);
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
      console.log('[createAuditInstance] Initial responses created, count:', initialResponses.length);

      console.log('[createAuditInstance] Creating new audit instance...');
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

      console.log('[createAuditInstance] Saving audit instance...');
      await newAuditInstance.save();
      console.log('[createAuditInstance] Audit instance saved with ID:', newAuditInstance._id);

      try {
        console.log('[createAuditInstance] Populating audit instance...');
        const populatedAudit = await newAuditInstance.populate([
          { path: 'company', select: 'name industry contactPerson' },
          { path: 'template', select: 'name version' },
          { path: 'assignedAuditors', select: 'firstName lastName email' },
          { path: 'createdBy', select: 'firstName lastName email' }
        ]);
        console.log('[createAuditInstance] Audit instance populated successfully');
        return populatedAudit;
      } catch (populateError) {
        console.error('[createAuditInstance] Population error:', populateError.message);
        console.error('[createAuditInstance] Population error stack:', populateError.stack);
        return newAuditInstance;
      }
    } catch (error) {
      console.error('[createAuditInstance] ERROR:', error.message);
      console.error('[createAuditInstance] ERROR STACK:', error.stack);
      throw error;
    }
  }

  /* -------------------------------------------------- */
  /* GET ALL AUDIT INSTANCES                           */
  /* -------------------------------------------------- */
  async getAllAuditInstances(requestingUser) {
    console.log('[getAllAuditInstances] START - Requesting user:', requestingUser);
    console.log('[getAllAuditInstances] START - User model available:', !!User);
    console.log('[getAllAuditInstances] START - User model type:', typeof User);

    let query = {};

    try {
      if (requestingUser.role === 'super_admin' || requestingUser.role === 'admin') {
        console.log('[getAllAuditInstances] Processing admin/super_admin role');
        
        try {
          console.log('[getAllAuditInstances] About to query User model for managed auditors...');
          console.log('[getAllAuditInstances] User model before query:', User);
          console.log('[getAllAuditInstances] User model find method:', typeof User.find);
          
          if (!User || typeof User.find !== 'function') {
            throw new Error(`User model is not properly imported. User: ${User}, User.find: ${typeof User.find}`);
          }

          const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
          console.log('[getAllAuditInstances] Managed auditors found:', managedAuditors.length);
          console.log('[getAllAuditInstances] Managed auditors:', managedAuditors);
          
          const managedAuditorIds = managedAuditors.map(a => a._id);
          console.log('[getAllAuditInstances] Managed auditor IDs:', managedAuditorIds);

          query = {
            $or: [
              { createdBy: requestingUser.id },
              { assignedAuditors: { $in: [requestingUser.id, ...managedAuditorIds] } }
            ]
          };
          console.log('[getAllAuditInstances] Query created with managed auditors:', query);
        } catch (userError) {
          console.error('[getAllAuditInstances] Error querying User model:', userError.message);
          console.error('[getAllAuditInstances] User model error stack:', userError.stack);
          console.error('[getAllAuditInstances] User model at error time:', User);
          
          // Fallback query without managed auditors
          query = {
            $or: [
              { createdBy: requestingUser.id },
              { assignedAuditors: requestingUser.id }
            ]
          };
          console.log('[getAllAuditInstances] Fallback query created:', query);
        }
      } else if (requestingUser.role === 'auditor') {
        console.log('[getAllAuditInstances] Processing auditor role');
        query = {
          $or: [
            { createdBy: requestingUser.id },
            { assignedAuditors: requestingUser.id }
          ]
        };
        console.log('[getAllAuditInstances] Auditor query created:', query);
      } else {
        throw new Error('Unauthorized role to view audit instances.');
      }

      console.log('[getAllAuditInstances] Executing AuditInstance query...');
      const result = await AuditInstance.find(query)
        .populate('company', 'name industry')
        .populate('template', 'name version')
        .populate('assignedAuditors', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName email');

      console.log('[getAllAuditInstances] Query executed successfully, results count:', result.length);
      return result;
    } catch (error) {
      console.error('[getAllAuditInstances] ERROR:', error.message);
      console.error('[getAllAuditInstances] ERROR STACK:', error.stack);
      throw error;
    }
  }

  /* -------------------------------------------------- */
  /* GET SINGLE AUDIT INSTANCE                         */
  /* -------------------------------------------------- */
  async getAuditInstanceById(auditInstanceId, requestingUser) {
    console.log('[getAuditInstanceById] START - auditInstanceId:', auditInstanceId);
    console.log('[getAuditInstanceById] START - requestingUser:', requestingUser);

    try {
      const audit = await AuditInstance.findById(auditInstanceId)
        .populate('company', 'name industry contactPerson address website')
        .populate('template', 'name version')
        .populate('assignedAuditors', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName email');

      console.log('[getAuditInstanceById] Audit found:', !!audit);
      if (!audit) throw new Error('Audit Instance not found.');

      const isCreator = audit.createdBy.toString() === requestingUser.id;
      const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id);

      console.log('[getAuditInstanceById] Authorization check - isCreator:', isCreator, 'isAssigned:', isAssigned);

      if ((requestingUser.role === 'super_admin' || requestingUser.role === 'admin') && isCreator) return audit;
      if (requestingUser.role === 'auditor' && (isCreator || isAssigned)) return audit;

      throw new Error('You are not authorized to view this audit instance.');
    } catch (error) {
      console.error('[getAuditInstanceById] ERROR:', error.message);
      throw error;
    }
  }

  /* -------------------------------------------------- */
  /* EDIT-PERMISSION HELPER                            */
  /* -------------------------------------------------- */
  _canEdit(audit, user) {
    console.log('[_canEdit] Checking edit permissions...');
    const isCreator = audit.createdBy.toString() === user.id;
    const isAssigned = audit.assignedAuditors.some(a => a.toString() === user.id);
    console.log('[_canEdit] isCreator:', isCreator, 'isAssigned:', isAssigned);
    return isCreator || isAssigned;
  }

  /* -------------------------------------------------- */
  /* ASSIGN AUDITORS                                   */
  /* -------------------------------------------------- */
  async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
    console.log('[assignAuditors] START - auditInstanceId:', auditInstanceId);
    console.log('[assignAuditors] START - auditorIds:', auditorIds);
    console.log('[assignAuditors] START - requestingUserId:', requestingUserId);
    console.log('[assignAuditors] START - requestingUserRole:', requestingUserRole);
    console.log('[assignAuditors] START - User model available:', !!User);
    console.log('[assignAuditors] START - User model type:', typeof User);

    try {
      console.log('[assignAuditors] Finding audit instance...');
      const audit = await AuditInstance.findById(auditInstanceId);
      if (!audit) throw new Error('Audit Instance not found.');
      console.log('[assignAuditors] Audit instance found');

      if (requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
        throw new Error('You are not authorized to assign auditors.');
      }
      console.log('[assignAuditors] Authorization check passed');

      console.log('[assignAuditors] About to query User model...');
      console.log('[assignAuditors] User model before query:', User);
      console.log('[assignAuditors] User model find method:', typeof User.find);

      if (!User) {
        throw new Error('User model is null or undefined');
      }

      if (typeof User.find !== 'function') {
        throw new Error(`User.find is not a function. Type: ${typeof User.find}`);
      }

      console.log('[assignAuditors] Executing User.find query...');
      const auditors = await User.find({
        _id: { $in: auditorIds },
        role: 'auditor'
      }).select('_id firstName lastName email managerId');

      console.log('[assignAuditors] User query completed successfully');
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

      if (requestingUserRole !== 'super_admin') {
        console.log('[assignAuditors] Checking auditor management permissions...');
        const unauthorizedAuditors = auditors.filter(auditor =>
          auditor.managerId?.toString() !== requestingUserId.toString()
        );

        if (unauthorizedAuditors.length > 0) {
          console.log('[assignAuditors] Unauthorized auditors found:', unauthorizedAuditors.map(a => a._id));
          throw new Error('One or more auditors are not under your management.');
        }
        console.log('[assignAuditors] All auditors are properly managed');
      }

      console.log('[assignAuditors] Assigning auditors to audit instance...');
      audit.assignedAuditors = auditorIds;
      audit.lastModifiedBy = requestingUserId;
      await audit.save();
      console.log('[assignAuditors] Audit instance updated successfully');

      console.log('[assignAuditors] Populating audit instance...');
      const populatedAudit = await audit.populate([
        { path: 'company', select: 'name' },
        { path: 'template', select: 'name version' },
        { path: 'assignedAuditors', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'lastModifiedBy', select: 'firstName lastName email' }
      ]);

      console.log('[assignAuditors] SUCCESS - Auditors assigned and populated');
      return populatedAudit;
    } catch (error) {
      console.error('[assignAuditors] ERROR:', error.message);
      console.error('[assignAuditors] ERROR STACK:', error.stack);
      console.error('[assignAuditors] User model at error time:', User);
      console.error('[assignAuditors] User model type at error time:', typeof User);
      throw error;
    }
  }

  /* -------------------------------------------------- */
  /* SUBMIT RESPONSES                                  */
  /* -------------------------------------------------- */
  async submitResponses(auditInstanceId, responsesData, requestingUser) {
    console.log('[submitResponses] START');
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
  /* UPDATE STATUS                                     */
  /* -------------------------------------------------- */
  async updateAuditStatus(auditInstanceId, newStatus, requestingUser) {
    console.log('[updateAuditStatus] START');
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
  /* DELETE AUDIT                                      */
  /* -------------------------------------------------- */
  async deleteAuditInstance(auditInstanceId, requestingUser) {
    console.log('[deleteAuditInstance] START - Requesting user:', requestingUser);
    const audit = await AuditInstance.findById(auditInstanceId);
    if (!audit) throw new Error('Audit Instance not found.');
    if (requestingUser.role !== 'super_admin' && requestingUser.role !== 'admin' && audit.createdBy.toString() !== requestingUser.id) {
      throw new Error('You are not authorized to delete this audit.');
    }
    await AuditInstance.findByIdAndDelete(auditInstanceId);
    console.log('[deleteAuditInstance] Audit deleted successfully.');
  }

  /* -------------------------------------------------- */
  /* GENERATE PDF REPORT                               */
  /* -------------------------------------------------- */
  async generateReport(auditInstanceId, requestingUser) {
    console.log('[generateReport] START - auditInstanceId:', auditInstanceId);
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

console.log('[AUDIT_SERVICE] Service class created, User model still available:', !!User);

export default new AuditInstanceService();