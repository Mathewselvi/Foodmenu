require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

async function check() {
    await connectDB();
    const count = await Product.countDocuments();
    console.log(`Current product count in database: ${count}`);
    process.exit(0);
}

check();
