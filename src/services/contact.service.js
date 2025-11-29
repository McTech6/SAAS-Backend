// src/services/contact.service.js

import sendEmail from '../utils/emailSender.js'; 
// Note: We don't use the { default: ... } syntax here because Node's module resolution handles 
// default exports correctly with native import syntax.

const RECEIVING_EMAIL = 'taudit098@gmail.com'; 

/**
 * Handles the preparation and sending of the contact form email.
 * @param {object} formData - Data from the contact form.
 * @returns {Promise<void>}
 */
export const sendContactMessage = async (formData) => {
    const { 
        fullName, 
        emailAddress, 
        phoneNumber, 
        topic, 
        message 
    } = formData;

    // --- Prepare Email Content (Source is always English for you, the admin) ---
    
    const subject = `New Inquiry from Contact Form - Topic: ${topic}`;
    
    const textBody = `
        A new message was submitted via the contact form:

        Full Name: ${fullName}
        Email: ${emailAddress}
        Phone: ${phoneNumber || 'N/A'}
        Topic: ${topic}

        Message:
        ${message}
    `;

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">New Message from Contact Form</h2>
            <p><strong>From:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${emailAddress}</p>
            <p><strong>Phone:</strong> ${phoneNumber || 'N/A'}</p>
            <hr>
            <h3>Topic: ${topic}</h3>
            <div style="border: 1px solid #eee; padding: 15px; background-color: #f9f9f9;">
                <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
        </div>
    `;

    try {
        await sendEmail(
            RECEIVING_EMAIL, 
            subject,         
            textBody,        
            htmlBody,        
            'EN'             
        );
        console.log(`Contact message successfully processed for ${emailAddress}`);
    } catch (error) {
        throw new Error(`Service failed to send email: ${error.message}`);
    }
};