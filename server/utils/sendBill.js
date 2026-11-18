const generateBillPDF = require('./generateBillPDF');
const sendEmail = require('./sendEmail');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Placeholder written onto very old orders that had no email (see PUT /orders/:id/payment)
const PLACEHOLDER_EMAIL = 'no-reply@beyondheaven.com';

const escapeHtml = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// HTML entities so ₹ and × display correctly in every email app
const rupees = (n) => `&#8377;${Number(n || 0).toLocaleString('en-IN')}`;

/**
 * Emails the bill (PDF attached) to the email address the guest gave when ordering.
 * Never throws. Returns { sent: true, to } or { sent: false, reason }.
 */
const sendBill = async (order) => {
    const to = (order.email || '').trim();
    if (!to || !EMAIL_RE.test(to) || to.toLowerCase() === PLACEHOLDER_EMAIL) {
        return { sent: false, reason: 'This order has no valid guest email address' };
    }
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return { sent: false, reason: 'Email is not set up on the server (SMTP_USER / SMTP_PASS)' };
    }

    try {
        const pdf = await generateBillPDF(order);
        const orderNo = order._id.toString().slice(-6).toUpperCase();
        const rows = order.items
            .map(
                (item) => `
                <tr>
                    <td style="padding:6px 0;color:#374151;">${item.qty} &times; ${escapeHtml(item.name)}</td>
                    <td style="padding:6px 0;color:#111827;text-align:right;">${rupees(item.price * item.qty)}</td>
                </tr>`
            )
            .join('');
        const serviceRow =
            order.serviceCharge > 0
                ? `<tr><td style="padding:6px 0;color:#6b7280;">Room service fee</td><td style="padding:6px 0;color:#111827;text-align:right;">${rupees(order.serviceCharge)}</td></tr>`
                : '';

        const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>
            <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; color: #111827;">
                <h2 style="color: #059669; margin-bottom: 4px;">Your bill from Resort Beyond Heaven</h2>
                <p style="color:#6b7280; margin-top:0;">Order #${orderNo}</p>
                <p>Dear ${escapeHtml(order.guestName || 'Guest')},</p>
                <p>Thank you for dining with us. Your order is complete and your bill is attached as a PDF.</p>
                <table style="width:100%; border-collapse:collapse; margin:16px 0; border-top:1px solid #e5e7eb; border-bottom:1px solid #e5e7eb;">
                    ${rows}
                    ${serviceRow}
                    <tr>
                        <td style="padding:10px 0;font-weight:bold;">Total</td>
                        <td style="padding:10px 0;font-weight:bold;text-align:right;color:#059669;">${rupees(order.totalAmount)}</td>
                    </tr>
                </table>
                <p style="color:#6b7280; font-size:14px;">Payment status: ${order.paymentStatus === 'Received' ? 'Received — thank you!' : 'Pending'}</p>
                <p style="color:#6b7280; font-size:14px; margin-top:32px; text-align:center;">Have a wonderful stay at Resort Beyond Heaven!</p>
            </div></body></html>
        `;

        const ok = await sendEmail({
            to,
            subject: `Your bill for order #${orderNo} - Resort Beyond Heaven`,
            html,
            attachments: [{ filename: `Bill_${orderNo}.pdf`, content: pdf, contentType: 'application/pdf' }],
        });
        return ok ? { sent: true, to } : { sent: false, reason: 'The email could not be delivered to the mail server' };
    } catch (error) {
        console.error('Bill email error:', error);
        return { sent: false, reason: 'The bill could not be generated' };
    }
};

module.exports = sendBill;
