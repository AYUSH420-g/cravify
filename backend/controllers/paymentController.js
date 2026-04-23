const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create a Razorpay order for checkout
exports.createOrder = async (req, res) => {
    try {
        const { amount, orderId, loyaltyPointsToRedeem } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        let finalAmount = amount; // in rupees
        let loyaltyDiscount = 0;
        let pointsUsed = 0;

        // Handle loyalty points redemption
        if (loyaltyPointsToRedeem && loyaltyPointsToRedeem > 0) {
            const user = await User.findById(req.user.id);
            if (!user) return res.status(404).json({ message: 'User not found' });

            // Validate points
            const maxRedeemable = Math.min(
                user.loyaltyPoints,
                Math.floor(finalAmount * 0.5) // max 50% of order
            );
            pointsUsed = Math.min(loyaltyPointsToRedeem, maxRedeemable);
            loyaltyDiscount = pointsUsed; // 1 point = ₹1

            finalAmount = Math.max(1, finalAmount - loyaltyDiscount); // min ₹1 for Razorpay
        }

        // Mock Payment Check (For local testing without Razorpay keys)
        if (process.env.MOCK_PAYMENT === 'true') {
            if (process.env.NODE_ENV === 'production') {
                console.error('MOCK_PAYMENT cannot be enabled in production');
                return res.status(500).json({ message: 'Payment configuration error' });
            }
            const mockOrderId = `mock_order_${Date.now()}`;
            const payment = new Payment({
                user: req.user.id,
                order: orderId || null,
                amount: Math.round(finalAmount * 100),
                razorpayOrderId: mockOrderId,
                loyaltyPointsUsed: pointsUsed,
                loyaltyDiscount: loyaltyDiscount,
                status: 'Created'
            });
            await payment.save();

            return res.json({
                orderId: mockOrderId,
                amount: Math.round(finalAmount * 100),
                currency: 'INR',
                paymentId: payment._id,
                loyaltyDiscount,
                pointsUsed,
                key: 'mock_key_id'
            });
        }

        // Create Razorpay order (amount in paise)
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(finalAmount * 100),
            currency: 'INR',
            receipt: `order_${Date.now()}`,
            notes: {
                userId: req.user.id,
                loyaltyPointsUsed: pointsUsed,
                loyaltyDiscount: loyaltyDiscount
            }
        });

        // Create payment record
        const payment = new Payment({
            user: req.user.id,
            order: orderId || null,
            amount: Math.round(finalAmount * 100),
            razorpayOrderId: razorpayOrder.id,
            loyaltyPointsUsed: pointsUsed,
            loyaltyDiscount: loyaltyDiscount,
            status: 'Created'
        });
        await payment.save();

        res.json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            paymentId: payment._id,
            loyaltyDiscount,
            pointsUsed,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('Razorpay order creation failed:', err);
        res.status(500).json({ message: 'Failed to create payment order' });
    }
};

// Verify Razorpay payment signature and finalize
exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            paymentId,
            orderData
        } = req.body;
        let { razorpay_payment_id, razorpay_signature } = req.body;

        // Mock payment testing flow
        if (process.env.MOCK_PAYMENT === 'true') {
            if (process.env.NODE_ENV === 'production') {
                console.error('MOCK_PAYMENT cannot be enabled in production');
                return res.status(500).json({ message: 'Payment configuration error' });
            }
            // 15% random failure rate in mock mode
            const isFailure = Math.random() < 0.15;
            if (isFailure) {
                await Payment.findByIdAndUpdate(paymentId, { status: 'Failed' });
                return res.status(400).json({ message: 'Simulated mock payment failure (15% chance). Please try again.' });
            }
            // If mock success, we skip real signature checks and proceed to place the order
            razorpay_signature = 'mock_signature';
            razorpay_payment_id = `mock_payment_${Date.now()}`;
        } else {
            // Verify signature using HMAC SHA256 for real Razorpay
            const body = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(body)
                .digest('hex');

            if (expectedSignature !== razorpay_signature) {
                // Mark payment as failed
                await Payment.findByIdAndUpdate(paymentId, { status: 'Failed' });
                return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
            }
        }

        // Update payment record
        const payment = await Payment.findByIdAndUpdate(paymentId, {
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: 'Paid'
        }, { new: true });

        // Now place the actual order
        const { restaurantId, items, deliveryAddress, deliveryLocation, paymentMethod, loyaltyPointsUsed } = orderData;

        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const deliveryFee = 40;
        const platformFee = 5;
        const gst = Math.round(totalAmount * 0.05);
        const grossTotal = totalAmount + deliveryFee + platformFee + gst;
        const loyaltyDiscount = payment.loyaltyDiscount || 0;
        const finalTotal = Math.max(1, grossTotal - loyaltyDiscount);

        // Calculate loyalty points to earn (1 per ₹10 spent on food)
        const pointsEarned = Math.floor(totalAmount / 10);

        const order = new Order({
            user: req.user.id,
            restaurant: restaurantId,
            items,
            totalAmount: finalTotal,
            deliveryAddress,
            deliveryLocation: deliveryLocation?.lat && deliveryLocation?.lng
                ? { lat: deliveryLocation.lat, lng: deliveryLocation.lng }
                : undefined,
            paymentMethod: 'Razorpay',
            paymentStatus: 'Paid',
            payment: payment._id,
            loyaltyPointsUsed: loyaltyPointsUsed || 0,
            loyaltyPointsEarned: pointsEarned
        });
        await order.save();

        // Link payment to order
        payment.order = order._id;
        await payment.save();

        // Deduct loyalty points if used
        if (loyaltyPointsUsed && loyaltyPointsUsed > 0) {
            const user = await User.findById(req.user.id);
            user.loyaltyPoints -= loyaltyPointsUsed;
            await user.save();

            await LoyaltyTransaction.create({
                user: req.user.id,
                type: 'redeem',
                points: loyaltyPointsUsed,
                order: order._id,
                description: `Redeemed ${loyaltyPointsUsed} points for ₹${loyaltyDiscount} discount`,
                balanceAfter: user.loyaltyPoints
            });
        }

        // Notify restaurant vendor via socket (consistent with COD flow)
        const io = req.app.get('io');
        const restaurant = await Restaurant.findById(restaurantId).select('vendor').lean();
        const populatedOrder = await Order.findById(order._id)
            .populate('restaurant', 'name image address location')
            .populate('user', 'name phone')
            .lean();
        
        if (io && restaurant?.vendor) {
            io.to(`user_${restaurant.vendor}`).emit('new_order', populatedOrder);
        }

        res.status(201).json({ 
            message: 'Payment verified & order placed!', 
            order: populatedOrder,
            pointsEarned
        });
    } catch (err) {
        console.error('Payment verification error:', err);
        res.status(500).json({ message: 'Payment verification failed' });
    }
};

// Get payment history for a user
exports.getPaymentHistory = async (req, res) => {
    try {
        const payments = await Payment.find({ user: req.user.id, status: 'Paid' })
            .populate('order', 'items totalAmount status createdAt')
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(payments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch payment history' });
    }
};
