const mongoose = require('mongoose');

const LoyaltyTransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['earn', 'redeem'], required: true },
    points: { type: Number, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    description: { type: String, required: true },
    balanceAfter: { type: Number, required: true } // snapshot of balance after this txn
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyTransaction', LoyaltyTransactionSchema);
