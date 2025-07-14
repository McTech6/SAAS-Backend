// src/config/auth.config.js

import dotenv from 'dotenv';
dotenv.config();

const authConfig = {
    jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
    jwtExpiresIn: '1d',
    otpSecret: process.env.OTP_SECRET || 'your_otp_secret_key',
    otpExpiresInMinutes: process.env.OTP_EXPIRY_MINUTES || 10,
    inviteTokenExpiresInHours: 24
};

export default authConfig;
