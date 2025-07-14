// src/routes/admin.routes.js (Example)

import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
// import adminController from '../controllers/admin.controller.js'; // Assuming you have this

const router = Router();

// Example: Only super_admin or admin can create a new audit
router.post('/audits', protect, authorize('super_admin', 'admin'), (req, res) => {
    // adminController.createAudit(req, res);
    res.send('Admin or Super Admin can create audit!');
});

// Example: Only super_admin can create another admin
router.post('/create-admin', protect, authorize('super_admin'), (req, res) => {
    // adminController.createAdmin(req, res);
    res.send('Only Super Admin can create another Admin!');
});

export default router;