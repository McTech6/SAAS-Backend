// 

import auditInstanceService from '../services/auditInstance.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

class AuditInstanceController {
  async createAuditInstance(req, res) {
    try {
      const auditData = req.body;
      const requestingUser = req.user;
      const newAuditInstance = await auditInstanceService.createAuditInstance(auditData, requestingUser);
      sendSuccessResponse(res, 201, 'Audit Instance created successfully.', newAuditInstance);
    } catch (error) {
      sendErrorResponse(res, 400, error.message);
    }
  }

  async getAllAuditInstances(req, res) {
    try {
      const requestingUser = req.user;
      const auditInstances = await auditInstanceService.getAllAuditInstances(requestingUser);
      sendSuccessResponse(res, 200, 'Audit Instances retrieved successfully.', auditInstances);
    } catch (error) {
      sendErrorResponse(res, 500, error.message);
    }
  }

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

  async submitResponses(req, res) {
    try {
      const { id } = req.params;
      const responsesData = req.body.responses;
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

  async updateAuditStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const requestingUser = req.user;
      const updatedAuditInstance = await auditInstanceService.updateAuditStatus(id, status, requestingUser);
      sendSuccessResponse(res, 200, `Audit status updated to ${status}.`, updatedAuditInstance);
    } catch (error) {
      sendErrorResponse(res, 400, error.message);
    }
  }

  async assignAuditors(req, res) {
    try {
      const { id } = req.params;
      const { auditorIds } = req.body;
      const requestingUser = req.user;

      if (!Array.isArray(auditorIds) || auditorIds.length === 0) {
        return sendErrorResponse(res, 400, 'auditorIds must be a non-empty array.');
      }

      const updated = await auditInstanceService.assignAuditors(
        id,
        auditorIds,
        requestingUser.id,
        requestingUser.role
      );
      sendSuccessResponse(res, 200, 'Auditors assigned successfully.', updated);
    } catch (err) {
      sendErrorResponse(res, 400, err.message);
    }
  }

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

  async generateReport(req, res) {
    try {
      const { id } = req.params;
      const { download } = req.query;
      const requestingUser = req.user;

      const pdfBuffer = await auditInstanceService.generateReport(id, requestingUser);

      const filename = `audit_report_${id}.pdf`;
      const disposition = download === 'true' ? 'attachment' : 'inline';

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      sendErrorResponse(res, 400, error.message);
    }
  }
}

export default new AuditInstanceController();
