const mongoose = require('mongoose');

const DeliveryProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
        lat: { type: Number, default: 23.0225 },
        lng: { type: Number, default: 72.5714 }
    },
    totalEarnings: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryProfile', DeliveryProfileSchema);
