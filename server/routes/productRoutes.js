const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.restaurantId) {
            query.restaurant = req.query.restaurantId;
        }
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
    try {
        const { name, price, category, isAvailable, restaurant, imageUrl } = req.body;
        const product = new Product({
            name,
            price,
            category,
            isAvailable,
            restaurant,
            imageUrl
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, price, category, isAvailable, restaurant, imageUrl } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.category = category || product.category;
            product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;
            if (restaurant) product.restaurant = restaurant;
            if (imageUrl !== undefined) product.imageUrl = imageUrl;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
