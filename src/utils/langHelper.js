// src/utils/langHelper.js
import { MESSAGES } from './messages.js'; 

const SUPPORTED_LANGUAGES = ['EN', 'FR', 'DE'];
const DEFAULT_LANGUAGE = 'EN';

// Pre-calculate reverse map for fast lookup of message keys from English strings
const REVERSE_MESSAGE_MAP = new Map();
for (const key in MESSAGES) {
    if (MESSAGES[key] && MESSAGES[key].EN) {
        REVERSE_MESSAGE_MAP.set(MESSAGES[key].EN, key);
    }
}


/**
 * Retrieves a translated message from the MESSAGES object.
 * @param {string} messageKeyOrString - The key from MESSAGES (e.g., 'LOGIN_SUCCESS') or a raw English error string from the service.
 * @param {string} lang - The requested language code (e.g., 'FR', 'DE').
 * @returns {string} The translated message or the English fallback.
 */
export const getMessage = (messageKeyOrString, lang) => {
    // 1. Determine the canonical message key
    const finalKey = REVERSE_MESSAGE_MAP.get(messageKeyOrString) || messageKeyOrString;

    const upperLang = (lang || '').toUpperCase();
    const language = SUPPORTED_LANGUAGES.includes(upperLang) ? upperLang : DEFAULT_LANGUAGE;
    
    // 2. Check if the canonical key exists in MESSAGES
    if (MESSAGES[finalKey]) {
        // Return the requested language, or English fallback
        return MESSAGES[finalKey][language] || MESSAGES[finalKey][DEFAULT_LANGUAGE];
    }

    // 3. Fallback: If it was a raw string we couldn't map, return it as is.
    return messageKeyOrString;
};

/**
 * Determines the final language code from a request object.
 * @param {object} req - Express request object.
 * @returns {string} The normalized language code (EN, FR, or DE).
 */
export const getLangFromReq = (req) => {
    const lang = req.query.lang || DEFAULT_LANGUAGE;
    const upperLang = lang.toUpperCase();
    return SUPPORTED_LANGUAGES.includes(upperLang) ? upperLang : DEFAULT_LANGUAGE;
};