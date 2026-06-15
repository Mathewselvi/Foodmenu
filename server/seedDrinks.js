const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');
const Restaurant = require('./models/Restaurant');

const coolDrinks = [
    { name: 'Cola 500ml', price: 40, category: 'COOL DRINKS', isAvailable: true },
    { name: 'Cola 1L', price: 80, category: 'COOL DRINKS', isAvailable: true },
    { name: 'Pepsi 500ml', price: 40, category: 'COOL DRINKS', isAvailable: true },
    { name: 'Pepsi 1L', price: 80, category: 'COOL DRINKS', isAvailable: true },
    { name: 'Sprite 500ml', price: 40, category: 'COOL DRINKS', isAvailable: true },
    { name: 'Sprite 1L', price: 80, category: 'COOL DRINKS', isAvailable: true },
];

const seedDrinks = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // Fetch all restaurants
        const restaurants = await Restaurant.find();
        
        if (restaurants.length === 0) {
            console.log('No restaurants found in the database. Please add a restaurant first.');
            process.exit(1);
        }

        console.log(`Found ${restaurants.length} restaurants. Adding cool drinks to all...`);

        for (const restaurant of restaurants) {
            const productsWithRestaurant = coolDrinks.map(drink => ({
                ...drink,
                restaurant: restaurant._id
            }));

            // Optional: prevent exact duplicates in case run multiple times
            for (const item of productsWithRestaurant) {
                const exists = await Product.findOne({ name: item.name, restaurant: item.restaurant });
                if (!exists) {
                    await Product.create(item);
                    console.log(`Added ${item.name} to ${restaurant.name}`);
                } else {
                    console.log(`${item.name} already exists in ${restaurant.name}`);
                }
            }
        }

        console.log('Cool Drinks seeding completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding drinks:', error);
        process.exit(1);
    }
};

seedDrinks();
