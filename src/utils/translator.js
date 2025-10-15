// src/utils/translator.js
import dotenv from 'dotenv';
dotenv.config();

import deepl from 'deepl-node';

const authKey = process.env.DEEPL_AUTH_KEY;
if (!authKey) console.warn("DEEPL_AUTH_KEY is missing! Emails will not be translated.");

// Note: Ensure your environment supports DeepL's target language codes (EN, FR, DE)
const translator = authKey ? new deepl.Translator(authKey) : null;

/**
 * Translates text using DeepL API. Falls back to original text if translation fails or key is missing.
 * @param {string} text - Text to translate.
 * @param {string} targetLang - Target language code (e.g., 'FR', 'DE').
 * @returns {Promise<string>} Translated text or original text on failure/no key.
 */
export const translateText = async (text, targetLang) => {
    if (!translator || targetLang.toUpperCase() === 'EN') {
        return text;
    }

    // DeepL expects specific codes, normalize EN to EN-US for robustness
    const deepLTarget = targetLang.toUpperCase() === 'EN' ? 'EN-US' : targetLang.toUpperCase();
    
    try {
        const result = await translator.translateText(text, null, deepLTarget);
        return result.text;
    } catch (error) {
        console.error('DeepL Translation Error:', error.message);
        // Fallback to the original English text
        return text; 
    }
};