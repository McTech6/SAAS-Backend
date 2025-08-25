// src/services/auditInstance.service.js

import AuditInstance from '../models/auditInstance.model.js';
import Company from '../models/company.model.js';
import AuditTemplate from '../models/auditTemplate.model.js';
import User from '../models/user.model.js';
import companyService from './company.service.js';
import puppeteer from 'puppeteer';
import generateReportHtml from '../utils/reportGenerator.js';

class AuditInstanceService {
  /* -------------------------------------------------- */
  /* CREATE AUDIT INSTANCE                              */
  /* -------------------------------------------------- */
  async createAuditInstance(data, requestingUser) {
    console.log('[createAuditInstance] START - Data received:', data);
    console.log('[createAuditInstance] START - Requesting user:', requestingUser);
    try {
      const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate } = data;

      let companyId;
      if (companyDetails) {
        console.log('[createAuditInstance] Creating new company...');
        const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
        companyId = newCompany._id;
      } else if (existingCompanyId) {
        console.log('[createAuditInstance] Using existing company ID:', existingCompanyId);
        const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
        if (!existingCompany) throw new Error('Existing company not found or you do not have access to it.');
        companyId = existingCompany._id;
      } else {
        throw new Error('Either companyDetails or existingCompanyId must be provided.');
      }

      console.log('[createAuditInstance] Finding audit template:', auditTemplateId);
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

      try {
        const populatedAudit = await newAuditInstance.populate([
          { path: 'company', select: 'name industry contactPerson' },
          { path: 'template', select: 'name version' },
          { path: 'assignedAuditors', select: 'firstName lastName email' },
          { path: 'createdBy', select: 'firstName lastName email' }
        ]);
        console.log('[createAuditInstance] SUCCESS - Audit instance created and populated');
        return populatedAudit;
      } catch (populateError) {
        console.error('[createAuditInstance] Population error:', populateError.message);
        return newAuditInstance;
      }
    } catch (error) {
      console.error('[createAuditInstance] ERROR:', error.message);
      throw error;
    }
  }

  /* -------------------------------------------------- */
  /* GET ALL AUDIT INSTANCES                            */
  /* -------------------------------------------------- */
  async getAllAuditInstances(requestingUser) {
    console.log('[getAllAuditInstances] START - Requesting user:', requestingUser);
    let query = {};

    try {
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

      const result = await AuditInstance.find(query)
        .populate('company', 'name industry')
        .populate('template', 'name version')
        .populate('assignedAuditors', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName email');

      console.log('[getAllAuditInstances] Query executed successfully, results count:', result.length);
      return result;
    } catch (error) {
      console.error('[getAllAuditInstances] FINAL ERROR CATCH:', error.message);
      throw error;
    }
  }

  /* -------------------------------------------------- */
  /* GET SINGLE AUDIT INSTANCE                          */
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

      if (!audit) {
        console.log('[getAuditInstanceById] Audit not found.');
        throw new Error('Audit Instance not found.');
      }

      const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
      const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
      const isAdminOrSuperAdmin = requestingUser.role === 'super_admin' || requestingUser.role === 'admin';

      console.log('[getAuditInstanceById] Authorization check - isCreator:', isCreator, 'isAssigned:', isAssigned, 'isAdminOrSuperAdmin:', isAdminOrSuperAdmin);
      console.log('Stored createdBy ID:', audit.createdBy._id.toString());
      console.log('Requesting user ID:', requestingUser.id.toString());

      if (isAdminOrSuperAdmin || isCreator || isAssigned) {
        console.log('[getAuditInstanceById] Authorization passed.');
        return audit;
      }
      console.log('[getAuditInstanceById] Authorization failed.');
      throw new Error('You are not authorized to view this audit instance.');
    } catch (error) {
      console.error('[getAuditInstanceById] ERROR:', error.message);
      throw error;
    }
  }

  /* -------------------------------------------------- */
  /* EDIT-PERMISSION HELPER                             */
  /* -------------------------------------------------- */
_canEdit(audit, user) {
    if (!user || !user.id) {
        console.error('[_canEdit] ERROR: Requesting user object is missing or invalid.');
        return false;
    }
    if (!audit || !audit.createdBy) {
        console.error('[_canEdit] ERROR: Audit object or createdBy field is missing.');
        return false;
    }

    console.log('[_canEdit] Checking edit permissions...');

    // Determine if createdBy is a populated object or a string ID
    const creatorId = typeof audit.createdBy === 'object' && audit.createdBy !== null
        ? audit.createdBy._id.toString()
        : audit.createdBy.toString();

    console.log('[_canEdit] Stored createdBy ID:', creatorId);
    console.log('[_canEdit] Requesting User ID:', user.id.toString());

    const isCreator = creatorId === user.id.toString();
    const isAssigned = audit.assignedAuditors.some(a => a.toString() === user.id.toString());
    
    console.log('[_canEdit] isCreator:', isCreator, 'isAssigned:', isAssigned);
    return isCreator || isAssigned;
}


  /* -------------------------------------------------- */
  /* ASSIGN AUDITORS                                    */
  /* -------------------------------------------------- */
//   async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
//     console.log('[assignAuditors] START');
//     try {
//       const audit = await AuditInstance.findById(auditInstanceId);
//       if (!audit) throw new Error('Audit Instance not found.');

//       if (requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
//         throw new Error('You are not authorized to assign auditors.');
//       }

//       const auditors = await User.find({
//         _id: { $in: auditorIds },
//         role: 'auditor'
//       }).select('_id firstName lastName email managerId');

//       if (auditors.length === 0 || auditors.length !== auditorIds.length) {
//         throw new Error('Some of the provided auditor IDs are invalid or do not have auditor role.');
//       }

//       if (requestingUserRole !== 'super_admin') {
//         const unauthorizedAuditors = auditors.filter(auditor =>
//           auditor.managerId?.toString() !== requestingUserId.toString()
//         );

//         if (unauthorizedAuditors.length > 0) {
//           throw new Error('One or more auditors are not under your management.');
//         }
//       }

//       audit.assignedAuditors = auditorIds;
//       audit.lastModifiedBy = requestingUserId;
//       await audit.save();

//       const populatedAudit = await audit.populate([
//         { path: 'company', select: 'name' },
//         { path: 'template', select: 'name version' },
//         { path: 'assignedAuditors', select: 'firstName lastName email' },
//         { path: 'createdBy', select: 'firstName lastName email' },
//         { path: 'lastModifiedBy', select: 'firstName lastName email' }
//       ]);

//       console.log('[assignAuditors] SUCCESS');
//       return populatedAudit;
//     } catch (error) {
//       console.error('[assignAuditors] FINAL ERROR CATCH:', error.message);
//       throw error;
//     }
//   }

  async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
    console.log('[assignAuditors] START');
    try {
      const audit = await AuditInstance.findById(auditInstanceId);
      if (!audit) throw new Error('Audit Instance not found.');

      // Authorization: Only Super-Admin or Admin can assign.
      if (requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
        throw new Error('You are not authorized to assign users.');
      }

      // Find all users that the requesting user is trying to assign.
      const usersToAssign = await User.find({
        _id: { $in: auditorIds },
        role: { $in: ['auditor', 'admin'] } // Find both auditors and admins
      }).select('_id firstName lastName email role managerId');

      // Validation 1: Check if all provided IDs are valid and have the correct role
      if (usersToAssign.length === 0 || usersToAssign.length !== auditorIds.length) {
        throw new Error('One or more user IDs are invalid or do not have the required role (Auditor/Admin).');
      }
      // Validation 2: Prevent a user from assigning themselves
      if (usersToAssign.some(user => user._id.toString() === requestingUserId.toString())) {
        throw new Error('You cannot assign yourself to an audit.');
      }

      // Permission Check for Admins
      if (requestingUserRole !== 'super_admin') {
        console.log('[assignAuditors] Performing admin permission check...');
        const unauthorizedUsers = usersToAssign.filter(user => {
          console.log(`[assignAuditors] Checking user ${user._id}:`);
          console.log(`[assignAuditors] User's managerId: ${user.managerId?.toString()}`);
          console.log(`[assignAuditors] Requesting admin's ID: ${requestingUserId.toString()}`);
          const match = user.managerId?.toString() === requestingUserId.toString();
          console.log(`[assignAuditors] Do they match? ${match}`);
          return !match;
        });

        if (unauthorizedUsers.length > 0) {
          throw new Error('One or more users are not under your management.');
        }
      }

      audit.assignedAuditors = auditorIds;
      audit.lastModifiedBy = requestingUserId;
      await audit.save();

      const populatedAudit = await audit.populate([
        { path: 'company', select: 'name' },
        { path: 'template', select: 'name version' },
        { path: 'assignedAuditors', select: 'firstName lastName email' },
        { path: 'createdBy', select: 'firstName lastName email' },
        { path: 'lastModifiedBy', select: 'firstName lastName email' }
      ]);

      console.log('[assignAuditors] SUCCESS - Auditors and Admins assigned successfully.');
      return populatedAudit;
    } catch (error) {
      console.error('[assignAuditors] FINAL ERROR CATCH:', error.message);
      throw error;
    }
  }


  /* -------------------------------------------------- */
  /* SUBMIT RESPONSES                                   */
  /* -------------------------------------------------- */
  async submitResponses(auditInstanceId, responsesData, requestingUser) {
    console.log('[submitResponses] START');
    // Get the audit and populate the createdBy field for the _canEdit check
    const audit = await AuditInstance.findById(auditInstanceId).populate('createdBy');
    if (!audit) throw new Error('Audit Instance not found.');

    // Use the _canEdit helper function for authorization
    if (!this._canEdit(audit, requestingUser)) {
      console.log('[submitResponses] Authorization failed. Not creator or assigned.');
      throw new Error('You are not authorized to edit this audit.');
    }
    console.log('[submitResponses] Authorization passed.');

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
    console.log('[submitResponses] SUCCESS');
    return audit;
  }

  /* -------------------------------------------------- */
  /* UPDATE STATUS                                      */
  /* -------------------------------------------------- */
  async updateAuditStatus(auditInstanceId, newStatus, requestingUser) {
    console.log('[updateAuditStatus] START');
    const audit = await AuditInstance.findById(auditInstanceId).populate('createdBy');
    if (!audit) throw new Error('Audit Instance not found.');

    // Use the _canEdit helper function for authorization
    if (!this._canEdit(audit, requestingUser)) {
      console.log('[updateAuditStatus] Authorization failed. Not creator or assigned.');
      throw new Error('You are not authorized to edit this audit.');
    }
    console.log('[updateAuditStatus] Authorization passed.');

    const allowed = ['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'];
    if (!allowed.includes(newStatus)) throw new Error('Invalid status provided.');

    audit.status = newStatus;
    if (newStatus === 'Completed' && !audit.actualCompletionDate) audit.actualCompletionDate = new Date();
    else if (newStatus !== 'Completed') audit.actualCompletionDate = undefined;
    audit.lastModifiedBy = requestingUser.id;
    await audit.save();
    console.log('[updateAuditStatus] SUCCESS');
    return audit;
  }

  /* -------------------------------------------------- */
  /* DELETE AUDIT                                       */
  /* -------------------------------------------------- */
  async deleteAuditInstance(auditInstanceId, requestingUser) {
    console.log('[deleteAuditInstance] START - Requesting user:', requestingUser);
    const audit = await AuditInstance.findById(auditInstanceId);
    if (!audit) throw new Error('Audit Instance not found.');
    
    // Authorization: Only the creator can delete this audit.
    const isCreator = audit.createdBy.toString() === requestingUser.id.toString();
    console.log('[deleteAuditInstance] Creator ID:', audit.createdBy.toString());
    console.log('[deleteAuditInstance] Requesting User ID:', requestingUser.id.toString());
    console.log('[deleteAuditInstance] Is creator:', isCreator);

    if (!isCreator) {
      throw new Error('You are not authorized to delete this audit.');
    }
    await AuditInstance.findByIdAndDelete(auditInstanceId);
    console.log('[deleteAuditInstance] Audit deleted successfully.');
  }

  /* -------------------------------------------------- */
  /* GENERATE PDF REPORT                                */
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

export default new AuditInstanceService();