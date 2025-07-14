// src/models/user.model.js

import mongoose from 'mongoose';
import crypto from 'crypto';
// Removed direct bcrypt import, as hashing is now handled explicitly in service/script

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        required: function() { return this.profileCompleted; }
    },
    lastName: {
        type: String,
        trim: true,
        required: function() { return this.profileCompleted; }
    },
    phoneNumber: {
        type: String,
        trim: true,
        required: function() { return this.profileCompleted; }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: function() { return this.profileCompleted; },
        minlength: 8,
        select: false
    },
    role: {
        type: String,
        enum: ['super_admin', 'admin', 'auditor'],
        default: 'auditor',
        required: true
    },
    inviteToken: {
        type: String,
        unique: true,
        sparse: true
    },
    inviteTokenExpires: {
        type: Date
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    profileCompleted: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        select: false
    },
    otpExpires: {
        type: Date,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    }
}, { timestamps: true });

// REMOVED: userSchema.pre('save', ...) for password hashing
// Password hashing will now be handled explicitly in the service/script before saving.

userSchema.methods.getResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model('User', userSchema);

export default User;
