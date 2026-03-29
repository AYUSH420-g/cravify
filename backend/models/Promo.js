const mongoose = require('mongoose');

const PromoSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountValue: { type: Number, default: null }, // Null means no limit
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Promo', PromoSchema);
