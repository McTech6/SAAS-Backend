 

// // export default new AuditInstanceService();
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
//     console.log('[createAuditInstance] START - Data received:', data);
//     console.log('[createAuditInstance] START - Requesting user:', requestingUser);
//     try {
//         const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate, examinationEnvironment } = data;

//         let finalAuditorIds = assignedAuditorIds || [];
//         if (!finalAuditorIds.includes(requestingUser.id)) {
//             finalAuditorIds = [requestingUser.id, ...finalAuditorIds];
//         }
//         console.log('[createAuditInstance] Final auditor IDs:', finalAuditorIds);

//         let companyId;
//         if (companyDetails) {
//             console.log('[createAuditInstance] Creating new company...');
            
//             // Ensure examination environment is included in company details
//             if (examinationEnvironment) {
//                 companyDetails.examinationEnvironment = examinationEnvironment;
//                 console.log('[createAuditInstance] Added examination environment to company details:', examinationEnvironment);
//             }
            
//             const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
//             companyId = newCompany._id;
//             console.log('[createAuditInstance] New company created with ID:', companyId);
//         } else if (existingCompanyId) {
//             console.log('[createAuditInstance] Using existing company ID:', existingCompanyId);
//             const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
//             if (!existingCompany) throw new Error('Existing company not found or you do not have access to it.');
//             companyId = existingCompany._id;
            
//             // If we have examination environment data, update the existing company
//             if (examinationEnvironment) {
//                 console.log('[createAuditInstance] Updating existing company with examination environment data');
//                 await Company.findByIdAndUpdate(companyId, {
//                     $set: { examinationEnvironment: examinationEnvironment },
//                     lastModifiedBy: requestingUser.id
//                 });
//             }
//         } else {
//             throw new Error('Either companyDetails or existingCompanyId must be provided.');
//         }

//         console.log('[createAuditInstance] Finding audit template:', auditTemplateId);
//         const auditTemplate = await AuditTemplate.findById(auditTemplateId);
//         if (!auditTemplate) throw new Error('Audit Template not found.');

//         const templateStructureSnapshot = JSON.parse(JSON.stringify(auditTemplate.sections.toObject()));

//         const initialResponses = [];
//         templateStructureSnapshot.forEach(section => {
//             section.subSections.forEach(subSection => {
//                 subSection.questions.forEach(question => {
//                     initialResponses.push({
//                         questionId: question._id,
//                         questionTextSnapshot: question.text,
//                         questionTypeSnapshot: question.type,
//                         answerOptionsSnapshot: question.answerOptions,
//                         comment: '',
//                         includeCommentInReport: question.includeCommentInReportDefault,
//                         score: 0,
//                         auditorId: requestingUser.id,
//                         lastUpdated: new Date()
//                     });
//                 });
//             });
//         });

//         const newAuditInstance = new AuditInstance({
//             company: companyId,
//             template: auditTemplateId,
//             templateNameSnapshot: auditTemplate.name,
//             templateVersionSnapshot: auditTemplate.version,
//             templateStructureSnapshot,
//             assignedAuditors: finalAuditorIds,
//             startDate: startDate || new Date(),
//             endDate,
//             status: 'Draft',
//             responses: initialResponses,
//             createdBy: requestingUser.id,
//             lastModifiedBy: requestingUser.id,
//             // Store examination environment at audit level as backup
//             examinationEnvironment: examinationEnvironment || {}
//         });

//         await newAuditInstance.save();
//         console.log('[createAuditInstance] Audit instance saved with examination environment:', examinationEnvironment);

//         try {
//             const populatedAudit = await newAuditInstance.populate([
//                 { path: 'company', select: 'name industry contactPerson examinationEnvironment' },
//                 { path: 'template', select: 'name version' },
//                 { path: 'assignedAuditors', select: 'firstName lastName email' },
//                 { path: 'createdBy', select: 'firstName lastName email' }
//             ]);
//             console.log('[createAuditInstance] SUCCESS - Audit instance created and populated');
//             console.log('[createAuditInstance] Company examination environment:', JSON.stringify(populatedAudit.company.examinationEnvironment, null, 2));
//             return populatedAudit;
//         } catch (populateError) {
//             console.error('[createAuditInstance] Population error:', populateError.message);
//             return newAuditInstance;
//         }
//     } catch (error) {
//         console.error('[createAuditInstance] ERROR:', error.message);
//         throw error;
//     }
// }

//     async getAllAuditInstances(requestingUser) {
//         console.log('[getAllAuditInstances] START - Requesting user:', requestingUser);
//         let query = {};

//         try {
//             if (requestingUser.role === 'super_admin' || requestingUser.role === 'admin') {
//                 const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
//                 const managedAuditorIds = (managedAuditors || []).map(a => a._id);
//                 console.log('[getAllAuditInstances] Managed auditor IDs:', managedAuditorIds);

//                 query = {
//                     $or: [
//                         { createdBy: requestingUser.id },
//                         { assignedAuditors: { $in: [requestingUser.id, ...managedAuditorIds] } }
//                     ]
//                 };
//             } else if (requestingUser.role === 'auditor') {
//                 query = {
//                     $or: [
//                         { createdBy: requestingUser.id },
//                         { assignedAuditors: requestingUser.id }
//                     ]
//                 };
//             } else {
//                 throw new Error('Unauthorized role to view audit instances.');
//             }

//             console.log('[getAllAuditInstances] Final query:', JSON.stringify(query));
//             const result = await AuditInstance.find(query)
//                 .populate('company', 'name industry')
//                 .populate('template', 'name version')
//                 .populate('assignedAuditors', 'firstName lastName email')
//                 .populate('createdBy', 'firstName lastName email')
//                 .populate('lastModifiedBy', 'firstName lastName email');

//             console.log('[getAllAuditInstances] Query executed successfully, results count:', result.length);
//             return result;
//         } catch (error) {
//             console.error('[getAllAuditInstances] FINAL ERROR CATCH:', error.message);
//             throw error;
//         }
//     }

//     async getAuditInstanceById(auditInstanceId, requestingUser) {
//         console.log('[getAuditInstanceById] START - auditInstanceId:', auditInstanceId);
//         console.log('[getAuditInstanceById] START - requestingUser:', requestingUser);
//         try {
//             const audit = await AuditInstance.findById(auditInstanceId)
//                 .populate('company', 'name industry contactPerson address website')
//                 .populate('template', 'name version')
//                 .populate('assignedAuditors', 'firstName lastName email')
//                 .populate('createdBy', 'firstName lastName email')
//                 .populate('lastModifiedBy', 'firstName lastName email');

//             if (!audit) {
//                 console.log('[getAuditInstanceById] Audit not found.');
//                 throw new Error('Audit Instance not found.');
//             }

//             const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
//             const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
//             const isAdminOrSuperAdmin = requestingUser.role === 'super_admin' || requestingUser.role === 'admin';

//             console.log('[getAuditInstanceById] Authorization check - isCreator:', isCreator, 'isAssigned:', isAssigned, 'isAdminOrSuperAdmin:', isAdminOrSuperAdmin);

//             if (isAdminOrSuperAdmin || isCreator || isAssigned) {
//                 console.log('[getAuditInstanceById] Authorization passed.');
//                 return audit;
//             }
//             console.log('[getAuditInstanceById] Authorization failed.');
//             throw new Error('You are not authorized to view this audit instance.');
//         } catch (error) {
//             console.error('[getAuditInstanceById] ERROR:', error.message);
//             throw error;
//         }
//     }

//     _canEdit(audit, user) {
//         if (!user || !user.id) {
//             console.error('[_canEdit] ERROR: Requesting user object is missing or invalid.');
//             return false;
//         }
//         if (!audit || !audit.createdBy) {
//             console.error('[_canEdit] ERROR: Audit object or createdBy field is missing.');
//             return false;
//         }

//         console.log('[_canEdit] Checking edit permissions for status:', audit.status);

//         const creatorId = typeof audit.createdBy === 'object' && audit.createdBy !== null
//             ? audit.createdBy._id.toString()
//             : audit.createdBy.toString();

//         console.log('[_canEdit] Stored createdBy ID:', creatorId);
//         console.log('[_canEdit] Requesting User ID:', user.id.toString());

//         const isCreator = creatorId === user.id.toString();
//         const isAssigned = audit.assignedAuditors.some(a => a.toString() === user.id.toString());
//         const isAdminOrSuperAdmin = user.role === 'super_admin' || user.role === 'admin';

//         console.log('[_canEdit] isCreator:', isCreator, 'isAssigned:', isAssigned, 'isAdminOrSuperAdmin:', isAdminOrSuperAdmin);

//         switch (audit.status) {
//             case 'Draft':
//             case 'In Progress':
//                 return isAssigned;
//             case 'In Review':
//                 return isAdminOrSuperAdmin;
//             case 'Completed':
//             case 'Archived':
//                 return false;
//             default:
//                 return false;
//         }
//     }

//     async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
//         console.log('[assignAuditors] START - Audit ID:', auditInstanceId);
//         console.log('[assignAuditors] Requesting User ID:', requestingUserId, 'Role:', requestingUserRole);
//         console.log('[assignAuditors] User IDs to assign:', auditorIds);

//         try {
//             const audit = await AuditInstance.findById(auditInstanceId);
//             if (!audit) {
//                 console.log('[assignAuditors] ERROR - Audit not found:', auditInstanceId);
//                 throw new Error('Audit Instance not found.');
//             }
//             console.log('[assignAuditors] Audit found successfully');

//             if (requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
//                 console.log('[assignAuditors] ERROR - Unauthorized role:', requestingUserRole);
//                 throw new Error('Access denied. Only administrators can assign users to audits.');
//             }
//             console.log('[assignAuditors] Authorization check passed');

//             console.log('[assignAuditors] Searching for users in database...');
//             const users = await User.find({
//                 _id: { $in: auditorIds },
//                 role: { $in: ['auditor', 'admin'] },
//                 isActive: true
//             }).select('_id firstName lastName email role managerId');

//             console.log('[assignAuditors] Found', users.length, 'users out of', auditorIds.length, 'requested');
//             console.log('[assignAuditors] Found users:', users.map(u => `${u.firstName} ${u.lastName} (${u.role})`));

//             if (users.length === 0) {
//                 console.log('[assignAuditors] ERROR - No valid users found');
//                 throw new Error('No valid users found. Please ensure the selected users are active auditors or administrators.');
//             }

//             if (users.length !== auditorIds.length) {
//                 const foundIds = users.map(u => u._id.toString());
//                 const missingIds = auditorIds.filter(id => !foundIds.includes(id.toString()));
//                 console.log('[assignAuditors] ERROR - Missing user IDs:', missingIds);
//                 throw new Error(`Some users could not be found or are inactive. Please verify that all selected users are active auditors or administrators. Missing IDs: ${missingIds.join(', ')}`);
//             }

//             console.log('[assignAuditors] Checking management permissions...');
//             const unauthorizedUsers = users.filter(user =>
//                 user.managerId?.toString() !== requestingUserId.toString()
//             );

//             if (unauthorizedUsers.length > 0) {
//                 const unauthorizedNames = unauthorizedUsers.map(u => `${u.firstName} ${u.lastName} (${u.role})`);
//                 console.log('[assignAuditors] ERROR - Unauthorized users found:', unauthorizedNames);
//                 throw new Error(`You can only assign users that are under your direct management. The following users are not managed by you: ${unauthorizedNames.join(', ')}. Please contact your administrator if you need to assign users from other teams.`);
//             }

//             console.log('[assignAuditors] Management permissions validated - all users are under requesting user management');

//             audit.assignedAuditors = auditorIds;
//             audit.lastModifiedBy = requestingUserId;
//             await audit.save();
//             console.log('[assignAuditors] Audit instance updated successfully');

//             const populatedAudit = await audit.populate([
//                 { path: 'company', select: 'name' },
//                 { path: 'template', select: 'name version' },
//                 { path: 'assignedAuditors', select: 'firstName lastName email role' },
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ]);

//             const assignedUsersList = users.map(u => `${u.firstName} ${u.lastName} (${u.role})`);
//             console.log('[assignAuditors] SUCCESS - Successfully assigned the following users to audit:', assignedUsersList);
//             console.log('[assignAuditors] Total users assigned:', users.length);
            
//             return populatedAudit;
//         } catch (error) {
//             console.error('[assignAuditors] OPERATION FAILED');
//             console.error('[assignAuditors] Error details:', {
//                 auditId: auditInstanceId,
//                 requestingUserId,
//                 requestingUserRole,
//                 attemptedAssignments: auditorIds,
//                 errorMessage: error.message,
//                 timestamp: new Date().toISOString()
//             });
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

//         if (audit.status === 'Completed' || audit.status === 'Archived') {
//             throw new Error(`Cannot submit responses. Audit is already ${audit.status}.`);
//         }

//         for (const resp of responsesData) {
//             const { questionId, selectedValue, comment, includeCommentInReport, evidenceUrls } = resp;
//             let ex = audit.responses.find(r => r.questionId.toString() === questionId);
//             const q = audit.templateStructureSnapshot
//                 .flatMap(s => s.subSections)
//                 .flatMap(ss => ss.questions)
//                 .find(q => q._id.toString() === questionId);

//             if (!q) continue;
//             const score = this._calcScore(q, selectedValue);

//             if (ex) {
//                 Object.assign(ex, { selectedValue, comment, includeCommentInReport, evidenceUrls, auditorId: requestingUser.id, lastUpdated: new Date(), score });
//             } else {
//                 audit.responses.push({
//                     questionId, questionTextSnapshot: q.text, questionTypeSnapshot: q.type,
//                     answerOptionsSnapshot: q.answerOptions, selectedValue, comment, includeCommentInReport,
//                     evidenceUrls, score, auditorId: requestingUser.id, lastUpdated: new Date()
//                 });
//             }
//         }

//         audit.overallScore = this._calculateOverallScore(audit);
//         audit.lastModifiedBy = requestingUser.id;
//         await audit.save();
//         console.log('[submitResponses] SUCCESS');
//         return audit;
//     }

//     async updateAuditStatus(auditInstanceId, newStatus, requestingUser) {
//         console.log('[updateAuditStatus] START');
//         const audit = await AuditInstance.findById(auditInstanceId).populate('createdBy');
//         if (!audit) throw new Error('Audit Instance not found.');

//         const allowed = ['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'];
//         if (!allowed.includes(newStatus)) throw new Error('Invalid status provided.');

//         let canChangeStatus = false;

//         switch (audit.status) {
//             case 'Draft':
//             case 'In Progress':
//                 if (newStatus === 'In Review') {
//                     const isAssigned = audit.assignedAuditors.some(a => a.toString() === requestingUser.id.toString());
//                     canChangeStatus = isAssigned;
//                 }
//                 break;
//             case 'In Review':
//                 if (newStatus === 'Completed') {
//                     const isAdminOrSuperAdmin = requestingUser.role === 'super_admin' || requestingUser.role === 'admin';
//                     canChangeStatus = isAdminOrSuperAdmin;
//                 }
//                 break;
//             case 'Completed':
//                 if (newStatus === 'Archived') {
//                     const isAdminOrSuperAdmin = requestingUser.role === 'super_admin' || requestingUser.role === 'admin';
//                     canChangeStatus = isAdminOrSuperAdmin;
//                 }
//                 break;
//         }

//         if (!canChangeStatus) {
//             throw new Error(`You are not authorized to change status from ${audit.status} to ${newStatus}.`);
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
//         console.log('[deleteAuditInstance] START - Requesting user:', requestingUser);
//         const audit = await AuditInstance.findById(auditInstanceId);
//         if (!audit) throw new Error('Audit Instance not found.');

//         const isCreator = audit.createdBy.toString() === requestingUser.id.toString();
//         console.log('[deleteAuditInstance] Creator ID:', audit.createdBy.toString());
//         console.log('[deleteAuditInstance] Requesting User ID:', requestingUser.id.toString());
//         console.log('[deleteAuditInstance] Is creator:', isCreator);

//         if (!isCreator) {
//             throw new Error('You are not authorized to delete this audit.');
//         }
//         await AuditInstance.findByIdAndDelete(auditInstanceId);
//         console.log('[deleteAuditInstance] Audit deleted successfully.');
//     }

  
//     async generateReport(auditInstanceId, requestingUser) {
//     console.log('[generateReport] START - auditInstanceId:', auditInstanceId);

//     try {
//         const audit = await AuditInstance.findById(auditInstanceId)
//             .populate({ 
//                 path: 'company', 
//                 select: 'name industry contactPerson address website generalInfo examinationEnvironment' 
//             })
//             .populate({ path: 'template' })
//             .populate({ path: 'assignedAuditors', select: 'firstName lastName email' })
//             .populate({ path: 'createdBy', select: 'firstName lastName email' });

//         if (!audit) {
//             throw new Error('Audit Instance not found.');
//         }
        
//         // Debug logging to see what data we have
//         console.log('[generateReport] Company data:', JSON.stringify(audit.company, null, 2));
//         console.log('[generateReport] Audit examinationEnvironment:', JSON.stringify(audit.examinationEnvironment, null, 2));
        
//         // Check authorization to generate report
//         const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
//         const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
//         const isAdminOrSuperAdmin = requestingUser.role === 'super_admin' || requestingUser.role === 'admin';

//         if (!isCreator && !isAssigned && !isAdminOrSuperAdmin) {
//             throw new Error('You are not authorized to generate a report for this audit instance.');
//         }

//         // Decide who to display as auditors
//         let auditorsToDisplay = [];
//         if (audit.assignedAuditors?.length > 0) {
//             auditorsToDisplay = audit.assignedAuditors;
//         } else if (audit.createdBy) {
//             auditorsToDisplay = [audit.createdBy];
//         }

//         const auditObj = audit.toObject();
//         auditObj.auditorsToDisplay = auditorsToDisplay;

//         // Debug: Log the final audit object structure
//         console.log('[generateReport] Final audit object company:', JSON.stringify(auditObj.company, null, 2));
//         console.log('[generateReport] Final audit object examinationEnvironment:', JSON.stringify(auditObj.examinationEnvironment, null, 2));

//         const html = generateReportHtml(auditObj);
//         console.log('[generateReport] HTML report content generated');

//         const browser = await puppeteer.launch({
//             args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
//             defaultViewport: chromium.defaultViewport,
//             executablePath: await chromium.executablePath(),
//             headless: chromium.headless,
//             ignoreHTTPSErrors: true,
//         });

//         console.log('[generateReport] Browser launched successfully with @sparticuz/chromium');

//         const page = await browser.newPage();
//         await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
//         console.log('[generateReport] HTML content set on page');

//         const pdfBuffer = await page.pdf({
//             format: 'A4',
//             printBackground: true,
//             margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' }
//         });
//         console.log('[generateReport] PDF generated successfully');

//         await browser.close();
//         console.log('[generateReport] Browser closed');

//         return pdfBuffer;

//     } catch (error) {
//         console.error('[generateReport] ERROR occurred:', {
//             auditId: auditInstanceId,
//             userId: requestingUser.id,
//             error: error.message,
//             stack: error.stack,
//             timestamp: new Date().toISOString()
//         });
//         throw new Error(`Failed to generate PDF report: ${error.message}`);
//     }
// }

//     _calcScore(question, value) {
//         if (!question) return 0;
//         if (question.type === 'single_choice' || question.type === 'multi_choice') {
//             const opt = question.answerOptions?.find(o => o.value === value);
//             return opt ? opt.score || 0 : 0;
//         }
//         if (question.type === 'numeric' && typeof value === 'number') return value;
//         return 0;
//     }

//     _calculateOverallScore(audit) {
//         if (!audit.responses || !audit.responses.length) return 0;
//         let total = 0, max = 0;
//         audit.responses.forEach(r => {
//             const q = (audit.templateStructureSnapshot || [])
//                 .flatMap(s => s.subSections || [])
//                 .flatMap(ss => ss.questions || [])
//                 .find(q => q._id?.toString() === r.questionId?.toString());
//             if (q) { total += r.score || 0; max += q.weight || 1; }
//         });
//         return max ? parseFloat(((total / max) * 100).toFixed(2)) : 0;
//     }
// }

// export default new AuditInstanceService();


import AuditInstance from '../models/auditInstance.model.js';
import Company from '../models/company.model.js';
import AuditTemplate from '../models/auditTemplate.model.js';
import User from '../models/user.model.js';
import companyService from './company.service.js';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import generateReportHtml from '../utils/reportGenerator.js';

class AuditInstanceService {

    async createAuditInstance(data, requestingUser) {
        console.log('[createAuditInstance] START - Data received:', data);
        console.log('[createAuditInstance] START - Requesting user:', requestingUser);
        try {
            const { companyDetails, existingCompanyId, auditTemplateId, assignedAuditorIds, startDate, endDate, examinationEnvironment } = data;

            let finalAuditorIds = assignedAuditorIds || [];
            if (!finalAuditorIds.includes(requestingUser.id)) {
                finalAuditorIds = [requestingUser.id, ...finalAuditorIds];
            }
            console.log('[createAuditInstance] Final auditor IDs:', finalAuditorIds);

            let companyId;
            if (companyDetails) {
                console.log('[createAuditInstance] Creating new company...');
                if (examinationEnvironment) {
                    companyDetails.examinationEnvironment = examinationEnvironment;
                    console.log('[createAuditInstance] Added examination environment to company details:', examinationEnvironment);
                }
                const newCompany = await companyService.createCompany(companyDetails, requestingUser.id);
                companyId = newCompany._id;
                console.log('[createAuditInstance] New company created with ID:', companyId);
            } else if (existingCompanyId) {
                console.log('[createAuditInstance] Using existing company ID:', existingCompanyId);
                const existingCompany = await companyService.getCompanyById(existingCompanyId, requestingUser.id, requestingUser.role);
                if (!existingCompany) throw new Error('Existing company not found or you do not have access to it.');
                companyId = existingCompany._id;
                if (examinationEnvironment) {
                    console.log('[createAuditInstance] Updating existing company with examination environment data');
                    await Company.findByIdAndUpdate(companyId, {
                        $set: { examinationEnvironment: examinationEnvironment },
                        lastModifiedBy: requestingUser.id
                    });
                }
            } else {
                throw new Error('Either companyDetails or existingCompanyId must be provided.');
            }

            console.log('[createAuditInstance] Finding audit template:', auditTemplateId);
            const auditTemplate = await AuditTemplate.findById(auditTemplateId);
            if (!auditTemplate) throw new Error('Audit Template not found.');

            const templateStructureSnapshot = JSON.parse(JSON.stringify(auditTemplate.sections));

            // Initialize responses from the template structure
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
                assignedAuditors: finalAuditorIds,
                startDate: startDate || new Date(),
                endDate,
                status: 'Draft',
                responses: initialResponses,
                createdBy: requestingUser.id,
                lastModifiedBy: requestingUser.id,
                examinationEnvironment: examinationEnvironment || {}
            });

            await newAuditInstance.save();
            console.log('[createAuditInstance] Audit instance saved with examination environment:', examinationEnvironment);

            const populatedAudit = await newAuditInstance.populate([
                { path: 'company', select: 'name industry contactPerson examinationEnvironment' },
                { path: 'template', select: 'name version' },
                { path: 'assignedAuditors', select: 'firstName lastName email' },
                { path: 'createdBy', select: 'firstName lastName email' }
            ]);
            console.log('[createAuditInstance] SUCCESS - Audit instance created and populated');
            return populatedAudit;
        } catch (error) {
            console.error('[createAuditInstance] ERROR:', error.message);
            throw error;
        }
    }

    async getAllAuditInstances(requestingUser) {
        console.log('[getAllAuditInstances] START - Requesting user:', requestingUser);
        let query = {};

        try {
            if (requestingUser.role === 'super_admin' || requestingUser.role === 'admin') {
                const managedAuditors = await User.find({ managerId: requestingUser.id }).select('_id');
                const managedAuditorIds = (managedAuditors || []).map(a => a._id);
                console.log('[getAllAuditInstances] Managed auditor IDs:', managedAuditorIds);
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

            console.log('[getAllAuditInstances] Final query:', JSON.stringify(query));
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

    _canEdit(audit, user) {
        if (!user || !user.id) {
            console.error('[_canEdit] ERROR: Requesting user object is missing or invalid.');
            return false;
        }
        if (!audit || !audit.createdBy) {
            console.error('[_canEdit] ERROR: Audit object or createdBy field is missing.');
            return false;
        }

        console.log('[_canEdit] Checking edit permissions for status:', audit.status);

        const creatorId = typeof audit.createdBy === 'object' && audit.createdBy !== null ? audit.createdBy._id.toString() : audit.createdBy.toString();

        console.log('[_canEdit] Stored createdBy ID:', creatorId);
        console.log('[_canEdit] Requesting User ID:', user.id.toString());

        const isCreator = creatorId === user.id.toString();
        const isAssigned = audit.assignedAuditors.some(a => a.toString() === user.id.toString());
        const isAdminOrSuperAdmin = user.role === 'super_admin' || user.role === 'admin';

        console.log('[_canEdit] isCreator:', isCreator, 'isAssigned:', isAssigned, 'isAdminOrSuperAdmin:', isAdminOrSuperAdmin);

        switch (audit.status) {
            case 'Draft':
            case 'In Progress':
                return isAssigned;
            case 'In Review':
                return isAdminOrSuperAdmin;
            case 'Completed':
            case 'Archived':
                return false;
            default:
                return false;
        }
    }

    async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
        console.log('[assignAuditors] START - Audit ID:', auditInstanceId);
        console.log('[assignAuditors] Requesting User ID:', requestingUserId, 'Role:', requestingUserRole);
        console.log('[assignAuditors] User IDs to assign:', auditorIds);

        try {
            const audit = await AuditInstance.findById(auditInstanceId);
            if (!audit) {
                console.log('[assignAuditors] ERROR - Audit not found:', auditInstanceId);
                throw new Error('Audit Instance not found.');
            }
            console.log('[assignAuditors] Audit found successfully');

            if (requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
                console.log('[assignAuditors] ERROR - Unauthorized role:', requestingUserRole);
                throw new Error('Access denied. Only administrators can assign users to audits.');
            }
            console.log('[assignAuditors] Authorization check passed');

            console.log('[assignAuditors] Searching for users in database...');
            const users = await User.find({
                _id: { $in: auditorIds },
                role: { $in: ['auditor', 'admin'] },
                isActive: true
            }).select('_id firstName lastName email role managerId');

            console.log('[assignAuditors] Found', users.length, 'users out of', auditorIds.length, 'requested');
            console.log('[assignAuditors] Found users:', users.map(u => `${u.firstName} ${u.lastName} (${u.role})`));

            if (users.length === 0) {
                console.log('[assignAuditors] ERROR - No valid users found');
                throw new Error('No valid users found. Please ensure the selected users are active auditors or administrators.');
            }

            if (users.length !== auditorIds.length) {
                const foundIds = users.map(u => u._id.toString());
                const missingIds = auditorIds.filter(id => !foundIds.includes(id.toString()));
                console.log('[assignAuditors] ERROR - Missing user IDs:', missingIds);
                throw new Error(`Some users could not be found or are inactive. Please verify that all selected users are active auditors or administrators. Missing IDs: ${missingIds.join(', ')}`);
            }

            console.log('[assignAuditors] Checking management permissions...');
            const unauthorizedUsers = users.filter(user =>
                user.managerId?.toString() !== requestingUserId.toString()
            );

            if (unauthorizedUsers.length > 0) {
                const unauthorizedNames = unauthorizedUsers.map(u => `${u.firstName} ${u.lastName} (${u.role})`);
                console.log('[assignAuditors] ERROR - Unauthorized users found:', unauthorizedNames);
                throw new Error(`You can only assign users that are under your direct management. The following users are not managed by you: ${unauthorizedNames.join(', ')}. Please contact your administrator if you need to assign users from other teams.`);
            }

            console.log('[assignAuditors] Management permissions validated - all users are under requesting user management');

            audit.assignedAuditors = auditorIds;
            audit.lastModifiedBy = requestingUserId;
            await audit.save();
            console.log('[assignAuditors] Audit instance updated successfully');

            const populatedAudit = await audit.populate([
                { path: 'company', select: 'name' },
                { path: 'template', select: 'name version' },
                { path: 'assignedAuditors', select: 'firstName lastName email role' },
                { path: 'createdBy', select: 'firstName lastName email' },
                { path: 'lastModifiedBy', select: 'firstName lastName email' }
            ]);

            const assignedUsersList = users.map(u => `${u.firstName} ${u.lastName} (${u.role})`);
            console.log('[assignAuditors] SUCCESS - Successfully assigned the following users to audit:', assignedUsersList);
            console.log('[assignAuditors] Total users assigned:', users.length);

            return populatedAudit;
        } catch (error) {
            console.error('[assignAuditors] OPERATION FAILED');
            console.error('[assignAuditors] Error details:', {
                auditId: auditInstanceId,
                requestingUserId,
                requestingUserRole,
                attemptedAssignments: auditorIds,
                errorMessage: error.message,
                timestamp: new Date().toISOString()
            });
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

        if (audit.status === 'Completed' || audit.status === 'Archived') {
            throw new Error(`Cannot submit responses. Audit is already ${audit.status}.`);
        }

        for (const resp of responsesData) {
            const { questionId, selectedValue, comment, recommendation, includeCommentInReport, evidenceUrls } = resp;
            let existingResponse = audit.responses.find(r => r.questionId.toString() === questionId);

            // Find the question from the snapshot to get the correct score
            const questionFromSnapshot = audit.templateStructureSnapshot
                .flatMap(s => s.subSections)
                .flatMap(ss => ss.questions)
                .find(q => q._id.toString() === questionId);

            if (!questionFromSnapshot) {
                console.warn(`[submitResponses] Question with ID ${questionId} not found in snapshot. Skipping response.`);
                continue;
            }

            // Calculate score using the question's snapshot data
            const score = this._calcScore(questionFromSnapshot, selectedValue);

            if (existingResponse) {
                Object.assign(existingResponse, { selectedValue, comment, recommendation, includeCommentInReport, evidenceUrls, score, auditorId: requestingUser.id, lastUpdated: new Date() });
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
        
        // This is the core fix: Overall score is now calculated based on the responses array
        // and the authoritative template structure snapshot.
        audit.overallScore = this._calculateOverallScore(audit);
        audit.lastModifiedBy = requestingUser.id;
        await audit.save();
        console.log('[submitResponses] SUCCESS');
        return audit;
    }
    
    // This is the core fix for the score calculation.
    _calculateOverallScore(audit) {
        let totalAchievedScore = 0;
        let totalPossibleScore = 0;
    
        // Iterate over the definitive template structure snapshot
        for (const section of audit.templateStructureSnapshot) {
            for (const subSection of section.subSections) {
                for (const question of subSection.questions) {
                    // Find the corresponding response for the current question
                    const response = audit.responses.find(r => r.questionId.toString() === question._id.toString());
    
                    // Add question's weight to the total possible score
                    totalPossibleScore += question.weight;
    
                    if (response) {
                        // Use the score from the response, which was pre-calculated in submitResponses
                        totalAchievedScore += response.score;
                    }
                    // If no response, the achieved score for this question remains 0
                }
            }
        }
    
        if (totalPossibleScore === 0) {
            return 0; // Avoid division by zero
        }
    
        const overallPercentage = (totalAchievedScore / totalPossibleScore) * 100;
        return parseFloat(overallPercentage.toFixed(2));
    }

    _calcScore(question, value) {
        if (!question) return 0;
        if (question.type === 'single_choice' || question.type === 'multi_choice') {
            // Ensure value is an array for consistent handling of single and multi-choice
            const selectedValues = Array.isArray(value) ? value : [value];
            let questionScore = 0;
            // Iterate over the options to find the score of the selected answer(s)
            question.answerOptions.forEach(opt => {
                if (selectedValues.includes(opt.value)) {
                    questionScore += opt.score;
                }
            });
            return questionScore;
        }
        if (question.type === 'numeric' && typeof value === 'number') {
            return value;
        }
        return 0;
    }

    async updateAuditStatus(auditInstanceId, newStatus, requestingUser) {
        console.log('[updateAuditStatus] START');
        const audit = await AuditInstance.findById(auditInstanceId).populate('createdBy');
        if (!audit) throw new Error('Audit Instance not found.');

        const allowed = ['Draft', 'In Progress', 'In Review', 'Completed', 'Archived'];
        if (!allowed.includes(newStatus)) throw new Error('Invalid status provided.');

        let canChangeStatus = false;

        switch (audit.status) {
            case 'Draft':
            case 'In Progress':
                if (newStatus === 'In Review') {
                    const isAssigned = audit.assignedAuditors.some(a => a.toString() === requestingUser.id.toString());
                    canChangeStatus = isAssigned;
                }
                break;
            case 'In Review':
                if (newStatus === 'Completed') {
                    const isAdminOrSuperAdmin = requestingUser.role === 'super_admin' || requestingUser.role === 'admin';
                    canChangeStatus = isAdminOrSuperAdmin;
                }
                break;
            case 'Completed':
                if (newStatus === 'Archived') {
                    const isAdminOrSuperAdmin = requestingUser.role === 'super_admin' || requestingUser.role === 'admin';
                    canChangeStatus = isAdminOrSuperAdmin;
                }
                break;
        }

        if (!canChangeStatus) {
            throw new Error(`You are not authorized to change status from ${audit.status} to ${newStatus}.`);
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
        console.log('[deleteAuditInstance] START - Requesting user:', requestingUser);
        const audit = await AuditInstance.findById(auditInstanceId);
        if (!audit) throw new Error('Audit Instance not found.');

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

    async generateReport(auditInstanceId, requestingUser) {
        console.log('[generateReport] START - auditInstanceId:', auditInstanceId);
        try {
            const audit = await AuditInstance.findById(auditInstanceId)
                .populate({
                    path: 'company',
                    select: 'name industry contactPerson address website generalInfo examinationEnvironment'
                })
                .populate({ path: 'template' })
                .populate({ path: 'assignedAuditors', select: 'firstName lastName email' })
                .populate({ path: 'createdBy', select: 'firstName lastName email' });

            if (!audit) {
                throw new Error('Audit Instance not found.');
            }

            console.log('[generateReport] Company data:', JSON.stringify(audit.company, null, 2));
            console.log('[generateReport] Audit examinationEnvironment:', JSON.stringify(audit.examinationEnvironment, null, 2));

            const isCreator = audit.createdBy._id.toString() === requestingUser.id.toString();
            const isAssigned = audit.assignedAuditors.some(a => a._id.toString() === requestingUser.id.toString());
            const isAdminOrSuperAdmin = requestingUser.role === 'super_admin' || requestingUser.role === 'admin';

            if (!isCreator && !isAssigned && !isAdminOrSuperAdmin) {
                throw new Error('You are not authorized to generate a report for this audit instance.');
            }

            let auditorsToDisplay = [];
            if (audit.assignedAuditors?.length > 0) {
                auditorsToDisplay = audit.assignedAuditors;
            } else if (audit.createdBy) {
                auditorsToDisplay = [audit.createdBy];
            }

            const auditObj = audit.toObject();
            auditObj.auditorsToDisplay = auditorsToDisplay;

            console.log('[generateReport] Final audit object company:', JSON.stringify(auditObj.company, null, 2));
            console.log('[generateReport] Final audit object examinationEnvironment:', JSON.stringify(auditObj.examinationEnvironment, null, 2));

            const html = generateReportHtml(auditObj);
            console.log('[generateReport] HTML report content generated');

            const browser = await puppeteer.launch({
                args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
                ignoreHTTPSErrors: true,
            });

            console.log('[generateReport] Browser launched successfully with @sparticuz/chromium');

            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0', timeout: 60000 });
            console.log('[generateReport] HTML content set on page');

            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '0.6in', right: '0.6in', bottom: '0.6in', left: '0.6in' }
            });
            console.log('[generateReport] PDF generated successfully');

            await browser.close();
            console.log('[generateReport] Browser closed');

            return pdfBuffer;

        } catch (error) {
            console.error('[generateReport] ERROR occurred:', {
                auditId: auditInstanceId,
                userId: requestingUser.id,
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            });
            throw new Error(`Failed to generate PDF report: ${error.message}`);
        }
    }
}

export default new AuditInstanceService();