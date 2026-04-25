const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true }, // in paise (100 = ₹1)
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: ['UPI', 'Card', 'COD', 'Wallet'], default: 'Card' },
    status: {
        type: String,
        enum: ['Created', 'Paid', 'Failed', 'Refunded'],
        default: 'Created'
    },
    // Razorpay specific
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    // Discount details
    loyaltyPointsUsed: { type: Number, default: 0 },
    loyaltyDiscount: { type: Number, default: 0 } // in rupees
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
