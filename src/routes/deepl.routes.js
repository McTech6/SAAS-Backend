// deepl.routes.js
import express from 'express';
import fetch from 'node-fetch'; // Use import for node-fetch
import dotenv from 'dotenv';

// Load env variables again (good practice for a standalone route file)
dotenv.config();

const router = express.Router();

const DEEPL_KEY = process.env.DEEPL_AUTH_KEY;
const DEEPL_URL = process.env.DEEPL_API_URL;

/**
 * @route POST /api/v1/deepl/translate
 * @desc Proxy endpoint to securely translate text using DeepL API
 * @access Public (Frontend friendly)
 */
router.post('/translate', async (req, res) => {
    // 1. Get data from the friend's request body
    const { text, target_lang, source_lang } = req.body;

    if (!text || !target_lang) {
        return res.status(400).json({ 
            error: 'Missing required fields: `text` and `target_lang`.' 
        });
    }

    // Basic key check (should be secure in .env but good for debugging)
    if (!DEEPL_KEY) {
        return res.status(500).json({ 
            error: 'Server configuration error: DeepL API key not found.' 
        });
    }

    try {
        // 2. Build the request payload for the official DeepL API
        const deeplPayload = {
            text: [text], // DeepL expects an array of texts
            target_lang: target_lang,
            // Optionally include source_lang if provided by the frontend
            ...(source_lang && { source_lang }), 
        };

        const deeplResponse = await fetch(DEEPL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // *** SECURITY STEP: The secret key is added here on the backend ***
                'Authorization': `DeepL-Auth-Key ${DEEPL_KEY}` 
            },
            body: JSON.stringify(deeplPayload),
        });

        // 3. Handle potential DeepL errors (e.g., rate limit, invalid language)
        if (!deeplResponse.ok) {
            const errorData = await deeplResponse.json();
            console.error('DeepL API Error:', errorData);
            return res.status(deeplResponse.status).json(errorData);
        }

        // 4. Send DeepL's successful response data back to the frontend
        const data = await deeplResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Proxy Server Error:', error.message);
        res.status(500).json({ error: 'Internal proxy server error.' });
    }
});

export default router;