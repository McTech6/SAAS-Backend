// // src/controllers/auditInstance.controller.js
// import auditInstanceService from '../services/auditInstance.service.js';
// import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

// class AuditInstanceController {
//   async createAuditInstance(req, res) {
//     try {
//       const auditData = req.body;
//       const requestingUser = req.user;
//       const newAuditInstance = await auditInstanceService.createAuditInstance(auditData, requestingUser);
//       sendSuccessResponse(res, 201, 'Audit Instance created successfully.', newAuditInstance);
//     } catch (error) {
//       sendErrorResponse(res, 400, error.message);
//     }
//   }

//   async getAllAuditInstances(req, res) {
//     try {
//       const requestingUser = req.user;
//       const auditInstances = await auditInstanceService.getAllAuditInstances(requestingUser);
//       sendSuccessResponse(res, 200, 'Audit Instances retrieved successfully.', auditInstances);
//     } catch (error) {
//       sendErrorResponse(res, 500, error.message);
//     }
//   }

//   async getAuditInstanceById(req, res) {
//     try {
//       const { id } = req.params;
//       const requestingUser = req.user;
//       const auditInstance = await auditInstanceService.getAuditInstanceById(id, requestingUser);
//       sendSuccessResponse(res, 200, 'Audit Instance retrieved successfully.', auditInstance);
//     } catch (error) {
//       sendErrorResponse(res, 404, error.message);
//     }
//   }

//   async submitResponses(req, res) {
//     try {
//       const { id } = req.params;
//       const responsesData = req.body.responses;
//       const requestingUser = req.user;

//       if (!Array.isArray(responsesData)) {
//         return sendErrorResponse(res, 400, 'Responses must be an array.');
//       }

//       const updatedAuditInstance = await auditInstanceService.submitResponses(id, responsesData, requestingUser);
//       sendSuccessResponse(res, 200, 'Audit responses submitted successfully.', updatedAuditInstance);
//     } catch (error) {
//       sendErrorResponse(res, 400, error.message);
//     }
//   }

//   async updateAuditStatus(req, res) {
//     try {
//       const { id } = req.params;
//       const { status } = req.body;
//       const requestingUser = req.user;
//       const updatedAuditInstance = await auditInstanceService.updateAuditStatus(id, status, requestingUser);
//       sendSuccessResponse(res, 200, `Audit status updated to ${status}.`, updatedAuditInstance);
//     } catch (error) {
//       sendErrorResponse(res, 400, error.message);
//     }
//   }

//   async assignAuditors(req, res) {
//     try {
//       const { id } = req.params;
//       const { auditorIds } = req.body;
//       const requestingUser = req.user;

//       if (!Array.isArray(auditorIds) || auditorIds.length === 0) {
//         return sendErrorResponse(res, 400, 'auditorIds must be a non-empty array.');
//       }

//       const updated = await auditInstanceService.assignAuditors(
//         id,
//         auditorIds,
//         requestingUser.id,
//         requestingUser.role
//       );
//       sendSuccessResponse(res, 200, 'Auditors assigned successfully.', updated);
//     } catch (err) {
//       sendErrorResponse(res, 400, err.message);
//     }
//   }

//   async deleteAuditInstance(req, res) {
//     try {
//       const { id } = req.params;
//       const requestingUser = req.user;
//       await auditInstanceService.deleteAuditInstance(id, requestingUser);
//       sendSuccessResponse(res, 200, 'Audit Instance deleted successfully.');
//     } catch (error) {
//       sendErrorResponse(res, 400, error.message);
//     }
//   }

//  /**
//  * Generates & streams a PDF report for an audit instance.
//  * Query param ?download=true forces download instead of inline preview.
//  * Accessible by Super-Admin, Admin, or any assigned auditor if audit is Completed.
//  * @param {object} req - Express request object.
//  * @param {object} res - Express response object.
//  */
// //  async generateReport(req, res) {
// //     try {
// //       const { id } = req.params;
// //       const { download } = req.query; 
// //       const requestingUser = req.user;

// //       const pdfBuffer = await auditInstanceService.generateReport(id, requestingUser);

// //       const filename = `audit_report_${id}.pdf`;
// //       const disposition = download === 'true' ? 'attachment' : 'inline';

// //       res.setHeader('Content-Type', 'application/pdf');
// //       res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
// //       res.send(pdfBuffer);
// //     } catch (error) {
// //       sendErrorResponse(res, 400, error.message);
// //     }
// //   }

// /**
//  * Generates & streams a PDF report for an audit instance.
//  * Query param ?preview=true  → inline browser tab
//  * Query param ?preview=false → force download
//  */
// async generateReport(req, res) {
//   try {
//     const { id } = req.params;
//     const { preview } = req.query;          // ← NEW
//     const requestingUser = req.user;

//     const pdfBuffer = await auditInstanceService.generateReport(id, requestingUser);

//     const filename = `audit_report_${id}.pdf`;

//     /*  NEW  –  decide inline vs attachment  */
//     const disposition = (preview === 'false') ? 'attachment' : 'inline';

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
//     res.send(pdfBuffer);
//   } catch (error) {
//     sendErrorResponse(res, 400, error.message);
//   }
// }
// }

// export default new AuditInstanceController();

import auditInstanceService from '../services/auditInstance.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { getLangFromReq } from '../utils/langHelper.js';

class AuditInstanceController {
  async createAuditInstance(req, res) {
    const lang = getLangFromReq(req);
    try {
      const auditData = req.body;
      const requestingUser = req.user;
      const newAuditInstance = await auditInstanceService.createAuditInstance(auditData, requestingUser, lang);
      sendSuccessResponse(res, 201, 'AUDIT_INSTANCE_CREATED', newAuditInstance, lang);
    } catch (error) {
      sendErrorResponse(res, 400, error.message, lang);
    }
  }

  async getAllAuditInstances(req, res) {
    const lang = getLangFromReq(req);
    try {
      const requestingUser = req.user;
      const auditInstances = await auditInstanceService.getAllAuditInstances(requestingUser, lang);
      sendSuccessResponse(res, 200, 'AUDIT_INSTANCES_RETRIEVED', auditInstances, lang);
    } catch (error) {
      sendErrorResponse(res, 500, error.message, lang);
    }
  }

  async getAuditInstanceById(req, res) {
    const lang = getLangFromReq(req);
    try {
      const { id } = req.params;
      const requestingUser = req.user;
      const auditInstance = await auditInstanceService.getAuditInstanceById(id, requestingUser, lang);
      sendSuccessResponse(res, 200, 'AUDIT_INSTANCE_RETRIEVED', auditInstance, lang);
    } catch (error) {
      sendErrorResponse(res, 404, error.message, lang);
    }
  }

  async submitResponses(req, res) {
    const lang = getLangFromReq(req);
    try {
      const { id } = req.params;
      const responsesData = req.body.responses;
      const requestingUser = req.user;

      if (!Array.isArray(responsesData)) {
        return sendErrorResponse(res, 400, 'RESPONSES_NOT_ARRAY', lang);
      }

      const updatedAuditInstance = await auditInstanceService.submitResponses(id, responsesData, requestingUser, lang);
      sendSuccessResponse(res, 200, 'AUDIT_RESPONSES_SUBMITTED', updatedAuditInstance, lang);
    } catch (error) {
      sendErrorResponse(res, 400, error.message, lang);
    }
  }

  async updateAuditStatus(req, res) {
    const lang = getLangFromReq(req);
    try {
      const { id } = req.params;
      const { status } = req.body;
      const requestingUser = req.user;
      const updatedAuditInstance = await auditInstanceService.updateAuditStatus(id, status, requestingUser, lang);
      sendSuccessResponse(res, 200, 'AUDIT_STATUS_UPDATED', updatedAuditInstance, lang);
    } catch (error) {
      sendErrorResponse(res, 400, error.message, lang);
    }
  }

  async assignAuditors(req, res) {
    const lang = getLangFromReq(req);
    try {
      const { id } = req.params;
      const { auditorIds } = req.body;
      const requestingUser = req.user;

      if (!Array.isArray(auditorIds) || auditorIds.length === 0) {
        return sendErrorResponse(res, 400, 'AUDITOR_IDS_INVALID', lang);
      }

      const updated = await auditInstanceService.assignAuditors(
        id,
        auditorIds,
        requestingUser.id,
        requestingUser.role,
        lang
      );
      sendSuccessResponse(res, 200, 'AUDITORS_ASSIGNED', updated, lang);
    } catch (err) {
      sendErrorResponse(res, 400, err.message, lang);
    }
  }

  async deleteAuditInstance(req, res) {
    const lang = getLangFromReq(req);
    try {
      const { id } = req.params;
      const requestingUser = req.user;
      await auditInstanceService.deleteAuditInstance(id, requestingUser, lang);
      sendSuccessResponse(res, 200, 'AUDIT_INSTANCE_DELETED', null, lang);
    } catch (error) {
      sendErrorResponse(res, 400, error.message, lang);
    }
  }

  async generateReport(req, res) {
    const lang = getLangFromReq(req);
    try {
      const { id } = req.params;
      const { preview } = req.query;
      const requestingUser = req.user;

      const pdfBuffer = await auditInstanceService.generateReport(id, requestingUser, lang);

      const filename = `audit_report_${id}.pdf`;
      const disposition = (preview === 'false') ? 'attachment' : 'inline';

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
      res.send(pdfBuffer);
    } catch (error) {
      sendErrorResponse(res, 400, error.message, lang);
    }
  }
}

export default new AuditInstanceController();