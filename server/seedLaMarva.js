const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Restaurant = require('./models/Restaurant');
const Product = require('./models/Product');

dotenv.config();

const categoryImages = {
    'KERALA SPECIAL': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
    'ARABIC': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&q=80',
    'SHAKES': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
    'CURRY ITEMS': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&q=80',
    'SOUPS': 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80',
    'SALADS': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
    'RAITHA': 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?w=600&q=80',
    'BREAD': 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600&q=80',
    'BIRIYANI': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
    'RICE': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=600&q=80',
    'CHINESE': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
    'NORTH (NON VEG)': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
    'NORTH (VEG)': 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&q=80',
    'VEG NORTH': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=600&q=80'
};

const itemsToAdd = [
    // KERALA SPECIAL
    { name: 'Nadan Chicken Curry', price: 420, category: 'KERALA SPECIAL' },
    { name: 'Chicken Chettinad', price: 490, category: 'KERALA SPECIAL' },
    { name: 'La Marwa Special Chicken Fry', price: 490, category: 'KERALA SPECIAL' },
    { name: 'Munnar Chicken Curry', price: 480, category: 'KERALA SPECIAL' },
    { name: 'Chicken Kondattam', price: 350, category: 'KERALA SPECIAL' },
    { name: 'Fish Pollichath (Per Size)', price: 0, category: 'KERALA SPECIAL' },
    { name: 'Fish Thava Fry (Per Size)', price: 0, category: 'KERALA SPECIAL' },
    { name: 'Prawns Dry Fry', price: 490, category: 'KERALA SPECIAL' },

    // ARABIC - Normal Al Faham
    { name: 'Normal Al Faham (Quarter)', price: 290, category: 'ARABIC' },
    { name: 'Normal Al Faham (Half)', price: 470, category: 'ARABIC' },
    { name: 'Normal Al Faham (Full)', price: 780, category: 'ARABIC' },

    // ARABIC - Peri Peri Al Faham
    { name: 'Peri Peri Al Faham (Quarter)', price: 310, category: 'ARABIC' },
    { name: 'Peri Peri Al Faham (Half)', price: 490, category: 'ARABIC' },
    { name: 'Peri Peri Al Faham (Full)', price: 880, category: 'ARABIC' },

    // ARABIC - Kanthari Al Faham
    { name: 'Kanthari Al Faham (Quarter)', price: 310, category: 'ARABIC' },
    { name: 'Kanthari Al Faham (Half)', price: 500, category: 'ARABIC' },
    { name: 'Kanthari Al Faham (Full)', price: 890, category: 'ARABIC' },

    // ARABIC - Honey Al Faham
    { name: 'Honey Al Faham (Quarter)', price: 310, category: 'ARABIC' },
    { name: 'Honey Al Faham (Half)', price: 500, category: 'ARABIC' },
    { name: 'Honey Al Faham (Full)', price: 890, category: 'ARABIC' },

    // ARABIC - Mandhi
    { name: 'Al Faham Mandhi (Quarter)', price: 390, category: 'ARABIC' },
    { name: 'Al Faham Mandhi (Half)', price: 650, category: 'ARABIC' },
    { name: 'Al Faham Mandhi (Full)', price: 1100, category: 'ARABIC' },

    // SHAKES - Ice Cream Shakes
    { name: 'Sharja Ice Cream Shake', price: 220, category: 'SHAKES' },
    { name: 'Oreo Ice Cream Shake', price: 220, category: 'SHAKES' },
    { name: 'Cold Coffee Shake', price: 220, category: 'SHAKES' },
    { name: 'Cold Boost Shake', price: 220, category: 'SHAKES' },
    { name: 'Vanilla Ice Cream Shake', price: 220, category: 'SHAKES' },

    // SHAKES - Fruit Shakes
    { name: 'Shamam Fruit Shake', price: 220, category: 'SHAKES' },
    { name: 'Dates Nuts Shake', price: 250, category: 'SHAKES' },
    { name: 'Mango Shake', price: 240, category: 'SHAKES' },
    { name: 'Banana Fruit Shake', price: 240, category: 'SHAKES' },
    { name: 'Apple Fruit Shake', price: 240, category: 'SHAKES' },

    // SHAKES - Arabic Shakes
    { name: 'Abood Shake', price: 260, category: 'SHAKES' },
    { name: 'Shabab Shake', price: 260, category: 'SHAKES' },
    { name: 'Thabakath Shake', price: 260, category: 'SHAKES' },

    // CURRY ITEMS
    { name: 'Egg Curry', price: 220, category: 'CURRY ITEMS' },
    { name: 'Egg Roast', price: 250, category: 'CURRY ITEMS' },
    { name: 'Kadala Curry', price: 220, category: 'CURRY ITEMS' },
    { name: 'Veg Kuruma', price: 230, category: 'CURRY ITEMS' },

    // SOUPS
    { name: 'Clear Soup (Chicken/Veg)', price: 250, category: 'SOUPS' },
    { name: 'Sweet Corn Soup (Chicken/Veg)', price: 250, category: 'SOUPS' },
    { name: 'Hot & Sour Soup (Chicken/Veg)', price: 260, category: 'SOUPS' },
    { name: 'Manchow Soup (Chicken/Veg)', price: 260, category: 'SOUPS' },

    // SALADS
    { name: 'Green Salad', price: 230, category: 'SALADS' },
    { name: 'Tossed Salad (Capsicum)', price: 270, category: 'SALADS' },
    { name: 'Hawaiian Chicken Salad', price: 290, category: 'SALADS' },
    { name: 'Hawaiian Veg Salad', price: 260, category: 'SALADS' },
    { name: 'Onion Salad', price: 190, category: 'SALADS' },
    { name: 'Cucumber Salad', price: 190, category: 'SALADS' },
    { name: 'Chicken Tikka Salad', price: 290, category: 'SALADS' },

    // RAITHA
    { name: 'Mix Raitha', price: 190, category: 'RAITHA' },
    { name: 'Curd', price: 170, category: 'RAITHA' },

    // BREAD
    { name: 'Parotta', price: 140, category: 'BREAD' },
    { name: 'Chapathy', price: 140, category: 'BREAD' },
    { name: 'Butter Nan', price: 190, category: 'BREAD' },
    { name: 'Plain Nan', price: 160, category: 'BREAD' },
    { name: 'Rotti', price: 150, category: 'BREAD' },
    { name: 'Alu Parotta', price: 190, category: 'BREAD' },
    { name: 'Paneer Kulcha', price: 210, category: 'BREAD' },
    { name: 'Mix Veg Kulcha', price: 210, category: 'BREAD' },
    { name: 'Cheese Nan', price: 230, category: 'BREAD' },
    { name: 'Garlic Nan', price: 210, category: 'BREAD' },
    { name: 'Ramal Rotti', price: 180, category: 'BREAD' },

    // BIRIYANI
    { name: 'Veg Biriyani', price: 300, category: 'BIRIYANI' },
    { name: 'Mushroom Biriyani', price: 320, category: 'BIRIYANI' },
    { name: 'Paneer Biriyani', price: 330, category: 'BIRIYANI' },
    { name: 'Egg Biriyani', price: 300, category: 'BIRIYANI' },
    { name: 'Chicken Dum Biriyani', price: 360, category: 'BIRIYANI' },
    { name: 'Chicken Fry Biriyani', price: 340, category: 'BIRIYANI' },
    { name: 'Chicken Thalapakkatti Biriyani', price: 390, category: 'BIRIYANI' },
    { name: 'Prawns Biriyani', price: 480, category: 'BIRIYANI' },

    // RICE
    { name: 'Plain Rice', price: 220, category: 'RICE' },
    { name: 'Curd Rice', price: 240, category: 'RICE' },
    { name: 'Ghee Rice', price: 250, category: 'RICE' },
    { name: 'Jeera Rice', price: 260, category: 'RICE' },
    { name: 'Biriyani Rice', price: 250, category: 'RICE' },
    { name: 'Tomato Rice', price: 270, category: 'RICE' },
    { name: 'Veg Pulav', price: 290, category: 'RICE' },
    { name: 'Mushroom Pulav', price: 310, category: 'RICE' },
    { name: 'Paneer Pulav', price: 320, category: 'RICE' },
    { name: 'Lemon Rice', price: 280, category: 'RICE' },

    // CHINESE - Fried Rice
    { name: 'Veg Fried Rice', price: 300, category: 'CHINESE' },
    { name: 'Chicken Fried Rice', price: 340, category: 'CHINESE' },
    { name: 'Egg Fried Rice', price: 320, category: 'CHINESE' },
    { name: 'Paneer Fried Rice', price: 340, category: 'CHINESE' },
    { name: 'Prawns Fried Rice', price: 440, category: 'CHINESE' },
    { name: 'Mushroom Fried Rice', price: 340, category: 'CHINESE' },
    { name: 'Schezwan Chicken Fried Rice', price: 360, category: 'CHINESE' },
    { name: 'Schezwan Veg Fried Rice', price: 320, category: 'CHINESE' },
    { name: 'Schezwan Egg Fried Rice', price: 330, category: 'CHINESE' },

    // CHINESE - Noodles
    { name: 'Chicken Noodles', price: 350, category: 'CHINESE' },
    { name: 'Veg Noodles', price: 300, category: 'CHINESE' },
    { name: 'Egg Noodles', price: 310, category: 'CHINESE' },
    { name: 'Prawns Noodles', price: 460, category: 'CHINESE' },
    { name: 'Schezwan Chicken Noodles', price: 380, category: 'CHINESE' },
    { name: 'Schezwan Egg Noodles', price: 340, category: 'CHINESE' },
    { name: 'Schezwan Veg Noodles', price: 320, category: 'CHINESE' },

    // CHINESE - Chinese Curry
    { name: 'Gobi Manchurian', price: 290, category: 'CHINESE' },
    { name: 'Chilli Gopi', price: 290, category: 'CHINESE' },
    { name: 'Chilli Chicken', price: 320, category: 'CHINESE' },
    { name: 'Chicken 65', price: 300, category: 'CHINESE' },
    { name: 'Pepper Chicken', price: 340, category: 'CHINESE' },
    { name: 'Chicken Manchurian', price: 320, category: 'CHINESE' },
    { name: 'Garlic Chicken', price: 290, category: 'CHINESE' },
    { name: 'Ginger Chicken', price: 290, category: 'CHINESE' },

    // NORTH (NON VEG)
    { name: 'Kadai Chicken', price: 400, category: 'NORTH (NON VEG)' },
    { name: 'Butter Chicken', price: 430, category: 'NORTH (NON VEG)' },
    { name: 'Chicken Khurma', price: 390, category: 'NORTH (NON VEG)' },
    { name: 'Pepper Chicken Masala', price: 420, category: 'NORTH (NON VEG)' },
    { name: 'Lahori Chicken Curry', price: 420, category: 'NORTH (NON VEG)' },

    // NORTH (VEG)
    { name: 'Paneer Thekka', price: 390, category: 'NORTH (VEG)' },
    { name: 'Tandoori Gopi', price: 360, category: 'NORTH (VEG)' },
    { name: 'Harabhara Kabab', price: 360, category: 'NORTH (VEG)' },
    { name: 'Tandoori Chicken (Full)', price: 780, category: 'NORTH (VEG)' },
    { name: 'Tandoori Chicken (Half)', price: 460, category: 'NORTH (VEG)' },
    { name: 'Tandoori Chicken (Quarter)', price: 290, category: 'NORTH (VEG)' },
    { name: 'Chicken Thekka', price: 430, category: 'NORTH (VEG)' },
    { name: 'Hariyali Chicken Thekka', price: 450, category: 'NORTH (VEG)' },
    { name: 'Malai Chicken Thekka', price: 450, category: 'NORTH (VEG)' },

    // VEG NORTH
    { name: 'Parotta (Veg North)', price: 140, category: 'VEG NORTH' },
    { name: 'Chapathy (Veg North)', price: 140, category: 'VEG NORTH' },
    { name: 'Butter Nan (Veg North)', price: 190, category: 'VEG NORTH' },
    { name: 'Plain Nan (Veg North)', price: 160, category: 'VEG NORTH' },
    { name: 'Rotti (Veg North)', price: 150, category: 'VEG NORTH' },
    { name: 'Alu Parotta (Veg North)', price: 190, category: 'VEG NORTH' },
    { name: 'Paneer Kulcha (Veg North)', price: 210, category: 'VEG NORTH' },
    { name: 'Mix Veg Kulcha (Veg North)', price: 210, category: 'VEG NORTH' },
    { name: 'Cheese Nan (Veg North)', price: 230, category: 'VEG NORTH' },
    { name: 'Garlic Nan (Veg North)', price: 210, category: 'VEG NORTH' },
    { name: 'Ramal Rotti (Veg North)', price: 180, category: 'VEG NORTH' },
    { name: 'Dal Fry', price: 280, category: 'VEG NORTH' },
    { name: 'Dal Thadukka', price: 300, category: 'VEG NORTH' },
    { name: 'Dal Khichadi', price: 320, category: 'VEG NORTH' },
    { name: 'Kadai Vegetable', price: 320, category: 'VEG NORTH' },
    { name: 'Veg Kuruma (Veg North)', price: 280, category: 'VEG NORTH' },
    { name: 'Kadai Paneer', price: 340, category: 'VEG NORTH' },
    { name: 'Paneer Butter Masala', price: 350, category: 'VEG NORTH' },
    { name: 'Mutter Paneer Masala', price: 350, category: 'VEG NORTH' },
    { name: 'Kadai Mushroom', price: 340, category: 'VEG NORTH' },
    { name: 'Aloo Gobi', price: 300, category: 'VEG NORTH' },
    { name: 'Aloo Jeera', price: 280, category: 'VEG NORTH' },
    { name: 'Mushroom Masala', price: 350, category: 'VEG NORTH' }
];

const seedLaMarva = async () => {
    try {
        await connectDB();

        // Check if la marva already exists (case-insensitive)
        let restaurant = await Restaurant.findOne({ name: { $regex: /^la marva$/i } });
        
        if (!restaurant) {
            console.log('la marva not found. Creating new restaurant...');
            restaurant = new Restaurant({
                name: 'la marva',
                isActive: true,
                serviceChargeEnabled: true,
                serviceChargeAmount: 500
            });
            await restaurant.save();
            console.log('Created la marva restaurant.');
        } else {
            console.log('la marva already exists. Making it active...');
            restaurant.isActive = true;
            await restaurant.save();
        }

        // Deactivate other restaurants so la marva is the default active restaurant shown
        await Restaurant.updateMany({ _id: { $ne: restaurant._id } }, { $set: { isActive: false } });
        console.log('Set other restaurants to inactive.');

        // Clear previous products for la marva to avoid duplicates when running multiple times
        await Product.deleteMany({ restaurant: restaurant._id });
        console.log('Cleared old items for la marva.');

        // Prepare items with restaurant reference and category image
        const productsWithRestaurant = itemsToAdd.map(item => ({
            ...item,
            imageUrl: categoryImages[item.category] || '',
            restaurant: restaurant._id,
            isAvailable: true
        }));

        await Product.insertMany(productsWithRestaurant);

        console.log(`Successfully added ${productsWithRestaurant.length} items to la marva!`);
        process.exit(0);
    } catch (error) {
        console.error(`Error seeding la marva: ${error}`);
        process.exit(1);
    }
};

seedLaMarva();
