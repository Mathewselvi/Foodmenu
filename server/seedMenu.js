/**
 * Beyond Heaven Resort food menu — the ONLY menu served by this app.
 *
 * Base prices are copied from the partner restaurant's printed menu (PDF).
 * The website price = base price + the markup for that category:
 *
 *   Hot Beverages, Lime, Mojitos ........ +0   (same as printed menu)
 *   Al-Faham, Mandhi, Tandoor ........... +100
 *   Starters, Biriyani, everything else . +60
 *
 * Usage:
 *   node seedMenu.js --dry-run   # print the final price list, no DB access
 *   node seedMenu.js             # back up DB, remove other restaurants' menus, load this menu
 *
 * A JSON backup of all restaurants + products is written to ./backups/ before anything is deleted.
 * Orders are never touched.
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

// Name shown in the admin panel. Guests only ever see "Beyond Heaven Resort".
const RESTAURANT_NAME = 'Beyond Heaven Resort';

const VEG = true;
const NON_VEG = false;
const NA = null; // veg/non-veg marker not shown (drinks, or not known)

// Expands "Classic Al-Faham" + [200, 400, 760] into Quarter / Half / Full items.
const sizes = (name, [quarter, half, full], isVeg = NON_VEG) => [
    [`${name} (Quarter)`, quarter, isVeg],
    [`${name} (Half)`, half, isVeg],
    [`${name} (Full)`, full, isVeg],
];

// [name, base price from printed menu, isVeg]. A base price of null means "seasonal" (no fixed price).
const MENU = [
    {
        category: 'STARTERS', markup: 60, items: [
            ['Chicken 65', 250, NON_VEG],
            ['Dragon Chicken', 280, NON_VEG],
            ['Chilly Gobi', 200, VEG],
            ['Paneer Tikka', 260, VEG],
            ['Aloo Jeera', 200, VEG],
            ['Buffalo Fry', 250, NON_VEG],
        ],
    },
    {
        category: 'AL-FAHAM', markup: 100, items: [
            ...sizes('Classic Al-Faham', [200, 400, 760]),
            ...sizes('Peri Peri Al-Faham', [230, 460, 880]),
            ...sizes('Honey Al-Faham', [300, 600, 1100]),
            ...sizes('BBQ Al-Faham', [300, 600, 1100]),
        ],
    },
    {
        category: 'MANDHI', markup: 100, items: [
            ...sizes('Al-Faham Mandhi', [270, 520, 960]),
            ...sizes('Peri Peri Mandhi', [290, 580, 1080]),
            ...sizes('Honey Mandhi', [370, 720, 1300]),
            // Printed menu says 11300 for BBQ Mandhi (Full) — a typo; it matches Honey Mandhi (Full) at 1300.
            ...sizes('BBQ Mandhi', [370, 720, 1300]),
        ],
    },
    {
        category: 'TANDOOR', markup: 100, items: [
            ...sizes('Tandoor Chicken', [200, 400, 760]),
        ],
    },
    {
        category: 'BIRIYANI', markup: 60, items: [
            ['Chicken Biriyani', 200, NON_VEG],
            ['Veg Biriyani', 180, VEG],
            ['Buffalo Biriyani', 250, NON_VEG],
            ['Fish Biriyani (Seasonal)', 450, NON_VEG],
            ['Prawns Biriyani', 400, NON_VEG],
        ],
    },
    {
        category: 'NON VEG GRAVIES', markup: 60, items: [
            ['Chicken Curry', 230, NON_VEG],
            ['Kadai Chicken', 250, NON_VEG],
            ['Butter Chicken', 250, NON_VEG],
            ['Pepper Chicken', 260, NON_VEG],
            ['Chilly Chicken', 260, NON_VEG],
            ['Chicken Roast', 260, NON_VEG],
            ['Chicken Manchurian', 240, NON_VEG],
            ['Masala Chicken', 230, NON_VEG],
        ],
    },
    {
        category: 'BUFFALO', markup: 60, items: [
            ['Buffalo Masala', 270, NON_VEG],
            ['Buffalo Fry', 250, NON_VEG],
            ['Buffalo Coconut', 250, NON_VEG],
        ],
    },
    {
        category: 'SEA FOOD', markup: 60, items: [
            ['Fish Fry', null, NON_VEG],
            ['Fish Masala', null, NON_VEG],
            ['Prawns Masala', null, NON_VEG],
            ['Prawns Fry', null, NON_VEG],
        ],
    },
    {
        category: 'VEG GRAVIES', markup: 60, items: [
            ['Chilly Paneer', 250, VEG],
            ['Chilly Gobi', 200, VEG],
            ['Paneer Butter Masala', 260, VEG],
            ['Dal Tadka', 180, VEG],
            ['Mushroom Masala', 240, VEG],
            ['Kadai Mushroom', 260, VEG],
            ['Veg Kadai', 200, VEG],
            ['Veg Kolhapuri', 200, VEG],
            ['Green Peas Masala', 180, VEG],
            ['Paneer Chilly', 250, VEG],
        ],
    },
    {
        category: 'FRIED RICE', markup: 60, items: [
            ['Chicken Fried Rice', 200, NON_VEG],
            ['Veg Fried Rice', 180, VEG],
            ['Egg Fried Rice', 190, NON_VEG],
            ['Mixed Fried Rice', 250, NON_VEG],
            ['Prawns Fried Rice', 350, NON_VEG],
            ['Paneer Fried Rice', 250, VEG],
            ['Schezwan Chicken Fried Rice', 250, NON_VEG],
            ['Schezwan Veg Fried Rice', 220, VEG],
            ['Schezwan Egg Fried Rice', 230, NON_VEG],
            ['Schezwan Mixed Fried Rice', 300, NON_VEG],
            ['Schezwan Prawns Fried Rice', 400, NON_VEG],
            ['Schezwan Paneer Fried Rice', 300, VEG],
        ],
    },
    {
        category: 'NOODLES', markup: 60, items: [
            ['Chicken Noodles', 220, NON_VEG],
            ['Veg Noodles', 200, VEG],
            ['Mixed Noodles', 250, NON_VEG],
            ['Prawns Noodles', 300, NON_VEG],
            ['Paneer Noodles', 280, VEG],
            ['Schezwan Chicken Noodles', 270, NON_VEG],
            ['Schezwan Veg Noodles', 250, VEG],
            ['Schezwan Mixed Noodles', 300, NON_VEG],
            ['Schezwan Prawns Noodles', 350, NON_VEG],
            ['Schezwan Paneer Noodles', 330, VEG],
        ],
    },
    {
        category: 'RICE', markup: 60, items: [
            ['White Rice', 120, VEG],
            ['Biriyani Rice', 150, NA],
            ['Jeera Rice', 190, VEG],
            ['Curd Rice', 170, VEG],
            ['Tomato Lemon Rice', 180, VEG],
            ['Mandhi Rice (Quarter)', 120, NA],
        ],
    },
    {
        category: 'BREADS', markup: 60, items: [
            ['Kuboos', 15, VEG],
            ['Tandoor Rotti', 40, VEG],
            ['Butter Rotti', 60, VEG],
            ['Plain Nan', 40, VEG],
            ['Butter Nan', 60, VEG],
            ['Garlic Nan', 70, VEG],
            ['Rumali Rotti', 30, VEG],
        ],
    },
    {
        category: 'SOUPS', markup: 60, items: [
            ['Chicken Soup', 150, NON_VEG],
            ['Veg Soup', 100, VEG],
            ['Sweet Corn Soup', 150, VEG],
            ['Chicken Corn Soup', 170, NON_VEG],
            ['Hot and Sour Soup', 120, VEG],
            ['Hot and Sour Chicken Soup', 150, NON_VEG],
        ],
    },
    {
        category: 'SALADS', markup: 60, items: [
            ['Green Salad', 120, VEG],
            ['Onion Salad', 80, VEG],
            ['Russian Salad', 200, VEG],
            ['Tossed Salad', 150, VEG],
        ],
    },
    {
        category: 'MOJITOS', markup: 0, items: [
            ['Passion Fruit Mojito', 120, NA],
            ['Green Apple Mojito', 120, NA],
            ['Pineapple Mojito', 120, NA],
            ['Blue Berry Mojito', 120, NA],
            ['Grape Mojito', 120, NA],
            ['Water Melon Mojito', 120, NA],
            ['Virgin Mint Mojito', 120, NA],
        ],
    },
    {
        category: 'LIME', markup: 0, items: [
            ['Fresh Lime', 40, NA],
            ['Mint Lime', 50, NA],
            ['Pineapple Lime', 60, NA],
            ['Chocolate Lime', 60, NA],
        ],
    },
    {
        category: 'HOT BEVERAGES', markup: 0, items: [
            ['Black Tea', 20, NA],
            ['Green Tea', 40, NA],
            ['Lemon Tea', 30, NA],
        ],
    },
];

// Final website price. Seasonal items (no printed price) are stored as 0 and shown as "Seasonal"
// on the website; set a price from the admin panel when they are in season.
const buildItems = () =>
    MENU.flatMap(({ category, markup, items }) =>
        items.map(([name, base, isVeg]) => ({
            name,
            category,
            basePrice: base,
            price: base === null ? 0 : base + markup,
            isVeg,
        }))
    );

const printMenu = (items) => {
    let current = '';
    for (const item of items) {
        if (item.category !== current) {
            current = item.category;
            const { markup } = MENU.find((s) => s.category === current);
            console.log(`\n${current}  (+${markup})`);
        }
        const base = item.basePrice === null ? 'seasonal' : item.basePrice;
        const final = item.basePrice === null ? 'seasonal' : `₹${item.price}`;
        console.log(`  ${item.name.padEnd(32)} ${String(base).padStart(8)}  ->  ${final}`);
    }
    console.log(`\n${items.length} items in ${MENU.length} categories`);
};

const seed = async () => {
    const items = buildItems();

    if (process.argv.includes('--dry-run')) {
        printMenu(items);
        return;
    }

    const mongoose = require('mongoose');
    const connectDB = require('./config/db');
    const Restaurant = require('./models/Restaurant');
    const Product = require('./models/Product');

    await connectDB();

    // 1. Back up everything we might delete or replace.
    const backupDir = path.join(__dirname, 'backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `menu-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    const [allRestaurants, allProducts] = await Promise.all([
        Restaurant.find({}).lean(),
        Product.find({}).lean(),
    ]);
    fs.writeFileSync(backupFile, JSON.stringify({ restaurants: allRestaurants, products: allProducts }, null, 2));
    console.log(`Backed up ${allRestaurants.length} restaurants and ${allProducts.length} products to ${backupFile}`);

    // 2. Reuse the restaurant record already in use (so past orders stay linked and its
    //    service-charge settings are kept), renamed to the resort's name. Create it if none exists.
    let restaurant =
        (await Restaurant.findOne({ name: RESTAURANT_NAME })) ||
        (await Restaurant.findOne({ isActive: { $ne: false } }).sort({ updatedAt: -1 }));
    if (!restaurant) {
        restaurant = new Restaurant({ name: RESTAURANT_NAME });
        console.log(`Created restaurant: ${RESTAURANT_NAME}`);
    } else if (restaurant.name !== RESTAURANT_NAME) {
        console.log(`Renaming restaurant "${restaurant.name}" to "${RESTAURANT_NAME}"`);
    }
    restaurant.name = RESTAURANT_NAME;
    restaurant.isActive = true;
    await restaurant.save();

    // 3. Remove every other restaurant and all products that don't belong to this one.
    const others = allRestaurants.filter((r) => String(r._id) !== String(restaurant._id));
    if (others.length) {
        console.log(`Removing other restaurants: ${others.map((r) => r.name).join(', ')}`);
    }
    await Restaurant.deleteMany({ _id: { $ne: restaurant._id } });
    const removedOther = await Product.deleteMany({ restaurant: { $ne: restaurant._id } });
    console.log(`Removed ${removedOther.deletedCount} products from other menus.`);

    // 4. Replace the menu.
    await Product.deleteMany({ restaurant: restaurant._id });
    await Product.insertMany(
        items.map(({ name, category, price, isVeg }) => ({
            name,
            category,
            price,
            isVeg,
            imageUrl: '',
            isAvailable: true,
            restaurant: restaurant._id,
        }))
    );
    console.log(`Loaded ${items.length} menu items for ${RESTAURANT_NAME}.`);

    await mongoose.disconnect();
};

seed().catch((error) => {
    console.error(`Error seeding the menu: ${error.message}`);
    process.exit(1);
});
