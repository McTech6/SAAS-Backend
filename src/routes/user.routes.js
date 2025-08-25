// src/routes/user.routes.js

import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// Apply protect middleware to all user routes
router.use(protect);

// GET /api/v1/users/profile - Get authenticated user's profile (firstName, email)
// Accessible by any authenticated user
router.get('/profile', userController.getProfile);

// POST /api/v1/users - Create a new user (Super Admin only)
// Note: User creation might also be handled by auth.controller.js (e.g., registration, invitation)
router.post('/', authorize('super_admin'), userController.createUser);

// GET /api/v1/users - Get all users (Super Admin and Admin only)
// The actual filtering will happen in the service based on role
router.get('/', authorize('super_admin', 'admin'), userController.getAllUsers); 

// /api/v1/users/managed

router.get('/managed', authorize('super_admin', 'admin'), userController.getManagedUsers);

// GET /api/v1/users/:id - Get a single user by ID (Super Admin, Admin for managed auditors, or user themselves)
// The controller will handle authorization based on user role and ID
router.get('/:id', userController.getUserById);

// PATCH /api/v1/users/:id - Update a user (Super Admin or user themselves)
// The controller will handle authorization based on user role and ID
router.patch('/:id', userController.updateUser);

// PATCH /api/v1/users/:id/deactivate - Deactivate a user (Super Admin only)
router.patch('/:id/deactivate', authorize('super_admin'), userController.deactivateUser);

// PATCH /api/v1/users/:id/reactivate - Reactivate a user (Super Admin only)
router.patch('/:id/reactivate', authorize('super_admin'), userController.reactivateUser);

// DELETE /api/v1/users/:id - Delete a user (Super Admin only)
router.delete('/:id', authorize('super_admin'), userController.deleteUser);




export default router;
