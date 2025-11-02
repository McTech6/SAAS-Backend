// // src/services/audit.service.js

// import AuditInstance from '../models/auditInstance.model.js';
// import Company from '../models/company.model.js';
// import AuditTemplate from '../models/auditTemplate.model.js';

// class AuditService {
//     /**
//      * Creates a new audit instance.
//      * Accessible by Super Admin and Admin.
//      * Admins can only create audits for companies they manage.
//      * @param {string} companyId - The ID of the company.
//      * @param {string} templateId - The ID of the audit template.
//      * @param {string} assignedToUserId - The ID of the auditor assigned to this audit.
//      * @param {string} createdByUserId - The ID of the user creating the audit.
//      * @param {string} createdByUserRole - The role of the user creating the audit.
//      * @returns {Promise<AuditInstance>} The newly created audit instance.
//      * @throws {Error} If company not found or user unauthorized.
//      */
//     async createAuditInstance(companyId, templateId, assignedToUserId, createdByUserId, createdByUserRole) {
//         // Find company to check if user has access to it.
//         const company = await Company.findById(companyId);
//         if (!company) {
//             throw new Error('Company not found.');
//         }

//         // --- Permission check for creating an audit ---
//         if (createdByUserRole === 'admin' && company.createdBy.toString() !== createdByUserId) {
//             // Admin must be the creator of the company to create an audit for it.
//             throw new Error('You are not authorized to create an audit for this company.');
//         } else if (createdByUserRole === 'auditor') {
//             // Auditors cannot create audits.
//             throw new Error('Auditors are not authorized to create new audits.');
//         }

//         const newAuditInstance = new AuditInstance({
//             company: companyId,
//             template: templateId,
//             assignedTo: assignedToUserId,
//             createdBy: createdByUserId,
//             status: 'draft'
//         });

//         await newAuditInstance.save();
//         return newAuditInstance;
//     }

//     /**
//      * Retrieves a single audit instance with full access control.
//      * @param {string} auditId - The ID of the audit to retrieve.
//      * @param {string} requestingUserId - The ID of the user making the request.
//      * @param {string} requestingUserRole - The role of the user making the request.
//      * @returns {Promise<AuditInstance>} The audit instance object.
//      * @throws {Error} If audit not found or user unauthorized.
//      */
//     async getAuditInstance(auditId, requestingUserId, requestingUserRole) {
//         const audit = await AuditInstance.findById(auditId)
//             .populate('company', 'name')
//             .populate('template', 'templateName')
//             .populate('createdBy', 'firstName lastName')
//             .populate('assignedTo', 'firstName lastName');

//         if (!audit) {
//             throw new Error('Audit instance not found.');
//         }

//         // --- Permission check for viewing an audit ---
//         const requestingUserIdString = requestingUserId.toString();
//         const createdByString = audit.createdBy.toString();
//         const assignedToString = audit.assignedTo.toString();

//         let isAuthorized = false;

//         // Super Admin can view audits they created or are assigned to.
//         if (requestingUserRole === 'super_admin' && (createdByString === requestingUserIdString || assignedToString === requestingUserIdString)) {
//             isAuthorized = true;
//         }
//         // Admin can view audits they created.
//         else if (requestingUserRole === 'admin' && createdByString === requestingUserIdString) {
//             isAuthorized = true;
//         }
//         // Auditor can view audits they are assigned to.
//         else if (requestingUserRole === 'auditor' && assignedToString === requestingUserIdString) {
//             isAuthorized = true;
//         }

//         if (!isAuthorized) {
//             throw new Error('You are not authorized to view this audit.');
//         }

//         return audit;
//     }

//     /**
//      * Updates an existing audit instance.
//      * @param {string} auditId - The ID of the audit to update.
//      * @param {object} updates - Fields to update.
//      * @param {string} requestingUserId - The ID of the user making the request.
//      * @param {string} requestingUserRole - The role of the user making the request.
//      * @returns {Promise<AuditInstance>} The updated audit instance object.
//      * @throws {Error} If audit not found or user unauthorized.
//      */
//     async updateAuditInstance(auditId, updates, requestingUserId, requestingUserRole) {
//         const audit = await AuditInstance.findById(auditId);

//         if (!audit) {
//             throw new Error('Audit instance not found.');
//         }

//         // --- Permission check for updating an audit ---
//         const requestingUserIdString = requestingUserId.toString();
//         const createdByString = audit.createdBy.toString();
//         const assignedToString = audit.assignedTo.toString();

//         let isAuthorizedToUpdate = false;

//         // Super Admin can update audits they created or are assigned to.
//         if (requestingUserRole === 'super_admin' && (createdByString === requestingUserIdString || assignedToString === requestingUserIdString)) {
//             isAuthorizedToUpdate = true;
//         }
//         // Admin can update audits they created.
//         else if (requestingUserRole === 'admin' && createdByString === requestingUserIdString) {
//             isAuthorizedToUpdate = true;
//         }
//         // Auditor can update audits they are assigned to.
//         else if (requestingUserRole === 'auditor' && assignedToString === requestingUserIdString) {
//             isAuthorizedToUpdate = true;
//         }

//         if (!isAuthorizedToUpdate) {
//             throw new Error('You are not authorized to update this audit.');
//         }

//         // --- Permission check for completing an audit (stricter rule) ---
//         if (updates.status === 'completed') {
//             const isAuthorizedToComplete = (requestingUserRole === 'super_admin' && createdByString === requestingUserIdString) ||
//                                            (requestingUserRole === 'admin' && createdByString === requestingUserIdString);

//             if (!isAuthorizedToComplete) {
//                 throw new Error('You do not have permission to mark this audit as completed.');
//             }
//         }

//         // Perform the update
//         const updatedAudit = await AuditInstance.findByIdAndUpdate(
//             auditId,
//             { ...updates },
//             { new: true, runValidators: true }
//         ).populate('company', 'name')
//          .populate('template', 'templateName')
//          .populate('createdBy', 'firstName lastName')
//          .populate('assignedTo', 'firstName lastName');

//         if (!updatedAudit) {
//             throw new Error('Audit instance not found after update.');
//         }

//         return updatedAudit;
//     }
// }

// export default new AuditService();


import AuditInstance from '../models/auditInstance.model.js';
import Company from '../models/company.model.js';
import AuditTemplate from '../models/auditTemplate.model.js';
import { translateAuditTemplate } from '../utils/dataTranslator.js';   // <-- NEW

class AuditService {
  async createAuditInstance(companyId, templateId, assignedToUserId, createdByUserId, createdByUserRole, lang) { // <-- added lang
    const company = await Company.findById(companyId);
    if (!company) throw new Error('COMPANY_NOT_FOUND');

    if (createdByUserRole === 'admin' && company.createdBy.toString() !== createdByUserId) {
      throw new Error('COMPANY_UPDATE_UNAUTHORIZED');
    } else if (createdByUserRole === 'auditor') {
      throw new Error('NOT_AUTHORIZED');
    }

    // Translate template before saving snapshot
    const template = await AuditTemplate.findById(templateId);
    if (!template) throw new Error('TEMPLATE_NOT_FOUND');
    const translatedTemplate = await translateAuditTemplate(template, lang);

    const newAuditInstance = new AuditInstance({
      company: companyId,
      template: templateId,
      assignedTo: assignedToUserId,
      createdBy: createdByUserId,
      status: 'draft',
      templateNameSnapshot: translatedTemplate.name,               // <-- translated
      templateStructureSnapshot: JSON.parse(JSON.stringify(translatedTemplate.sections))
    });

    await newAuditInstance.save();
    return newAuditInstance;
  }

  async getAuditInstance(auditId, requestingUserId, requestingUserRole, lang) { // <-- added lang
    const audit = await AuditInstance.findById(auditId)
      .populate('company', 'name')
      .populate('template', 'templateName')
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .lean();

    if (!audit) throw new Error('AUDIT_INSTANCE_NOT_FOUND');

    // Translate snapshot on-the-fly
    const translatedSections = await translateAuditTemplate(
      { sections: audit.templateStructureSnapshot },
      lang
    ).then(t => t.sections);

    const auditObj = { ...audit, templateStructureSnapshot: translatedSections };

    const requestingUserIdString = requestingUserId.toString();
    const createdByString = audit.createdBy._id.toString();
    const assignedToString = audit.assignedTo._id.toString();

    let isAuthorized = false;

    if (requestingUserRole === 'super_admin' && (createdByString === requestingUserIdString || assignedToString === requestingUserIdString)) {
      isAuthorized = true;
    } else if (requestingUserRole === 'admin' && createdByString === requestingUserIdString) {
      isAuthorized = true;
    } else if (requestingUserRole === 'auditor' && assignedToString === requestingUserIdString) {
      isAuthorized = true;
    }

    if (!isAuthorized) throw new Error('NOT_AUTHORIZED');
    return auditObj;
  }

  async updateAuditInstance(auditId, updates, requestingUserId, requestingUserRole, lang) { // <-- added lang
    const audit = await AuditInstance.findById(auditId);
    if (!audit) throw new Error('AUDIT_INSTANCE_NOT_FOUND');

    const requestingUserIdString = requestingUserId.toString();
    const createdByString = audit.createdBy.toString();
    const assignedToString = audit.assignedTo.toString();

    let isAuthorizedToUpdate = false;

    if (requestingUserRole === 'super_admin' && (createdByString === requestingUserIdString || assignedToString === requestingUserIdString)) {
      isAuthorizedToUpdate = true;
    } else if (requestingUserRole === 'admin' && createdByString === requestingUserIdString) {
      isAuthorizedToUpdate = true;
    } else if (requestingUserRole === 'auditor' && assignedToString === requestingUserIdString) {
      isAuthorizedToUpdate = true;
    }

    if (!isAuthorizedToUpdate) throw new Error('NOT_AUTHORIZED');

    if (updates.status === 'completed') {
      const isAuthorizedToComplete = (requestingUserRole === 'super_admin' && createdByString === requestingUserIdString) ||
                                     (requestingUserRole === 'admin'    && createdByString === requestingUserIdString);
      if (!isAuthorizedToComplete) throw new Error('MARK_COMPLETED_UNAUTHORIZED');
    }

    const updatedAudit = await AuditInstance.findByIdAndUpdate(
      auditId,
      { ...updates },
      { new: true, runValidators: true }
    )
      .populate('company', 'name')
      .populate('template', 'templateName')
      .populate('createdBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName')
      .lean();

    // Translate snapshot before returning
    const translatedSections = await translateAuditTemplate(
      { sections: updatedAudit.templateStructureSnapshot },
      lang
    ).then(t => t.sections);

    return { ...updatedAudit, templateStructureSnapshot: translatedSections };
  }
}

export default new AuditService();