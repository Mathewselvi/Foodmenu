const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resortFoodDB');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (/ENOTFOUND|ECONNREFUSED/.test(error.message)) {
            console.error('Cannot reach the database in MONGO_URI (server/.env). Check that the MongoDB server/Atlas cluster exists and is running.');
        }
        process.exit(1);
    }
};

module.exports = connectDB;
