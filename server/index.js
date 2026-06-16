const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Diagnostic route
app.get('/api/test-env', (req, res) => {
    res.json({
        hasSmtpUser: !!process.env.SMTP_USER,
        smtpUserVal: process.env.SMTP_USER,
        hasSmtpPass: !!process.env.SMTP_PASS,
        smtpPassLength: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
        mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) : null
    });
});

const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
