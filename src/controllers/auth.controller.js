// src/controllers/auth.controller.js

import authService from '../services/auth.service.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseHandler.js';

class AuthController {
    async inviteUser(req, res) {
        try {
            const { email, role, frontendRegisterUrl } = req.body;
            const user = await authService.inviteUser(email, role, frontendRegisterUrl);
            sendSuccessResponse(res, 201, 'User invited successfully. Registration link sent to email.', user);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    async completeRegistration(req, res) {
        try {
            const { token } = req.query;
            const userData = req.body;
            const user = await authService.completeRegistration(token, userData);
            sendSuccessResponse(res, 200, 'Registration completed. OTP sent to email for verification.', { email: user.email });
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    async verifyEmailOtp(req, res) {
        try {
            const { email, otp } = req.body;
            await authService.verifyEmailOtp(email, otp);
            sendSuccessResponse(res, 200, 'Email verified successfully. You can now log in.');
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const message = await authService.login(email, password);
            sendSuccessResponse(res, 200, message, { email });
        } catch (error) {
            sendErrorResponse(res, 401, error.message);
        }
    }

    async verifyLoginOtp(req, res) {
        try {
            const { email, otp } = req.body;
            const token = await authService.verifyLoginOtp(email, otp);
            sendSuccessResponse(res, 200, 'Login successful.', { token });
        } catch (error) {
            sendErrorResponse(res, 401, error.message);
        }
    }

    async forgotPassword(req, res) {
        try {
            const { email, frontendResetUrl } = req.body;
            const message = await authService.forgotPassword(email, frontendResetUrl);
            sendSuccessResponse(res, 200, message);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    async resetPassword(req, res) {
        try {
            const { token } = req.query;
            const { newPassword } = req.body;
            await authService.resetPassword(token, newPassword);
            sendSuccessResponse(res, 200, 'Password reset successfully.');
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    async updateProfile(req, res) {
        try {
            // req.user.id is populated by the 'protect' middleware
            const userId = req.user.id;
            const updates = req.body;
            const updatedUser = await authService.updateProfile(userId, updates);
            sendSuccessResponse(res, 200, 'Profile updated successfully.', updatedUser);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Gets the profile of the currently authenticated user.
     * @param {object} req - Express request object (req.user populated by middleware).
     * @param {object} res - Express response object.
     */
    async getMe(req, res) {
        try {
            // req.user is populated by the 'protect' middleware
            // It already contains the user's non-sensitive profile data
            sendSuccessResponse(res, 200, 'User profile retrieved successfully.', req.user);
        } catch (error) {
            sendErrorResponse(res, 500, 'Failed to retrieve user profile.', error.message);
        }
    }

      /**
     * Handles resending of OTP.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async resendOtp(req, res) {
        try {
            const { email } = req.body;
            const message = await authService.resendOtp(email);
            sendSuccessResponse(res, 200, message);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }
}

export default new AuthController();
