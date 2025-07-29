// src/services/user.service.js

import User from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/helpers.js'; // Assuming these are your helpers

/**
 * Service for managing user accounts (beyond authentication).
 */
class UserService {
    /**
     * Retrieves all users from the database based on the requesting user's role.
     * Super Admins see all users. Admins see users they manage (where managerId matches their ID).
     * @param {object} requestingUser - The authenticated user object ({ id, role }).
     * @returns {Promise<Array<User>>} A list of users, excluding sensitive fields.
     * @throws {Error} If the requesting user's role is not authorized to view users.
     */
    async getAllUsers(requestingUser) { // <-- MODIFIED SIGNATURE
        let query = {};

        if (requestingUser.role === 'super_admin') {
            // Super Admin sees all users
            query = {};
        } else if (requestingUser.role === 'admin') {
            // Admin sees users they are the manager of
            query = { managerId: requestingUser.id }; // <-- FILTER BY managerId
        } else {
            // Other roles (e.g., 'auditor') are not authorized to view all users
            throw new Error('You are not authorized to view other user accounts.');
        }

        // Exclude sensitive fields like password, OTPs, tokens by default
        return User.find(query).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
    }

    /**
     * Retrieves a single user by their ID.
     * @param {string} userId - The ID of the user to retrieve.
     * @returns {Promise<User>} The user object, excluding sensitive fields.
     * @throws {Error} If user not found.
     */
    async getUserById(userId) {
        const user = await User.findById(userId).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
        if (!user) {
            throw new Error('User not found.');
        }
        return user;
    }

    /**
     * Retrieves a user's first name and email by ID for profile display.
     * @param {string} userId - The ID of the user to retrieve.
     * @returns {Promise<object>} An object containing the user's firstName and email.
     * @throws {Error} If user not found.
     */
    async getUserProfileById(userId) {
        const user = await User.findById(userId).select('firstName email'); // Select only these fields
        if (!user) {
            throw new Error('User not found.');
        }
        return user;
    }

    /**
     * Updates an existing user's profile or role.
     * Super Admins can update roles. Admins can update auditor profiles.
     * @param {string} targetUserId - The ID of the user to update.
     * @param {object} updates - Object containing fields to update.
     * @param {string} requestingUserRole - The role of the user making the request.
     * @returns {Promise<User>} The updated user object.
     * @throws {Error} If user not found, unauthorized, or update fails.
     */
    async updateUser(targetUserId, updates, requestingUserRole) {
        const user = await User.findById(targetUserId).select('+password'); // Select password if it might be updated

        if (!user) {
            throw new Error('User not found.');
        }

        // Prevent non-super_admins from changing roles
        if (updates.role && requestingUserRole !== 'super_admin') {
            throw new Error('Only Super Admins can change user roles.');
        }
        // Prevent admins from changing other admin/super_admin roles
        if (updates.role && requestingUserRole === 'super_admin' && (user.role === 'super_admin' && user._id.toString() !== targetUserId)) {
             // A super_admin cannot change another super_admin's role (or their own) via this endpoint,
             // this is more for security to prevent accidental demotion of the last super_admin.
             // For simplicity, we'll prevent a super_admin from changing another super_admin's role here.
             if (updates.role === 'super_admin' && user.role === 'super_admin') {
                throw new Error('Cannot change another Super Admin\'s role via this endpoint.');
             }
        }


        // Apply updates
        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;
        if (updates.email) user.email = updates.email; // Be cautious with email changes, might need re-verification
        if (updates.role && requestingUserRole === 'super_admin') {
            user.role = updates.role;
        }

        // Handle password change if newPassword is provided
        if (updates.newPassword) {
            // If changing own password, currentPassword is required
            // If admin/super_admin is resetting another user's password, currentPassword is NOT required
            if (updates.currentPassword) { // If currentPassword is provided, it's likely a self-update
                const isPasswordMatch = await comparePassword(updates.currentPassword, user.password);
                if (!isPasswordMatch) {
                    throw new Error('Invalid current password.');
                }
            }
            user.password = await hashPassword(updates.newPassword); // Hash new password
            user.profileCompleted = true; // Ensure profile is marked complete
        }

        await user.save();

        // Return user without sensitive data
        user.password = undefined;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.inviteToken = undefined;
        user.inviteTokenExpires = undefined;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        return user;
    }

    /**
     * Deactivates a user account (soft delete).
     * @param {string} userId - The ID of the user to deactivate.
     * @returns {Promise<User>} The deactivated user object.
     * @throws {Error} If user not found or cannot deactivate self.
     */
    async deactivateUser(userId, requestingUserId) {
        if (userId === requestingUserId) {
            throw new Error('Cannot deactivate your own account.');
        }
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true }).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
        if (!user) {
            throw new Error('User not found.');
        }
        return user;
    }

    /**
     * Reactivates a user account.
     * @param {string} userId - The ID of the user to reactivate.
     * @returns {Promise<User>} The reactivated user object.
     * @throws {Error} If user not found.
     */
    async reactivateUser(userId) {
        const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true }).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
        if (!user) {
            throw new Error('User not found.');
        }
        return user;
    }

    /**
     * Deletes a user account permanently.
     * @param {string} userId - The ID of the user to delete.
     * @returns {Promise<void>}
     * @throws {Error} If user not found or cannot delete self.
     */
    async deleteUser(userId, requestingUserId) {
        if (userId === requestingUserId) {
            throw new Error('Cannot delete your own account.');
        }
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error('User not found.');
        }
        // Optionally, handle deletion of related data (e.g., audits created by this user)
    }
}

export default new UserService();
