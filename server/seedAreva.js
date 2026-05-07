const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Restaurant = require('./models/Restaurant');
const Product = require('./models/Product');

dotenv.config();

const itemsToAdd = [
    { name: 'Plain Rice', price: 120, category: 'RICE / MEALS' },
    { name: 'Chicken Fried Rice', price: 250, category: 'FRIED RICE' },
    { name: 'Egg Fried Rice', price: 200, category: 'FRIED RICE' },
    { name: 'Ghee Rice', price: 150, category: 'RICE / MEALS' },
    { name: 'Chicken Curry', price: 230, category: 'CHICKEN SPECIAL' },
    { name: 'Chilly Chicken', price: 250, category: 'CHICKEN SPECIAL' },
    { name: 'Chicken 65', price: 250, category: 'CHICKEN SPECIAL' },
    { name: 'Kadai Chicken', price: 230, category: 'CHICKEN SPECIAL' },
    { name: 'Dal Fry', price: 170, category: 'VEG CURRY' },
    { name: 'Mix Veg Curry', price: 150, category: 'VEG CURRY' },
    { name: 'Gobi Manjurian', price: 170, category: 'VEG CURRY' },
    { name: 'Chilly Gobi', price: 170, category: 'VEG CURRY' },
    { name: 'Chapathi', price: 20, category: 'ROTIS' },
    { name: 'Egg Curry', price: 100, category: 'EGG BASKET' },
    { name: 'Egg Roast', price: 150, category: 'EGG BASKET' },
    { name: 'Egg Burji', price: 100, category: 'EGG BASKET' },
];

const seedAreva = async () => {
    try {
        await connectDB();

        // Get Areva Hotel ID
        const areva = await Restaurant.findOne({ name: 'AREVA HOTEL' });
        if (!areva) {
            console.log('Areva Hotel not found!');
            process.exit(1);
        }

        // Add items
        const productsWithRestaurant = itemsToAdd.map(item => ({
            ...item,
            restaurant: areva._id,
            isAvailable: true
        }));

        await Product.insertMany(productsWithRestaurant);

        console.log('Successfully added items to AREVA HOTEL!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedAreva();
