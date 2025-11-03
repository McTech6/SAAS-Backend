import { Router } from 'express';
import auditTemplateController from '../controllers/auditTemplate.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All audit template routes require authentication
router.use(protect);

// Existing routes
router.post('/', authorize('super_admin'), auditTemplateController.createAuditTemplate);
router.get('/', authorize('super_admin', 'admin', 'auditor'), auditTemplateController.getAllAuditTemplates);
router.get('/:id', authorize('super_admin', 'admin', 'auditor'), auditTemplateController.getAuditTemplateById);
router.patch('/:id', authorize('super_admin'), auditTemplateController.updateAuditTemplate);
router.delete('/:id', authorize('super_admin'), auditTemplateController.deleteAuditTemplate);

// NEW ROUTE: Admins get only assigned templates
//router.get('/assigned/my-templates', authorize('admin'), auditTemplateController.getAssignedTemplates);

export default router;
