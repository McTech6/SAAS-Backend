// // src/utils/responseHandler.js

// export const sendSuccessResponse = (res, statusCode, message, data = {}) => {
//     res.status(statusCode).json({
//         success: true,
//         message,
//         data
//     });
// };

// export const sendErrorResponse = (res, statusCode, message, errorDetails = null) => {
//     res.status(statusCode).json({
//         success: false,
//         message,
//         error: errorDetails
//     });
// };


// src/utils/responseHandler.js (ASSUMED STRUCTURE)

import { getMessage } from './langHelper.js'; // Ensure this is imported

/**
 * Sends a standardized success JSON response.
 * @param {object} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 200, 201).
 * @param {string} messageKeyOrString - The key (e.g., 'COMPANY_RETRIEVED') or string to translate.
 * @param {object | array} data - The response data payload.
 * @param {string} [lang='EN'] - The language code for message translation.
 */
export const sendSuccessResponse = (res, statusCode, messageKeyOrString, data = null, lang = 'EN') => {
    // Translate the message before sending
    const translatedMessage = getMessage(messageKeyOrString, lang);

    res.status(statusCode).json({
        success: true,
        message: translatedMessage, // Use the translated message
        data: data
    });
};

/**
 * Sends a standardized error JSON response.
 * @param {object} res - Express response object.
 * @param {number} statusCode - HTTP status code (e.g., 400, 404, 500).
 * @param {string} messageKeyOrString - The error key or raw error string to translate.
 * @param {string} [lang='EN'] - The language code for message translation.
 */
export const sendErrorResponse = (res, statusCode, messageKeyOrString, lang = 'EN') => {
    // This assumes error messages are also translated, but often only success messages need this context.
    // For simplicity, we'll ensure error messages also use the helper.
    const translatedMessage = getMessage(messageKeyOrString, lang);

    res.status(statusCode).json({
        success: false,
        message: translatedMessage
    });
};
// Note: You must ensure 'Company retrieved successfully.' is mapped in MESSAGES or handled by the fallback logic.