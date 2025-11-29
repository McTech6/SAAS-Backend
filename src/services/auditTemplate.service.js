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

// // src/services/auditTemplate.service.js

// import AuditTemplate from '../models/auditTemplate.model.js';
// import { translateAuditTemplate } from '../utils/dataTranslator.js'; // <-- IMPORTED

// /**
//  * Service for managing Audit Templates.
//  * CRUD operations are primarily for Super Admin.
//  * Read operations are for Super Admin, Admin, and Auditor.
//  */
// class AuditTemplateService {
//     /**
//      * Creates a new audit template.
//      */
//     async createAuditTemplate(templateData, createdByUserId) {
//         // Check if template name already exists
//         const existingTemplate = await AuditTemplate.findOne({ name: templateData.name });
//         if (existingTemplate) {
//             // Throw the message key, not the full string
//             throw new Error('TEMPLATE_NAME_EXISTS'); 
//         }

//         const newTemplate = new AuditTemplate({
//             ...templateData,
//             createdBy: createdByUserId,
//             lastModifiedBy: createdByUserId
//         });
//         await newTemplate.save();
        
//         const populatedTemplate = await newTemplate.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);

//         return { newTemplate: populatedTemplate, messageKey: 'TEMPLATE_CREATED' }; // <-- RETURN MESSAGE KEY
//     }

//     /**
//      * Retrieves all audit templates.
//      */
//     async getAllAuditTemplates(lang) { // <-- ACCEPTED LANG
//         const templates = await AuditTemplate.find()
//             .populate([
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ])
//             .lean(); // Use .lean() to allow mutation

//         // Translate all templates concurrently
//         const translatedTemplates = await Promise.all(
//             templates.map(template => translateAuditTemplate(template, lang)) // <-- APPLY TRANSLATION
//         );

//         return { templates: translatedTemplates, messageKey: 'TEMPLATES_RETRIEVED' }; // <-- RETURN MESSAGE KEY
//     }

//     /**
//      * Retrieves a single audit template by its ID.
//      */
//     async getAuditTemplateById(templateId, lang) { // <-- ACCEPTED LANG
//         const template = await AuditTemplate.findById(templateId)
//             .populate([
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ])
//             .lean(); // Use .lean() to allow mutation

//         if (!template) {
//             throw new Error('TEMPLATE_NOT_FOUND'); // <-- RETURN MESSAGE KEY
//         }

//         const translatedTemplate = await translateAuditTemplate(template, lang); // <-- APPLY TRANSLATION

//         return { template: translatedTemplate, messageKey: 'TEMPLATE_RETRIEVED' }; // <-- RETURN MESSAGE KEY
//     }

//     /**
//      * Updates an existing audit template.
//      */
//     async updateAuditTemplate(templateId, updates, requestingUserId) {
//         // Find by ID and check name uniqueness if name is being updated
//         const template = await AuditTemplate.findById(templateId);

//         if (!template) {
//             throw new Error('TEMPLATE_NOT_FOUND'); // <-- RETURN MESSAGE KEY
//         }

//         if (updates.name && updates.name !== template.name) {
//              const existingTemplate = await AuditTemplate.findOne({ name: updates.name });
//              if (existingTemplate && !existingTemplate._id.equals(templateId)) {
//                 throw new Error('TEMPLATE_NAME_EXISTS'); // <-- RETURN MESSAGE KEY
//              }
//         }

//         // Apply updates
//         Object.keys(updates).forEach(key => {
//             if (['name', 'description', 'version', 'status', 'sections'].includes(key)) {
//                 template[key] = updates[key];
//             }
//         });

//         template.lastModifiedBy = requestingUserId; // Update last modified user
//         await template.save();

//         const updatedTemplate = await template.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);

//         return { updatedTemplate, messageKey: 'TEMPLATE_UPDATED' }; // <-- RETURN MESSAGE KEY
//     }

//     /**
//      * Deletes an audit template permanently.
//      */
//     async deleteAuditTemplate(templateId) {
//         const template = await AuditTemplate.findByIdAndDelete(templateId);
//         if (!template) {
//             throw new Error('TEMPLATE_NOT_FOUND'); // <-- RETURN MESSAGE KEY
//         }
//         return { messageKey: 'TEMPLATE_DELETED' }; // <-- RETURN MESSAGE KEY
//     }
// }

// export default new AuditTemplateService();



// import AuditTemplate from '../models/auditTemplate.model.js';
// import Subscription from '../models/subscription.model.js'; // <-- NEW IMPORT
// import { translateAuditTemplate } from '../utils/dataTranslator.js'; 
// import { MESSAGES } from '../utils/messages.js';

// /**
//  * Service for managing Audit Templates.
//  */
// class AuditTemplateService {
//     /**
//      * Helper to determine the template filter based on the user's subscription.
//      * @param {Object} requestingUser - The authenticated user object containing subscriptionId and role.
//      * @returns {Object} A Mongoose query object.
//      */
//     async getTemplateFilter(requestingUser) {
//         if (requestingUser.role === 'super_admin') {
//             // Super Admin sees all templates
//             return {};
//         }
        
//         if (!requestingUser.subscriptionId) {
//             // User is not a Super Admin and has no subscription, cannot access templates
//             return { _id: null }; 
//         }

//         const subscription = await Subscription.findById(requestingUser.subscriptionId).lean();
//         if (!subscription) {
//             return { _id: null };
//         }

//         const allowedTemplateIds = subscription.templateAccess;

//         if (allowedTemplateIds.length === 0 && subscription.name === 'Enterprise') {
//             // Enterprise plan (or similar) often implies access to all public templates.
//             return {}; 
//         } else if (allowedTemplateIds.length > 0) {
//             // Filter by the specific IDs allowed in the plan
//             return { _id: { $in: allowedTemplateIds } };
//         } else {
//             // Other plans with no configured access, effectively denying access
//             return { _id: null };
//         }
//     }


//     /**
//      * Creates a new audit template. (Only available to Super Admin, authorization handled elsewhere)
//      */
//     async createAuditTemplate(templateData, createdByUserId) {
//         // Check if template name already exists
//         const existingTemplate = await AuditTemplate.findOne({ name: templateData.name });
//         if (existingTemplate) {
//             throw new Error('TEMPLATE_NAME_EXISTS'); 
//         }

//         const newTemplate = new AuditTemplate({
//             ...templateData,
//             createdBy: createdByUserId,
//             lastModifiedBy: createdByUserId
//         });
//         await newTemplate.save();
        
//         const populatedTemplate = await newTemplate.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);

//         return { newTemplate: populatedTemplate, messageKey: 'TEMPLATE_CREATED' };
//     }

//     /**
//      * Retrieves all audit templates visible to the user based on their subscription.
//      */
//    async getAllAuditTemplates(requestingUser, lang) { 
//     const filter = await this.getTemplateFilter(requestingUser);

//     const templates = await AuditTemplate.find(filter) // <-- APPLY FILTER
//         .populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ])
//         .lean();

//     // Translate all templates concurrently
//     const translatedTemplates = await Promise.all(
//         templates.map(template => translateAuditTemplate(template, lang))
//     );

//     return { templates: translatedTemplates, messageKey: 'TEMPLATES_RETRIEVED' };
// }


//     /**
//      * Retrieves a single audit template by its ID, after checking subscription eligibility.
//      */
//     async getAuditTemplateById(templateId, requestingUser, lang) {
        
//         // 1. Check if the template ID is allowed by the subscription filter
//         const filter = await this.getTemplateFilter(requestingUser);
        
//         // Combine the subscription filter with the specific ID requested
//         const query = { ...filter, _id: templateId };

//         const template = await AuditTemplate.findOne(query)
//             .populate([
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ])
//             .lean();

//         if (!template) {
//             // Check if the template exists but is forbidden by subscription access
//             const templateExistsButForbidden = await AuditTemplate.findById(templateId);

//             if (templateExistsButForbidden && requestingUser.role !== 'super_admin') {
//                 throw new Error(MESSAGES.SUBSCRIPTION_FORBIDDEN.EN); // Custom forbidden message
//             }
//             throw new Error('TEMPLATE_NOT_FOUND');
//         }

//         const translatedTemplate = await translateAuditTemplate(template, lang);

//         return { template: translatedTemplate, messageKey: 'TEMPLATE_RETRIEVED' };
//     }

//     /**
//      * Updates an existing audit template. (Only available to Super Admin, authorization handled elsewhere)
//      */
//     async updateAuditTemplate(templateId, updates, requestingUserId) {
//         // Find by ID and check name uniqueness if name is being updated
//         const template = await AuditTemplate.findById(templateId);

//         if (!template) {
//             throw new Error('TEMPLATE_NOT_FOUND'); 
//         }

//         if (updates.name && updates.name !== template.name) {
//              const existingTemplate = await AuditTemplate.findOne({ name: updates.name });
//              if (existingTemplate && !existingTemplate._id.equals(templateId)) {
//                 throw new Error('TEMPLATE_NAME_EXISTS'); 
//              }
//         }

//         // Apply updates
//         Object.keys(updates).forEach(key => {
//             if (['name', 'description', 'version', 'status', 'sections'].includes(key)) {
//                 template[key] = updates[key];
//             }
//         });

//         template.lastModifiedBy = requestingUserId; // Update last modified user
//         await template.save();

//         const updatedTemplate = await template.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);

//         return { updatedTemplate, messageKey: 'TEMPLATE_UPDATED' };
//     }

//     /**
//      * Deletes an audit template permanently. (Only available to Super Admin, authorization handled elsewhere)
//      */
//     async deleteAuditTemplate(templateId) {
//         const template = await AuditTemplate.findByIdAndDelete(templateId);
//         if (!template) {
//             throw new Error('TEMPLATE_NOT_FOUND'); 
//         }
//         return { messageKey: 'TEMPLATE_DELETED' }; 
//     }
// }

// export default new AuditTemplateService();


// import AuditTemplate from '../models/auditTemplate.model.js';
// import Subscription from '../models/subscription.model.js';
// import { translateAuditTemplate } from '../utils/dataTranslator.js';
// import { MESSAGES } from '../utils/messages.js';

// class AuditTemplateService {

//     /**
//      * Determine which templates the user is allowed to access.
//      */
//     async getTemplateFilter(requestingUser) {
//         console.log("\n===== [TEMPLATE SERVICE] getTemplateFilter START =====");
//         console.log("User received:", requestingUser);

//         if (requestingUser.role === 'super_admin') {
//             console.log("[FILTER] User is super_admin → returning ALL templates.");
//             return {};
//         }

//         if (!requestingUser.subscriptionId) {
//             console.log("[FILTER] User has NO subscriptionId → denying template access.");
//             return { _id: null };
//         }

//         console.log("[FILTER] Fetching subscription using ID:", requestingUser.subscriptionId);

//         const subscription = await Subscription.findById(requestingUser.subscriptionId).lean();

//         console.log("[FILTER] Subscription found:", subscription);

//         if (!subscription) {
//             console.log("[FILTER] No subscription found → denying access.");
//             return { _id: null };
//         }

//         const allowedIds = subscription.templateAccess || [];
//         console.log("[FILTER] Allowed template IDs:", allowedIds);

//         if (allowedIds.length === 0 && subscription.name === 'Enterprise') {
//             console.log("[FILTER] Enterprise plan with no restrictions → full access.");
//             return {};
//         }

//         if (allowedIds.length > 0) {
//             console.log("[FILTER] Returning filter for specific allowed templates.");
//             return { _id: { $in: allowedIds } };
//         }

//         console.log("[FILTER] No access defined → denying access.");
//         return { _id: null };
//     }



//     /**
//      * Create new template
//      */
//     async createAuditTemplate(templateData, createdByUserId) {
//         console.log("\n===== [TEMPLATE SERVICE] createAuditTemplate START =====");
//         console.log("Incoming templateData:", templateData);
//         console.log("Creator User ID:", createdByUserId);

//         const existing = await AuditTemplate.findOne({ name: templateData.name });

//         console.log("Existing template with same name:", existing);

//         if (existing) {
//             console.log("[ERROR] Template name already exists!");
//             throw new Error('TEMPLATE_NAME_EXISTS');
//         }

//         const newTemplate = new AuditTemplate({
//             ...templateData,
//             createdBy: createdByUserId,
//             lastModifiedBy: createdByUserId
//         });

//         console.log("Saving new template...");
//         await newTemplate.save();

//         console.log("Populating createdBy and lastModifiedBy...");
//         const populated = await newTemplate.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);

//         console.log("[SUCCESS] Template created:", populated);

//         return { newTemplate: populated, messageKey: 'TEMPLATE_CREATED' };
//     }



//     /**
//      * Get ALL templates visible to the user
//      */
//     async getAllAuditTemplates(requestingUser, lang) {
//         console.log("\n===== [TEMPLATE SERVICE] getAllAuditTemplates START =====");
//         console.log("Requester:", requestingUser, "Language:", lang);

//         const filter = await this.getTemplateFilter(requestingUser);

//         console.log("[GET ALL] Final filter applied:", filter);

//         console.log("[GET ALL] Querying AuditTemplate...");
//         const templates = await AuditTemplate.find(filter)
//             .populate([
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ])
//             .lean();

//         console.log("[GET ALL] Raw templates result:", templates);

//         console.log("[GET ALL] Translating templates...");
//         const translated = await Promise.all(
//             templates.map(tmp => translateAuditTemplate(tmp, lang))
//         );

//         console.log("[GET ALL] Final translated templates:", translated);

//         return { templates: translated, messageKey: 'TEMPLATES_RETRIEVED' };
//     }



//     /**
//      * Get a single template with subscription validation
//      */
//     async getAuditTemplateById(templateId, requestingUser, lang) {
//         console.log("\n===== [TEMPLATE SERVICE] getAuditTemplateById START =====");
//         console.log("Template ID:", templateId);
//         console.log("Requester:", requestingUser);

//         const filter = await this.getTemplateFilter(requestingUser);

//         console.log("[GET BY ID] Subscription-based filter:", filter);

//         const finalQuery = { ...filter, _id: templateId };
//         console.log("[GET BY ID] Final query:", finalQuery);

//         const template = await AuditTemplate.findOne(finalQuery)
//             .populate([
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ])
//             .lean();

//         console.log("[GET BY ID] Query result:", template);

//         if (!template) {
//             console.log("[GET BY ID] Template not found in filter range → checking if exists...");

//             const exists = await AuditTemplate.findById(templateId);
//             console.log("Template exists in DB?", exists);

//             if (exists && requestingUser.role !== 'super_admin') {
//                 console.log("[ERROR] Template found BUT user forbidden to access.");
//                 throw new Error(MESSAGES.SUBSCRIPTION_FORBIDDEN.EN);
//             }

//             console.log("[ERROR] Template truly not found.");
//             throw new Error('TEMPLATE_NOT_FOUND');
//         }

//         console.log("[GET BY ID] Template found → translating...");
//         const translated = await translateAuditTemplate(template, lang);

//         console.log("[GET BY ID] Final translated template:", translated);

//         return { template: translated, messageKey: 'TEMPLATE_RETRIEVED' };
//     }



//     /**
//      * Update template
//      */
//     async updateAuditTemplate(templateId, updates, requestingUserId) {
//         console.log("\n===== [TEMPLATE SERVICE] updateAuditTemplate START =====");
//         console.log("Template ID:", templateId);
//         console.log("Updates received:", updates);

//         const template = await AuditTemplate.findById(templateId);
//         console.log("Fetched template:", template);

//         if (!template) {
//             console.log("[ERROR] Template not found.");
//             throw new Error('TEMPLATE_NOT_FOUND');
//         }

//         if (updates.name && updates.name !== template.name) {
//             console.log("[UPDATE] Checking for name duplicates...");
//             const existing = await AuditTemplate.findOne({ name: updates.name });

//             console.log("Existing template with new name:", existing);

//             if (existing && !existing._id.equals(templateId)) {
//                 console.log("[ERROR] Name conflict detected!");
//                 throw new Error('TEMPLATE_NAME_EXISTS');
//             }
//         }

//         console.log("[UPDATE] Applying updates...");
//         Object.keys(updates).forEach(key => {
//             if (['name', 'description', 'version', 'status', 'sections'].includes(key)) {
//                 console.log(`[UPDATE] Setting ${key}:`, updates[key]);
//                 template[key] = updates[key];
//             }
//         });

//         console.log("[UPDATE] Updating lastModifiedBy:", requestingUserId);
//         template.lastModifiedBy = requestingUserId;

//         console.log("[UPDATE] Saving changes...");
//         await template.save();

//         console.log("[UPDATE] Populating fields...");
//         const updated = await template.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);

//         console.log("[SUCCESS] Template updated:", updated);

//         return { updatedTemplate: updated, messageKey: 'TEMPLATE_UPDATED' };
//     }



//     /**
//      * Delete template
//      */
//     async deleteAuditTemplate(templateId) {
//         console.log("\n===== [TEMPLATE SERVICE] deleteAuditTemplate START =====");
//         console.log("Template ID to delete:", templateId);

//         const template = await AuditTemplate.findByIdAndDelete(templateId);

//         console.log("Delete result:", template);

//         if (!template) {
//             console.log("[ERROR] Template not found!");
//             throw new Error('TEMPLATE_NOT_FOUND');
//         }

//         console.log("[SUCCESS] Template deleted.");
//         return { messageKey: 'TEMPLATE_DELETED' };
//     }
// }

// export default new AuditTemplateService();



// // src/services/auditTemplate.service.js
// import AuditTemplate from '../models/auditTemplate.model.js';
// import Subscription from '../models/subscription.model.js';
// import { translateAuditTemplate } from '../utils/dataTranslator.js';
// import { MESSAGES } from '../utils/messages.js';

// /**
//  * AuditTemplateService
//  * Option A: super_admin bypasses all subscription/plan/templateAccess checks
//  */
// class AuditTemplateService {

//     /**
//      * Determine which templates the user is allowed to access.
//      * NOTE: super_admin gets {} (full access).
//      */
//     async getTemplateFilter(requestingUser) {
//         console.log("\n===== [TEMPLATE SERVICE] getTemplateFilter START =====");
//         console.log("User received:", requestingUser && { id: requestingUser.id, role: requestingUser.role, subscriptionId: requestingUser.subscriptionId });

//         // SUPER ADMIN BYPASS: full access
//         if (requestingUser && requestingUser.role === 'super_admin') {
//             console.log("[FILTER] SUPER ADMIN detected — returning full access (no filter).");
//             return {};
//         }

//         // Non-super-admin logic
//         if (!requestingUser || !requestingUser.subscriptionId) {
//             console.log("[FILTER] No subscriptionId found on requestingUser -> denying access.");
//             return { _id: null };
//         }

//         console.log("[FILTER] Fetching subscription by ID:", requestingUser.subscriptionId);
//         const subscription = await Subscription.findById(requestingUser.subscriptionId).lean();
//         console.log("[FILTER] Subscription fetched:", subscription);

//         if (!subscription) {
//             console.log("[FILTER] Subscription not found -> denying access.");
//             return { _id: null };
//         }

//         const allowedIds = subscription.templateAccess || [];
//         console.log("[FILTER] subscription.templateAccess:", allowedIds, "subscription.name:", subscription.name);

//         if (allowedIds.length === 0 && subscription.name === 'Enterprise') {
//             console.log("[FILTER] Enterprise with empty templateAccess -> full access for tenant.");
//             return {};
//         }

//         if (allowedIds.length > 0) {
//             console.log("[FILTER] Returning filter for allowed template IDs.");
//             return { _id: { $in: allowedIds } };
//         }

//         console.log("[FILTER] No templates allowed -> denying access.");
//         return { _id: null };
//     }

//     /**
//      * Create new template
//      * Super Admin: allowed regardless of subscription
//      */
//     async createAuditTemplate(templateData, createdByUser) {
//         console.log("\n===== [TEMPLATE SERVICE] createAuditTemplate START =====");
//         console.log("CreatedBy:", createdByUser && { id: createdByUser.id, role: createdByUser.role });
//         console.log("Incoming templateData:", templateData);

//         // No subscription checks for create; super_admin or other roles authorized at controller level
//         const existing = await AuditTemplate.findOne({ name: templateData.name }).lean();
//         console.log("Existing template check result:", !!existing);

//         if (existing) {
//             console.error("[CREATE] Template name already exists -> throwing TEMPLATE_NAME_EXISTS");
//             throw new Error('TEMPLATE_NAME_EXISTS');
//         }

//         const newTemplate = new AuditTemplate({
//             ...templateData,
//             createdBy: createdByUser.id || createdByUser,
//             lastModifiedBy: createdByUser.id || createdByUser
//         });

//         console.log("[CREATE] Saving new template...");
//         await newTemplate.save();

//         console.log("[CREATE] Populating createdBy and lastModifiedBy...");
//         const populated = await newTemplate.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);

//         console.log("[CREATE] Template created successfully:", { id: populated._id, name: populated.name });
//         return { newTemplate: populated, messageKey: 'TEMPLATE_CREATED' };
//     }

//     /**
//      * Get all templates visible to the user
//      * Super Admin: returns all templates
//      */
//     async getAllAuditTemplates(requestingUser, lang = 'EN') {
//         console.log("\n===== [TEMPLATE SERVICE] getAllAuditTemplates START =====");
//         console.log("Requester:", requestingUser && { id: requestingUser.id, role: requestingUser.role });

//         // SUPER ADMIN BYPASS: immediate full query
//         if (requestingUser && requestingUser.role === 'super_admin') {
//             console.log("[GET ALL] SUPER ADMIN — fetching all templates without filter.");
//             const templates = await AuditTemplate.find({})
//                 .populate([
//                     { path: 'createdBy', select: 'firstName lastName email' },
//                     { path: 'lastModifiedBy', select: 'firstName lastName email' }
//                 ])
//                 .lean();

//             console.log(`[GET ALL] Found ${templates.length} templates for super_admin.`);
//             const translated = await Promise.all(templates.map(t => translateAuditTemplate(t, lang)));
//             return { templates: translated, messageKey: 'TEMPLATES_RETRIEVED' };
//         }

//         // Non-super-admin path
//         const filter = await this.getTemplateFilter(requestingUser);
//         console.log("[GET ALL] Using filter:", filter);

//         const templates = await AuditTemplate.find(filter)
//             .populate([
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ])
//             .lean();

//         console.log(`[GET ALL] Found ${templates.length} templates for user.`);
//         const translated = await Promise.all(templates.map(t => translateAuditTemplate(t, lang)));
//         return { templates: translated, messageKey: 'TEMPLATES_RETRIEVED' };
//     }

//     /**
//      * Get a single template by ID with subscription validation
//      * Super Admin: full direct fetch
//      */
//     async getAuditTemplateById(templateId, requestingUser, lang = 'EN') {
//         console.log("\n===== [TEMPLATE SERVICE] getAuditTemplateById START =====");
//         console.log("Template ID:", templateId);
//         console.log("Requester:", requestingUser && { id: requestingUser.id, role: requestingUser.role });

//         // SUPER ADMIN BYPASS
//         if (requestingUser && requestingUser.role === 'super_admin') {
//             console.log("[GET BY ID] SUPER ADMIN — fetching template by ID without filter.");
//             const template = await AuditTemplate.findById(templateId)
//                 .populate([
//                     { path: 'createdBy', select: 'firstName lastName email' },
//                     { path: 'lastModifiedBy', select: 'firstName lastName email' }
//                 ])
//                 .lean();

//             if (!template) {
//                 console.error("[GET BY ID] SUPER ADMIN requested non-existing template -> TEMPLATE_NOT_FOUND");
//                 throw new Error('TEMPLATE_NOT_FOUND');
//             }

//             const translated = await translateAuditTemplate(template, lang);
//             console.log("[GET BY ID] SUPER ADMIN fetched template:", { id: template._id, name: template.name });
//             return { template: translated, messageKey: 'TEMPLATE_RETRIEVED' };
//         }

//         // Non-super-admin path
//         const filter = await this.getTemplateFilter(requestingUser);
//         console.log("[GET BY ID] Subscription-based filter:", filter);

//         const finalQuery = { ...filter, _id: templateId };
//         console.log("[GET BY ID] Final query object:", finalQuery);

//         const template = await AuditTemplate.findOne(finalQuery)
//             .populate([
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ])
//             .lean();

//         console.log("[GET BY ID] Query result:", !!template);

//         if (!template) {
//             console.log("[GET BY ID] Not found under allowed filter -> check existence.");
//             const exists = await AuditTemplate.findById(templateId).lean();
//             console.log("[GET BY ID] Exists in DB:", !!exists);

//             if (exists && requestingUser.role !== 'super_admin') {
//                 console.error("[GET BY ID] Exists but forbidden -> throwing SUBSCRIPTION_FORBIDDEN");
//                 throw new Error(MESSAGES.SUBSCRIPTION_FORBIDDEN.EN);
//             }

//             console.error("[GET BY ID] Template not found -> throwing TEMPLATE_NOT_FOUND");
//             throw new Error('TEMPLATE_NOT_FOUND');
//         }

//         const translated = await translateAuditTemplate(template, lang);
//         console.log("[GET BY ID] Template retrieved and translated:", { id: template._id, name: template.name });
//         return { template: translated, messageKey: 'TEMPLATE_RETRIEVED' };
//     }

//     /**
//      * Update a template
//      * Super Admin: allowed to update any template
//      */
//     async updateAuditTemplate(templateId, updates, requestingUser) {
//         console.log("\n===== [TEMPLATE SERVICE] updateAuditTemplate START =====");
//         console.log("Template ID:", templateId);
//         console.log("Requester:", requestingUser && { id: requestingUser.id, role: requestingUser.role });
//         console.log("Updates:", updates);

//         // SUPER ADMIN BYPASS: can update without checks
//         if (requestingUser && requestingUser.role === 'super_admin') {
//             console.log("[UPDATE] SUPER ADMIN — updating template without subscription checks.");
//             const template = await AuditTemplate.findById(templateId);
//             if (!template) {
//                 console.error("[UPDATE] TEMPLATE_NOT_FOUND");
//                 throw new Error('TEMPLATE_NOT_FOUND');
//             }

//             Object.keys(updates).forEach(key => {
//                 if (['name', 'description', 'version', 'status', 'sections'].includes(key)) {
//                     template[key] = updates[key];
//                 }
//             });

//             template.lastModifiedBy = requestingUser.id || requestingUser;
//             await template.save();

//             const populated = await template.populate([
//                 { path: 'createdBy', select: 'firstName lastName email' },
//                 { path: 'lastModifiedBy', select: 'firstName lastName email' }
//             ]);

//             console.log("[UPDATE] SUPER ADMIN updated template:", { id: populated._id, name: populated.name });
//             return { updatedTemplate: populated, messageKey: 'TEMPLATE_UPDATED' };
//         }

//         // Non-super-admin path: basic checks (name uniqueness etc.)
//         const template = await AuditTemplate.findById(templateId);
//         if (!template) {
//             console.error("[UPDATE] TEMPLATE_NOT_FOUND");
//             throw new Error('TEMPLATE_NOT_FOUND');
//         }

//         if (updates.name && updates.name !== template.name) {
//             const existing = await AuditTemplate.findOne({ name: updates.name }).lean();
//             if (existing && !existing._id.equals(templateId)) {
//                 console.error("[UPDATE] TEMPLATE_NAME_EXISTS");
//                 throw new Error('TEMPLATE_NAME_EXISTS');
//             }
//         }

//         Object.keys(updates).forEach(key => {
//             if (['name', 'description', 'version', 'status', 'sections'].includes(key)) {
//                 template[key] = updates[key];
//             }
//         });

//         template.lastModifiedBy = requestingUser.id || requestingUser;
//         await template.save();

//         const updatedPopulated = await template.populate([
//             { path: 'createdBy', select: 'firstName lastName email' },
//             { path: 'lastModifiedBy', select: 'firstName lastName email' }
//         ]);

//         console.log("[UPDATE] Template updated by non-super-admin:", { id: updatedPopulated._id, name: updatedPopulated.name });
//         return { updatedTemplate: updatedPopulated, messageKey: 'TEMPLATE_UPDATED' };
//     }

//     /**
//      * Delete template
//      * Super Admin: allowed to delete any template
//      */
//     async deleteAuditTemplate(templateId, requestingUser) {
//         console.log("\n===== [TEMPLATE SERVICE] deleteAuditTemplate START =====");
//         console.log("Template ID:", templateId);
//         console.log("Requester:", requestingUser && { id: requestingUser.id, role: requestingUser.role });

//         // SUPER ADMIN BYPASS
//         if (requestingUser && requestingUser.role === 'super_admin') {
//             console.log("[DELETE] SUPER ADMIN — deleting without subscription checks.");
//             const template = await AuditTemplate.findByIdAndDelete(templateId);
//             if (!template) {
//                 console.error("[DELETE] TEMPLATE_NOT_FOUND");
//                 throw new Error('TEMPLATE_NOT_FOUND');
//             }
//             console.log("[DELETE] Template deleted by super_admin:", { id: templateId });
//             return { messageKey: 'TEMPLATE_DELETED' };
//         }

//         // Non-super-admin path
//         const template = await AuditTemplate.findByIdAndDelete(templateId);
//         if (!template) {
//             console.error("[DELETE] TEMPLATE_NOT_FOUND");
//             throw new Error('TEMPLATE_NOT_FOUND');
//         }

//         console.log("[DELETE] Template deleted:", { id: templateId });
//         return { messageKey: 'TEMPLATE_DELETED' };
//     }
// }

// export default new AuditTemplateService();


import mongoose from 'mongoose';
import AuditTemplate from '../models/auditTemplate.model.js';
import Subscription from '../models/subscription.model.js';
import { translateAuditTemplate } from '../utils/dataTranslator.js';
import { MESSAGES } from '../utils/messages.js';

class AuditTemplateService {

    /**
     * Determine which templates the user can access.
     */
    async getTemplateFilter(requestingUser) {
        if (requestingUser && requestingUser.role === 'super_admin') {
            return {};
        }

        if (!requestingUser || !requestingUser.subscriptionId) {
            return { _id: null };
        }

        const subscription = await Subscription.findById(requestingUser.subscriptionId).lean();
        if (!subscription) return { _id: null };

        const allowedIds = subscription.templateAccess || [];
        if (allowedIds.length === 0 && subscription.name === 'Enterprise') return {};
        if (allowedIds.length > 0) return { _id: { $in: allowedIds } };
        return { _id: null };
    }

    /**
     * Create new Audit Template
     */
    async createAuditTemplate(templateData, createdByUserId) {
        const existing = await AuditTemplate.findOne({ name: templateData.name }).lean();
        if (existing) throw new Error('TEMPLATE_NAME_EXISTS');

        const newTemplate = new AuditTemplate({
            ...templateData,
            createdBy: new mongoose.Types.ObjectId(createdByUserId),
            lastModifiedBy: new mongoose.Types.ObjectId(createdByUserId)
        });

        await newTemplate.save();

        const populated = await newTemplate.populate([
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'lastModifiedBy', select: 'firstName lastName email' }
        ]);

        return { newTemplate: populated, messageKey: 'TEMPLATE_CREATED' };
    }

    /**
     * Get all templates visible to the user
     */
    async getAllAuditTemplates(requestingUser, lang = 'EN') {
        if (requestingUser && requestingUser.role === 'super_admin') {
            const templates = await AuditTemplate.find({})
                .populate([
                    { path: 'createdBy', select: 'firstName lastName email' },
                    { path: 'lastModifiedBy', select: 'firstName lastName email' }
                ])
                .lean();
            const translated = await Promise.all(templates.map(t => translateAuditTemplate(t, lang)));
            return { templates: translated, messageKey: 'TEMPLATES_RETRIEVED' };
        }

        const filter = await this.getTemplateFilter(requestingUser);
        const templates = await AuditTemplate.find(filter)
            .populate([
                { path: 'createdBy', select: 'firstName lastName email' },
                { path: 'lastModifiedBy', select: 'firstName lastName email' }
            ])
            .lean();

        const translated = await Promise.all(templates.map(t => translateAuditTemplate(t, lang)));
        return { templates: translated, messageKey: 'TEMPLATES_RETRIEVED' };
    }

    /**
     * Get a single template by ID
     */
    async getAuditTemplateById(templateId, requestingUser, lang = 'EN') {
        if (requestingUser && requestingUser.role === 'super_admin') {
            const template = await AuditTemplate.findById(templateId)
                .populate([
                    { path: 'createdBy', select: 'firstName lastName email' },
                    { path: 'lastModifiedBy', select: 'firstName lastName email' }
                ])
                .lean();
            if (!template) throw new Error('TEMPLATE_NOT_FOUND');

            const translated = await translateAuditTemplate(template, lang);
            return { template: translated, messageKey: 'TEMPLATE_RETRIEVED' };
        }

        const filter = await this.getTemplateFilter(requestingUser);
        const finalQuery = { ...filter, _id: templateId };
        const template = await AuditTemplate.findOne(finalQuery)
            .populate([
                { path: 'createdBy', select: 'firstName lastName email' },
                { path: 'lastModifiedBy', select: 'firstName lastName email' }
            ])
            .lean();

        if (!template) {
            const exists = await AuditTemplate.findById(templateId).lean();
            if (exists && requestingUser.role !== 'super_admin') throw new Error(MESSAGES.SUBSCRIPTION_FORBIDDEN.EN);
            throw new Error('TEMPLATE_NOT_FOUND');
        }

        const translated = await translateAuditTemplate(template, lang);
        return { template: translated, messageKey: 'TEMPLATE_RETRIEVED' };
    }

    /**
     * Update an existing template
     */
    async updateAuditTemplate(templateId, updates, requestingUserId) {
        const template = await AuditTemplate.findById(templateId);
        if (!template) throw new Error('TEMPLATE_NOT_FOUND');

        if (updates.name && updates.name !== template.name) {
            const existing = await AuditTemplate.findOne({ name: updates.name }).lean();
            if (existing && !existing._id.equals(templateId)) throw new Error('TEMPLATE_NAME_EXISTS');
        }

        Object.keys(updates).forEach(key => {
            if (['name', 'description', 'version', 'status', 'sections'].includes(key)) {
                template[key] = updates[key];
            }
        });

        template.lastModifiedBy = new mongoose.Types.ObjectId(requestingUserId);
        await template.save();

        const populated = await template.populate([
            { path: 'createdBy', select: 'firstName lastName email' },
            { path: 'lastModifiedBy', select: 'firstName lastName email' }
        ]);

        return { updatedTemplate: populated, messageKey: 'TEMPLATE_UPDATED' };
    }

    /**
     * Delete template
     */
    async deleteAuditTemplate(templateId) {
        const template = await AuditTemplate.findByIdAndDelete(templateId);
        if (!template) throw new Error('TEMPLATE_NOT_FOUND');
        return { messageKey: 'TEMPLATE_DELETED' };
    }
}

export default new AuditTemplateService();
