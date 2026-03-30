const mongoose = require('mongoose');

const DeliveryTaskSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'arrived_at_restaurant', 'picked_up', 'arrived_at_customer', 'delivered', 'cancelled'],
        default: 'pending'
    },
    earnings: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryTask', DeliveryTaskSchema);
