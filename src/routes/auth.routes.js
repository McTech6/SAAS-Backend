// src/routes/auth.routes.js

import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js'; // Import the middleware

const router = Router();

// --- PUBLIC ROUTES (NO AUTHENTICATION REQUIRED) ---
router.post('/register', authController.completeRegistration); // Handles completing registration after invite
router.post('/login', authController.login);
router.post('/verify-email-otp', authController.verifyEmailOtp);
router.post('/verify-login-otp', authController.verifyLoginOtp);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password', authController.resetPassword); // PUT for reset-password
router.post('/resend-otp', authController.resendOtp); // POST for resend-otp

// --- PROTECTED ROUTES (AUTHENTICATION REQUIRED) ---
// All routes defined AFTER this line will automatically use the 'protect' middleware
router.use(protect);

// Invite a new user
// Requires authentication (via 'protect') and specific roles (via 'authorize')
router.post('/invite', authorize('super_admin', 'admin'), authController.inviteUser);

// Get current user's profile
router.get('/me', authController.getMe);

// Update authenticated user's profile
router.patch('/profile', authController.updateProfile);


export default router;




//router.patch('/profile', protect, authController.updateProfile)
