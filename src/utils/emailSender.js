// // // src/utils/emailSender.js

// // import nodemailer from 'nodemailer';
// // import dotenv from 'dotenv';
// // dotenv.config();

// // const transporter = nodemailer.createTransport({
// //     host: process.env.EMAIL_SERVICE_HOST,
// //     port: process.env.EMAIL_SERVICE_PORT,
// //     secure: process.env.EMAIL_SERVICE_PORT == 465, // This will be true for port 465
// //     auth: {
// //         user: process.env.EMAIL_SERVICE_USER,
// //         pass: process.env.EMAIL_SERVICE_PASS,
// //     },
// // });

// // const sendEmail = async (to, subject, text, html) => {
// //     try {
// //         await transporter.sendMail({
// //             from: process.env.SENDER_EMAIL,
// //             to,
// //             subject,
// //             text,
// //             html,
// //         });
// //         console.log(`Email sent to ${to} with subject: ${subject}`);
// //     } catch (error) {
// //         console.error(`Error sending email to ${to}:`, error);
// //         throw new Error('Failed to send email.');
// //     }
// // };

// // export default sendEmail;


// // src/utils/emailSender.js
// import sgMail from '@sendgrid/mail';
// import dotenv from 'dotenv';
// dotenv.config();

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = async (to, subject, text, html) => {
//   try {
//     const msg = {
//       to,
//       from: process.env.SENDER_EMAIL, // must be verified in SendGrid
//       replyTo: 'no-reply@yourdomain.com',
//       subject,
//       text,
//       html,
//     };

//     console.log('Sending email with the following details:', msg);

//     const response = await sgMail.send(msg);

//     console.log('SendGrid response:', response); // this will show headers, status codes
//     console.log(`Email sent to ${to} with subject: ${subject}`);
//   } catch (error) {
//     console.error('Error sending email:', error);
//     if (error.response) {
//       console.error('SendGrid error response body:', error.response.body);
//     }
//     throw new Error('Failed to send email.');
//   }
// };

// export default sendEmail;


// src/utils/emailSender.js

import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { translateText } from './translator.js'; 
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Sends an email, translating the subject, text, and HTML body if needed.
 * @param {string} to - Recipient email.
 * @param {string} subject - Email subject in English (source).
 * @param {string} text - Plain text body in English (source).
 * @param {string} html - HTML body in English (source).
 * @param {string} lang - Target language code (e.g., 'FR', 'DE').
 */
const sendEmail = async (to, subject, text, html, lang = 'EN') => {
    try {
        let finalSubject = subject;
        let finalText = text;
        let finalHtml = html;

        if (lang.toUpperCase() !== 'EN') {
            // Translate all parts concurrently
            [finalSubject, finalText, finalHtml] = await Promise.all([
                translateText(subject, lang),
                translateText(text, lang),
                translateText(html, lang),
            ]);
        }
        
        const msg = {
            to,
            from: process.env.SENDER_EMAIL, 
            replyTo: 'no-reply@yourdomain.com',
            subject: finalSubject,
            text: finalText,
            html: finalHtml,
        };

        await sgMail.send(msg);

        console.log(`Email sent to ${to} in ${lang} with subject: ${finalSubject}`);
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('SendGrid error response body:', error.response.body);
        }
        throw new Error('Failed to send email.');
    }
};

export default sendEmail;