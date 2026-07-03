const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Restaurant = require('./models/Restaurant');
const Product = require('./models/Product');

dotenv.config();

const categoryImages = {
    'STARTERS': 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80',
    'BIRIYANI': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
    'AL-FAHAM': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
    'MANDHI': 'https://images.unsplash.com/photo-1633948593661-3a0cb1db60cb?w=600&q=80',
    'TANDOOR': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80',
    'RICE': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80',
    'BREADS': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&q=80',
    'NON VEG GRAVIES': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
    'BUFFALO': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    'VEG GRAVIES': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=600&q=80',
    'FRIED RICE': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80',
    'NOODLES': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
    'SALADS': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'MOJITOS': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80',
    'SOUPS': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80'
};

const itemsToAdd = [
    // STARTERS
    { name: 'Chicken 65', price: 380, category: 'STARTERS' },
    { name: 'Dragon Chicken', price: 420, category: 'STARTERS' },
    { name: 'Chilly Gopi', price: 330, category: 'STARTERS' },
    { name: 'Paneer Tikka', price: 390, category: 'STARTERS' },
    { name: 'Aloo Jeera', price: 320, category: 'STARTERS' },
    { name: 'Buffalo Fry', price: 380, category: 'STARTERS' },

    // BIRIYANI
    { name: 'Chicken Biriyani', price: 330, category: 'BIRIYANI' },
    { name: 'Veg Biriyani', price: 300, category: 'BIRIYANI' },
    { name: 'Buffalo Biriyani', price: 380, category: 'BIRIYANI' },
    { name: 'Fish Biriyani (Seasonal)', price: 580, category: 'BIRIYANI' },
    { name: 'Prawns Biriyani', price: 550, category: 'BIRIYANI' },

    // AL-FAHAM - Classic
    { name: 'Classic Al-Faham (Quarter)', price: 320, category: 'AL-FAHAM' },
    { name: 'Classic Al-Faham (Half)', price: 530, category: 'AL-FAHAM' },
    { name: 'Classic Al-Faham (Full)', price: 900, category: 'AL-FAHAM' },

    // AL-FAHAM - Peri Peri
    { name: 'Peri Peri Al-Faham (Quarter)', price: 350, category: 'AL-FAHAM' },
    { name: 'Peri Peri Al-Faham (Half)', price: 600, category: 'AL-FAHAM' },
    { name: 'Peri Peri Al-Faham (Full)', price: 1030, category: 'AL-FAHAM' },

    // AL-FAHAM - Honey
    { name: 'Honey Al-Faham (Quarter)', price: 440, category: 'AL-FAHAM' },
    { name: 'Honey Al-Faham (Half)', price: 740, category: 'AL-FAHAM' },
    { name: 'Honey Al-Faham (Full)', price: 1250, category: 'AL-FAHAM' },

    // AL-FAHAM - BBQ
    { name: 'BBQ Al-Faham (Quarter)', price: 440, category: 'AL-FAHAM' },
    { name: 'BBQ Al-Faham (Half)', price: 740, category: 'AL-FAHAM' },
    { name: 'BBQ Al-Faham (Full)', price: 1250, category: 'AL-FAHAM' },

    // MANDHI - Al-Faham Mandhi
    { name: 'Al-Faham Mandhi (Quarter)', price: 390, category: 'MANDHI' },
    { name: 'Al-Faham Mandhi (Half)', price: 650, category: 'MANDHI' },
    { name: 'Al-Faham Mandhi (Full)', price: 1100, category: 'MANDHI' },

    // MANDHI - Peri Peri Mandhi
    { name: 'Peri Peri Mandhi (Quarter)', price: 420, category: 'MANDHI' },
    { name: 'Peri Peri Mandhi (Half)', price: 720, category: 'MANDHI' },
    { name: 'Peri Peri Mandhi (Full)', price: 1230, category: 'MANDHI' },

    // MANDHI - Honey Mandhi
    { name: 'Honey Mandhi (Quarter)', price: 500, category: 'MANDHI' },
    { name: 'Honey Mandhi (Half)', price: 860, category: 'MANDHI' },
    { name: 'Honey Mandhi (Full)', price: 1450, category: 'MANDHI' },

    // MANDHI - BBQ Mandhi
    { name: 'BBQ Mandhi (Quarter)', price: 500, category: 'MANDHI' },
    { name: 'BBQ Mandhi (Half)', price: 860, category: 'MANDHI' },
    { name: 'BBQ Mandhi (Full)', price: 1450, category: 'MANDHI' },

    // TANDOOR
    { name: 'Tandoor Chicken (Quarter)', price: 330, category: 'TANDOOR' },
    { name: 'Tandoor Chicken (Half)', price: 540, category: 'TANDOOR' },
    { name: 'Tandoor Chicken (Full)', price: 900, category: 'TANDOOR' },

    // RICE
    { name: 'White Rice', price: 220, category: 'RICE' },
    { name: 'Biriyani Rice', price: 260, category: 'RICE' },
    { name: 'Jeera Rice', price: 310, category: 'RICE' },
    { name: 'Curd Rice', price: 290, category: 'RICE' },
    { name: 'Tomato Lemon Rice', price: 300, category: 'RICE' },
    { name: 'Mandhi Rice (Quarter)', price: 240, category: 'RICE' },

    // BREADS
    { name: 'Kuboos', price: 120, category: 'BREADS' },
    { name: 'Tandoor Rotti', price: 150, category: 'BREADS' },
    { name: 'Butter Rotti', price: 170, category: 'BREADS' },
    { name: 'Plain Nan', price: 150, category: 'BREADS' },
    { name: 'Butter Nan', price: 180, category: 'BREADS' },
    { name: 'Garlic Nan', price: 190, category: 'BREADS' },
    { name: 'Romani Rotti', price: 140, category: 'BREADS' },

    // NON VEG GRAVIES
    { name: 'Chicken Curry', price: 360, category: 'NON VEG GRAVIES' },
    { name: 'Kadai Chicken', price: 390, category: 'NON VEG GRAVIES' },
    { name: 'Butter Chicken', price: 390, category: 'NON VEG GRAVIES' },
    { name: 'Pepper Chicken', price: 400, category: 'NON VEG GRAVIES' },
    { name: 'Chilly Chicken', price: 390, category: 'NON VEG GRAVIES' },
    { name: 'Chicken Roast', price: 400, category: 'NON VEG GRAVIES' },
    { name: 'Chicken Manjoorian', price: 370, category: 'NON VEG GRAVIES' },
    { name: 'Masala Chicken', price: 360, category: 'NON VEG GRAVIES' },

    // BUFFALO
    { name: 'Buffalo Masala', price: 410, category: 'BUFFALO' },
    { name: 'Buffalo Fry', price: 390, category: 'BUFFALO' },
    { name: 'Buffalo Coconut', price: 390, category: 'BUFFALO' },

    // VEG GRAVIES
    { name: 'Chilly Paneer', price: 350, category: 'VEG GRAVIES' },
    { name: 'Chilly Gopi', price: 360, category: 'VEG GRAVIES' },
    { name: 'Paneer Butter Masala', price: 390, category: 'VEG GRAVIES' },
    { name: 'Dal Thaduka', price: 350, category: 'VEG GRAVIES' },
    { name: 'Mashroom Masala', price: 380, category: 'VEG GRAVIES' },
    { name: 'Kadai Mashroom', price: 390, category: 'VEG GRAVIES' },
    { name: 'Veg Kadai', price: 330, category: 'VEG GRAVIES' },
    { name: 'Veg Kolapuri', price: 330, category: 'VEG GRAVIES' },
    { name: 'Green Peas Masala', price: 300, category: 'VEG GRAVIES' },
    { name: 'Paneer Chilly', price: 380, category: 'VEG GRAVIES' },

    // FRIED RICE
    { name: 'Chicken Fried Rice', price: 330, category: 'FRIED RICE' },
    { name: 'Veg Fried Rice', price: 300, category: 'FRIED RICE' },
    { name: 'Egg Fried Rice', price: 320, category: 'FRIED RICE' },
    { name: 'Mixed Fried Rice', price: 390, category: 'FRIED RICE' },
    { name: 'Prawns Fried Rice', price: 490, category: 'FRIED RICE' },
    { name: 'Paneer Fried Rice', price: 380, category: 'FRIED RICE' },
    { name: 'Schezwan Chicken Fried Rice', price: 390, category: 'FRIED RICE' },
    { name: 'Schezwan Veg Fried Rice', price: 350, category: 'FRIED RICE' },
    { name: 'Schezwan Egg Fried Rice', price: 360, category: 'FRIED RICE' },
    { name: 'Schezwan Mixed Fried Rice', price: 440, category: 'FRIED RICE' },
    { name: 'Schezwan Prawns Fried Rice', price: 550, category: 'FRIED RICE' },
    { name: 'Schezwan Paneer Fried Rice', price: 430, category: 'FRIED RICE' },

    // NOODLES
    { name: 'Chicken Noodles', price: 350, category: 'NOODLES' },
    { name: 'Veg Noodles', price: 320, category: 'NOODLES' },
    { name: 'Mixed Noodles', price: 390, category: 'NOODLES' },
    { name: 'Prawns Noodles', price: 440, category: 'NOODLES' },
    { name: 'Paneer Noodles', price: 410, category: 'NOODLES' },
    { name: 'Schezwan Chicken Noodles', price: 400, category: 'NOODLES' },
    { name: 'Schezwan Veg Noodles', price: 380, category: 'NOODLES' },
    { name: 'Schezwan Mixed Noodles', price: 440, category: 'NOODLES' },
    { name: 'Schezwan Prawns Noodles', price: 500, category: 'NOODLES' },
    { name: 'Schezwan Paneer Noodles', price: 470, category: 'NOODLES' },

    // SALADS
    { name: 'Green Salad', price: 230, category: 'SALADS' },
    { name: 'Onion Salad', price: 190, category: 'SALADS' },
    { name: 'Russian Salad', price: 340, category: 'SALADS' },
    { name: 'Tossed Salad', price: 280, category: 'SALADS' },

    // MOJITOS
    { name: 'Passion Fruit Mojito', price: 240, category: 'MOJITOS' },
    { name: 'Green Apple Mojito', price: 240, category: 'MOJITOS' },
    { name: 'Pineapple Mojito', price: 240, category: 'MOJITOS' },
    { name: 'Blue Berry Mojito', price: 240, category: 'MOJITOS' },
    { name: 'Grape Mojito', price: 240, category: 'MOJITOS' },
    { name: 'Water Melon Mojito', price: 240, category: 'MOJITOS' },
    { name: 'Virgin Mint Mojito', price: 240, category: 'MOJITOS' },

    // SOUPS
    { name: 'Chicken Soup', price: 280, category: 'SOUPS' },
    { name: 'Veg Soup', price: 220, category: 'SOUPS' },
    { name: 'Sweet Corn Soup', price: 280, category: 'SOUPS' },
    { name: 'Chicken Corn Soup', price: 300, category: 'SOUPS' },
    { name: 'Hot and Sour Soup', price: 240, category: 'SOUPS' },
    { name: 'Hot and Sour Chicken Soup', price: 290, category: 'SOUPS' }
];

const seedGrilloCalicut = async () => {
    try {
        await connectDB();

        // Check if Grillo calicut already exists (case-insensitive)
        let restaurant = await Restaurant.findOne({ name: { $regex: /^Grillo calicut$/i } });
        
        if (!restaurant) {
            console.log('Grillo calicut not found. Creating new restaurant...');
            restaurant = new Restaurant({
                name: 'Grillo calicut',
                isActive: true,
                serviceChargeEnabled: true,
                serviceChargeAmount: 500
            });
            await restaurant.save();
            console.log('Created Grillo calicut restaurant.');
        } else {
            console.log('Grillo calicut already exists. Making it active...');
            restaurant.isActive = true;
            await restaurant.save();
        }

        // Deactivate other restaurants so Grillo calicut is the default active restaurant shown
        await Restaurant.updateMany({ _id: { $ne: restaurant._id } }, { $set: { isActive: false } });
        console.log('Set other restaurants to inactive.');

        // Clear previous products for Grillo calicut to avoid duplicates when running multiple times
        await Product.deleteMany({ restaurant: restaurant._id });
        console.log('Cleared old items for Grillo calicut.');

        // Prepare items with restaurant reference and category image
        const productsWithRestaurant = itemsToAdd.map(item => ({
            ...item,
            imageUrl: categoryImages[item.category] || '',
            restaurant: restaurant._id,
            isAvailable: true
        }));

        await Product.insertMany(productsWithRestaurant);

        console.log(`Successfully added ${productsWithRestaurant.length} items to Grillo calicut!`);
        process.exit(0);
    } catch (error) {
        console.error(`Error seeding Grillo calicut: ${error}`);
        process.exit(1);
    }
};

seedGrilloCalicut();
