// src/controllers/upload.controller.js

import uploadService from '../services/upload.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

/**
 * Controller for file upload operations.
 */
class UploadController {
    /**
     * Handles single file upload for evidence.
     * Accessible by Super Admin, Admin, and Auditor.
     * @param {object} req - Express request object (contains req.file from Multer).
     * @param {object} res - Express response object.
     */
    async uploadEvidence(req, res) {
        try {
            // Multer attaches the file to req.file
            const file = req.file;

            if (!file) {
                return sendErrorResponse(res, 400, 'No file uploaded.');
            }

            // You can customize the folder based on user, audit, etc.
            // For now, a generic 'audit_evidence' folder.
            const fileUrl = await uploadService.uploadSingleFile(file, 'audit_evidence');

            sendSuccessResponse(res, 200, 'File uploaded successfully.', { url: fileUrl });
        } catch (error) {
            sendErrorResponse(res, 500, error.message);
        }
    }
}

export default new UploadController();
