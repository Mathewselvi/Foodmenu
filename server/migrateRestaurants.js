const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Restaurant = require('./models/Restaurant');
const Product = require('./models/Product');
const Order = require('./models/Order');

dotenv.config();

const seedRestaurants = async () => {
    try {
        await connectDB();

        // Check if restaurants already exist
        let rochas = await Restaurant.findOne({ name: 'ROCHAS RESTURANT' });
        if (!rochas) {
            rochas = await Restaurant.create({ name: 'ROCHAS RESTURANT' });
        }

        let areva = await Restaurant.findOne({ name: 'AREVA HOTEL' });
        if (!areva) {
            areva = await Restaurant.create({ name: 'AREVA HOTEL' });
        }

        // Update all products that don't have a restaurant
        await Product.updateMany({ restaurant: { $exists: false } }, { $set: { restaurant: rochas._id } });
        
        // Update all orders that don't have a restaurant
        await Order.updateMany({ restaurant: { $exists: false } }, { $set: { restaurant: rochas._id } });

        console.log('Database updated with restaurants!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedRestaurants();
