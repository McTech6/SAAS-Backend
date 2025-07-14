// src/services/auth.service.js

import User from '../models/user.model.js';
import generateOTP from '../utils/otpGenerator.js';
import sendEmail from '../utils/emailSender.js';
import { hashPassword, comparePassword } from '../utils/helpers.js';
import authConfig from '../config/auth.config.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class AuthService {
    async inviteUser(email, role, frontendRegisterUrl) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('User with this email already exists.');
        }

        const inviteToken = crypto.randomBytes(32).toString('hex');
        const inviteTokenExpires = new Date(Date.now() + authConfig.inviteTokenExpiresInHours * 60 * 60 * 1000);

        const user = new User({
            email,
            role,
            inviteToken,
            inviteTokenExpires,
            isVerified: false,
            profileCompleted: false
        });

        await user.save();

        const registrationLink = `${frontendRegisterUrl}?token=${inviteToken}`;
        const emailSubject = 'Invitation to SaaS Cybersecurity Audit Platform';
        const emailText = `You have been invited to join the SaaS Cybersecurity Audit Platform. Please complete your registration using this link: ${registrationLink}`;
        const emailHtml = `<p>You have been invited to join the SaaS Cybersecurity Audit Platform.</p><p>Please complete your registration by clicking the link below:</p><p><a href="${registrationLink}">Complete Registration</a></p><p>This link is valid for ${authConfig.inviteTokenExpiresInHours} hours.</p>`;

        await sendEmail(email, emailSubject, emailText, emailHtml);

        return user;
    }

    async completeRegistration(inviteToken, userData) {
        const user = await User.findOne({
            inviteToken,
            inviteTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error('Invalid or expired invitation token.');
        }

        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.phoneNumber = userData.phoneNumber;
        // Explicitly hash password before assigning to user object
        user.password = await hashPassword(userData.password);
        user.profileCompleted = true;
        user.inviteToken = undefined;
        user.inviteTokenExpires = undefined;

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

        console.log(`[DEBUG - completeRegistration] Password before save: '${user.password}'`); // New debug log
        await user.save();

        const emailSubject = 'Verify Your Email - SaaS Cybersecurity Audit Platform';
        const emailText = `Your OTP for email verification is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
        const emailHtml = `<p>Your One-Time Password (OTP) for email verification is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

        await sendEmail(user.email, emailSubject, emailText, emailHtml);

        return user;
    }

    async verifyEmailOtp(email, otp) {
        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user) {
            throw new Error('User not found.');
        }
        if (!user.otp || user.otp !== otp) {
            throw new Error('Invalid OTP.');
        }
        if (user.otpExpires < Date.now()) {
            throw new Error('OTP expired.');
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();
        return user;
    }

    async login(email, password) {
        const user = await User.findOne({ email }).select('+password +isVerified +otp +otpExpires');

        if (!user) {
            throw new Error('Invalid credentials.');
        }

        const isPasswordMatch = await comparePassword(password, user.password);

        if (!isPasswordMatch) {
            throw new Error('Invalid credentials.');
        }
        if (!user.isVerified) {
            throw new Error('Please verify your email first. An OTP has been sent to your email during registration.');
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

        await user.save();

        const emailSubject = 'Login Verification OTP - SaaS Cybersecurity Audit Platform';
        const emailText = `Your OTP for login verification is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
        const emailHtml = `<p>Your One-Time Password (OTP) for login verification is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

        await sendEmail(user.email, emailSubject, emailText, emailHtml);

        return 'OTP sent to your email for login verification.';
    }

    async verifyLoginOtp(email, otp) {
        const user = await User.findOne({ email }).select('+otp +otpExpires');

        if (!user) {
            throw new Error('User not found or OTP not requested.');
        }
        if (!user.otp || user.otp !== otp) {
            throw new Error('Invalid OTP.');
        }
        if (user.otpExpires < Date.now()) {
            throw new Error('OTP expired.');
        }

        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const token = jwt.sign(
            { id: user._id, role: user.role },
            authConfig.jwtSecret,
            { expiresIn: authConfig.jwtExpiresIn }
        );

        return token;
    }

    async forgotPassword(email, frontendResetUrl) {
        const user = await User.findOne({ email });

        if (!user) {
            throw new Error('User with that email does not exist.');
        }

        const resetToken = user.getResetPasswordToken();
        await user.save();

        const resetUrl = `${frontendResetUrl}?token=${resetToken}`;
        const emailSubject = 'Password Reset Request - SaaS Cybersecurity Audit Platform';
        const emailText = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease make a PUT request to: ${resetUrl}\n\nThis token is valid for 10 minutes.\nIf you did not request this, please ignore this email and your password will remain unchanged.`;
        const emailHtml = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link is valid for 10 minutes.</p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

        await sendEmail(user.email, emailSubject, emailText, emailHtml);

        return 'Password reset email sent.';
    }

    async resetPassword(token, newPassword) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        }).select('+passwordResetToken +passwordResetExpires +password');

        if (!user) {
            throw new Error('Invalid or expired reset token.');
        }

        user.password = await hashPassword(newPassword);
        user.profileCompleted = true;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        await user.save();
        return user;
    }

    async updateProfile(userId, updates) {
        const user = await User.findById(userId).select('+password');

        if (!user) {
            throw new Error('User not found.');
        }

        if (updates.firstName) user.firstName = updates.firstName;
        if (updates.lastName) user.lastName = updates.lastName;
        if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;

        if (updates.newPassword) {
            if (!updates.currentPassword) {
                throw new Error('Current password is required to change password.');
            }
            if (!(await comparePassword(updates.currentPassword, user.password))) {
                throw new Error('Invalid current password.');
            }
            user.password = await hashPassword(updates.newPassword);
            user.profileCompleted = true;
        }

        await user.save();

        user.password = undefined;
        user.otp = undefined;
        user.otpExpires = undefined;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;

        return user;
    }

    async resendOtp(email) {
        const user = await User.findOne({ email }).select('+isVerified +otp +otpExpires');

        if (!user) {
            throw new Error('User not found.');
        }

        let emailSubject = 'OTP Resent - SaaS Cybersecurity Audit Platform';
        let emailText, emailHtml;

        if (!user.profileCompleted) {
            throw new Error('Please complete your registration first.');
        } else if (!user.isVerified) {
            emailSubject = 'Email Verification OTP Resent - SaaS Cybersecurity Audit Platform';
        } else {
            emailSubject = 'Login Verification OTP Resent - SaaS Cybersecurity Audit Platform';
        }

        const otp = generateOTP();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + authConfig.otpExpiresInMinutes * 60 * 1000);

        await user.save();

        emailText = `Your new One-Time Password (OTP) is: ${otp}. It is valid for ${authConfig.otpExpiresInMinutes} minutes.`;
        emailHtml = `<p>Your new One-Time Password (OTP) is: <strong>${otp}</strong></p><p>This OTP is valid for ${authConfig.otpExpiresInMinutes} minutes.</p>`;

        await sendEmail(user.email, emailSubject, emailText, emailHtml);

        return 'New OTP sent to your email.';
    }
}

export default new AuthService();
