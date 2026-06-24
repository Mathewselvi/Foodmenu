const express = require('express');
const dotenv = require('dotenv');
const multer = require('multer');

// Use memory storage for Vercel/serverless compatibility
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
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
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/admin', adminRoutes);

// Image Upload route
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Convert the buffer to a base64 string
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        // Return the base64 string as the imageUrl
        res.json({ imageUrl: base64Image });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
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
