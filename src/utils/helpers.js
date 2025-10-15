// // src/utils/helpers.js

// import argon2 from 'argon2';

// /**
//  * Hashes a plain text password using Argon2.
//  * @param {string} password - The plain text password.
//  * @returns {Promise<string>} The hashed password.
//  */
// export const hashPassword = async (password) => {
//     return argon2.hash(password);
// };

// /**
//  * Verifies a plain text password against an Argon2 hashed password.
//  * @param {string} plainPassword - The plain text password.
//  * @param {string} hashedPassword - The Argon2 hashed password.
//  * @returns {Promise<boolean>} True if passwords match, false otherwise.
//  */
// export const comparePassword = async (plainPassword, hashedPassword) => {
//     return argon2.verify(hashedPassword, plainPassword);
// };

// src/utils/helpers.js

import argon2 from 'argon2';

/**
 * Hashes a plain text password using Argon2.
 * @param {string} password - The plain text password.
 * @returns {Promise<string>} The hashed password.
 */
export const hashPassword = async (password) => {
    return argon2.hash(password);
};

/**
 * Verifies a plain text password against an Argon2 hashed password.
 * @param {string} plainPassword - The plain text password.
 * @param {string} hashedPassword - The Argon2 hashed password.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
    // Note: The argon2.verify method signature is (hash, plainPassword)
    return argon2.verify(hashedPassword, plainPassword);
};