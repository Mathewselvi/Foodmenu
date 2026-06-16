const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');
const generateBillPDF = require('../utils/generateBillPDF');
const router = express.Router();

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { guestName, email, items, totalAmount, restaurant, serviceCharge } = req.body;

        if (items && items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        } else {
            const order = new Order({
                guestName: guestName || 'Guest',
                email,
                items,
                totalAmount,
                restaurant,
                serviceCharge
            });

            const createdOrder = await order.save();

            // Send confirmation email
            const emailHtml = `
                <h2>Order Confirmation</h2>
                <p>Hello ${order.guestName},</p>
                <p>Your order has been successfully placed! We are currently preparing your food.</p>
                <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
                <p>Your food will arrive right on time!</p>
                <p>Thank you for choosing Resort Beyond Heaven!</p>
            `;
            await sendEmail({
                to: order.email,
                subject: 'Order Placed Successfully - Resort Beyond Heaven',
                html: emailHtml
            });

            // Send notification email to admin
            const adminHtml = `
                <h2>New Order Received!</h2>
                <p><strong>Guest Name:</strong> ${order.guestName}</p>
                <p><strong>Guest Email:</strong> ${order.email}</p>
                <p><strong>Total Amount:</strong> ₹${order.totalAmount} (Service Charge: ₹${order.serviceCharge || 0})</p>
                <br/>
                <p>Please log in to the admin dashboard to manage this order.</p>
            `;
            if (process.env.SMTP_USER) {
                await sendEmail({
                    to: process.env.SMTP_USER,
                    subject: '🚨 New Order Received - Resort Beyond Heaven',
                    html: adminHtml
                });
            }

            res.status(201).json(createdOrder);
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const query = {};
        if (req.query.restaurantId) {
            query.restaurant = req.query.restaurantId;
        }
        const orders = await Order.find(query).sort({ createdAt: -1 }); // Newest first
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.status = req.body.status || order.status;
            if (req.body.items) {
                order.items = req.body.items;
            }
            if (req.body.totalAmount) {
                order.totalAmount = req.body.totalAmount;
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Mark payment as received and send bill
// @route   PUT /api/orders/:id/payment
// @access  Private
router.put('/:id/payment', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            order.paymentStatus = 'Received';
            
            // Fix for older orders that were created before the email field was added and required
            if (!order.email) {
                order.email = 'no-reply@beyondheaven.com';
            }

            const updatedOrder = await order.save();

            // Generate PDF Buffer
            const pdfBuffer = await generateBillPDF(order);

            const emailHtml = `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #059669;">Payment Received - Thank You!</h2>
                    <p>Dear ${order.guestName},</p>
                    <p>We have successfully received your payment of <strong>₹${order.totalAmount}</strong>.</p>
                    <p>Please find your final bill attached to this email as a PDF document.</p>
                    <div style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 14px;">
                        <p>We hope you enjoyed your meal.</p>
                        <p>Have a wonderful stay at Resort Beyond Heaven!</p>
                    </div>
                </div>
            `;

            await sendEmail({
                to: order.email,
                subject: 'Payment Received & Bill - Resort Beyond Heaven',
                html: emailHtml,
                attachments: [
                    {
                        filename: `Receipt_${order._id}.pdf`,
                        content: pdfBuffer,
                        contentType: 'application/pdf'
                    }
                ]
            });

            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Payment Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete an order
// @route   DELETE /api/orders/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            await order.deleteOne();
            res.json({ message: 'Order removed' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
