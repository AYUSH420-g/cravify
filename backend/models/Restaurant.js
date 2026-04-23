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
    numRatings: { type: Number, default: 0 },
    deliveryTime: String,
    priceForTwo: String,
    offer: String,
    address: String,
    pincode: { type: String },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
    menu: [MenuItemSchema]
}, { timestamps: true });

RestaurantSchema.index({ isOnline: 1, _id: 1 });
RestaurantSchema.index({ name: 'text', cuisines: 'text' });

module.exports = mongoose.model('Restaurant', RestaurantSchema);
