const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const { protect } = require('../middleware/authMiddleware');

// Get all restaurants
router.get('/', async (req, res) => {
    try {
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new restaurant (Private)
router.post('/', protect, async (req, res) => {
    try {
        const { name } = req.body;
        const restaurant = new Restaurant({ name });
        const createdRestaurant = await restaurant.save();
        res.status(201).json(createdRestaurant);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a restaurant (Private)
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const restaurant = await Restaurant.findById(req.params.id);

        if (restaurant) {
            restaurant.name = name || restaurant.name;
            if (isActive !== undefined) {
                restaurant.isActive = isActive;
            }

            const updatedRestaurant = await restaurant.save();
            res.json(updatedRestaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a restaurant (Private)
router.delete('/:id', protect, async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);

        if (restaurant) {
            await restaurant.deleteOne();
            res.json({ message: 'Restaurant removed' });
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
