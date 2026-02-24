const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    addresses: [{
        street: String,
        city: String,
        zip: String,
        type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' }
    }],
    role: {
        type: String,
        enum: ['customer', 'restaurant_partner', 'delivery_partner', 'admin'],
        default: 'customer'
    },
    // For partners
    isVerified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
