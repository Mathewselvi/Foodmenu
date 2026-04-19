const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const sampleProducts = [
    {
        name: 'Paneer Butter Masala',
        price: 250,
        category: 'Vegetarian',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
    },
    {
        name: 'Chicken Tikka Masala',
        price: 320,
        category: 'Non-Vegetarian',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
    },
    {
        name: 'Garlic Naan',
        price: 45,
        category: 'Breads',
        image: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
    },
    {
        name: 'Chicken Biryani',
        price: 350,
        category: 'Rice',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
    },
    {
        name: 'Gulab Jamun',
        price: 120,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1596568359544-b2586da8676b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
    },
    {
        name: 'Mojito',
        price: 150,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        isAvailable: true,
    }
];

const importData = async () => {
    try {
        await Product.deleteMany();
        await Product.insertMany(sampleProducts);
        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();
