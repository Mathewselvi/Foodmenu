const nodemailer = require('nodemailer');

// Returns true when the email was accepted by the mail server, false otherwise (never throws).
const sendEmail = async (options) => {
    try {
        // Only send if credentials exist
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.warn('SMTP credentials not configured. Skipping email send.');
            return false;
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: `"Resort Beyond Heaven" <${process.env.SMTP_USER}>`,
            to: options.to,
            subject: options.subject,
            html: options.html,
            attachments: options.attachments || []
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`Error sending email: ${error}`);
        return false;
    }
};

module.exports = sendEmail;
