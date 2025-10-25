


// src/controllers/user.controller.js

import userService from '../services/user.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';
import { getMessage, getLangFromReq } from '../utils/langHelper.js'; // <-- IMPORTED

/**
 * Controller for User management operations.
 * These routes will be protected by authentication and authorization middleware.
 */
class UserController {
    /**
     * Creates a new user.
     * Accessible by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async createUser(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            const userData = req.body;
            // Assuming createUser returns { newUser, messageKey: 'USER_CREATED' }
            const { newUser, messageKey } = await userService.createUser(userData); 
            
            sendSuccessResponse(res, 201, getMessage(messageKey, lang), newUser); // <-- TRANSLATED
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang)); // <-- TRANSLATED
        }
    }

    /**
     * Retrieves all users based on the requesting user's role.
     * Accessible by Super Admin (sees all) and Admin (sees users they manage).
     * @param {object} req - Express request object (req.user populated by auth middleware).
     * @param {object} res - Express response object.
     */
    async getAllUsers(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            // Pass the authenticated user object to the service for role-based filtering
            // Assuming getAllUsers returns { users, messageKey: 'USERS_RETRIEVED' }
            const { users, messageKey } = await userService.getAllUsers({ id: req.user.id, role: req.user.role });
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), users); // <-- TRANSLATED
        } catch (error) {
            // Error code 403 (Forbidden) is often more appropriate for authorization errors
            sendErrorResponse(res, 403, getMessage(error.message, lang)); // <-- TRANSLATED (Changed status code to 403 for authorization errors)
        }
    }

    /**
     * Retrieves a single user by ID.
     * Accessible by Super Admin, Admin (for managed auditors), and the user themselves.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getUserById(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            const { id } = req.params;
            // Assuming getUserById returns { user, messageKey: 'PROFILE_RETRIEVED' }
            const { user, messageKey } = await userService.getUserById(id);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), user); // <-- TRANSLATED
        } catch (error) {
            sendErrorResponse(res, 404, getMessage(error.message, lang)); // <-- TRANSLATED
        }
    }

    /**
     * Retrieves the profile (first name and email) of the authenticated user.
     * Accessible by any authenticated user.
     * @param {object} req - Express request object (req.user populated by auth middleware).
     * @param {object} res - Express response object.
     */
    async getProfile(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            // The user's ID is available from the protect middleware (req.user.id)
            const userId = req.user.id;
            // Assuming getUserProfileById returns { userProfile, messageKey: 'PROFILE_RETRIEVED' }
            const { userProfile, messageKey } = await userService.getUserProfileById(userId);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), userProfile); // <-- TRANSLATED
        } catch (error) {
            sendErrorResponse(res, 404, getMessage(error.message, lang)); // <-- TRANSLATED
        }
    }

    /**
     * Updates an existing user.
     * Accessible by Super Admin and the user themselves (for their own profile).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async updateUser(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            const { id } = req.params;
            const updates = req.body;
            const requestingUserRole = req.user.role; // Get role of authenticated user
            // Assuming updateUser returns { updatedUser, messageKey: 'PROFILE_UPDATED' }
            const { updatedUser, messageKey } = await userService.updateUser(id, updates, requestingUserRole);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), updatedUser); // <-- TRANSLATED
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang)); // <-- TRANSLATED
        }
    }

    /**
     * Deactivates a user account (soft delete).
     * Accessible by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deactivateUser(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            const { id } = req.params;
            const requestingUserId = req.user.id; // Get ID of authenticated user
            // Assuming deactivateUser returns { deactivatedUser, messageKey: 'USER_DEACTIVATED' }
            const { deactivatedUser, messageKey } = await userService.deactivateUser(id, requestingUserId);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), deactivatedUser); // <-- TRANSLATED
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang)); // <-- TRANSLATED
        }
    }

    /**
     * Reactivates a user account.
     * Accessible by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async reactivateUser(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            const { id } = req.params;
            // Assuming reactivateUser returns { reactivatedUser, messageKey: 'USER_REACTIVATED' }
            const { reactivatedUser, messageKey } = await userService.reactivateUser(id);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), reactivatedUser); // <-- TRANSLATED
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang)); // <-- TRANSLATED
        }
    }

    /**
     * Deletes a user account permanently.
     * Accessible by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deleteUser(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            const { id } = req.params;
            const requestingUserId = req.user.id; // Get ID of authenticated user
            // Assuming deleteUser returns { messageKey: 'USER_DELETED' }
            const { messageKey } = await userService.deleteUser(id, requestingUserId);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang)); // <-- TRANSLATED
        } catch (error) {
            sendErrorResponse(res, 400, getMessage(error.message, lang)); // <-- TRANSLATED
        }
    }

    /**
    * Returns all users whose managerId equals the logged-in user’s id.
    * Accessible by Super-Admin and Admin only.
    */
    async getManagedUsers(req, res) {
        const lang = getLangFromReq(req); // <-- GET LANG
        try {
            const requestingUser = req.user; 
            // Assuming getManagedUsers returns { users, messageKey: 'MANAGED_USERS_RETRIEVED' }
            const { users, messageKey } = await userService.getManagedUsers(requestingUser.id);
            
            sendSuccessResponse(res, 200, getMessage(messageKey, lang), users); // <-- TRANSLATED
        } catch (err) {
            sendErrorResponse(res, 400, getMessage(err.message, lang)); // <-- TRANSLATED
        }
    }
}

export default new UserController();