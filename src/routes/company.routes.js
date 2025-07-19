// src/routes/company.routes.js

import { Router } from 'express';
import companyController from '../controllers/company.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All company management routes require authentication
router.use(protect);

// POST /api/v1/companies - Create a new company
// Accessible by Super Admin, Admin, and Auditor
router.post('/', authorize('super_admin', 'admin', 'auditor'), companyController.createCompany);

// GET /api/v1/companies - Get all companies accessible to the user
// Accessible by Super Admin, Admin, and Auditor
router.get('/', authorize('super_admin', 'admin', 'auditor'), companyController.getAllCompanies);

// GET /api/v1/companies/:id - Get a single company by ID
// Accessible by Super Admin, Admin, and Auditor
router.get('/:id', authorize('super_admin', 'admin', 'auditor'), companyController.getCompanyById);

// PATCH /api/v1/companies/:id - Update a company
// Accessible by Super Admin and Admin
router.patch('/:id', authorize('super_admin', 'admin'), companyController.updateCompany);

// DELETE /api/v1/companies/:id - Delete a company permanently
// Accessible by Super Admin and Admin
router.delete('/:id', authorize('super_admin', 'admin'), companyController.deleteCompany);

export default router;
