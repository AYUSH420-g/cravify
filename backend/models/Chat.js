const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'restaurant_partner', 'delivery_partner'], required: true },
    text: { type: String, required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

ChatMessageSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);
