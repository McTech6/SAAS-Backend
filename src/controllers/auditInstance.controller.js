// src/controllers/auditInstance.controller.js

import auditInstanceService from '../services/auditInstance.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

/**
 * Controller for Audit Instance management operations.
 * These routes will be protected by authentication and authorization middleware.
 */
class AuditInstanceController {
    /**
     * Creates a new audit instance.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async createAuditInstance(req, res) {
        try {
            const auditData = req.body;
            const requestingUser = req.user; // Authenticated user
            const newAuditInstance = await auditInstanceService.createAuditInstance(auditData, requestingUser);
            sendSuccessResponse(res, 201, 'Audit Instance created successfully.', newAuditInstance);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Retrieves all audit instances accessible to the requesting user.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getAllAuditInstances(req, res) {
        try {
            const requestingUser = req.user;
            const auditInstances = await auditInstanceService.getAllAuditInstances(requestingUser);
            sendSuccessResponse(res, 200, 'Audit Instances retrieved successfully.', auditInstances);
        } catch (error) {
            sendErrorResponse(res, 500, error.message);
        }
    }

    /**
     * Retrieves a single audit instance by ID, with access control.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getAuditInstanceById(req, res) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;
            const auditInstance = await auditInstanceService.getAuditInstanceById(id, requestingUser);
            sendSuccessResponse(res, 200, 'Audit Instance retrieved successfully.', auditInstance);
        } catch (error) {
            sendErrorResponse(res, 404, error.message);
        }
    }

    /**
     * Submits or updates responses for specific questions within an audit instance.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async submitResponses(req, res) {
        try {
            const { id } = req.params; // Audit Instance ID
            const responsesData = req.body.responses; // Array of response objects
            const requestingUser = req.user;

            if (!Array.isArray(responsesData)) {
                return sendErrorResponse(res, 400, 'Responses must be an array.');
            }

            const updatedAuditInstance = await auditInstanceService.submitResponses(id, responsesData, requestingUser);
            sendSuccessResponse(res, 200, 'Audit responses submitted successfully.', updatedAuditInstance);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Updates the status of an audit instance.
     * Accessible by Super Admin, Admin, and Auditor (with restrictions).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async updateAuditStatus(req, res) {
        try {
            const { id } = req.params; // Audit Instance ID
            const { status } = req.body; // New status
            const requestingUser = req.user;

            const updatedAuditInstance = await auditInstanceService.updateAuditStatus(id, status, requestingUser);
            sendSuccessResponse(res, 200, `Audit status updated to ${status}.`, updatedAuditInstance);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Deletes an audit instance permanently.
     * Accessible by Super Admin and Admin (with restrictions).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deleteAuditInstance(req, res) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;
            await auditInstanceService.deleteAuditInstance(id, requestingUser);
            sendSuccessResponse(res, 200, 'Audit Instance deleted successfully.');
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Generates a report for an audit instance.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async generateReport(req, res) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;
            const reportResult = await auditInstanceService.generateReport(id, requestingUser);
            sendSuccessResponse(res, 200, reportResult.message, reportResult);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }
}

export default new AuditInstanceController();
