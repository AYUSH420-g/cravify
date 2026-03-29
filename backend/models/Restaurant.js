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
    name: { type: String, required: true },
    image: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cuisines: [String],
    rating: { type: Number, default: 0 },
    deliveryTime: String,
    priceForTwo: String,
    offer: String,
    address: String,
    menu: [MenuItemSchema]
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
