// // src/controllers/auth.controller.js

// import authService from '../services/auth.service.js';
// import { sendErrorResponse, sendSuccessResponse } from '../utils/responseHandler.js';

// class AuthController {
//     async inviteUser(req, res) {
//         try {
//             // Debug logs (can be removed once confirmed working)
//             console.log('--- Inside authController.inviteUser ---');
//             console.log('req.user:', req.user); // Should now be populated by 'protect'
//             console.log('req.body:', req.body);

//             const { email, role, frontendRegisterUrl } = req.body;

//             // Ensure req.user is populated by the 'protect' middleware
//             // This check is a safeguard, the primary fix is ensuring middleware order in routes
//             if (!req.user || !req.user.id) {
//                 console.error('Error: req.user or req.user.id is undefined. Authentication middleware might not be working correctly.');
//                 return sendErrorResponse(res, 401, 'Authentication required: Inviting user ID not found.');
//             }

//             const managerId = req.user.id; // Get the ID of the inviting user from the authenticated request

//             // Pass arguments in the exact order expected by authService.inviteUser
//             const user = await authService.inviteUser(email, role, frontendRegisterUrl, managerId);
//             sendSuccessResponse(res, 201, 'User invited successfully. Registration link sent to email.', user);
//         } catch (error) {
//             console.error('Error in authController.inviteUser:', error);
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     async completeRegistration(req, res) {
//         try {
//             const { token } = req.query;
//             const userData = req.body;
//             const user = await authService.completeRegistration(token, userData);
//             sendSuccessResponse(res, 200, 'Registration completed. OTP sent to email for verification.', { email: user.email });
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     async verifyEmailOtp(req, res) {
//         try {
//             const { email, otp } = req.body;
//             await authService.verifyEmailOtp(email, otp);
//             sendSuccessResponse(res, 200, 'Email verified successfully. You can now log in.');
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     async login(req, res) {
//         try {
//             const { email, password } = req.body;
//             const message = await authService.login(email, password);
//             sendSuccessResponse(res, 200, message, { email });
//         } catch (error) {
//             sendErrorResponse(res, 401, error.message);
//         }
//     }

//     async verifyLoginOtp(req, res) {
//         try {
//             const { email, otp } = req.body;
//             const token = await authService.verifyLoginOtp(email, otp);
//             sendSuccessResponse(res, 200, 'Login successful.', { token });
//         } catch (error) {
//             sendErrorResponse(res, 401, error.message);
//         }
//     }

//     async forgotPassword(req, res) {
//         try {
//             const { email, frontendResetUrl } = req.body;
//             const message = await authService.forgotPassword(email, frontendResetUrl);
//             sendSuccessResponse(res, 200, message);
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     async resetPassword(req, res) {
//         try {
//             const { token } = req.query;
//             const { newPassword } = req.body;
//             await authService.resetPassword(token, newPassword);
//             sendSuccessResponse(res, 200, 'Password reset successfully.');
//         } catch (error) {
//             // *** SYNTAX FIX APPLIED HERE ***
//             // Removed the extra '(error) { ... }' block that was causing the TypeError.
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     async updateProfile(req, res) {
//         try {
//             const userId = req.user.id;
//             const updates = req.body;
//             const updatedUser = await authService.updateProfile(userId, updates);
//             sendSuccessResponse(res, 200, 'Profile updated successfully.', updatedUser);
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }

//     /**
//      * Gets the profile of the currently authenticated user.
//      * @param {object} req - Express request object (req.user populated by middleware).
//      * @param {object} res - Express response object.
//      */
//     async getMe(req, res) {
//         try {
//             sendSuccessResponse(res, 200, 'User profile retrieved successfully.', req.user);
//         } catch (error) {
//             sendErrorResponse(res, 500, 'Failed to retrieve user profile.', error.message);
//         }
//     }

//     /**
//      * Handles resending of OTP.
//      * @param {object} req - Express request object.
//      * @param {object} res - Express response object.
//      */
//     async resendOtp(req, res) {
//         try {
//             const { email } = req.body;
//             const message = await authService.resendOtp(email);
//             sendSuccessResponse(res, 200, message);
//         } catch (error) {
//             sendErrorResponse(res, 400, error.message);
//         }
//     }
// }

// export default new AuthController();

// src/controllers/auth.controller.js

import authService from '../services/auth.service.js';
import { sendErrorResponse, sendSuccessResponse } from '../utils/responseHandler.js';
import { getMessage, getLangFromReq } from '../utils/langHelper.js';

class AuthController {
    async inviteUser(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { email, role, frontendRegisterUrl } = req.body;
            
            if (!req.user || !req.user.id) {
                return sendErrorResponse(res, 401, getMessage('AUTH_REQUIRED', lang));
            }

            const managerId = req.user.id;
            const { user, messageKey } = await authService.inviteUser(email, role, frontendRegisterUrl, managerId, lang);
            
            sendSuccessResponse(res, 201, getMessage(messageKey, lang), user);
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    async completeRegistration(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { token } = req.query;
            const userData = req.body;
            const { user, messageKey } = await authService.completeRegistration(token, userData, lang);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), { email: user.email });
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    async verifyEmailOtp(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { email, otp } = req.body;
            const { messageKey } = await authService.verifyEmailOtp(email, otp);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang));
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    async login(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { email, password } = req.body;
            const { messageKey } = await authService.login(email, password, lang); 
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), { email }); 
        } catch (error) {
            sendErrorResponse(res, 401, getMessage(error.message, lang));
        }
    }

    async verifyLoginOtp(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { email, otp } = req.body;
            const { token, messageKey } = await authService.verifyLoginOtp(email, otp);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), { token });
        } catch (error) {
            sendErrorResponse(res, 401, getMessage(error.message, lang));
        }
    }

    async forgotPassword(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { email, frontendResetUrl } = req.body;
            const { messageKey } = await authService.forgotPassword(email, frontendResetUrl, lang);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang));
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    async resetPassword(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { token } = req.query;
            const { newPassword } = req.body;
            const { messageKey } = await authService.resetPassword(token, newPassword);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang)); 
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    async updateProfile(req, res) {
        const lang = getLangFromReq(req);
        try {
            const userId = req.user.id;
            const updates = req.body;
            // Language for API response is handled by the controller
            const { user, messageKey } = await authService.updateProfile(userId, updates);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), user); 
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }

    async getMe(req, res) {
        const lang = getLangFromReq(req);
        try {
            sendSuccessResponse(res, 200, getMessage('PROFILE_RETRIEVED', lang), req.user);
        } catch (error) {
            sendErrorResponse(res, 500, getMessage('UNKNOWN_ERROR', lang)); 
        }
    }

    async resendOtp(req, res) {
        const lang = getLangFromReq(req);
        try {
            const { email } = req.body;
            const { messageKey } = await authService.resendOtp(email, lang);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang));
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang));
        }
    }
}

export default new AuthController();