// src/routes/upload.routes.js

import { Router } from 'express';
import uploadController from '../controllers/upload.controller.js';
import upload from '../middleware/multer.middleware.js'; // Multer middleware
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All upload routes require authentication
router.use(protect);

// POST /api/v1/uploads/evidence - Upload a single evidence file
// 'evidenceFile' is the name of the form field that will contain the file
router.post(
    '/evidence',
    authorize('super_admin', 'admin', 'auditor'), // All roles that can submit responses can upload evidence
    upload.single('evidenceFile'), // Multer middleware to handle single file upload
    uploadController.uploadEvidence
);

export default router;
