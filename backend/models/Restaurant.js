const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: String,
    isVeg: { type: Boolean, default: true },
    category: String,
    isBestseller: { type: Boolean, default: false }
});

const RestaurantSchema = new mongoose.Schema({
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isOnline: { type: Boolean, default: false },
    name: { type: String, required: true },
    image: { type: String },
    cuisines: [String],
    rating: { type: Number, default: 0 },
    deliveryTime: String,
    priceForTwo: String,
    offer: String,
    address: String,
    location: {
        lat: { type: Number, default: 23.0225 },
        lng: { type: Number, default: 72.5714 }
    },
    menu: [MenuItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
