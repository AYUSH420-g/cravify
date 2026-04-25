const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    // Singleton pattern — only one document ever exists
    _id: { type: String, default: 'platform_settings' },
    platformFee: { type: Number, default: 5 },
    referralBonus: { type: Number, default: 10 },
    supportEmail: { type: String, default: 'support@cravify.com' },
    maintenanceMode: { type: Boolean, default: false },
    globalBroadcastMessage: { type: String, default: '' },
    autoApproveRestaurants: { type: Boolean, default: false }
}, { timestamps: true });

// Helper to always get/create the single settings doc
SettingsSchema.statics.getInstance = async function () {
    let settings = await this.findById('platform_settings');
    if (!settings) {
        settings = await this.create({ _id: 'platform_settings' });
    }
    return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);
