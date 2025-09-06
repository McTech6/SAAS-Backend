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

 /* -------------------------------------------------- */
/* ASSIGN AUDITORS                                    */
/* -------------------------------------------------- */
// async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
//   console.log('[assignAuditors] START - Audit ID:', auditInstanceId);
//   console.log('[assignAuditors] Requesting User ID:', requestingUserId, 'Role:', requestingUserRole);
//   console.log('[assignAuditors] User IDs to assign:', auditorIds);
  
//   try {
//     const audit = await AuditInstance.findById(auditInstanceId);
//     if (!audit) {
//       console.log('[assignAuditors] ERROR - Audit not found:', auditInstanceId);
//       throw new Error('Audit Instance not found.');
//     }
//     console.log('[assignAuditors] Audit found successfully');

//     // Check if requesting user has permission to assign auditors
//     if (requestingUserRole !== 'super_admin' && requestingUserRole !== 'admin') {
//       console.log('[assignAuditors] ERROR - Unauthorized role:', requestingUserRole);
//       throw new Error('Access denied. Only administrators can assign users to audits.');
//     }
//     console.log('[assignAuditors] Authorization check passed');

//     // Find users with the provided IDs (both auditors and admins are allowed)
//     console.log('[assignAuditors] Searching for users in database...');
//     const users = await User.find({
//       _id: { $in: auditorIds },
//       role: { $in: ['auditor', 'admin'] }, // Allow both auditors and admins
//       isActive: true // Only active users
//     }).select('_id firstName lastName email role managerId');
    
//     console.log('[assignAuditors] Found', users.length, 'users out of', auditorIds.length, 'requested');
//     console.log('[assignAuditors] Found users:', users.map(u => `${u.firstName} ${u.lastName} (${u.role})`));

//     // Check if all provided IDs are valid
//     if (users.length === 0) {
//       console.log('[assignAuditors] ERROR - No valid users found');
//       throw new Error('No valid users found. Please ensure the selected users are active auditors or administrators.');
//     }

//     if (users.length !== auditorIds.length) {
//       const foundIds = users.map(u => u._id.toString());
//       const missingIds = auditorIds.filter(id => !foundIds.includes(id.toString()));
//       console.log('[assignAuditors] ERROR - Missing user IDs:', missingIds);
//       throw new Error(`Some users could not be found or are inactive. Please verify that all selected users are active auditors or administrators. Missing IDs: ${missingIds.join(', ')}`);
//     }

//     // Both super admin and admin can only assign users they manage
//     console.log('[assignAuditors] Checking management permissions...');
//     const unauthorizedUsers = users.filter(user => 
//       user.managerId?.toString() !== requestingUserId.toString()
//     );

//     if (unauthorizedUsers.length > 0) {
//       const unauthorizedNames = unauthorizedUsers.map(u => `${u.firstName} ${u.lastName} (${u.role})`);
//       console.log('[assignAuditors] ERROR - Unauthorized users found:', unauthorizedNames);
//       throw new Error(`You can only assign users that are under your direct management. The following users are not managed by you: ${unauthorizedNames.join(', ')}. Please contact your administrator if you need to assign users from other teams.`);
//     }
    
//     console.log('[assignAuditors] Management permissions validated - all users are under requesting user management');

//     // Update the audit instance
//     console.log('[assignAuditors] Updating audit instance with new assignments...');
//     audit.assignedAuditors = auditorIds;
//     audit.lastModifiedBy = requestingUserId;
//     await audit.save();
//     console.log('[assignAuditors] Audit instance updated successfully');

//     // Populate and return the updated audit
//     console.log('[assignAuditors] Populating audit data for response...');
//     const populatedAudit = await audit.populate([
//       { path: 'company', select: 'name' },
//       { path: 'template', select: 'name version' },
//       { path: 'assignedAuditors', select: 'firstName lastName email role' }, // Include role in response
//       { path: 'createdBy', select: 'firstName lastName email' },
//       { path: 'lastModifiedBy', select: 'firstName lastName email' }
//     ]);

//     const assignedUsersList = users.map(u => `${u.firstName} ${u.lastName} (${u.role})`);
//     console.log('[assignAuditors] SUCCESS - Successfully assigned the following users to audit:', assignedUsersList);
//     console.log('[assignAuditors] Total users assigned:', users.length);
    
//     return populatedAudit;
//   } catch (error) {
//     console.error('[assignAuditors] OPERATION FAILED');
//     console.error('[assignAuditors] Error details:', {
//       auditId: auditInstanceId,
//       requestingUserId,
//       requestingUserRole,
//       attemptedAssignments: auditorIds,
//       errorMessage: error.message,
//       timestamp: new Date().toISOString()
//     });
//     throw error;
//   }
// }

/* -------------------------------------------------- */
/* ASSIGN AUDITORS   (DEBUG VERSION)                 */
/* -------------------------------------------------- */
async assignAuditors(auditInstanceId, auditorIds, requestingUserId, requestingUserRole) {
  console.log('\n========== [assignAuditors] START ==========');
  console.log('[assignAuditors] auditInstanceId :', auditInstanceId);
  console.log('[assignAuditors] requestingUserId :', requestingUserId, 'role:', requestingUserRole);
  console.log('[assignAuditors] raw auditorIds  :', auditorIds);

  /* ---------- 1.  Audit exists? ---------- */
  const audit = await AuditInstance.findById(auditInstanceId);
  if (!audit) {
    console.log('[assignAuditors] ❌ Audit Instance not found');
    throw new Error('Audit Instance not found.');
  }
  console.log('[assignAuditors] ✅ Audit found. ID:', audit._id.toString());

  /* ---------- 2.  Role check ---------- */
  if (!['super_admin', 'admin'].includes(requestingUserRole)) {
    console.log('[assignAuditors] ❌ Requestor role is', requestingUserRole, '- not allowed');
    throw new Error('Access denied. Only administrators can assign users to audits.');
  }
  console.log('[assignAuditors] ✅ Role check passed');

  /* ---------- 3.  Sanitise auditorIds ---------- */
  if (!Array.isArray(auditorIds) || !auditorIds.length) {
    console.log('[assignAuditors] ❌ auditorIds is not a non-empty array');
    throw new Error('auditorIds must be a non-empty array.');
  }
  // ensure strings
  auditorIds = auditorIds.map(id => id.toString());
  console.log('[assignAuditors] sanitised auditorIds:', auditorIds);

  /* ---------- 4.  Users exist & are active auditors/admins ---------- */
  const users = await User.find({
    _id: { $in: auditorIds },
    role: { $in: ['auditor', 'admin'] },
    isActive: true
  }).select('_id firstName lastName email role managerId');

  console.log('[assignAuditors] found users:', users.map(u => ({
    id: u._id.toString(),
    name: `${u.firstName} ${u.lastName}`,
    role: u.role,
    managerId: u.managerId?.toString()
  })));

  if (users.length !== auditorIds.length) {
    const foundIds = users.map(u => u._id.toString());
    const missing = auditorIds.filter(id => !foundIds.includes(id));
    console.log('[assignAuditors] ❌ Some IDs invalid or inactive:', missing);
    throw new Error(`Some users could not be found or are inactive. Invalid IDs: ${missing.join(', ')}`);
  }

  /* ---------- 5.  Manager hierarchy check ---------- */
  if (requestingUserRole !== 'super_admin') {
    const unauthorised = users.filter(u => u.managerId?.toString() !== requestingUserId.toString());
    if (unauthorised.length) {
      const names = unauthorised.map(u => `${u.firstName} ${u.lastName} (${u.role})`);
      console.log('[assignAuditors] ❌ Users not managed by requestor:', names);
      throw new Error(`You can only assign users that are under your direct management: ${names.join(', ')}`);
    }
  }
  console.log('[assignAuditors] ✅ Hierarchy check passed');

  /* ---------- 6.  Assignment ---------- */
  audit.assignedAuditors = auditorIds;
  audit.lastModifiedBy = requestingUserId;
  await audit.save();

  /* ---------- 7.  Populate for response ---------- */
  const populated = await audit.populate([
    { path: 'company', select: 'name' },
    { path: 'template', select: 'name version' },
    { path: 'assignedAuditors', select: 'firstName lastName email role' },
    { path: 'createdBy', select: 'firstName lastName email' },
    { path: 'lastModifiedBy', select: 'firstName lastName email' }
  ]);

  console.log('[assignAuditors] ✅ SUCCESS. Assigned:', auditorIds);
  console.log('========== [assignAuditors] END ==========\n');
  return populated;
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
//   async generateReport(auditInstanceId, requestingUser) {
//     console.log('[generateReport] START - auditInstanceId:', auditInstanceId);
//     const audit = await this.getAuditInstanceById(auditInstanceId, requestingUser);
//     const html = generateReportHtml(audit);

//     const browser = await puppeteer.launch({
//       headless: true,
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });
//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       printBackground: true,
//       margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
//       displayHeaderFooter: true,
//       headerTemplate: '<div></div>',
//       footerTemplate: `<div style="font-size:9pt;text-align:center;width:100%">
//                           <span class="pageNumber"></span> / <span class="totalPages"></span>
//                         </div>`
//     });
//     await browser.close();
//     return pdfBuffer;
//   }

/* -------------------------------------------------- */
/* GENERATE PDF REPORT                                */
/* -------------------------------------------------- */
async generateReport(auditInstanceId, requestingUser) {
  console.log('[generateReport] START - auditInstanceId:', auditInstanceId);
  
  try {
    const audit = await this.getAuditInstanceById(auditInstanceId, requestingUser);
    console.log('[generateReport] Audit data retrieved successfully');
    
    const html = generateReportHtml(audit);
    console.log('[generateReport] HTML report generated');

    // First, try to install Chrome if it's missing
    try {
      console.log('[generateReport] Checking Chrome installation...');
      const { execSync } = await import('child_process');
      
      // Try to install Chrome if not found
      console.log('[generateReport] Attempting to install Chrome...');
      execSync('npx puppeteer browsers install chrome', { 
        stdio: 'inherit',
        timeout: 120000 // 2 minutes timeout
      });
      console.log('[generateReport] Chrome installation completed');
    } catch (installError) {
      console.log('[generateReport] Chrome installation warning:', installError.message);
      // Continue anyway, might already be installed
    }

    // Enhanced Puppeteer configuration for Render
    const puppeteerOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    };

    // Try to find Chrome executable
    if (process.env.NODE_ENV === 'production') {
      const chromePaths = [
        '/opt/render/.cache/puppeteer/chrome/*/chrome-linux64/chrome',
        '/usr/bin/google-chrome-stable',
        '/usr/bin/google-chrome',
        '/usr/bin/chromium-browser',
        '/usr/bin/chromium',
        process.env.CHROME_BIN,
        process.env.PUPPETEER_EXECUTABLE_PATH
      ].filter(Boolean);

      // Use glob to find Chrome in cache directory
      try {
        const glob = await import('glob');
        const chromeInCache = glob.globSync('/opt/render/.cache/puppeteer/chrome/*/chrome-linux*/chrome');
        if (chromeInCache.length > 0) {
          puppeteerOptions.executablePath = chromeInCache[0];
          console.log('[generateReport] Found Chrome in cache:', chromeInCache[0]);
        }
      } catch (globError) {
        console.log('[generateReport] Glob search failed:', globError.message);
      }

      // If not found in cache, try system paths
      if (!puppeteerOptions.executablePath) {
        const fs = await import('fs');
        for (const chromePath of chromePaths) {
          if (fs.existsSync && fs.existsSync(chromePath)) {
            puppeteerOptions.executablePath = chromePath;
            console.log('[generateReport] Using Chrome at:', chromePath);
            break;
          }
        }
      }
    }

    console.log('[generateReport] Launching browser with config:', {
      executablePath: puppeteerOptions.executablePath || 'default',
      headless: puppeteerOptions.headless
    });
    
    const browser = await puppeteer.launch(puppeteerOptions);
    
    const page = await browser.newPage();
    console.log('[generateReport] Browser page created');
    
    // Set content and wait for it to load
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 30000 // 30 second timeout
    });
    console.log('[generateReport] HTML content set on page');
    
    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '1in', right: '1in', bottom: '1in', left: '1in' },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `<div style="font-size:9pt;text-align:center;width:100%">
                          <span class="pageNumber"></span> / <span class="totalPages"></span>
                        </div>`,
      timeout: 30000 // 30 second timeout for PDF generation
    });
    
    console.log('[generateReport] PDF generated successfully, size:', pdfBuffer.length, 'bytes');
    
    await browser.close();
    console.log('[generateReport] Browser closed successfully');
    
    return pdfBuffer;
    
  } catch (error) {
    console.error('[generateReport] ERROR occurred:', {
      auditId: auditInstanceId,
      userId: requestingUser.id,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    // Provide more specific error messages
    if (error.message.includes('Chrome') || error.message.includes('browser')) {
      throw new Error('PDF generation service is temporarily unavailable. Chrome browser could not be found or started. Please contact support.');
    } else if (error.message.includes('timeout')) {
      throw new Error('PDF generation timed out. The report might be too large. Please try again.');
    } else {
      throw new Error(`Failed to generate PDF report: ${error.message}`);
    }
  }
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