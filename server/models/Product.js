const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            default: '',
        },

        isAvailable: {
            type: Boolean,
            default: true,
        },
        // true = veg, false = non-veg, null = no marker (drinks, or not specified)
        isVeg: {
            type: Boolean,
            default: null,
        },
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
