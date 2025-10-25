 

// import User from '../models/user.model.js';
// import { hashPassword, comparePassword } from '../utils/helpers.js'; 
// import { MESSAGES } from '../utils/messages.js';

// /**
//  * Service for managing user accounts (beyond authentication).
//  */
// class UserService {
//     async getAllUsers(requestingUser) { 
//         let query = {};

//         if (requestingUser.role === 'super_admin') {
//             query = {};
//         } else if (requestingUser.role === 'admin') {
//             query = { managerId: requestingUser.id };
//         } else {
//             throw new Error(MESSAGES.NOT_AUTHORIZED.EN);
//         }

//         const users = await User.find(query).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
//         return { users, messageKey: 'USERS_RETRIEVED' };
//     }

//     async getUserById(userId) {
//         const user = await User.findById(userId).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         return { user: user.toObject(), messageKey: 'PROFILE_RETRIEVED' };
//     }

//     async getUserProfileById(userId) {
//         const user = await User.findById(userId).select('firstName email'); 
//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         return { user: user.toObject(), messageKey: 'PROFILE_RETRIEVED' };
//     }

//     async updateUser(targetUserId, updates, requestingUserRole) {
//         const user = await User.findById(targetUserId).select('+password'); 

//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }

//         if (updates.role && requestingUserRole !== 'super_admin') {
//             throw new Error(MESSAGES.ROLE_CHANGE_UNAUTHORIZED.EN);
//         }
//         if (updates.role && requestingUserRole === 'super_admin' && (user.role === 'super_admin' && user._id.toString() !== targetUserId)) {
//              if (updates.role === 'super_admin' && user.role === 'super_admin') {
//                  throw new Error(MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE.EN);
//              }
//         }

//         if (updates.firstName) user.firstName = updates.firstName;
//         if (updates.lastName) user.lastName = updates.lastName;
//         if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;
//         if (updates.email) user.email = updates.email;
//         if (updates.role && requestingUserRole === 'super_admin') {
//             user.role = updates.role;
//         }

//         if (updates.newPassword) {
//             if (updates.currentPassword) { 
//                 const isPasswordMatch = await comparePassword(updates.currentPassword, user.password);
//                 if (!isPasswordMatch) {
//                     // Use the specific message key for localization
//                     throw new Error(MESSAGES.PASSWORD_MISMATCH.EN);
//                 }
//             }
//             user.password = await hashPassword(updates.newPassword); 
//             user.profileCompleted = true; 
//         }

//         await user.save();

//         // Sanitize sensitive fields before returning
//         user.password = undefined;
//         user.otp = undefined;
//         user.otpExpires = undefined;
//         user.inviteToken = undefined;
//         user.inviteTokenExpires = undefined;
//         user.passwordResetToken = undefined;
//         user.passwordResetExpires = undefined;

//         return { user: user.toObject(), messageKey: 'PROFILE_UPDATED' };
//     }

//     async deactivateUser(userId, requestingUserId) {
//         if (userId === requestingUserId) {
//             throw new Error(MESSAGES.CANNOT_DEACTIVATE_SELF.EN);
//         }
//         const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true }).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         return { user: user.toObject(), messageKey: 'USER_DEACTIVATED' };
//     }

//     async reactivateUser(userId) {
//         const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true }).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         return { user: user.toObject(), messageKey: 'USER_REACTIVATED' };
//     }

//     async deleteUser(userId, requestingUserId) {
//         if (userId === requestingUserId) {
//             throw new Error(MESSAGES.CANNOT_DELETE_SELF.EN);
//         }
//         const user = await User.findByIdAndDelete(userId);
//         if (!user) {
//             throw new Error(MESSAGES.USER_NOT_FOUND.EN);
//         }
//         return { messageKey: 'USER_DELETED' };
//     }

//     async getManagedUsers(managerId) {
//         const users = await User.find({ managerId })
//             .select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires')
//             .sort({ createdAt: -1 });
//         return { users, messageKey: 'MANAGED_USERS_RETRIEVED' };
//     }
// }

// export default new UserService();

// src/services/user.service.js

import User from '../models/user.model.js';
import { hashPassword, comparePassword } from '../utils/helpers.js'; 
import { MESSAGES } from '../utils/messages.js';

/**
 * Service for managing user accounts (beyond authentication).
 */
class UserService {
    /**
     * Helper to count users of a specific role under a manager's entire hierarchy.
     * @param {string} managerId - The ID of the top-level manager (Admin/Super Admin).
     * @param {('admin'|'auditor')} roleToCount - The role to count (Auditors count against MaxAuditor limit).
     * @returns {number} The count of managed users.
     */
    async countManagedUsersInHierarchy(managerId, roleToCount) {
        // Find all direct Admin reports of the main managerId
        const directAdminReports = await User.find({ managerId: managerId, role: 'admin' }).select('_id');
        const managedAdminIds = directAdminReports.map(admin => admin._id);
        
        // Include the main managerId itself, as they can directly invite users
        const effectiveManagerIds = [managerId, ...managedAdminIds];
        
        // Count users of the specified role under the entire hierarchy
        const count = await User.countDocuments({
            managerId: { $in: effectiveManagerIds },
            role: roleToCount
        });
        
        return count;
    }


    async getAllUsers(requestingUser) { 
        let query = {};

        if (requestingUser.role === 'super_admin') {
            query = {};
        } else if (requestingUser.role === 'admin') {
            query = { managerId: requestingUser.id };
        } else {
            throw new Error(MESSAGES.NOT_AUTHORIZED.EN);
        }

        const users = await User.find(query).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
        return { users, messageKey: 'USERS_RETRIEVED' };
    }

    async getUserById(userId) {
        const user = await User.findById(userId).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
        if (!user) {
            throw new Error(MESSAGES.USER_NOT_FOUND.EN);
        }
        return { user: user.toObject(), messageKey: 'PROFILE_RETRIEVED' };
    }

    async getUserProfileById(userId) {
        const user = await User.findById(userId).select('firstName email'); 
        if (!user) {
            throw new Error(MESSAGES.USER_NOT_FOUND.EN);
        }
        return { user: user.toObject(), messageKey: 'PROFILE_RETRIEVED' };
    }

    async updateUser(targetUserId, updates, requestingUserRole) {
        const user = await User.findById(targetUserId).select('+password'); 

        if (!user) {
            throw new Error(MESSAGES.USER_NOT_FOUND.EN);
        }

        if (updates.role && requestingUserRole !== 'super_admin') {
            throw new Error(MESSAGES.ROLE_CHANGE_UNAUTHORIZED.EN);
        }
        if (updates.role && requestingUserRole === 'super_admin' && (user.role === 'super_admin' && user._id.toString() !== targetUserId)) {
             if (updates.role === 'super_admin' && user.role === 'super_admin') {
                 throw new Error(MESSAGES.CANNOT_CHANGE_SUPER_ADMIN_ROLE.EN);
             }
        }

        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;
        if (updates.email) user.email = updates.email;
        if (updates.role && requestingUserRole === 'super_admin') {
            user.role = updates.role;
        }

        if (updates.newPassword) {
            if (updates.currentPassword) { 
                const isPasswordMatch = await comparePassword(updates.currentPassword, user.password);
                if (!isPasswordMatch) {
                    // Use the specific message key for localization
                    throw new Error(MESSAGES.PASSWORD_MISMATCH.EN);
                }
            }
            user.password = await hashPassword(updates.newPassword); 
            user.profileCompleted = true; 
        }

        await user.save();

        // Sanitize sensitive fields before returning
        user.password = undefined;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.inviteToken = undefined;
        user.inviteTokenExpires = undefined;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        return { user: user.toObject(), messageKey: 'PROFILE_UPDATED' };
    }

    async deactivateUser(userId, requestingUserId) {
        if (userId === requestingUserId) {
            throw new Error(MESSAGES.CANNOT_DEACTIVATE_SELF.EN);
        }
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true }).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
        if (!user) {
            throw new Error(MESSAGES.USER_NOT_FOUND.EN);
        }
        return { user: user.toObject(), messageKey: 'USER_DEACTIVATED' };
    }

    async reactivateUser(userId) {
        const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true }).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');
        if (!user) {
            throw new Error(MESSAGES.USER_NOT_FOUND.EN);
        }
        return { user: user.toObject(), messageKey: 'USER_REACTIVATED' };
    }

    async deleteUser(userId, requestingUserId) {
        if (userId === requestingUserId) {
            throw new Error(MESSAGES.CANNOT_DELETE_SELF.EN);
        }
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new Error(MESSAGES.USER_NOT_FOUND.EN);
        }
        return { messageKey: 'USER_DELETED' };
    }

    async getManagedUsers(managerId) {
        const users = await User.find({ managerId })
            .select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires')
            .sort({ createdAt: -1 });
        return { users, messageKey: 'MANAGED_USERS_RETRIEVED' };
    }
}

export default new UserService();