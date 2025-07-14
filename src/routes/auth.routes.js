// src/routes/auth.routes.js

import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js'; // Import the new middleware

const router = Router();

router.post('/invite', authController.inviteUser); // Will be protected by superAdmin/admin middleware later
router.post('/register', authController.completeRegistration);
router.post('/verify-email-otp', authController.verifyEmailOtp);
router.post('/login', authController.login);
router.post('/verify-login-otp', authController.verifyLoginOtp);
router.post('/forgot-password', authController.forgotPassword);
router.put('/reset-password', authController.resetPassword);
router.put('/resend-otp', authController.resendOtp);

// Protected routes:
// PATCH /api/v1/auth/profile - Update user profile
router.patch('/profile', protect, authController.updateProfile);

// GET /api/v1/auth/me - Get current user's profile
router.get('/me', protect, authController.getMe);

export default router;
