// src/routes/auditInstance.routes.js

import { Router } from 'express';
import auditInstanceController from '../controllers/auditInstance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All audit instance routes require authentication
router.use(protect);

// POST /api/v1/audit-instances - Create a new audit instance
// Accessible by Super Admin, Admin, Auditor
router.post('/', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.createAuditInstance);

// GET /api/v1/audit-instances - Get all audit instances accessible to the user
// Accessible by Super Admin, Admin, Auditor
router.get('/', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.getAllAuditInstances);

// GET /api/v1/audit-instances/:id - Get a single audit instance by ID
// Accessible by Super Admin, Admin, Auditor
router.get('/:id', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.getAuditInstanceById);

// PATCH /api/v1/audit-instances/:id/responses - Submit/update audit responses
// Accessible by Super Admin, Admin, Auditor
router.patch('/:id/responses', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.submitResponses);

// PATCH /api/v1/audit-instances/:id/status - Update audit status
// Accessible by Super Admin, Admin, Auditor (with specific status transition rules)
router.patch('/:id/status', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.updateAuditStatus);

// DELETE /api/v1/audit-instances/:id - Delete an audit instance
// Accessible by Super Admin, Admin (with restrictions)
router.delete('/:id', authorize('super_admin', 'admin'), auditInstanceController.deleteAuditInstance);

// GET /api/v1/audit-instances/:id/report - Generate audit report
// Accessible by Super Admin, Admin, Auditor (only if audit is 'Completed')
router.get('/:id/report', authorize('super_admin', 'admin', 'auditor'), auditInstanceController.generateReport);

export default router;
