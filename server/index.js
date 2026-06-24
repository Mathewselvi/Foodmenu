const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Append extension
    }
});
const upload = multer({ storage: storage });
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);

// Image Upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    // Return the URL path
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

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
