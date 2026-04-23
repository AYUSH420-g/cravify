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
        type: { type: String, enum: ['Home', 'Work', 'Other'], default: 'Home' },
        location: {
            lat: { type: Number },
            lng: { type: Number }
        }
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
        imageUrl: String,
        location: {
            lat: { type: Number },
            lng: { type: Number }
        },
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
    // Real-time tracking — no defaults; only set when real GPS data is received
    lastKnownLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    // Loyalty system
    loyaltyPoints: { type: Number, default: 0 },
    totalPointsEarned: { type: Number, default: 0 },
    // Delivery partner wallet
    walletBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    deliveryRating: { type: Number, default: 0 },
    numDeliveryRatings: { type: Number, default: 0 }
}, { timestamps: true });

// email index already created by `unique: true` — no need to duplicate
UserSchema.index({ role: 1 });

module.exports = mongoose.model('User', UserSchema);
