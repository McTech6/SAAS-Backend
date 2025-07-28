// src/controllers/user.controller.js

import userService from '../services/user.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

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
        try {
            const userData = req.body;
            const newUser = await userService.createUser(userData); // Assuming createUser is handled by auth service or similar
            sendSuccessResponse(res, 201, 'User created successfully.', newUser);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Retrieves all users.
     * Accessible by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getAllUsers(req, res) {
        try {
            const users = await userService.getAllUsers();
            sendSuccessResponse(res, 200, 'Users retrieved successfully.', users);
        } catch (error) {
            sendErrorResponse(res, 500, error.message);
        }
    }

    /**
     * Retrieves a single user by ID.
     * Accessible by Super Admin, Admin (for managed auditors), and the user themselves.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await userService.getUserById(id);
            sendSuccessResponse(res, 200, 'User retrieved successfully.', user);
        } catch (error) {
            sendErrorResponse(res, 404, error.message);
        }
    }

    /**
     * Retrieves the profile (first name and email) of the authenticated user.
     * Accessible by any authenticated user.
     * @param {object} req - Express request object (req.user populated by auth middleware).
     * @param {object} res - Express response object.
     */
    async getProfile(req, res) {
        try {
            // The user's ID is available from the protect middleware (req.user.id)
            const userId = req.user.id;
            const userProfile = await userService.getUserProfileById(userId);
            sendSuccessResponse(res, 200, 'User profile retrieved successfully.', userProfile);
        } catch (error) {
            sendErrorResponse(res, 404, error.message);
        }
    }

    /**
     * Updates an existing user.
     * Accessible by Super Admin and the user themselves (for their own profile).
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const requestingUserRole = req.user.role; // Get role of authenticated user
            const updatedUser = await userService.updateUser(id, updates, requestingUserRole);
            sendSuccessResponse(res, 200, 'User updated successfully.', updatedUser);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Deactivates a user account (soft delete).
     * Accessible by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deactivateUser(req, res) {
        try {
            const { id } = req.params;
            const requestingUserId = req.user.id; // Get ID of authenticated user
            const deactivatedUser = await userService.deactivateUser(id, requestingUserId);
            sendSuccessResponse(res, 200, 'User deactivated successfully.', deactivatedUser);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Reactivates a user account.
     * Accessible by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async reactivateUser(req, res) {
        try {
            const { id } = req.params;
            const reactivatedUser = await userService.reactivateUser(id);
            sendSuccessResponse(res, 200, 'User reactivated successfully.', reactivatedUser);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Deletes a user account permanently.
     * Accessible by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const requestingUserId = req.user.id; // Get ID of authenticated user
            await userService.deleteUser(id, requestingUserId);
            sendSuccessResponse(res, 200, 'User deleted successfully.');
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }
}

export default new UserController();
