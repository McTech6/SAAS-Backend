

// // src/controllers/auth.controller.js

// import authService from '../services/auth.service.js';
// import { sendErrorResponse, sendSuccessResponse } from '../utils/responseHandler.js';
// import { getMessage, getLangFromReq } from '../utils/langHelper.js';

// class AuthController {
//     async inviteUser(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { email, role, frontendRegisterUrl } = req.body;
            
//             if (!req.user || !req.user.id) {
//                 return sendErrorResponse(res, 401, getMessage('AUTH_REQUIRED', lang));
//             }

//             const managerId = req.user.id;
//             const { user, messageKey } = await authService.inviteUser(email, role, frontendRegisterUrl, managerId, lang);
            
//             sendSuccessResponse(res, 201, getMessage(messageKey, lang), user);
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     async completeRegistration(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { token } = req.query;
//             const userData = req.body;
//             const { user, messageKey } = await authService.completeRegistration(token, userData, lang);
            
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), { email: user.email });
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     async verifyEmailOtp(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { email, otp } = req.body;
//             const { messageKey } = await authService.verifyEmailOtp(email, otp);
            
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang));
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     async login(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { email, password } = req.body;
//             const { messageKey } = await authService.login(email, password, lang); 
            
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), { email }); 
//         } catch (error) {
//             sendErrorResponse(res, 401, getMessage(error.message, lang));
//         }
//     }

//     async verifyLoginOtp(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { email, otp } = req.body;
//             const { token, messageKey } = await authService.verifyLoginOtp(email, otp);
            
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), { token });
//         } catch (error) {
//             sendErrorResponse(res, 401, getMessage(error.message, lang));
//         }
//     }

//     async forgotPassword(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { email, frontendResetUrl } = req.body;
//             const { messageKey } = await authService.forgotPassword(email, frontendResetUrl, lang);
            
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang));
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     async resetPassword(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { token } = req.query;
//             const { newPassword } = req.body;
//             const { messageKey } = await authService.resetPassword(token, newPassword);
            
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang)); 
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     async updateProfile(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const userId = req.user.id;
//             const updates = req.body;
//             // Language for API response is handled by the controller
//             const { user, messageKey } = await authService.updateProfile(userId, updates);
            
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang), user); 
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
//         }
//     }

//     async getMe(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             sendSuccessResponse(res, 200, getMessage('PROFILE_RETRIEVED', lang), req.user);
//         } catch (error) {
//             sendErrorResponse(res, 500, getMessage('UNKNOWN_ERROR', lang)); 
//         }
//     }

//     async resendOtp(req, res) {
//         const lang = getLangFromReq(req);
//         try {
//             const { email } = req.body;
//             const { messageKey } = await authService.resendOtp(email, lang);
            
//             sendSuccessResponse(res, 200, getMessage(messageKey, lang));
//         } catch (error) {
//             sendErrorResponse(res, 400, getMessage(error.message, lang));
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
            const { email, role, frontendRegisterUrl, maxManagedAdmins, maxManagedAuditors } = req.body; // <-- EXTRACT NEW QUOTA FIELDS
            
            if (!req.user || !req.user.id) {
                return sendErrorResponse(res, 401, getMessage('AUTH_REQUIRED', lang));
            }

            const inviterUser = req.user; // Use the full user object from middleware
            
            // Pass the full inviter user object and the new quota limits
            const { user, messageKey } = await authService.inviteUser(
                email, 
                role, 
                frontendRegisterUrl, 
                inviterUser, // <-- PASS FULL INVITER OBJECT
                maxManagedAdmins, // <-- PASS QUOTA LIMITS (Super Admin sets this for new Admin)
                maxManagedAuditors, // <-- PASS QUOTA LIMITS (Super Admin sets this for new Admin)
                lang
            );
            
            sendSuccessResponse(res, 201, getMessage(messageKey, lang), user);
        } catch (error) {
            // Use 403 for Authorization/Quota errors
            const statusCode = error.message.includes('LIMIT_REACHED') ? 403 : 400;
            sendErrorResponse(res, statusCode, getMessage(error.message, lang));
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