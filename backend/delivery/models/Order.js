const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Placed', 'Preparing', 'OutForDelivery', 'Delivered', 'Cancelled'],
        default: 'Placed'
    },
    deliveryAddress: {
        street: String,
        city: String,
        zip: String
    },
    paymentMethod: { type: String, enum: ['Card', 'UPI', 'COD'], default: 'Card' }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
