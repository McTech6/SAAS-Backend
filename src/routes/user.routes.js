// src/routes/user.routes.js

import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All user management routes require authentication
router.use(protect);

// GET /api/v1/users - Get all users (Super Admin, Admin)
router.get('/', authorize('super_admin', 'admin'), userController.getAllUsers);

// GET /api/v1/users/:id - Get a single user by ID (Super Admin, Admin)
router.get('/:id', authorize('super_admin', 'admin'), userController.getUserById);

// PATCH /api/v1/users/:id - Update a user (Super Admin, Admin)
// Super Admin can update any user's profile and role.
// Admin can update auditor profiles (not roles).
router.patch('/:id', authorize('super_admin', 'admin'), userController.updateUser);

// PATCH /api/v1/users/:id/deactivate - Deactivate a user (Super Admin, Admin)
router.patch('/:id/deactivate', authorize('super_admin', 'admin'), userController.deactivateUser);

// PATCH /api/v1/users/:id/reactivate - Reactivate a user (Super Admin, Admin)
router.patch('/:id/reactivate', authorize('super_admin', 'admin'), userController.reactivateUser);

// DELETE /api/v1/users/:id - Delete a user permanently (Super Admin only)
router.delete('/:id', authorize('super_admin'), userController.deleteUser);

export default router;
