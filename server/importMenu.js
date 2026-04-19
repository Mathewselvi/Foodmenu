require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

connectDB();

const rawMenuText = `
BEVERAGES
* Black Tea – 10.00
* Tea – 15.00
* Lemon Tea – 15.00
* Black Coffee (Bru) – 12.00
* Coffee Bru – 25.00
* Masala Tea – 20.00
* Cardamom Tea – 20.00
* Ginger Tea – 20.00
* Mint Tea – 20.00
* Saffron Tea – 30.00
* Boost / Horlicks – 30.00
* Milk – 20.00
* Hot Badam Milk – 40.00
* Booster Chai – 30.00
* Hot Chocolate – 60.00

SANDWICH
* Veg Sandwich – 90.00
* Egg Sandwich – 120.00
* Chicken Sandwich – 140.00

BREAKFAST
* Appam – 15.00
* Idiappam – 15.00
* Kerala Puttu – 45.00
* Idly (3 pcs) – 45.00
* Plain Dosa – 60.00
* Masala Dosa – 90.00
* Ghee Roast – 100.00
* Set Dosa – 50.00
* Ghee Masala Dosa – 120.00
* Ghee Podi Dosa – 100.00
* Ghee Podi Masala Dosa – 140.00
* Egg Dosa – 100.00
* Uthappam – 60.00
* Onion Uthappam – 90.00
* Onion Dosa – 90.00
* Tomato Onion Uthappam – 120.00
* Tomato Uthappam – 80.00
* Poori Masala – 80.00
* Vada – 16.00
* Bread Toast – 50.00
* Bread Butter Jam – 80.00
* Bread Omelet – 90.00
* Bread Butter – 80.00
* Bread Jam – 80.00

SHORT BITES
* Finger Chips – 130.00
* Onion Pakoda – 140.00
* Paneer Pakoda – 220.00
* Gobi 65 – 140.00
* Egg Pakoda – 140.00
* Chicken Pakoda (BL) – 220.00

SOUPS
* Veg Clear Soup – 90.00
* Veg Hot’N’ Soup – 110.00
* Veg Noodles Soup – 100.00
* Cream of Tomato – 100.00
* Sweet Corn Veg – 100.00
* French Onion Soup – 110.00
* Chicken Clear Soup – 100.00
* Chicken Hot ‘N’ Soup – 130.00
* Sweet Corn Chicken – 120.00
* Chicken Noodles Soup – 120.00
* Mushroom Soup – 110.00

SALADS
* Onion Salad – 70.00
* Carrot Salad – 80.00
* Tomato Salad – 80.00
* Pineapple Salad – 100.00
* Veg Salad – 100.00

EGG BASKET
* Boiled Egg – 15.00
* Fried Egg – 60.00
* Bull Eye – 50.00
* Omelette – 50.00
* Masala Omelette – 80.00
* Egg Masala – 50.00 / 100.00
* Egg Bhurji – 100.00
* Egg Chilly (Dry) – 140.00

RICE / MEALS
* Veg Meals – 100.00
* Fish Curry Meals – 160.00
* North Indian Thali (Veg) – 200.00
* North Indian Thali (Non Veg) – 330.00
* Plain Rice – 70.00
* Ghee Rice – 110.00
* Biriyani Rice – 100.00
* Tomato Rice – 100.00
* Lemon Rice – 100.00
* Curd Rice – 100.00
* Jeera Rice – 100.00

RAITA
* Curd – 50.00
* Onion Raita – 80.00
* Mixed Raita – 100.00
* Pineapple Raita – 100.00

ROTIS
* Chappathy – 15.00
* Kerala Porotta – 15.00
* Nool Porotta – 30.00
* Wheat Porotta – 30.00
* Butter Chappathy – 30.00
* Butter Porotta – 30.00
* Tandoor Roti – 30.00
* Butter Roti – 40.00
* Plain Naan – 40.00
* Butter Naan – 50.00
* Garlic Naan – 60.00
* Cheese Naan – 80.00
* Butter Kulcha – 50.00
* Stuffed Kulcha – 70.00
* Garlic Kulcha – 60.00
* Cheese Butter Kulcha – 100.00
* Tandoori Paratha – 60.00
* Podina Paratha – 70.00
* Gobi Paratha – 80.00
* Methi Paratha – 70.00
* Aloo Paratha – 90.00
* Rumali Roti – 20.00
* Kuboos – 12.00

BIRIYANI
* Veg Biryani – 130.00
* Egg Biryani – 150.00
* Mushroom Biryani – 160.00
* Chicken Biryani – 180.00
* Beef Biryani – 220.00
* Mutton Biryani – 300.00
* Rochas Special Biryani – 320.00
* Tamilnadu Chicken Biryani – 220.00
* Prawns Biryani – 300.00
* Fish Biryani – 300.00

FRIED RICE
* Vegetable Fried Rice – 140.00
* Mushroom Fried Rice – 170.00
* Paneer Fried Rice – 190.00
* Egg Fried Rice – 160.00
* Chicken Fried Rice – 190.00
* Mixed Fried Rice – 220.00
* Prawns Fried Rice – 200.00

NOODLES
* Veg Noodles – 140.00
* Veg Hakka Noodles – 160.00
* Egg Noodles – 160.00
* Egg Hakka Noodles – 170.00
* Chicken Noodles – 190.00
* Chicken Hakka Noodles – 200.00
* Mixed Noodles – 200.00
* Szechuan Noodles Veg – 160.00
* Szechuan Egg Noodles – 170.00
* Szechuan Chicken Noodles – 200.00
* American Chop Suey Veg – 190.00
* American Chop Suey Chicken – 210.00
* Chinese Chop Suey – 210.00

VEG CURRY
* Mix Veg Kurma – 100.00
* Kadala Curry – 50.00 / 100.00
* Tomato Fry – 100.00
* Mutter Masala – 130.00
* Channa Masala – 130.00
* Aloo Jeera – 120.00
* Aloo Mutter Masala – 150.00
* Aloo Gobi – 150.00
* Aloo Masala – 130.00
* Gobi Masala – 160.00
* Dal Fry – 120.00
* Dal Tadka – 120.00
* Chilly Gobi – 170.00
* Gobi Manchurian – 190.00
* Veg Manchurian – 220.00
* Bindi Masala – 140.00
* Paneer Butter Masala – 230.00
* Paneer Mutter Masala – 240.00
* Butter Paneer Manchurian – 250.00
* Chilly Paneer – 240.00
* Kadai Veg – 220.00
* Kadai Paneer – 250.00
* Mushroom Masala – 230.00
* Chilly Mushroom – 240.00
* Mushroom Manchurian – 250.00

BEEF
* Beef Coconut Fry – 160.00
* Beef Roast – 220.00
* Beef Dry Fry – 240.00
* Beef Kondattam – 190.00
* Beef Kaya / Koorka – 260.00
* Beef Pepper Fry – 200.00

MUTTON
* Mutton Roast – 350.00
* Mutton Fry – 360.00
* Mutton Ghee Roast – 370.00
* Mutton Masala – 380.00

TANDOORI
* Tandoor Chicken Full – 500.00
* Tandoori Chicken Half – 270.00
* Chicken Tikka – 320.00
* Tandoori Kabab – 250.00

SHAWARMA
* Shawarma Roll – 100.00
* Roll Full Meat – 130.00
* Plate Shawarma – 140.00

SHAWAYA
* Shawaya Half – 300.00
* Shawaya Full – 560.00

MASALA SHAWAYA
* Masala Shawaya Half – 320.00
* Masala Shawaya Full – 600.00

CHICKEN SPECIAL
* Chicken Masala – 150 / 260
* Chicken Roast – 150 / 260
* Chicken Fry – 140 / 250
* Kethels Chicken Fry – 280
* Chicken Curry – 140 / 250
* Chicken Varutharacha Curry – 160 / 260
* Chicken Ghee Roast – 190 / 290
* Chicken Kondattam – 180 / 280
* Chicken 65 – 140 / 250
* Chicken Dry Fry – 160 / 260
* Chilly Chicken – 150 / 250
* Ginger Chicken – 160 / 260
* Garlic Chicken – 160 / 260
* Chicken Manchurian – 170 / 270
* Kadai Chicken – 170 / 270
* Pepper Chicken – 170 / 270
* Chicken Mugalai – 180 / 280
* Chicken Lolipop – 260
* Hyderabadi Murgh Korma – 190 / 290
* Butter Chicken – 190 / 290
* Chicken Chettinad – 180 / 280
* Szechuan Chicken – 170 / 270
* Dragon Chicken – 180 / 280
* Chicken Shahi Korma – 190 / 290
* Chicken Kohlapuri – 180 / 280
* Chicken Tikka Masala – 280

ALFAHAM
* Lebanese – 150 / 280 / 560
* Mexican – 170 / 320 / 640
* Peri Peri – 180 / 340 / 680
* BBQ – 180 / 340 / 680
* Honey – 180 / 340 / 680
* Turkish – 180 / 340 / 680
* Kanthari – 180 / 340 / 680
* Alfaham Mandhi – 190 / 360 / 720
* Mandhi Rice – 110 / 190 / 370

LIME JUICE
* Fresh Lime – 30
* Mint Lime – 40
* Ginger Lime – 40
* Orange Lime – 40
* Pineapple Lime – 40
* Grape Lime – 40
* Fresh Lime Soda – 30
* Chilli Soda – 30

FRESH PULP
* Carrot – 70
* Orange – 80
* Grape – 80
* Mosambi – 80
* Pineapple – 80
* Pappaya – 80
* Watermelon – 70
* Shamam – 90
* Mango – 90

SIGNATURE
* Avil Milk – 80
* Naruneendi Milk Sarbath – 40
* Rose Milk – 70
* Cold Coffee – 80
* Cold Boost – 80
* Cold Badam – 80

LASSI
* Sweet Lassi – 45
* Salt Lassi – 35
* Butter Milk – 40
* Fruit Lassi – 80
* Mango Lassi – 100
* Rose Lassi – 60

MILKSHAKE
* Chickoo – 90
* Pappaya – 90
* Apple – 110
* Anar – 110
* Mango – 100
* Shamam – 100
* Sharjah Shake – 90
* Chocolate Shake – 110
* Butter Scotch – 110
* Strawberry – 110
* Pista Shake – 130
* Oreo Shake – 110

SUNDAES
* Fruit Salad – 120
* Royal Falooda – 180
* Vanilla Ice Cream – 70
* Chocolate – 90
* Strawberry – 90
* Tender Coconut – 100
* Mango – 90
* Butterscotch – 90
`;

async function importMenu() {
    try {
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        const lines = rawMenuText.split('\n');
        let currentCategory = 'General';
        const productsToInsert = [];

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            if (line.startsWith('*')) {
                // It's a product
                const content = line.substring(1).trim();
                const parts = content.split(' – ');
                if (parts.length < 2) {
                    // Try splitting by just ' - ' if ' – ' (en dash) fails
                    const altParts = content.split(' - ');
                    if (altParts.length < 2) {
                        // Special case for Chicken Masala – 150 / 260
                        const dashParts = content.split('–');
                         if (dashParts.length >= 2) {
                            processProduct(dashParts[0].trim(), dashParts[1].trim(), currentCategory, productsToInsert);
                         }
                        continue;
                    }
                    processProduct(altParts[0].trim(), altParts[1].trim(), currentCategory, productsToInsert);
                } else {
                    processProduct(parts[0].trim(), parts[1].trim(), currentCategory, productsToInsert);
                }
            } else {
                // It's a category
                currentCategory = line;
            }
        }

        await Product.insertMany(productsToInsert);
        console.log(`Successfully imported ${productsToInsert.length} products.`);
        process.exit(0);
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
}

function processProduct(name, priceStr, category, list) {
    // Handle multiple prices like "150 / 260"
    if (priceStr.includes('/')) {
        const prices = priceStr.split('/').map(p => parseFloat(p.trim()));
        if (prices.length === 2) {
            list.push({ name: name + ' (Half)', price: prices[0], category, isAvailable: true });
            list.push({ name: name + ' (Full)', price: prices[1], category, isAvailable: true });
        } else if (prices.length === 3) {
            list.push({ name: name + ' (Quarter)', price: prices[0], category, isAvailable: true });
            list.push({ name: name + ' (Half)', price: prices[1], category, isAvailable: true });
            list.push({ name: name + ' (Full)', price: prices[2], category, isAvailable: true });
        }
    } else {
        const price = parseFloat(priceStr);
        if (!isNaN(price)) {
            list.push({ name, price, category, isAvailable: true });
        }
    }
}

importMenu();
