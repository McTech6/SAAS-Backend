 
// // src/services/auditInstance.service.js
// import AuditInstance from '../models/auditInstance.model.js';
// import Company from '../models/company.model.js';
// import AuditTemplate from '../models/auditTemplate.model.js';
// import User from '../models/user.model.js';
// import companyService from './company.service.js';
// import puppeteer from 'puppeteer-core';
// import chromium from '@sparticuz/chromium';
// import generateReportHtml from '../utils/reportGenerator.js';

// class AuditInstanceService {

//     async createAuditInstance(data, requestingUser) {
//         console.log('[createAuditInstance] START - Data received:', data);
//         console.log('[createAuditInstance] Requesting user:', requestingUser?.id);

//         try {
//             const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate, examinationEnvironment } = data;

//             // Validate assignedAuditorIds is an array
//             const finalAuditorIds = Array.isArray(assignedAuditorIds) ? assignedAuditorIds : [];
            
//             // Only one auditor can be assigned at creation
//             if (finalAuditorIds.length > 1) {
//                 throw new Error('You cannot assign more than one auditor.');
//             }

//             // If auditors are being assigned, validate they exist and are active
//             if (finalAuditorIds.length > 0) {
//                 const users = await User.find({
//                     _id: { $in: finalAuditorIds },
//                     role: 'auditor',
//                     isActive: true
//                 }).select('_id');

//                 if (users.length !== finalAuditorIds.length) {
//                     throw new Error('One or more assigned auditor IDs are invalid or inactive.');
//                 }
//             }

//             let companyId;
//             if (companyDetails) {
//                 if (examinationEnvironment) companyDetails.examinationEnvironment = examinationEnvironment;
//                 const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
//                 companyId = newCompany._id;
//             } else if (existingCompanyId) {
//                 const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
//                 if (!existingCompany) throw new Error('Existing company not found or inaccessible.');
//                 companyId = existingCompany._id;

//                 if (examinationEnvironment) {
//                     await Company.findByIdAndUpdate(companyId, { $set: { examinationEnvironment }, lastModifiedBy: requestingUser.id });
//                 }
//             } else {
//                 throw new Error('Either companyDetails or existingCompanyId must be provided.');
//             }

//             const auditTemplate = await AuditTemplate.findById(auditTemplateId);
//             if (!auditTemplate) throw new Error('Audit Template not found.');
            
//             const templateStructureSnapshot = JSON.parse(JSON.stringify(auditTemplate.sections || []));

//             const initialResponses = [];
//             templateStructureSnapshot.forEach(section => {
//                 (section.subSections || []).forEach(subSection => {
//                     (subSection.questions || []).forEach(question => {
//                         initialResponses.push({
//                             questionId: question._id,
//                             questionTextSnapshot: question.text || '',
//                             questionTypeSnapshot: question.type || '',
//                             answerOptionsSnapshot: question.answerOptions || [],
//                             comment: '',
//                             includeCommentInReport: question.includeCommentInReportDefault || false,
//                             score: 0,
//                             auditorId: requestingUser.id,
//                             lastUpdated: new Date()
//                         });
//                     });
//                 });
//             });

//             // If auditors are assigned at creation -> In Progress, otherwise -> Draft
//             const initialStatus = finalAuditorIds.length > 0 ? 'In Progress' : 'Draft';

//             const newAuditInstance = new AuditInstance({
//                 company: companyId,
//                 template: auditTemplateId,
//                 templateNameSnapshot: auditTemplate.name || '',
//                 templateVersionSnapshot: auditTemplate.version || '',
//                 templateStructureSnapshot,
//                 assignedAuditors: finalAuditorIds,
//                 startDate: startDate || new Date(),
//                 endDate: endDate || null,
//                 status: initialStatus,
//                 responses: initialResponses,
//                 overallScore: 0,
//                 createdBy: requestingUser.id,
//                 lastModifiedBy: requestingUser.id,
//                 examinationEnvironment: examinationEnvironment || {}
//             });

//             await newAuditInstance.save();

//             console.log('[createAuditInstance] Audit instance created successfully with ID:', newAuditInstance._id);
//             console.log('[createAuditInstance] Initial status:', initialStatus);

//             return await newAuditInstance.populate([
//                 { path: 'company', select: 'name industry contactPerson examinationEnvironment' },
//                 { path: 'template', select: 'name version' },
//                 { path: 'assignedAuditors', select: 'firstName lastName email' },
//                 { path: 'createdBy', select: 'firstName lastName email' }
//             ]);

//         } catch (error) {
//             console.error('[createAuditInstance] ERROR:', error.message);
//             console.error('[createAuditInstance] Stack trace:', error.stack);
//             throw error;
//         }
//     }

//     async getAllAuditInstances(requestingUser) {
//         let query = {};
//         try {
//             if (requestingUser.role === 'super_admin' || requestingUser.role === 'admin') {
//                 const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
//                 const managedAuditorIds = (managedAuditors || []).map(a => a._id);
//                 query = { $or: [{ createdBy: requestingUser.id }, { assignedAuditors: { $in: [requestingUser.id, ...managedAuditorIds] } }] };
//             } else if (requestingUser.role === 'auditor') {
//                 query = { $or: [{ createdBy: requestingUser.id }, { assignedAuditors: requestingUser.id }] };
//             } else {
//                 throw new Error('Unauthorized role to view audit instances.');
//             }

//             return await AuditInstance.find(query)
//                 .populate('company', 'name industry')
//                 .populate('template', 'name version')
//                 .populate('assignedAuditors', 'firstName lastName email')
//                 .populate('createdBy', 'firstName lastName email')
//                 .populate('lastModifiedBy', 'firstName lastName email');

//         } catch (error) {
//             console.error('[getAllAuditInstances] ERROR:', error.message);
//             throw error;
//         }
//     }

//     async getAuditInstanceById(auditInstanceId, requestingUser) {
//         try {
//             const audit = await AuditInstance.findById(auditInstanceId)
//                 .populate('company', 'name industry contactPerson address website')
//                 .populate('template', 'name version')
//                 .populate('assignedAuditors', 'firstName lastName email')
//                 .populate('createdBy', 'firstName lastName email')
//                 .populate('lastModifiedBy', 'firstName lastName email');

//             if (!audit) throw new Error('Audit Instance not found.');

//             const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
//             const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
//             const isAdminOrSuperAdmin = ['admin', 'super_admin'].includes(requestingUser.role);

//             if (!isCreator && !isAssigned && !isAdminOrSuperAdmin) {
//                 throw new Error('Not authorized to view this audit instance.');
//             }
//             return audit;

//         } catch (error) {
//             console.error('[getAuditInstanceById] ERROR:', error.message);
//             throw error;
//         }
//     }

//     // Used by submitResponses for editing responses
//     _canEdit(audit, user) {
//         if (!audit || !user) return false;

//         const creatorId = audit.createdBy._id?.toString() || audit.createdBy.toString();
//         const isCreator = creatorId === user.id.toString();
//         const isAssigned = audit.assignedAuditors.some(a => a.toString() === user.id.toString());
//         const isAdminOrSuperAdmin = ['admin', 'super_admin'].includes(user.role);

//         switch (audit.status) {
//             case 'Draft':
//                 // In Draft, creator (admin) can edit
//                 return isAdminOrSuperAdmin || isCreator;
//             case 'In Progress':
//                 // In Progress, only assigned auditor can edit
//                 return isAssigned && user.role === 'auditor';
//             case 'In Review':
//             case 'Completed':
//             case 'Archived':
//                 return false;
//             default:
//                 return false;
//         }
//     }
    
//     async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
//         console.log('[assignAuditors] Starting assignment process...');
//         console.log('[assignAuditors] auditInstanceId:', auditInstanceId);
//         console.log('[assignAuditors] auditorIds:', auditorIds);
//         console.log('[assignAuditors] requestingUserId:', requestingUserId);

//         try {
//             const audit = await AuditInstance.findById(auditInstanceId);
//             if (!audit) throw new Error('Audit Instance not found.');

//             console.log('[assignAuditors] Audit fetched:', audit._id);
//             console.log('[assignAuditors] Audit status:', audit.status);
//             console.log('[assignAuditors] Audit createdBy:', audit.createdBy);

//             // Only the creator can assign auditors
//             if (audit.createdBy.toString() !== requestingUserId.toString()) {
//                 console.log('[assignAuditors] Access denied. Only creator can assign auditors.');
//                 throw new Error('Access denied. Only the creator can assign/reassign auditors.');
//             }

//             // Only one auditor can be assigned
//             if (auditorIds.length > 1) {
//                 throw new Error('You cannot assign more than one auditor.');
//             }
            
//             // Cannot modify auditors on completed/archived audits
//             if (['Completed', 'Archived', 'In Review'].includes(audit.status)) {
//                 throw new Error(`Cannot modify auditors on a ${audit.status} audit.`);
//             }

//             // Validate auditor IDs
//             const users = await User.find({
//                 _id: { $in: auditorIds },
//                 role: 'auditor',
//                 isActive: true
//             }).select('_id');

//             if (auditorIds.length > 0 && users.length !== auditorIds.length) {
//                 throw new Error('One or more IDs are invalid or inactive auditors.');
//             }

//             // Determine new status based on auditor assignment
//             let newStatus = audit.status;
//             if (auditorIds.length > 0 && audit.status === 'Draft') {
//                 newStatus = 'In Progress';
//             }
//             if (auditorIds.length === 0 && audit.status === 'In Progress') {
//                 newStatus = 'Draft';
//             }

//             console.log('[assignAuditors] Final status:', newStatus);

//             const updatedAudit = await AuditInstance.findByIdAndUpdate(
//                 auditInstanceId,
//                 {
//                     assignedAuditors: auditorIds,
//                     status: newStatus,
//                     lastModifiedBy: requestingUserId
//                 },
//                 { new: true }
//             ).populate([
//                 { path: 'company', select: 'name' },
//                 { path: 'template', select: 'name version' },
//                 { path: 'assignedAuditors', select: 'firstName lastName email role' },
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ]);

//             console.log('[assignAuditors] Auditor assignment successful!');
//             return updatedAudit;

//         } catch (error) {
//             console.error('[assignAuditors] ERROR:', error.message);
//             throw error;
//         }
//     }

//     async submitResponses(auditInstanceId, responsesData, requestingUser) {
//         console.log('[submitResponses] START');
//         const audit = await AuditInstance.findById(auditInstanceId).populate('createdBy');
//         if (!audit) throw new Error('Audit Instance not found.');

//         if (!this._canEdit(audit, requestingUser)) {
//             console.log('[submitResponses] Authorization failed. Not authorized to edit this audit.');
//             throw new Error('You are not authorized to edit this audit.');
//         }
//         console.log('[submitResponses] Authorization passed.');

//         for (const resp of responsesData) {
//             const { questionId, selectedValue, comment, recommendation, includeCommentInReport, evidenceUrls } = resp;
            
//             const questionFromSnapshot = audit.templateStructureSnapshot
//                 .flatMap(s => s.subSections)
//                 .flatMap(ss => ss.questions)
//                 .find(q => q._id.toString() === questionId);

//             if (!questionFromSnapshot) {
//                 console.warn(`[submitResponses] Question with ID ${questionId} not found in snapshot. Skipping response.`);
//                 continue;
//             }

//             // Calculate score for this question
//             const score = this._calcScore(questionFromSnapshot, selectedValue);
//             let existingResponse = audit.responses.find(r => r.questionId.toString() === questionId);

//             if (existingResponse) {
//                 Object.assign(existingResponse, {
//                     selectedValue,
//                     comment,
//                     recommendation,
//                     includeCommentInReport,
//                     evidenceUrls,
//                     score,
//                     auditorId: requestingUser.id,
//                     lastUpdated: new Date()
//                 });
//             } else {
//                 audit.responses.push({
//                     questionId,
//                     questionTextSnapshot: questionFromSnapshot.text,
//                     questionTypeSnapshot: questionFromSnapshot.type,
//                     answerOptionsSnapshot: questionFromSnapshot.answerOptions,
//                     selectedValue,
//                     comment,
//                     recommendation,
//                     includeCommentInReport,
//                     evidenceUrls,
//                     score,
//                     auditorId: requestingUser.id,
//                     lastUpdated: new Date()
//                 });
//             }
//         }

//         // Recalculate overall score
//         audit.overallScore = this._calculateOverallScore(audit);
//         audit.lastModifiedBy = requestingUser.id;
//         await audit.save();
        
//         console.log('[submitResponses] SUCCESS - Overall score:', audit.overallScore);
//         return audit;
//     }

//     // Calculate the overall percentage score
//     _calculateOverallScore(audit) {
//         let totalAchievedScore = 0;
//         let totalPossibleScore = 0;

//         for (const section of audit.templateStructureSnapshot) {
//             for (const subSection of section.subSections) {
//                 for (const question of subSection.questions) {
//                     const response = audit.responses.find(r => r.questionId.toString() === question._id.toString());

//                     totalPossibleScore += question.weight || 0;

//                     if (response) {
//                         totalAchievedScore += response.score || 0;
//                     }
//                 }
//             }
//         }

//         if (totalPossibleScore === 0) {
//             return 0;
//         }

//         const overallPercentage = (totalAchievedScore / totalPossibleScore) * 100;
//         return parseFloat(overallPercentage.toFixed(2));
//     }

//     // Calculate the score for a single question
//     _calcScore(question, value) {
//         if (!question) return 0;
        
//         if (['single_choice', 'multi_choice'].includes(question.type)) {
//             const selectedValues = Array.isArray(value) ? value : [value];
//             return question.answerOptions.reduce((sum, opt) => {
//                 return sum + (selectedValues.includes(opt.value) ? (opt.score || 0) : 0);
//             }, 0);
//         }
        
//         if (question.type === 'numeric' && typeof value === 'number') {
//             return value;
//         }
        
//         return 0;
//     }

//     async updateAuditStatus(auditInstanceId, newStatus, requestingUser) {
//         console.log('[updateAuditStatus] START - New Status:', newStatus);
//         const audit = await AuditInstance.findById(auditInstanceId).populate('createdBy');
//         if (!audit) throw new Error('Audit Instance not found.');

//         const allowed = ['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'];
//         if (!allowed.includes(newStatus)) throw new Error('Invalid status provided.');

//         let canChangeStatus = false;
//         const currentStatus = audit.status;

//         const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
//         const isAssigned = audit.assignedAuditors.some(a => a.toString() === requestingUser.id.toString());
//         const isSuperAdmin = requestingUser.role === 'super_admin';
//         const isAdmin = requestingUser.role === 'admin';

//         // Super Admins can always change status
//         if (isSuperAdmin) {
//             canChangeStatus = true;
//         } else {
//             switch (currentStatus) {
//                 case 'Draft':
//                     // Draft to In Progress: Creator/Admin can do this if auditor is assigned
//                     if (newStatus === 'In Progress' && (isCreator || isAdmin) && audit.assignedAuditors.length > 0) {
//                         canChangeStatus = true;
//                     }
//                     break;
//                 case 'In Progress':
//                     // In Progress to In Review: Only assigned auditor can do this
//                     if (newStatus === 'In Review' && isAssigned && requestingUser.role === 'auditor') {
//                         canChangeStatus = true;
//                     }
//                     break;
//                 case 'In Review':
//                     // In Review to Completed: Only creator can do this
//                     if (newStatus === 'Completed' && isCreator) {
//                         canChangeStatus = true;
//                     }
//                     break;
//                 case 'Completed':
//                     // Completed to Archived: Creator/Admin can do this
//                     if (newStatus === 'Archived' && (isCreator || isAdmin)) {
//                         canChangeStatus = true;
//                     }
//                     break;
//             }
//         }

//         if (!canChangeStatus) {
//             throw new Error(`You are not authorized to change status from ${currentStatus} to ${newStatus}.`);
//         }

//         audit.status = newStatus;
//         if (newStatus === 'Completed' && !audit.actualCompletionDate) {
//             audit.actualCompletionDate = new Date();
//         } else if (newStatus !== 'Completed') {
//             audit.actualCompletionDate = undefined;
//         }
//         audit.lastModifiedBy = requestingUser.id;
//         await audit.save();
        
//         console.log('[updateAuditStatus] SUCCESS');
//         return audit;
//     }

//     async deleteAuditInstance(auditInstanceId, requestingUser) {
//         const audit = await AuditInstance.findById(auditInstanceId);
//         if (!audit) throw new Error('Audit Instance not found.');
//         if (audit.createdBy.toString() !== requestingUser.id.toString()) {
//             throw new Error('You are not authorized to delete this audit.');
//         }
//         await AuditInstance.findByIdAndDelete(auditInstanceId);
//     }

//     async generateReport(auditInstanceId, requestingUser) {
//         console.log('[generateReport] START');
//         try {
//             const audit = await AuditInstance.findById(auditInstanceId)
//                 .populate({ path: 'company', select: 'name industry contactPerson address website generalInfo examinationEnvironment' })
//                 .populate({ path: 'template' })
//                 .populate({ path: 'assignedAuditors', select: 'firstName lastName email' })
//                 .populate({ path: 'createdBy', select: 'firstName lastName email' });

//             if (!audit) throw new Error('Audit Instance not found.');
//             if (audit.status !== 'Completed') {
//                 throw new Error(`Report can only be generated for completed audits. Current status: ${audit.status}`);
//             }

//             const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
//             const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
//             const isAdminOrSuperAdmin = ['admin', 'super_admin'].includes(requestingUser.role);

//             if (!isCreator && !isAssigned && !isAdminOrSuperAdmin) {
//                 throw new Error('Not authorized to generate report.');
//             }

//             console.log('[generateReport] Authorization passed');

//             const auditorsToDisplay = audit.assignedAuditors.length > 0 ? audit.assignedAuditors : [audit.createdBy];
//             const auditObj = audit.toObject();
//             auditObj.auditorsToDisplay = auditorsToDisplay;

//             console.log(`[generateReport] Audit overallScore: ${auditObj.overallScore}`);

//             const html = generateReportHtml(auditObj);

//             const browser = await puppeteer.launch({
//                 args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
//                 defaultViewport: chromium.defaultViewport,
//                 executablePath: await chromium.executablePath(),
//                 headless: chromium.headless,
//                 ignoreHTTPSErrors: true,
//             });

//             const page = await browser.newPage();
//             await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

//             const pdfBuffer = await page.pdf({
//                 format: 'A4',
//                 printBackground: true,
//                 margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' }
//             });

//             await browser.close();
//             console.log('[generateReport] SUCCESS');
//             return pdfBuffer;

//         } catch (error) {
//             console.error('[generateReport] ERROR:', error.message);
//             throw new Error(`Failed to generate PDF report: ${error.message}`);
//         }
//     }
// }

// export default new AuditInstanceService();


import AuditInstance from '../models/auditInstance.model.js';
import Company from '../models/company.model.js';
import AuditTemplate from '../models/auditTemplate.model.js';
import User from '../models/user.model.js';
import companyService from './company.service.js';
import auditTemplateService from './auditTemplate.service.js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import generateReportHtml from '../utils/reportGenerator.js';
import { translateAuditTemplate } from '../utils/dataTranslator.js';   // <-- NEW

class AuditInstanceService {
  // async createAuditInstance(data, requestingUser, lang) {               // <-- added lang
  //   console.log('[createAuditInstance] START - Data received:', data);
  //   console.log('[createAuditInstance] Requesting user:', requestingUser?.id);

  //   try {
  //     const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate, examinationEnvironment } = data;

  //     const finalAuditorIds = Array.isArray(assignedAuditorIds) ? assignedAuditorIds : [];
  //     if (finalAuditorIds.length > 1) throw new Error('You cannot assign more than one auditor.');

  //     if (finalAuditorIds.length > 0) {
  //       const users = await User.find({ _id: { $in: finalAuditorIds }, role: 'auditor', isActive: true }).select('_id');
  //       if (users.length !== finalAuditorIds.length) throw new Error('One or more assigned auditor IDs are invalid or inactive.');
  //     }

  //     let companyId;
  //     if (companyDetails) {
  //       if (examinationEnvironment) companyDetails.examinationEnvironment = examinationEnvironment;
  //       const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
  //       companyId = newCompany._id;
  //     } else if (existingCompanyId) {
  //       const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
  //       if (!existingCompany) throw new Error('Existing company not found or inaccessible.');
  //       companyId = existingCompany._id;
  //       if (examinationEnvironment) {
  //         await Company.findByIdAndUpdate(companyId, { $set: { examinationEnvironment }, lastModifiedBy: requestingUser.id });
  //       }
  //     } else {
  //       throw new Error('Either companyDetails or existingCompanyId must be provided.');
  //     }

  //     const auditTemplate = await AuditTemplate.findById(auditTemplateId);
  //     if (!auditTemplate) throw new Error('Audit Template not found.');

  //     // Translate template before snapshotting
  //     const translatedTemplate = await translateAuditTemplate(auditTemplate, lang);
  //     const templateStructureSnapshot = JSON.parse(JSON.stringify(translatedTemplate.sections || []));

  //     const initialResponses = [];
  //     templateStructureSnapshot.forEach(section => {
  //       (section.subSections || []).forEach(subSection => {
  //         (subSection.questions || []).forEach(question => {
  //           initialResponses.push({
  //             questionId: question._id,
  //             questionTextSnapshot: question.text || '',
  //             questionTypeSnapshot: question.type || '',
  //             answerOptionsSnapshot: question.answerOptions || [],
  //             comment: '',
  //             includeCommentInReport: question.includeCommentInReportDefault || false,
  //             score: 0,
  //             auditorId: requestingUser.id,
  //             lastUpdated: new Date()
  //           });
  //         });
  //       });
  //     });

  //     const initialStatus = finalAuditorIds.length > 0 ? 'In Progress' : 'Draft';

  //     const newAuditInstance = new AuditInstance({
  //       company: companyId,
  //       template: auditTemplateId,
  //       templateNameSnapshot: translatedTemplate.name || '',          // <-- translated
  //       templateVersionSnapshot: auditTemplate.version || '',
  //       templateStructureSnapshot,
  //       assignedAuditors: finalAuditorIds,
  //       startDate: startDate || new Date(),
  //       endDate: endDate || null,
  //       status: initialStatus,
  //       responses: initialResponses,
  //       overallScore: 0,
  //       createdBy: requestingUser.id,
  //       lastModifiedBy: requestingUser.id,
  //       examinationEnvironment: examinationEnvironment || {}
  //     });

  //     await newAuditInstance.save();
  //     console.log('[createAuditInstance] SUCCESS with ID:', newAuditInstance._id);
  //     return await newAuditInstance.populate([
  //       { path: 'company', select: 'name industry contactPerson examinationEnvironment' },
  //       { path: 'template', select: 'name version' },
  //       { path: 'assignedAuditors', select: 'firstName lastName email' },
  //       { path: 'createdBy', select: 'firstName lastName email' }
  //     ]);
  //   } catch (error) {
  //     console.error('[createAuditInstance] ERROR:', error.message);
  //     throw error;
  //   }
  // }

  // async getAllAuditInstances(requestingUser, lang) {                      // <-- added lang
  //   let query = {};
  //   try {
  //     if (requestingUser.role === 'super_admin' || requestingUser.role === 'admin') {
  //       const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
  //       const managedAuditorIds = (managedAuditors || []).map(a => a._id);
  //       query = { $or: [{ createdBy: requestingUser.id }, { assignedAuditors: { $in: [requestingUser.id, ...managedAuditorIds] } }] };
  //     } else if (requestingUser.role === 'auditor') {
  //       query = { $or: [{ createdBy: requestingUser.id }, { assignedAuditors: requestingUser.id }] };
  //     } else {
  //       throw new Error('You are not authorized to view audit instances.');
  //     }

  //     const audits = await AuditInstance.find(query)
  //       .populate('company', 'name industry')
  //       .populate('template', 'name version')
  //       .populate('assignedAuditors', 'firstName lastName email')
  //       .populate('createdBy', 'firstName lastName email')
  //       .populate('lastModifiedBy', 'firstName lastName email')
  //       .lean();

  //     // Translate each audit's template snapshot
  //     return Promise.all(audits.map(async audit => ({
  //       ...audit,
  //       templateNameSnapshot: audit.templateNameSnapshot, // already translated at creation
  //       templateStructureSnapshot: await translateAuditTemplate(
  //         { sections: audit.templateStructureSnapshot },
  //         lang
  //       ).then(t => t.sections)
  //     })));
  //   } catch (error) {
  //     console.error('[getAllAuditInstances] ERROR:', error.message);
  //     throw error;
  //   }
  // }

  // async getAuditInstanceById(auditInstanceId, requestingUser, lang) {     // <-- added lang
  //   const audit = await AuditInstance.findById(auditInstanceId)
  //     .populate('company', 'name industry contactPerson address website')
  //     .populate('template', 'name version')
  //     .populate('assignedAuditors', 'firstName lastName email')
  //     .populate('createdBy', 'firstName lastName email')
  //     .populate('lastModifiedBy', 'firstName lastName email')
  //     .lean();

  //   if (!audit) throw new Error('Audit Instance not found.');

  //   const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
  //   const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
  //   const isAdminOrSuperAdmin = ['admin', 'super_admin'].includes(requestingUser.role);

  //   if (!isCreator && !isAssigned && !isAdminOrSuperAdmin) {
  //     throw new Error('You are not authorized to view this audit instance.');
  //   }

  //   // Translate template snapshot on-the-fly
  //   const translatedSections = await translateAuditTemplate(
  //     { sections: audit.templateStructureSnapshot },
  //     lang
  //   ).then(t => t.sections);

  //   return { ...audit, templateStructureSnapshot: translatedSections };
  // }

    /**
   * Create an audit instance
  //  */
  // async createAuditInstance(data, requestingUser, lang) {
  //   try {
  //     const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate, examinationEnvironment } = data;

  //     // Only one auditor allowed
  //     const finalAuditorIds = Array.isArray(assignedAuditorIds) ? assignedAuditorIds : [];
  //     if (finalAuditorIds.length > 1) throw new Error('You cannot assign more than one auditor.');

  //     // Validate auditor IDs
  //     if (finalAuditorIds.length > 0) {
  //       const users = await User.find({ _id: { $in: finalAuditorIds }, role: 'auditor', isActive: true }).select('_id');
  //       if (users.length !== finalAuditorIds.length) throw new Error('One or more assigned auditor IDs are invalid or inactive.');
  //     }

  //     // Handle company creation or existing company
  //     let companyId;
  //     if (companyDetails) {
  //       if (examinationEnvironment) companyDetails.examinationEnvironment = examinationEnvironment;
  //       const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
  //       companyId = newCompany._id;
  //     } else if (existingCompanyId) {
  //       const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
  //       if (!existingCompany) throw new Error('Existing company not found or inaccessible.');
  //       companyId = existingCompany._id;
  //       if (examinationEnvironment) {
  //         await Company.findByIdAndUpdate(companyId, { $set: { examinationEnvironment }, lastModifiedBy: requestingUser.id });
  //       }
  //     } else {
  //       throw new Error('Either companyDetails or existingCompanyId must be provided.');
  //     }

  //     // Check template access based on subscription
  //     const templateFilter = await auditTemplateService.getTemplateFilter(requestingUser);
  //     const auditTemplate = await AuditTemplate.findOne({ _id: auditTemplateId, ...templateFilter });
  //     if (!auditTemplate) throw new Error('You are not authorized to use this audit template.');

  //     // Translate template before snapshotting
  //     const translatedTemplate = await translateAuditTemplate(auditTemplate, lang);
  //     const templateStructureSnapshot = JSON.parse(JSON.stringify(translatedTemplate.sections || []));

  //     // Prepare initial responses
  //     const initialResponses = [];
  //     templateStructureSnapshot.forEach(section => {
  //       (section.subSections || []).forEach(subSection => {
  //         (subSection.questions || []).forEach(question => {
  //           initialResponses.push({
  //             questionId: question._id,
  //             questionTextSnapshot: question.text || '',
  //             questionTypeSnapshot: question.type || '',
  //             answerOptionsSnapshot: question.answerOptions || [],
  //             comment: '',
  //             includeCommentInReport: question.includeCommentInReportDefault || false,
  //             score: 0,
  //             auditorId: requestingUser.id,
  //             lastUpdated: new Date()
  //           });
  //         });
  //       });
  //     });

  //     const initialStatus = finalAuditorIds.length > 0 ? 'In Progress' : 'Draft';

  //     // Create audit instance
  //     const newAuditInstance = new AuditInstance({
  //       company: companyId,
  //       template: auditTemplateId,
  //       templateNameSnapshot: translatedTemplate.name || '',
  //       templateVersionSnapshot: auditTemplate.version || '',
  //       templateStructureSnapshot,
  //       assignedAuditors: finalAuditorIds,
  //       startDate: startDate || new Date(),
  //       endDate: endDate || null,
  //       status: initialStatus,
  //       responses: initialResponses,
  //       overallScore: 0,
  //       createdBy: requestingUser.id,
  //       lastModifiedBy: requestingUser.id,
  //       examinationEnvironment: examinationEnvironment || {}
  //     });

  //     await newAuditInstance.save();

  //     return await newAuditInstance.populate([
  //       { path: 'company', select: 'name industry contactPerson examinationEnvironment' },
  //       { path: 'template', select: 'name version' },
  //       { path: 'assignedAuditors', select: 'firstName lastName email' },
  //       { path: 'createdBy', select: 'firstName lastName email' }
  //     ]);

  //   } catch (error) {
  //     console.error('[createAuditInstance] ERROR:', error.message);
  //     throw error;
  //   }
  // }

  async createAuditInstance(data, requestingUser, lang) {
        try {
            const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate, examinationEnvironment } = data;

            // LOG #1: Check all incoming auditor IDs
            console.log('[createAuditInstance] LOG #1 RCV_AUDITOR_IDS:', assignedAuditorIds);

            // Only one auditor allowed
            const finalAuditorIds = Array.isArray(assignedAuditorIds) ? assignedAuditorIds : [];
            if (finalAuditorIds.length > 1) throw new Error('You cannot assign more than one auditor.');

            // LOG #2: Confirms the cleaned array of auditor IDs
            console.log('[createAuditInstance] LOG #2 FINAL_AUDITOR_IDS:', finalAuditorIds);

            // Validate auditor IDs (This is where your primary error is happening)
            if (finalAuditorIds.length > 0) {
                const users = await User.find({ 
                    _id: { $in: finalAuditorIds }, 
                    role: 'auditor', 
                    isActive: true 
                }).select('_id');

                // LOG #3: How many users were found in the database
                console.log('[createAuditInstance] LOG #3 DB_USERS_FOUND_COUNT:', users.length);
                // LOG #4: How many users were expected to be found
                console.log('[createAuditInstance] LOG #4 DB_EXPECTED_COUNT:', finalAuditorIds.length);

                if (users.length !== finalAuditorIds.length) throw new Error('One or more assigned auditor IDs are invalid or inactive.');
            }

            // Handle company creation or existing company
            let companyId;
            if (companyDetails) {
                if (examinationEnvironment) companyDetails.examinationEnvironment = examinationEnvironment;
                const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
                companyId = newCompany._id;
            } else if (existingCompanyId) {
                const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
                if (!existingCompany) throw new Error('Existing company not found or inaccessible.');
                companyId = existingCompany._id;
                if (examinationEnvironment) {
                    await Company.findByIdAndUpdate(companyId, { $set: { examinationEnvironment }, lastModifiedBy: requestingUser.id });
                }
            } else {
                throw new Error('Either companyDetails or existingCompanyId must be provided.');
            }

            // Check template access based on subscription
            // LOG #5: Check template ID and user role before applying filter
            console.log(`[createAuditInstance] LOG #5 Template ID: ${auditTemplateId}, User Role: ${requestingUser.role}`);
            const templateFilter = await auditTemplateService.getTemplateFilter(requestingUser);
            
            // LOG #6: Check the filter object returned by the service
            console.log('[createAuditInstance] LOG #6 TEMPLATE_FILTER:', templateFilter);
            
            const auditTemplate = await AuditTemplate.findOne({ _id: auditTemplateId, ...templateFilter });
            if (!auditTemplate) throw new Error('You are not authorized to use this audit template.');

            // LOG #7: Pre-check template data before calling translation utility (potential source of "toUpperCase" error)
            if (!auditTemplate.name) {
                console.warn('[createAuditInstance] LOG #7 WARN: Audit Template is missing a name property.');
            }
            

            // Translate template before snapshotting
            const translatedTemplate = await translateAuditTemplate(auditTemplate, lang);
            const templateStructureSnapshot = JSON.parse(JSON.stringify(translatedTemplate.sections || []));

            // Prepare initial responses
            const initialResponses = [];
            templateStructureSnapshot.forEach(section => {
                (section.subSections || []).forEach(subSection => {
                    (subSection.questions || []).forEach(question => {
                        initialResponses.push({
                            questionId: question._id,
                            questionTextSnapshot: question.text || '',
                            questionTypeSnapshot: question.type || '',
                            answerOptionsSnapshot: question.answerOptions || [],
                            comment: '',
                            includeCommentInReport: question.includeCommentInReportDefault || false,
                            score: 0,
                            auditorId: requestingUser.id,
                            lastUpdated: new Date()
                        });
                    });
                });
            });

            const initialStatus = finalAuditorIds.length > 0 ? 'In Progress' : 'Draft';

            // Create audit instance
            const newAuditInstance = new AuditInstance({
                company: companyId,
                template: auditTemplateId,
                templateNameSnapshot: translatedTemplate.name || '',
                templateVersionSnapshot: auditTemplate.version || '',
                templateStructureSnapshot,
                assignedAuditors: finalAuditorIds,
                startDate: startDate || new Date(),
                endDate: endDate || null,
                status: initialStatus,
                responses: initialResponses,
                overallScore: 0,
                createdBy: requestingUser.id,
                lastModifiedBy: requestingUser.id,
                examinationEnvironment: examinationEnvironment || {}
            });

            await newAuditInstance.save();

            // LOG #8: Successful creation
            console.log('[createAuditInstance] LOG #8 SUCCESS: Audit instance created with status:', initialStatus);

            return await newAuditInstance.populate([
                { path: 'company', select: 'name industry contactPerson examinationEnvironment' },
                { path: 'template', select: 'name version' },
                { path: 'assignedAuditors', select: 'firstName lastName email' },
                { path: 'createdBy', select: 'firstName lastName email' }
            ]);

        } catch (error) {
            // LOG #9: Detailed error capture
            console.error('[createAuditInstance] LOG #9 FATAL ERROR:', error.message, error.stack);
            throw error;
        }
    }


  /**
   * Get all audit instances for the user
   */
//   async getAllAuditInstances(requestingUser, lang) {
//     try {
//       let query = {};
//       if (['super_admin', 'admin'].includes(requestingUser.role)) {
//         const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
//         const managedAuditorIds = (managedAuditors || []).map(a => a._id);
//         query = { $or: [{ createdBy: requestingUser.id }, { assignedAuditors: { $in: [requestingUser.id, ...managedAuditorIds] } }] };
//       } else if (requestingUser.role === 'auditor') {
//         query = { $or: [{ createdBy: requestingUser.id }, { assignedAuditors: requestingUser.id }] };
//       } else {
//         throw new Error('You are not authorized to view audit instances.');
//       }

//       const audits = await AuditInstance.find(query)
//         .populate('company', 'name industry')
//         .populate('template', 'name version')
//         .populate('assignedAuditors', 'firstName lastName email')
//         .populate('createdBy', 'firstName lastName email')
//         .populate('lastModifiedBy', 'firstName lastName email')
//         .lean();

//       // Filter templates by subscription for non-super-admins
//       const templateFilter = await auditTemplateService.getTemplateFilter(requestingUser);
//       const allowedTemplateIds = requestingUser.role === 'super_admin' ? null : Object.values(templateFilter._id || {});

//       const filteredAudits = audits.filter(audit => {
//         if (requestingUser.role === 'super_admin') return true;
//         return allowedTemplateIds.includes(audit.template._id.toString());
//       });

//       return Promise.all(filteredAudits.map(async audit => ({
//         ...audit,
//         templateStructureSnapshot: await translateAuditTemplate(
//           { sections: audit.templateStructureSnapshot },
//           lang
//         ).then(t => t.sections)
//       })));

//     } catch (error) {
//       console.error('[getAllAuditInstances] ERROR:', error.message);
//       throw error;
//     }
//   }
 

 // NOTE: Ensure you have 'auditTemplateService' and 'User' imported in your file's scope.
// If you encounter 'translateAuditTemplate is not defined', you must also add:
// import { translateAuditTemplate } from '../utils/dataTranslator.js'; 

// NOTE: Ensure you have 'auditTemplateService' and 'User' imported in your file's scope.
// If you encounter 'translateAuditTemplate' or 'translateAuditInstance' is not defined, 
// you must add the required imports from your utility file, for example:
// import { translateAuditTemplate, translateAuditInstance } from '../utils/dataTranslator.js'; 

async getAllAuditInstances(requestingUser, lang) {
    try {
        let query = {};
        const requestingUserId = requestingUser.id.toString();

        // --- 1. Role-based Access Query Construction ---
        if (['super_admin', 'admin'].includes(requestingUser.role)) {
            const managedAuditors = await User.find({ managerId: requestingUserId }).select('_id');
            const managedAuditorIds = (managedAuditors || []).map(a => a._id);
            // Admin sees audits created by them OR assigned to them/their managed auditors
            const allRelevantAuditorIds = [requestingUser.id, ...managedAuditorIds];
            query = { 
                $or: [
                    { createdBy: requestingUser.id }, 
                    { assignedAuditors: { $in: allRelevantAuditorIds } } 
                ] 
            };
        } else if (requestingUser.role === 'auditor') {
            // Auditor sees audits created by them OR audits they are assigned to
            query = { 
                $or: [
                    { createdBy: requestingUser.id }, 
                    { assignedAuditors: requestingUser.id } 
                ] 
            };
        } else {
            throw new Error('You are not authorized to view audit instances.');
        }

        // --- 2. Database Fetch ---
        const audits = await AuditInstance.find(query)
            .populate('company', 'name industry')
            .populate('template', 'name version')
            .populate('assignedAuditors', 'firstName lastName email')
            .populate('createdBy', 'firstName lastName email')
            .populate('lastModifiedBy', 'firstName lastName email')
            .lean();

        // --- 3. Subscription-based Template Filtering (FIXED LOGIC) ---
        
        const templateFilter = await auditTemplateService.getTemplateFilter(requestingUser);
        let allowedTemplateIds = null; // null means ALL access (Super Admin or Enterprise)

        if (requestingUser.role !== 'super_admin') {
            // Check for the full access case (Enterprise subscription returns {})
            if (Object.keys(templateFilter).length === 0) {
                allowedTemplateIds = null;
            } else if (templateFilter._id && templateFilter._id.$in) {
                // CORRECTLY extract the $in array and convert to strings for checking
                allowedTemplateIds = templateFilter._id.$in.map(id => id.toString());
            } else {
                // Case for { _id: null } or no access
                allowedTemplateIds = []; 
            }
        }
        
        // This is the core filtering step where we use the correctly extracted IDs
        const filteredAudits = audits.filter(audit => {
            // If access is null, include the audit (Super Admin or Enterprise)
            if (allowedTemplateIds === null) return true;
            
            // If access array is empty, block all audits
            if (allowedTemplateIds.length === 0) return false;

            // Ensure the template ID exists on the audit before checking
            if (!audit.template || !audit.template._id) return false; 
            
            // Check if the audit's template ID is in the allowed list
            const templateIdString = audit.template._id.toString();
            return allowedTemplateIds.includes(templateIdString);
        });

        // --- 4. Translation and Return ---
        // Preserving your original return structure which translates the snapshot
        return Promise.all(filteredAudits.map(async audit => ({
            ...audit,
            // Ensure translateAuditTemplate is imported if it throws a 'not defined' error
            templateStructureSnapshot: await translateAuditTemplate(
                { sections: audit.templateStructureSnapshot },
                lang
            ).then(t => t.sections)
        })));

    } catch (error) {
        console.error('[getAllAuditInstances] ERROR:', error.message);
        throw error;
    }
}

  /**
   * Get a single audit instance
   */
  async getAuditInstanceById(auditInstanceId, requestingUser, lang) {
    const audit = await AuditInstance.findById(auditInstanceId)
      .populate('company', 'name industry contactPerson address website')
      .populate('template', 'name version')
      .populate('assignedAuditors', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('lastModifiedBy', 'firstName lastName email')
      .lean();

    if (!audit) throw new Error('Audit Instance not found.');

    // Check template subscription access
    if (requestingUser.role !== 'super_admin') {
      const templateFilter = await auditTemplateService.getTemplateFilter(requestingUser);
      const allowedTemplate = await AuditTemplate.findOne({ _id: audit.template._id, ...templateFilter });
      if (!allowedTemplate) throw new Error('You are not authorized to access this audit template.');
    }

    const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
    const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
    const isAdminOrSuperAdmin = ['admin', 'super_admin'].includes(requestingUser.role);

    if (!isCreator && !isAssigned && !isAdminOrSuperAdmin) {
      throw new Error('You are not authorized to view this audit instance.');
    }

    const translatedSections = await translateAuditTemplate(
      { sections: audit.templateStructureSnapshot },
      lang
    ).then(t => t.sections);

    return { ...audit, templateStructureSnapshot: translatedSections };
  }

      _canEdit(audit, user) {
        if (!audit || !user) return false;

        const creatorId = audit.createdBy._id?.toString() || audit.createdBy.toString();
        const isCreator = creatorId === user.id.toString();
        const isAssigned = audit.assignedAuditors.some(a => a.toString() === user.id.toString());
        const isAdminOrSuperAdmin = ['admin', 'super_admin'].includes(user.role);

        switch (audit.status) {
            case 'Draft':
                // In Draft, creator (admin) can edit
                return isAdminOrSuperAdmin || isCreator;
            case 'In Progress':
                // In Progress, only assigned auditor can edit
                return isAssigned && user.role === 'auditor';
            case 'In Review':
            case 'Completed':
            case 'Archived':
                return false;
            default:
                return false;
        }
    }
    
    async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
        console.log('[assignAuditors] Starting assignment process...');
        console.log('[assignAuditors] auditInstanceId:', auditInstanceId);
        console.log('[assignAuditors] auditorIds:', auditorIds);
        console.log('[assignAuditors] requestingUserId:', requestingUserId);

        try {
            const audit = await AuditInstance.findById(auditInstanceId);
            if (!audit) throw new Error('Audit Instance not found.');

            console.log('[assignAuditors] Audit fetched:', audit._id);
            console.log('[assignAuditors] Audit status:', audit.status);
            console.log('[assignAuditors] Audit createdBy:', audit.createdBy);

            // Only the creator can assign auditors
            if (audit.createdBy.toString() !== requestingUserId.toString()) {
                console.log('[assignAuditors] Access denied. Only creator can assign auditors.');
                throw new Error('Access denied. Only the creator can assign/reassign auditors.');
            }

            // Only one auditor can be assigned
            if (auditorIds.length > 1) {
                throw new Error('You cannot assign more than one auditor.');
            }
            
            // Cannot modify auditors on completed/archived audits
            if (['Completed', 'Archived', 'In Review'].includes(audit.status)) {
                throw new Error(`Cannot modify auditors on a ${audit.status} audit.`);
            }

            // Validate auditor IDs
            const users = await User.find({
                _id: { $in: auditorIds },
                role: 'auditor',
                isActive: true
            }).select('_id');

            if (auditorIds.length > 0 && users.length !== auditorIds.length) {
                throw new Error('One or more IDs are invalid or inactive auditors.');
            }

            // Determine new status based on auditor assignment
            let newStatus = audit.status;
            if (auditorIds.length > 0 && audit.status === 'Draft') {
                newStatus = 'In Progress';
            }
            if (auditorIds.length === 0 && audit.status === 'In Progress') {
                newStatus = 'Draft';
            }

            console.log('[assignAuditors] Final status:', newStatus);

            const updatedAudit = await AuditInstance.findByIdAndUpdate(
                auditInstanceId,
                {
                    assignedAuditors: auditorIds,
                    status: newStatus,
                    lastModifiedBy: requestingUserId
                },
                { new: true }
            ).populate([
                { path: 'company', select: 'name' },
                { path: 'template', select: 'name version' },
                { path: 'assignedAuditors', select: 'firstName lastName email role' },
                { path: 'createdBy', select: 'firstName lastName email' },
                { path: 'lastModifiedBy', select: 'firstName lastName email' }
            ]);

            console.log('[assignAuditors] Auditor assignment successful!');
            return updatedAudit;

        } catch (error) {
            console.error('[assignAuditors] ERROR:', error.message);
            throw error;
        }
    }

    async submitResponses(auditInstanceId, responsesData, requestingUser) {
        console.log('[submitResponses] START');
        const audit = await AuditInstance.findById(auditInstanceId).populate('createdBy');
        if (!audit) throw new Error('Audit Instance not found.');

        if (!this._canEdit(audit, requestingUser)) {
            console.log('[submitResponses] Authorization failed. Not authorized to edit this audit.');
            throw new Error('You are not authorized to edit this audit.');
        }
        console.log('[submitResponses] Authorization passed.');

        for (const resp of responsesData) {
            const { questionId, selectedValue, comment, recommendation, includeCommentInReport, evidenceUrls } = resp;
            
            const questionFromSnapshot = audit.templateStructureSnapshot
                .flatMap(s => s.subSections)
                .flatMap(ss => ss.questions)
                .find(q => q._id.toString() === questionId);

            if (!questionFromSnapshot) {
                console.warn(`[submitResponses] Question with ID ${questionId} not found in snapshot. Skipping response.`);
                continue;
            }

            // Calculate score for this question
            const score = this._calcScore(questionFromSnapshot, selectedValue);
            let existingResponse = audit.responses.find(r => r.questionId.toString() === questionId);

            if (existingResponse) {
                Object.assign(existingResponse, {
                    selectedValue,
                    comment,
                    recommendation,
                    includeCommentInReport,
                    evidenceUrls,
                    score,
                    auditorId: requestingUser.id,
                    lastUpdated: new Date()
                });
            } else {
                audit.responses.push({
                    questionId,
                    questionTextSnapshot: questionFromSnapshot.text,
                    questionTypeSnapshot: questionFromSnapshot.type,
                    answerOptionsSnapshot: questionFromSnapshot.answerOptions,
                    selectedValue,
                    comment,
                    recommendation,
                    includeCommentInReport,
                    evidenceUrls,
                    score,
                    auditorId: requestingUser.id,
                    lastUpdated: new Date()
                });
            }
        }

        // Recalculate overall score
        audit.overallScore = this._calculateOverallScore(audit);
        audit.lastModifiedBy = requestingUser.id;
        await audit.save();
        
        console.log('[submitResponses] SUCCESS - Overall score:', audit.overallScore);
        return audit;
    }

    // Calculate the overall percentage score
    _calculateOverallScore(audit) {
        let totalAchievedScore = 0;
        let totalPossibleScore = 0;

        for (const section of audit.templateStructureSnapshot) {
            for (const subSection of section.subSections) {
                for (const question of subSection.questions) {
                    const response = audit.responses.find(r => r.questionId.toString() === question._id.toString());

                    totalPossibleScore += question.weight || 0;

                    if (response) {
                        totalAchievedScore += response.score || 0;
                    }
                }
            }
        }

        if (totalPossibleScore === 0) {
            return 0;
        }

        const overallPercentage = (totalAchievedScore / totalPossibleScore) * 100;
        return parseFloat(overallPercentage.toFixed(2));
    }

    // Calculate the score for a single question
    _calcScore(question, value) {
        if (!question) return 0;
        
        if (['single_choice', 'multi_choice'].includes(question.type)) {
            const selectedValues = Array.isArray(value) ? value : [value];
            return question.answerOptions.reduce((sum, opt) => {
                return sum + (selectedValues.includes(opt.value) ? (opt.score || 0) : 0);
            }, 0);
        }
        
        if (question.type === 'numeric' && typeof value === 'number') {
            return value;
        }
        
        return 0;
    }

    async updateAuditStatus(auditInstanceId, newStatus, requestingUser) {
        console.log('[updateAuditStatus] START - New Status:', newStatus);
        const audit = await AuditInstance.findById(auditInstanceId).populate('createdBy');
        if (!audit) throw new Error('Audit Instance not found.');

        const allowed = ['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'];
        if (!allowed.includes(newStatus)) throw new Error('Invalid status provided.');

        let canChangeStatus = false;
        const currentStatus = audit.status;

        const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
        const isAssigned = audit.assignedAuditors.some(a => a.toString() === requestingUser.id.toString());
        const isSuperAdmin = requestingUser.role === 'super_admin';
        const isAdmin = requestingUser.role === 'admin';

        // Super Admins can always change status
        if (isSuperAdmin) {
            canChangeStatus = true;
        } else {
            switch (currentStatus) {
                case 'Draft':
                    // Draft to In Progress: Creator/Admin can do this if auditor is assigned
                    if (newStatus === 'In Progress' && (isCreator || isAdmin) && audit.assignedAuditors.length > 0) {
                        canChangeStatus = true;
                    }
                    break;
                case 'In Progress':
                    // In Progress to In Review: Only assigned auditor can do this
                    if (newStatus === 'In Review' && isAssigned && requestingUser.role === 'auditor') {
                        canChangeStatus = true;
                    }
                    break;
                case 'In Review':
                    // In Review to Completed: Only creator can do this
                    if (newStatus === 'Completed' && isCreator) {
                        canChangeStatus = true;
                    }
                    break;
                case 'Completed':
                    // Completed to Archived: Creator/Admin can do this
                    if (newStatus === 'Archived' && (isCreator || isAdmin)) {
                        canChangeStatus = true;
                    }
                    break;
            }
        }

        if (!canChangeStatus) {
            throw new Error(`You are not authorized to change status from ${currentStatus} to ${newStatus}.`);
        }

        audit.status = newStatus;
        if (newStatus === 'Completed' && !audit.actualCompletionDate) {
            audit.actualCompletionDate = new Date();
        } else if (newStatus !== 'Completed') {
            audit.actualCompletionDate = undefined;
        }
        audit.lastModifiedBy = requestingUser.id;
        await audit.save();
        
        console.log('[updateAuditStatus] SUCCESS');
        return audit;
    }

    async deleteAuditInstance(auditInstanceId, requestingUser) {
        const audit = await AuditInstance.findById(auditInstanceId);
        if (!audit) throw new Error('Audit Instance not found.');
        if (audit.createdBy.toString() !== requestingUser.id.toString()) {
            throw new Error('You are not authorized to delete this audit.');
        }
        await AuditInstance.findByIdAndDelete(auditInstanceId);
    }

  // _canEdit, assignAuditors, submitResponses, updateAuditStatus, deleteAuditInstance
  // remain unchanged because they do not expose template text to the user.

  // generateReport is already translation-ready because it re-uses the translated snapshot
  // from getAuditInstanceById internally (see below).

  async generateReport(auditInstanceId, requestingUser, lang) {           // <-- added lang
    console.log('[generateReport] START');
    try {
      // Re-use the translated fetch
      const audit = await this.getAuditInstanceById(auditInstanceId, requestingUser, lang);

      if (audit.status !== 'Completed') {
        throw new Error(`Report can only be generated for completed audits. Current status: ${audit.status}`);
      }

      const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
      const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
      const isAdminOrSuperAdmin = ['admin', 'super_admin'].includes(requestingUser.role);

      if (!isCreator && !isAssigned && !isAdminOrSuperAdmin) {
        throw new Error('Not authorized to generate report.');
      }

      console.log('[generateReport] Authorization passed');

      const auditorsToDisplay = audit.assignedAuditors.length > 0 ? audit.assignedAuditors : [audit.createdBy];
      const auditObj = { ...audit, auditorsToDisplay };

      console.log(`[generateReport] Audit overallScore: ${auditObj.overallScore}`);

      // The HTML generator will receive the already-translated snapshot
      const html = generateReportHtml(auditObj);

      const browser = await puppeteer.launch({
        args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' }
      });

      await browser.close();
      console.log('[generateReport] SUCCESS');
      return pdfBuffer;
    } catch (error) {
      console.error('[generateReport] ERROR:', error.message);
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
  }
}

export default new AuditInstanceService();