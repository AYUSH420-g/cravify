const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional for OAuth
    resetPasswordToken: String,
    resetPasswordExpire: Date,
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
    isVerified: { type: Boolean, default: false },
    restaurantDetails: {
        restaurantName: String,
        address: String,
        cuisine: String,
        fssai: String,
        documents: {
            fssaiCertUrl: String,
            gstCertUrl: String,
            menuCardUrl: String,
        }
    },
    deliveryDetails: {
        isOnline: { type: Boolean, default: false },
        city: String,
        vehicleType: String,
        vehicleNumber: String,
        documents: {
            licenseUrl: String,
            rcUrl: String,
            aadharUrl: String
        }
    },
    // Real-time tracking
    lastKnownLocation: {
        lat: { type: Number, default: 23.0225 }, // Default to Ahmedabad
        lng: { type: Number, default: 72.5714 }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
