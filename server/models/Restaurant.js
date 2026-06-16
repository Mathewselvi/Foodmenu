const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        serviceChargeEnabled: {
            type: Boolean,
            default: true,
        },
        serviceChargeAmount: {
            type: Number,
            default: 500,
        },
    },
    {
        timestamps: true,
    }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
