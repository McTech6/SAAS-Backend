import sendEmail from "../utils/emailSender.js";

const RECEIVING_EMAIL = "taudit098@gmail.com";

/**
 * CONTACT FORM MESSAGE
 */
export const sendContactMessage = async (formData) => {
    const { fullName, emailAddress, phoneNumber, topic, message } = formData;

    const subject = `New Inquiry from Contact Form - Topic: ${topic}`;

    const textBody = `
        A new message was submitted via the contact form:

        Full Name: ${fullName}
        Email: ${emailAddress}
        Phone: ${phoneNumber || "N/A"}
        Topic: ${topic}

        Message:
        ${message}
    `;

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #333;">New Message from Contact Form</h2>
            <p><strong>From:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${emailAddress}</p>
            <p><strong>Phone:</strong> ${phoneNumber || "N/A"}</p>
            <hr>
            <h3>Topic: ${topic}</h3>
            <div style="border: 1px solid #eee; padding: 15px; background-color: #f9f9f9;">
                <p>${message.replace(/\n/g, "<br>")}</p>
            </div>
        </div>
    `;

    try {
        await sendEmail(RECEIVING_EMAIL, subject, textBody, htmlBody, "EN");
    } catch (error) {
        throw new Error(`Service failed to send contact email: ${error.message}`);
    }
};


/**
 * SUBSCRIPTION MESSAGE — sends name, email, and plan
 */
export const sendSubscriptionMessage = async ({ name, email, plan }) => {
    const subject = "New ISARION Platform Subscription";

    const textBody = `
        A new user subscribed to the ISARION Platform:

        Name: ${name}
        Email: ${email}
        Selected Plan: ${plan}
    `;

    const htmlBody = `
        <div style="font-family: Arial, sans-serif;">
            <h2>New ISARION Platform Subscription</h2>

            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Plan:</strong> ${plan}</p>
        </div>
    `;

    try {
        await sendEmail(
            RECEIVING_EMAIL,
            subject,
            textBody,
            htmlBody,
            "EN"
        );
    } catch (error) {
        throw new Error(`Service failed to send subscription email: ${error.message}`);
    }
};
