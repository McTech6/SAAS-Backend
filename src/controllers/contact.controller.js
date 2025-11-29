// src/controllers/contact.controller.js

import { sendContactMessage } from '../services/contact.service.js';

/**
 * Controller function to handle the POST /api/contact request.
 */
export const submitContactForm = async (req, res) => {
    const formData = req.body;
    
    // Basic validation
    const { fullName, emailAddress, topic, message } = formData;
    if (!fullName || !emailAddress || !topic || !message) {
        return res.status(400).json({ 
            error: 'Missing required fields.', 
            details: 'Full Name, Email Address, Topic, and Message are mandatory.' 
        });
    }

    try {
        // Call the service layer
        await sendContactMessage(formData);

        // Success response
        return res.status(200).json({ 
            success: true, 
            message: 'Message sent successfully! We will get back to you soon.' 
        });

    } catch (error) {
        console.error('Controller Error - Failed to process contact form:', error.message);
        // Error response
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to send message due to a server error.', 
            error: error.message 
        });
    }
};