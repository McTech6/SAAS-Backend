// src/utils/otpGenerator.js

import otpGenerator from 'otp-generator';

const generateOTP = () => {
    return otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false
    });
};

export default generateOTP;
