const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    // Using a singleton design pattern by assigning a hardcoded check
    singletonId: { type: String, default: 'admin_config', unique: true },
    platformFee: { type: Number, default: 5 },
    referralBonus: { type: Number, default: 10 },
    supportEmail: { type: String, default: 'support@cravify.com' },
    maintenanceMode: { type: Boolean, default: false },
    autoApproveRestaurants: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
