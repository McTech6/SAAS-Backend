// src/routes/auditTemplate.routes.js

import { Router } from 'express';
import auditTemplateController from '../controllers/auditTemplate.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All audit template routes require authentication
router.use(protect);

// POST /api/v1/audit-templates - Create a new audit template (Super Admin only)
router.post('/', authorize('super_admin'), auditTemplateController.createAuditTemplate);

// GET /api/v1/audit-templates - Get all audit templates (Super Admin, Admin, Auditor)
router.get('/', authorize('super_admin', 'admin', 'auditor'), auditTemplateController.getAllAuditTemplates);

// GET /api/v1/audit-templates/:id - Get a single audit template by ID (Super Admin, Admin, Auditor)
router.get('/:id', authorize('super_admin', 'admin', 'auditor'), auditTemplateController.getAuditTemplateById);

// PATCH /api/v1/audit-templates/:id - Update an audit template (Super Admin only)
router.patch('/:id', authorize('super_admin'), auditTemplateController.updateAuditTemplate);

// DELETE /api/v1/audit-templates/:id - Delete an audit template (Super Admin only)
router.delete('/:id', authorize('super_admin'), auditTemplateController.deleteAuditTemplate);

export default router;
