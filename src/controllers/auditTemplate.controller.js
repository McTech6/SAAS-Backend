 
// src/controllers/auditTemplate.controller.js

// import auditTemplateService from '../services/auditTemplate.service.js';
// import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
// import { getMessage, getLangFromReq } from '../utils/langHelper.js'; // <-- NEW/REQUIRED IMPORTS

// /**
//  * Controller for Audit Template management operations.
//  */
// class AuditTemplateController {
//     /**
//      * Creates a new audit template. Accessible only by Super Admin.
//      */
//     async createAuditTemplate(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const templateData = req.body;
//             const createdByUserId = req.user.id;
//             // Service returns { newTemplate, messageKey }
//             const { newTemplate, messageKey } = await auditTemplateService.createAuditTemplate(templateData, createdByUserId);
//             sendSuccessResponse(res, 201, getMessage(messageKey, lang), newTemplate);
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     /**
//      * Retrieves all audit templates. Accessible by Super Admin, Admin, and Auditor.
//      */
//     async getAllAuditTemplates(req, res) {
//         const lang = getLangFromReq(req); // <-- EXTRACT LANGUAGE
//         try {
//             // Pass lang down to service. Service returns { templates, messageKey }
//             const { templates, messageKey } = await auditTemplateService.getAllAuditTemplates(lang); // <-- PASS LANG
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), templates);
//         } catch (error) {
//             sendErrorResponse(res, 500, getMessage(error.message, lang));
//         }
//     }

//     /**
//      * Retrieves a single audit template by ID. Accessible by Super Admin, Admin, and Auditor.
//      */
//     async getAuditTemplateById(req, res) {
//         const lang = getLangFromReq(req); // <-- EXTRACT LANGUAGE
//         try {
//             const { id } = req.params;
//             // Pass lang down to service. Service returns { template, messageKey }
//             const { template, messageKey } = await auditTemplateService.getAuditTemplateById(id, lang); // <-- PASS LANG
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), template);
//         } catch (error) {
//             // Note: The service throws 'TEMPLATE_NOT_FOUND', which the message handler will localize.
//             sendErrorResponse(res, 404, getMessage(error.message, lang));
//         }
//     }

//     /**
//      * Updates an existing audit template. Accessible only by Super Admin.
//      */
//     async updateAuditTemplate(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { id } = req.params;
//             const updates = req.body;
//             const requestingUserId = req.user.id;
//             // Service returns { updatedTemplate, messageKey }
//             const { updatedTemplate, messageKey } = await auditTemplateService.updateAuditTemplate(id, updates, requestingUserId);
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), updatedTemplate);
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     /**
//      * Deletes an audit template permanently. Accessible only by Super Admin.
//      */
//     async deleteAuditTemplate(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { id } = req.params;
//             // Service returns { messageKey }
//             const { messageKey } = await auditTemplateService.deleteAuditTemplate(id);
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang));
//         } catch (error) {
//             // Note: The service throws 'TEMPLATE_NOT_FOUND', which the message handler will localize.
//             sendErrorResponse(res, 404, getMessage(error.message, lang));
//         }
//     }
// }

// export default new AuditTemplateController();




// import auditTemplateService from '../services/auditTemplate.service.js';
// import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
// import { getMessage, getLangFromReq } from '../utils/langHelper.js';

// /**
//  * Controller for Audit Template management operations.
//  */
// class AuditTemplateController {
//     /**
//      * Creates a new audit template. Accessible only by Super Admin.
//      */
//     async createAuditTemplate(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const templateData = req.body;
//             const createdByUserId = req.user.id;
//             // Service returns { newTemplate, messageKey }
//             const { newTemplate, messageKey } = await auditTemplateService.createAuditTemplate(templateData, createdByUserId);
//             sendSuccessResponse(res, 201, getMessage(messageKey, lang), newTemplate);
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     /**
//      * Retrieves all audit templates. Accessible by Super Admin, Admin, and Auditor.
//      * The list is filtered based on the user's subscription access.
//      */
//     async getAllAuditTemplates(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const requestingUser = req.user; // Contains subscriptionId and tenantAdminId
            
//             // Service will use requestingUser.subscriptionId to filter
//             const { templates, messageKey } = await auditTemplateService.getAllAuditTemplates(requestingUser, lang);
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), templates);
//         } catch (error) {
//             sendErrorResponse(res, 500, getMessage(error.message, lang));
//         }
//     }

//     /**
//      * Retrieves a single audit template by ID. Accessible by Super Admin, Admin, and Auditor.
//      */
//     async getAuditTemplateById(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { id } = req.params;
//             const requestingUser = req.user; // Contains subscriptionId and tenantAdminId

//             // Service handles both retrieval and subscription check
//             const { template, messageKey } = await auditTemplateService.getAuditTemplateById(id, requestingUser, lang);
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), template);
//         } catch (error) {
//             // Use 403 for unauthorized access due to subscription limits
//             const statusCode = error.message.includes('SUBSCRIPTION_FORBIDDEN') ? 403 : 404;
//             sendErrorResponse(res, statusCode, getMessage(error.message, lang));
//         }
//     }
 

//     /**
//      * Updates an existing audit template. Accessible only by Super Admin.
//      */
//     async updateAuditTemplate(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { id } = req.params;
//             const updates = req.body;
//             const requestingUserId = req.user.id;
//             // Service returns { updatedTemplate, messageKey }
//             const { updatedTemplate, messageKey } = await auditTemplateService.updateAuditTemplate(id, updates, requestingUserId);
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), updatedTemplate);
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     /**
//      * Deletes an audit template permanently. Accessible only by Super Admin.
//      */
//     async deleteAuditTemplate(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { id } = req.params;
//             // Service returns { messageKey }
//             const { messageKey } = await auditTemplateService.deleteAuditTemplate(id);
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang));
//         } catch (error) {
//             sendErrorResponse(res, 404, getMessage(error.message, lang));
//         }
//     }
// }

// export default new AuditTemplateController();


import auditTemplateService from '../services/auditTemplate.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { getMessage, getLangFromReq } from '../utils/langHelper.js';

/**
 * Controller for Audit Template management operations.
 */
class AuditTemplateController {
    /**
     * Creates a new audit template. Accessible only by Super Admin.
     */
    async createAuditTemplate(req, res) {
        const lang = getLangFromReq(req);
        try {
            const templateData = req.body;
            const createdByUserId = req.user.id;
            // Service returns { newTemplate, messageKey }
            const { newTemplate, messageKey } = await auditTemplateService.createAuditTemplate(templateData, createdByUserId);
            sendSuccessResponse(res, 201, getMessage(messageKey, lang), newTemplate);
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    /**
     * Retrieves all audit templates. Accessible by Super Admin, Admin, and Auditor.
     * The list is filtered based on the user's subscription access.
     */
    async getAllAuditTemplates(req, res) {
        const lang = getLangFromReq(req);
        try {
            const requestingUser = req.user; // Contains subscriptionId and tenantAdminId
            
            // Service will use requestingUser.subscriptionId to filter
            const { templates, messageKey } = await auditTemplateService.getAllAuditTemplates(requestingUser, lang);
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), templates);
        } catch (error) {
            sendErrorResponse(res, 500, getMessage(error.message, lang));
        }
    }

    /**
     * Retrieves a single audit template by ID. Accessible by Super Admin, Admin, and Auditor.
     */
    async getAuditTemplateById(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { id } = req.params;
            const requestingUser = req.user; // Contains subscriptionId and tenantAdminId

            // Service handles both retrieval and subscription check
            const { template, messageKey } = await auditTemplateService.getAuditTemplateById(id, requestingUser, lang);
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), template);
        } catch (error) {
            // Use 403 for unauthorized access due to subscription limits
            const statusCode = error.message.includes('SUBSCRIPTION_FORBIDDEN') ? 403 : 404;
            sendErrorResponse(res, statusCode, getMessage(error.message, lang));
        }
    }
 

    /**
     * Updates an existing audit template. Accessible only by Super Admin.
     */
    async updateAuditTemplate(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { id } = req.params;
            const updates = req.body;
            const requestingUserId = req.user.id;
            // Service returns { updatedTemplate, messageKey }
            const { updatedTemplate, messageKey } = await auditTemplateService.updateAuditTemplate(id, updates, requestingUserId);
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), updatedTemplate);
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    /**
     * Deletes an audit template permanently. Accessible only by Super Admin.
     */
    async deleteAuditTemplate(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { id } = req.params;
            const requestingUser = req.user; // Added for completeness, though not used in service delete function logic provided
            // Service returns { messageKey }
            const { messageKey } = await auditTemplateService.deleteAuditTemplate(id, requestingUser);
            sendSuccessResponse(res, 200, getMessage(messageKey, lang));
        } catch (error) {
            sendErrorResponse(res, 404, getMessage(error.message, lang));
        }
    }
}

export default new AuditTemplateController();