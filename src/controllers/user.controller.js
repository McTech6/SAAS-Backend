// src/controllers/user.controller.js

import userService from '../services/user.service.js';
import { sendSuccessResponse, sendErrorResponse } from '../utils/responseHandler.js';

/**
 * Controller for user management operations (beyond auth).
 * These routes will be protected by authentication and authorization middleware.
 */
class UserController {
    /**
     * Retrieves all users. Accessible by Super Admin and Admin.
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
     * Retrieves a single user by ID. Accessible by Super Admin and Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async getUserById(req, res) {
        try {
            const user = await userService.getUserById(req.params.id);
            sendSuccessResponse(res, 200, 'User retrieved successfully.', user);
        } catch (error) {
            sendErrorResponse(res, 404, error.message);
        }
    }

    /**
     * Updates a user's profile or role. Accessible by Super Admin and Admin.
     * Super Admin can update any user, including roles.
     * Admin can update auditor profiles.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async updateUser(req, res) {
        try {
            const { id } = req.params; // User ID to update
            const updates = req.body;
            const requestingUserRole = req.user.role; // Role of the authenticated user making the request

            const updatedUser = await userService.updateUser(id, updates, requestingUserRole);
            sendSuccessResponse(res, 200, 'User updated successfully.', updatedUser);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Deactivates a user account. Accessible by Super Admin and Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deactivateUser(req, res) {
        try {
            const { id } = req.params;
            const requestingUserId = req.user.id; // ID of the authenticated user making the request
            const deactivatedUser = await userService.deactivateUser(id, requestingUserId);
            sendSuccessResponse(res, 200, 'User deactivated successfully.', deactivatedUser);
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }

    /**
     * Reactivates a user account. Accessible by Super Admin and Admin.
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
     * Deletes a user account permanently. Accessible only by Super Admin.
     * @param {object} req - Express request object.
     * @param {object} res - Express response object.
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const requestingUserId = req.user.id; // ID of the authenticated user making the request
            await userService.deleteUser(id, requestingUserId);
            sendSuccessResponse(res, 200, 'User deleted successfully.');
        } catch (error) {
            sendErrorResponse(res, 400, error.message);
        }
    }
}

export default new UserController();
