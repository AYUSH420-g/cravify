const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    items: [{
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    // Fee breakdown for transparency
    itemTotal: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    platformFee: { type: Number, default: 5 },
    gst: { type: Number, default: 0 },
    offerDiscount: { type: Number, default: 0 },
    offerCode: { type: String, default: '' },
    distanceKm: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Placed', 'Preparing', 'ReadyForPickup', 'OutForDelivery', 'Delivered', 'Cancelled', 'Rejected'],
        default: 'Placed'
    },
    rejectionReason: { type: String },
    deliveryAddress: {
        street: String,
        city: String,
        zip: String
    },
    // Pincodes for distance-based delivery
    restaurantPincode: { type: String },
    deliveryPincode: { type: String },
    deliveryLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    riderCurrentLocation: {
        lat: { type: Number },
        lng: { type: Number }
    },
    paymentMethod: { type: String, enum: ['Card', 'UPI', 'COD', 'Razorpay'], default: 'COD' },
    paymentStatus: { 
        type: String, 
        enum: ['Pending', 'Paid', 'Failed', 'COD'], 
        default: 'Pending' 
    },
    payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    loyaltyPointsUsed: { type: Number, default: 0 },
    loyaltyPointsEarned: { type: Number, default: 0 },
    deliveryEarning: { type: Number, default: 0 },
    restaurantRating: { type: Number, min: 1, max: 5 },
    deliveryRating: { type: Number, min: 1, max: 5 },
    ratingComment: { type: String },
    // Whether the customer has been prompted to review
    reviewPrompted: { type: Boolean, default: false }
}, { timestamps: true });

OrderSchema.index({ user: 1, status: 1 });
OrderSchema.index({ restaurant: 1, status: 1 });
OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
