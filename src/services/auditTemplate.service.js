// // src/services/auditTemplate.service.js

// import AuditTemplate from '../models/auditTemplate.model.js';

// /**
//  * Service for managing Audit Templates.
//  * CRUD operations are primarily for Super Admin.
//  * Read operations are for Super Admin, Admin, and Auditor.
//  */
// class AuditTemplateService {
//     /**
//      * Creates a new audit template.
//      * @param {object} templateData - Data for the new audit template.
//      * @param {string} createdByUserId - The ID of the Super Admin creating the template.
//      * @returns {Promise<AuditTemplate>} The newly created audit template.
//      * @throws {Error} If template name already exists.
//      */
//     async createAuditTemplate(templateData, createdByUserId) {
//         const newTemplate = new AuditTemplate({
//             ...templateData,
//             createdBy: createdByUserId,
//             lastModifiedBy: createdByUserId
//         });
//         await newTemplate.save();
//         // FIX: Use single populate call with array for robustness
//         return newTemplate.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);
//     }

//     /**
//      * Retrieves all audit templates.
//      * @returns {Promise<Array<AuditTemplate>>} A list of all audit templates.
//      */
//     async getAllAuditTemplates() {
//         // FIX: Use single populate call with array for robustness
//         return AuditTemplate.find()
//                             .populate([
//                                 { path: 'createdBy', select: 'firstName lastName email' },
//                                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//                             ]);
//     }

//     /**
//      * Retrieves a single audit template by its ID.
//      * @param {string} templateId - The ID of the audit template to retrieve.
//      * @returns {Promise<AuditTemplate>} The audit template object.
//      * @throws {Error} If template not found.
//      */
//     async getAuditTemplateById(templateId) {
//         // FIX: Use single populate call with array for robustness
//         const template = await AuditTemplate.findById(templateId)
//                                             .populate([
//                                                 { path: 'createdBy', select: 'firstName lastName email' },
//                                                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//                                             ]);
//         if (!template) {
//             throw new Error('Audit Template not found.');
//         }
//         return template;
//     }

//     /**
//      * Updates an existing audit template.
//      * @param {string} templateId - The ID of the audit template to update.
//      * @param {object} updates - Fields to update.
//      * @param {string} requestingUserId - The ID of the Super Admin updating the template.
//      * @returns {Promise<AuditTemplate>} The updated audit template.
//      * @throws {Error} If template not found or update fails.
//      */
//     async updateAuditTemplate(templateId, updates, requestingUserId) {
//         const template = await AuditTemplate.findById(templateId);

//         if (!template) {
//             throw new Error('Audit Template not found.');
//         }

//         // Apply updates
//         Object.keys(updates).forEach(key => {
//             // Basic validation to prevent arbitrary field updates
//             if (['name', 'description', 'version', 'status', 'sections'].includes(key)) {
//                 template[key] = updates[key];
//             }
//         });

//         template.lastModifiedBy = requestingUserId; // Update last modified user

//         await template.save();
//         // FIX: Use single populate call with array for robustness
//         return template.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);
//     }

//     /**
//      * Deletes an audit template permanently.
//      * @param {string} templateId - The ID of the audit template to delete.
//      * @returns {Promise<void>}
//      * @throws {Error} If template not found.
//      */
//     async deleteAuditTemplate(templateId) {
//         const template = await AuditTemplate.findByIdAndDelete(templateId);
//         if (!template) {
//             throw new Error('Audit Template not found.');
//         }
//     }
// }

// export default new AuditTemplateService();

// src/services/auditTemplate.service.js

import AuditTemplate from '../models/auditTemplate.model.js';
import { translateAuditTemplate } from '../utils/dataTranslator.js'; // <-- IMPORTED

/**
 * Service for managing Audit Templates.
 * CRUD operations are primarily for Super Admin.
 * Read operations are for Super Admin, Admin, and Auditor.
 */
class AuditTemplateService {
    /**
     * Creates a new audit template.
     */
    async createAuditTemplate(templateData, createdByUserId) {
        // Check if template name already exists
        const existingTemplate = await AuditTemplate.findOne({ name: templateData.name });
        if (existingTemplate) {
            // Throw the message key, not the full string
            throw new Error('TEMPLATE_NAME_EXISTS'); 
        }

        const newTemplate = new AuditTemplate({
            ...templateData,
            createdBy: createdByUserId,
            lastModifiedBy: createdByUserId
        });
        await newTemplate.save();
        
        const populatedTemplate = await newTemplate.populate([
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'lastModifiedBy', select: 'firstName lastName email' }
        ]);

        return { newTemplate: populatedTemplate, messageKey: 'TEMPLATE_CREATED' }; // <-- RETURN MESSAGE KEY
    }

    /**
     * Retrieves all audit templates.
     */
    async getAllAuditTemplates(lang) { // <-- ACCEPTED LANG
        const templates = await AuditTemplate.find()
            .populate([
                { path: 'createdBy', select: 'firstName lastName email' },
                { path: 'lastModifiedBy', select: 'firstName lastName email' }
            ])
            .lean(); // Use .lean() to allow mutation

        // Translate all templates concurrently
        const translatedTemplates = await Promise.all(
            templates.map(template => translateAuditTemplate(template, lang)) // <-- APPLY TRANSLATION
        );

        return { templates: translatedTemplates, messageKey: 'TEMPLATES_RETRIEVED' }; // <-- RETURN MESSAGE KEY
    }

    /**
     * Retrieves a single audit template by its ID.
     */
    async getAuditTemplateById(templateId, lang) { // <-- ACCEPTED LANG
        const template = await AuditTemplate.findById(templateId)
            .populate([
                { path: 'createdBy', select: 'firstName lastName email' },
                { path: 'lastModifiedBy', select: 'firstName lastName email' }
            ])
            .lean(); // Use .lean() to allow mutation

        if (!template) {
            throw new Error('TEMPLATE_NOT_FOUND'); // <-- RETURN MESSAGE KEY
        }

        const translatedTemplate = await translateAuditTemplate(template, lang); // <-- APPLY TRANSLATION

        return { template: translatedTemplate, messageKey: 'TEMPLATE_RETRIEVED' }; // <-- RETURN MESSAGE KEY
    }

    /**
     * Updates an existing audit template.
     */
    async updateAuditTemplate(templateId, updates, requestingUserId) {
        // Find by ID and check name uniqueness if name is being updated
        const template = await AuditTemplate.findById(templateId);

        if (!template) {
            throw new Error('TEMPLATE_NOT_FOUND'); // <-- RETURN MESSAGE KEY
        }

        if (updates.name && updates.name !== template.name) {
             const existingTemplate = await AuditTemplate.findOne({ name: updates.name });
             if (existingTemplate && !existingTemplate._id.equals(templateId)) {
                throw new Error('TEMPLATE_NAME_EXISTS'); // <-- RETURN MESSAGE KEY
             }
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            if (['name', 'description', 'version', 'status', 'sections'].includes(key)) {
                template[key] = updates[key];
            }
        });

        template.lastModifiedBy = requestingUserId; // Update last modified user
        await template.save();

        const updatedTemplate = await template.populate([
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'lastModifiedBy', select: 'firstName lastName email' }
        ]);

        return { updatedTemplate, messageKey: 'TEMPLATE_UPDATED' }; // <-- RETURN MESSAGE KEY
    }

    /**
     * Deletes an audit template permanently.
     */
    async deleteAuditTemplate(templateId) {
        const template = await AuditTemplate.findByIdAndDelete(templateId);
        if (!template) {
            throw new Error('TEMPLATE_NOT_FOUND'); // <-- RETURN MESSAGE KEY
        }
        return { messageKey: 'TEMPLATE_DELETED' }; // <-- RETURN MESSAGE KEY
    }
}

export default new AuditTemplateService();