const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Restaurant = require('./models/Restaurant');
const Product = require('./models/Product');

dotenv.config();

const itemsToAdd = [
    // BIRIYANI – THE ROYAL DELICACIES
    { name: 'Chicken Biriyani', price: 280, category: 'BIRIYANI – THE ROYAL DELICACIES' },
    { name: 'Mutton Biriyani', price: 550, category: 'BIRIYANI – THE ROYAL DELICACIES' },
    { name: 'Egg Biriyani', price: 240, category: 'BIRIYANI – THE ROYAL DELICACIES' },
    { name: 'Prawns Biriyani', price: 550, category: 'BIRIYANI – THE ROYAL DELICACIES' },
    { name: 'Mushroom Biriyani', price: 260, category: 'BIRIYANI – THE ROYAL DELICACIES' },
    { name: 'Gobi Biriyani', price: 250, category: 'BIRIYANI – THE ROYAL DELICACIES' },
    { name: 'Veg Biriyani', price: 240, category: 'BIRIYANI – THE ROYAL DELICACIES' },
    { name: 'Paneer Biriyani', price: 270, category: 'BIRIYANI – THE ROYAL DELICACIES' },

    // RICE
    { name: 'Plain Rice', price: 180, category: 'RICE' },
    { name: 'Curd Rice', price: 200, category: 'RICE' },
    { name: 'Ghee Rice', price: 220, category: 'RICE' },
    { name: 'Coriander Rice', price: 210, category: 'RICE' },
    { name: 'Jeera Rice', price: 210, category: 'RICE' },
    { name: 'Carrot Rice', price: 210, category: 'RICE' },
    { name: 'Tomato Rice', price: 210, category: 'RICE' },
    { name: 'Lemon Rice', price: 200, category: 'RICE' },
    { name: 'Veg Pulav', price: 240, category: 'RICE' },
    { name: 'Coconut Rice', price: 220, category: 'RICE' },
    { name: 'Nuts Pulav', price: 300, category: 'RICE' },
    { name: 'Mushroom Pulav', price: 270, category: 'RICE' },
    { name: 'Paneer Pulav', price: 290, category: 'RICE' },
    { name: 'Tomato Pulav', price: 240, category: 'RICE' },
    { name: 'Mint Pulav', price: 240, category: 'RICE' },

    // NON VEG MAGICS
    { name: 'Chicken Masala', price: 350, category: 'NON VEG MAGICS' },
    { name: 'Kadai Chicken', price: 390, category: 'NON VEG MAGICS' },
    { name: 'Butter Chicken (Half)', price: 420, category: 'NON VEG MAGICS' },
    { name: 'Butter Chicken (Full)', price: 450, category: 'NON VEG MAGICS' },
    { name: 'Methi Chicken', price: 390, category: 'NON VEG MAGICS' },
    { name: 'Murg Sagwala', price: 390, category: 'NON VEG MAGICS' },

    // CHICKEN, SEAFOOD & EGG CURRIES
    { name: 'Chicken Sagwala', price: 390, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Chicken Kolapuri', price: 390, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Pepper Chicken Roast', price: 430, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Chicken Chettinadu', price: 430, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Chicken Stew', price: 450, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Kuttanadan Chicken Curry', price: 430, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Our Special Chicken Curry', price: 450, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Chicken Mapas', price: 430, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Kerala Chicken Curry', price: 330, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Prawns Molly', price: 600, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Prawns Masala', price: 600, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Prawns Roast', price: 620, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Kuttanadan Prawns Curry', price: 600, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Prawns Curry', price: 600, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Kerala Fish Curry', price: 350, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Egg Masala', price: 220, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Egg Curry', price: 180, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Egg Bhurji', price: 180, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Egg Chilli', price: 260, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },
    { name: 'Egg Roast', price: 200, category: 'CHICKEN, SEAFOOD & EGG CURRIES' },

    // VEGAN FANTACIES
    { name: 'Dal Fry', price: 240, category: 'VEGAN FANTACIES' },
    { name: 'Dal Tomato', price: 220, category: 'VEGAN FANTACIES' },
    { name: 'Dal Thanks', price: 260, category: 'VEGAN FANTACIES' },
    { name: 'Dal Kichadi', price: 270, category: 'VEGAN FANTACIES' },
    { name: 'Mixed Veg Kuruma', price: 220, category: 'VEGAN FANTACIES' },
    { name: 'Veg Kolapuri', price: 290, category: 'VEGAN FANTACIES' },
    { name: 'Kadai Veg', price: 260, category: 'VEGAN FANTACIES' },
    { name: 'Veg Mappas', price: 290, category: 'VEGAN FANTACIES' },

    // VEG CURRIES
    { name: 'Veg Stew', price: 280, category: 'VEG CURRIES' },
    { name: 'Bhindi Masala', price: 250, category: 'VEG CURRIES' },
    { name: 'Bhindi Do Pyasa', price: 270, category: 'VEG CURRIES' },
    { name: 'Baigan Masala', price: 250, category: 'VEG CURRIES' },
    { name: 'Aloo Baigan', price: 250, category: 'VEG CURRIES' },
    { name: 'Aloo Mirror Masala', price: 250, category: 'VEG CURRIES' },
    { name: 'Aloo Gobi', price: 250, category: 'VEG CURRIES' },
    { name: 'Gobi 65', price: 260, category: 'VEG CURRIES' },
    { name: 'Paneer 65', price: 350, category: 'VEG CURRIES' },
    { name: 'Mushroom 65', price: 320, category: 'VEG CURRIES' },
    { name: 'Aloo Paneer', price: 290, category: 'VEG CURRIES' },
    { name: 'Aloo Muttor', price: 250, category: 'VEG CURRIES' },
    { name: 'Aloo Masala', price: 250, category: 'VEG CURRIES' },
    { name: 'Mushroom Masala', price: 310, category: 'VEG CURRIES' },
    { name: 'Paneer Butter Masala', price: 360, category: 'VEG CURRIES' },
    { name: 'Paneer Mutter Masala', price: 320, category: 'VEG CURRIES' },
    { name: 'Kadai Paneer', price: 320, category: 'VEG CURRIES' },
    { name: 'Paneer Kolapuri', price: 320, category: 'VEG CURRIES' },
    { name: 'Paneer Panjabi', price: 330, category: 'VEG CURRIES' },
    { name: 'Paneer Masala', price: 320, category: 'VEG CURRIES' },
    { name: 'Green Piece Masala', price: 220, category: 'VEG CURRIES' },
    { name: 'Chana Masala', price: 180, category: 'VEG CURRIES' },
    { name: 'Paneer Bhurji', price: 320, category: 'VEG CURRIES' },
    { name: 'Kadai Mushroom', price: 290, category: 'VEG CURRIES' },
    { name: 'Aloo Jeera', price: 250, category: 'VEG CURRIES' },
    { name: 'Tomato Fry', price: 180, category: 'VEG CURRIES' },

    // CHINESE DELIGHTS
    { name: 'Veg Fried Rice', price: 240, category: 'CHINESE DELIGHTS' },
    { name: 'Schezwan Fried Rice (Veg)', price: 290, category: 'CHINESE DELIGHTS' },
    { name: 'Schezwan Fried Rice (Non Veg)', price: 340, category: 'CHINESE DELIGHTS' },
    { name: 'Egg Fried Rice', price: 260, category: 'CHINESE DELIGHTS' },
    { name: 'Chicken Fried Rice', price: 290, category: 'CHINESE DELIGHTS' },
    { name: 'Mix Fried Rice', price: 350, category: 'CHINESE DELIGHTS' },
    { name: 'Sweet Corn Veg Fried Rice', price: 280, category: 'CHINESE DELIGHTS' },
    { name: 'Paneer Fried Rice', price: 270, category: 'CHINESE DELIGHTS' },
    { name: 'Mushroom Fried Rice', price: 260, category: 'CHINESE DELIGHTS' },
    { name: 'Garlic Chicken Fried Rice', price: 320, category: 'CHINESE DELIGHTS' },
    { name: 'Veg Noodles', price: 220, category: 'CHINESE DELIGHTS' },
    { name: 'Schezwan Noodles (Veg)', price: 240, category: 'CHINESE DELIGHTS' },
    { name: 'Schezwan Noodles (Non Veg)', price: 280, category: 'CHINESE DELIGHTS' },
    { name: 'Egg Noodles', price: 250, category: 'CHINESE DELIGHTS' },
    { name: 'Chicken Noodles', price: 290, category: 'CHINESE DELIGHTS' },

    // NOODLES & CHOPSUEY
    { name: 'Mix Noodles', price: 350, category: 'NOODLES & CHOPSUEY' },
    { name: 'Chilly Garlic Noodles (Veg)', price: 250, category: 'NOODLES & CHOPSUEY' },
    { name: 'Chilly Garlic Noodles (Non Veg)', price: 320, category: 'NOODLES & CHOPSUEY' },
    { name: 'Prawns Noodles', price: 430, category: 'NOODLES & CHOPSUEY' },
    { name: 'American Chopsuey (Veg)', price: 480, category: 'NOODLES & CHOPSUEY' },
    { name: 'American Chopsuey (Non Veg)', price: 520, category: 'NOODLES & CHOPSUEY' },
    { name: 'Chinese Chopsuey (Veg)', price: 480, category: 'NOODLES & CHOPSUEY' },
    { name: 'Chinese Chopsuey (Non Veg)', price: 550, category: 'NOODLES & CHOPSUEY' },
    { name: 'Chilli Parath (Veg)', price: 290, category: 'NOODLES & CHOPSUEY' },
    { name: 'Chilli Parath (Non Veg)', price: 350, category: 'NOODLES & CHOPSUEY' },

    // CURRIES – THEN NO WORRIES
    { name: 'Chilly Chicken (Full)', price: 750, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chilly Chicken (Half)', price: 420, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chilly Chicken (Quarter)', price: 260, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chicken 65 (Full)', price: 750, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chicken 65 (Half)', price: 420, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chicken 65 (Quarter)', price: 260, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Garlic Chicken (Full)', price: 750, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Garlic Chicken (Half)', price: 420, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Garlic Chicken (Quarter)', price: 260, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Ginger Chicken (Full)', price: 750, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Ginger Chicken (Half)', price: 420, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Ginger Chicken (Quarter)', price: 260, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chicken Manjurian (Full)', price: 750, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chicken Manjurian (Half)', price: 420, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chicken Manjurian (Quarter)', price: 260, category: 'CURRIES – THEN NO WORRIES' },

    { name: 'Chilly Gobi', price: 260, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Gobi Manjurian', price: 260, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Mushroom Manjurian', price: 290, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Veg Manjurian', price: 350, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Gobi Salt & Pepper', price: 320, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Schezwan Mushroom', price: 350, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chilly Mushroom', price: 350, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Ginger Mushroom', price: 350, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Garlic Mushroom', price: 350, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Paneer Manjurian', price: 390, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Ginger Paneer', price: 390, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Garlic Paneer', price: 390, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chilly Paneer', price: 390, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Sweet N Sour Vegetable', price: 290, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Fish Manjurian', price: 550, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chilly Fish', price: 550, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Sweet N Sour Fish', price: 420, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Chilly Prawns', price: 620, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Honey Glazed Prawns', price: 720, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Mutton Kuruma', price: 620, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Mutton Chaps', price: 620, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Mutton Roast', price: 650, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Mutton Curry', price: 620, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Mutton Masal', price: 620, category: 'CURRIES – THEN NO WORRIES' },
    { name: 'Mutton Pepper Fry', price: 680, category: 'CURRIES – THEN NO WORRIES' },

    // SOUPS
    { name: 'Cream of Tomato', price: 180, category: 'SOUPS' },
    { name: 'Cream of Veg', price: 160, category: 'SOUPS' },
    { name: 'Cream of Chicken', price: 190, category: 'SOUPS' },
    { name: 'Cream of Mushroom', price: 180, category: 'SOUPS' },
    { name: 'Hot N Sour (Veg)', price: 160, category: 'SOUPS' },
    { name: 'Hot N Sour (Chicken)', price: 180, category: 'SOUPS' },
    { name: 'Sweet Corn Veg', price: 160, category: 'SOUPS' },
    { name: 'Sweet Corn Chicken', price: 210, category: 'SOUPS' },
    { name: 'Veg Mancho', price: 160, category: 'SOUPS' },
    { name: 'Chicken Manchow', price: 210, category: 'SOUPS' },
    { name: 'Lemon Coriander', price: 160, category: 'SOUPS' },
    { name: 'Mutton Shorba', price: 280, category: 'SOUPS' },
    { name: 'Mutton Mulagthani', price: 310, category: 'SOUPS' },

    // SALADS
    { name: 'Green Salad', price: 180, category: 'SALADS' },
    { name: 'Onion Salad', price: 140, category: 'SALADS' },
    { name: 'Cucumber Salad', price: 140, category: 'SALADS' },
    { name: 'Oriental Salad', price: 230, category: 'SALADS' },
    { name: 'Fruit Chat', price: 230, category: 'SALADS' },
    { name: 'Aloo Chat', price: 230, category: 'SALADS' },

    // ARABIC DISHES
    { name: 'Alfarm (Full)', price: 850, category: 'ARABIC DISHES' },
    { name: 'Alfarm (Half)', price: 450, category: 'ARABIC DISHES' },
    { name: 'Alfarm (Quarter)', price: 280, category: 'ARABIC DISHES' },
    { name: 'Tandoor Chicken (Full)', price: 850, category: 'ARABIC DISHES' },
    { name: 'Tandoor Chicken (Half)', price: 450, category: 'ARABIC DISHES' },
    { name: 'Tandoor Chicken (Quarter)', price: 280, category: 'ARABIC DISHES' },

    // TANDOOR ITEMS
    { name: 'Chicken Tikka', price: 450, category: 'TANDOOR ITEMS' },
    { name: 'Paneer Tikka', price: 550, category: 'TANDOOR ITEMS' },
    { name: 'Mushroom Tikka', price: 380, category: 'TANDOOR ITEMS' },
    { name: 'Prawns Tandoor', price: 700, category: 'TANDOOR ITEMS' },

    // BREAD ITEMS
    { name: 'Tandoor Rotti', price: 80, category: 'BREAD ITEMS' },
    { name: 'Butter Rotti', price: 90, category: 'BREAD ITEMS' },
    { name: 'Naan', price: 90, category: 'BREAD ITEMS' },
    { name: 'Butter Naan', price: 100, category: 'BREAD ITEMS' },
    { name: 'Garlic Naan', price: 110, category: 'BREAD ITEMS' },
    { name: 'Cheese Naan', price: 140, category: 'BREAD ITEMS' },
    { name: 'Aloo Naan', price: 120, category: 'BREAD ITEMS' },
    { name: 'Plain Kulcha', price: 110, category: 'BREAD ITEMS' },
    { name: 'Butter Kulcha', price: 120, category: 'BREAD ITEMS' },
    { name: 'Paneer Kulcha', price: 130, category: 'BREAD ITEMS' }
];

const seedFriendsHotel = async () => {
    try {
        await connectDB();

        // Check if Friends Hotel already exists
        let friendsHotel = await Restaurant.findOne({ name: 'Friends Hotel' });
        
        if (!friendsHotel) {
            console.log('Friends Hotel not found. Creating new restaurant...');
            friendsHotel = new Restaurant({
                name: 'Friends Hotel',
                isActive: true
            });
            await friendsHotel.save();
            console.log('Created Friends Hotel.');
        } else {
            console.log('Friends Hotel already exists.');
        }

        // Prepare items with the restaurant reference
        const productsWithRestaurant = itemsToAdd.map(item => ({
            ...item,
            restaurant: friendsHotel._id,
            isAvailable: true
        }));

        // Optionally, one could clear old items for this restaurant, but we just insert them here
        await Product.insertMany(productsWithRestaurant);

        console.log(`Successfully added ${productsWithRestaurant.length} items to Friends Hotel!`);
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedFriendsHotel();
