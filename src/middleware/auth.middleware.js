// src/middleware/auth.middleware.js

import jwt from 'jsonwebtoken';
import authConfig from '../config/auth.config.js';
import User from '../models/user.model.js';
import { sendErrorResponse } from '../utils/responseHandler.js';

/**
 * Middleware to protect routes, ensuring a valid JWT is provided.
 * Attaches user (id, role) to req.user.
 */
const protect = async (req, res, next) => {
    let token;

    // Check if Authorization header exists and starts with 'Bearer'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract the token from the 'Bearer <token>' string
            token = req.headers.authorization.split(' ')[1];

            // Verify the token using the JWT secret
            const decoded = jwt.verify(token, authConfig.jwtSecret);

            // Find the user by ID from the decoded token payload
            // Select only necessary fields (id, role) and exclude password
            const user = await User.findById(decoded.id).select('-password -otp -otpExpires -inviteToken -inviteTokenExpires -passwordResetToken -passwordResetExpires');

            if (!user) {
                return sendErrorResponse(res, 401, 'Not authorized, user not found.');
            }

            // Attach the user object (or just id and role) to the request for subsequent middleware/controllers
            req.user = {
                id: user._id,
                role: user.role,
                isVerified: user.isVerified,
                profileCompleted: user.profileCompleted,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber
            };

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            // Handle various JWT errors (e.g., TokenExpiredError, JsonWebTokenError)
            if (error.name === 'TokenExpiredError') {
                return sendErrorResponse(res, 401, 'Not authorized, token expired.');
            }
            return sendErrorResponse(res, 401, 'Not authorized, token failed.');
        }
    }

    // If no token is provided in the header
    if (!token) {
        return sendErrorResponse(res, 401, 'Not authorized, no token.');
    }
};

/**
 * Middleware for role-based access control.
 * @param {string[]} roles - An array of roles that are allowed to access the route.
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        // Check if req.user exists (meaning protect middleware ran successfully)
        if (!req.user || !req.user.role) {
            return sendErrorResponse(res, 403, 'Access denied, no user role found.');
        }

        // Check if the user's role is included in the allowed roles
        if (!roles.includes(req.user.role)) {
            return sendErrorResponse(res, 403, `Access denied, role '${req.user.role}' is not authorized for this action.`);
        }
        next(); // User is authorized, proceed
    };
};

export { protect, authorize };
