import { sendContactMessage, sendSubscriptionMessage } from "../services/contact.service.js";

/**
 * Handles POST /api/contact
 */
export const submitContactForm = async (req, res) => {
    const formData = req.body;

    const { fullName, emailAddress, topic, message } = formData;
    if (!fullName || !emailAddress || !topic || !message) {
        return res.status(400).json({
            error: "Missing required fields.",
            details: "Full Name, Email Address, Topic, and Message are mandatory."
        });
    }

    try {
        await sendContactMessage(formData);
        return res.status(200).json({
            success: true,
            message: "Message sent successfully! We will get back to you soon."
        });
    } catch (error) {
        console.error("Controller Error - Failed to process contact form:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to send message due to a server error.",
            error: error.message
        });
    }
};


/**
 * Handles POST /api/contact/subscribe
 */
export const submitSubscriptionForm = async (req, res) => {
    const { name, email, plan } = req.body;

    if (!name || !email || !plan) {
        return res.status(400).json({
            success: false,
            message: "Name, email, and plan are required."
        });
    }

    try {
        await sendSubscriptionMessage({ name, email, plan });

        return res.status(200).json({
            success: true,
            message: "Subscription successful!"
        });

    } catch (error) {
        console.error("Controller Error - Subscription failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Subscription failed due to server error.",
            error: error.message
        });
    }
};
