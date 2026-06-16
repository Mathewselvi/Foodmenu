require('dotenv').config();
const nodemailer = require('nodemailer');

const testSend = async () => {
    try {
        console.log('Testing SMTP connection...');
        console.log('User:', process.env.SMTP_USER);
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const info = await transporter.sendMail({
            from: `"Test" <${process.env.SMTP_USER}>`,
            to: process.env.SMTP_USER,
            subject: 'Test Email',
            text: 'This is a test email.'
        });

        console.log('Success! Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};

testSend();
