 
 

// src/routes/auditInstance.routes.js
import { Router } from 'express';
import auditInstanceController from '../controllers/auditInstance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.post('/', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.createAuditInstance);
router.get('/', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.getAllAuditInstances);
router.get('/:id', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.getAuditInstanceById);
router.patch('/:id/responses', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.submitResponses);
router.patch('/:id/status', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.updateAuditStatus);
router.patch('/:id/assign-auditors', authorize('super_admin', 'admin'), auditInstanceController.assignAuditors);
router.delete('/:id', authorize('super_admin', 'admin'), auditInstanceController.deleteAuditInstance);
// CHANGE: Only super_admin and admin can generate a report.
router.get('/:id/report', authorize('super_admin', 'admin'), auditInstanceController.generateReport);

export default router;