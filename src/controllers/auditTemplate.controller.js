// src/controllers/auditTemplate.controller.js

import auditTemplateService from '../services/auditTemplate.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

/**
 * Controller for Audit Template management operations.
 * These routes will be protected by authentication and authorization middleware.
 */
class AuditTemplateController {
    /**
     * Creates a new audit template. Accessible only by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async createAuditTemplate(req, res) {
        try {
            const templateData = req.body;
            const createdByUserId = req.user.id; // Get ID of the authenticated Super Admin
            const newTemplate = await auditTemplateService.createAuditTemplate(templateData, createdByUserId);
            sendSuccessResponse(res, 201, 'Audit Template created successfully.', newTemplate);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Retrieves all audit templates. Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getAllAuditTemplates(req, res) {
        try {
            const templates = await auditTemplateService.getAllAuditTemplates();
            sendSuccessResponse(res, 200, 'Audit Templates retrieved successfully.', templates);
        } catch (error) {
            sendErrorResponse(res, 500, error.message);
        }
    }

    /**
     * Retrieves a single audit template by ID. Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getAuditTemplateById(req, res) {
        try {
            const { id } = req.params;
            const template = await auditTemplateService.getAuditTemplateById(id);
            sendSuccessResponse(res, 200, 'Audit Template retrieved successfully.', template);
        } catch (error) {
            sendErrorResponse(res, 404, error.message);
        }
    }

    /**
     * Updates an existing audit template. Accessible only by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async updateAuditTemplate(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const requestingUserId = req.user.id; // Get ID of the authenticated Super Admin
            const updatedTemplate = await auditTemplateService.updateAuditTemplate(id, updates, requestingUserId);
            sendSuccessResponse(res, 200, 'Audit Template updated successfully.', updatedTemplate);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Deletes an audit template permanently. Accessible only by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deleteAuditTemplate(req, res) {
        try {
            const { id } = req.params;
            await auditTemplateService.deleteAuditTemplate(id);
            sendSuccessResponse(res, 200, 'Audit Template deleted successfully.');
        } catch (error) {
            sendErrorResponse(res, 404, error.message);
        }
    }
}

export default new AuditTemplateController();
