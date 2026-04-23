const User = require('../models/User');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');

// Get loyalty balance + recent transactions
exports.getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('loyaltyPoints totalPointsEarned name');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const recentTransactions = await LoyaltyTransaction.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('order', 'totalAmount status createdAt');

        // Determine tier
        let tier = 'Bronze';
        if (user.totalPointsEarned >= 500) tier = 'Gold';
        else if (user.totalPointsEarned >= 200) tier = 'Silver';

        res.json({
            points: user.loyaltyPoints,
            totalEarned: user.totalPointsEarned,
            tier,
            nextTier: tier === 'Gold' ? null : tier === 'Silver' ? { name: 'Gold', pointsNeeded: 500 - user.totalPointsEarned } : { name: 'Silver', pointsNeeded: 200 - user.totalPointsEarned },
            transactions: recentTransactions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch loyalty balance' });
    }
};

// Credit loyalty points after delivery (called internally)
exports.creditPointsForOrder = async (orderId) => {
    try {
        const Order = require('../models/Order');
        const order = await Order.findById(orderId);
        if (!order || order.loyaltyPointsEarned <= 0) return;

        // Already credited check
        const existing = await LoyaltyTransaction.findOne({ order: orderId, type: 'earn' });
        if (existing) return;

        const pointsToCredit = order.loyaltyPointsEarned;

        const user = await User.findByIdAndUpdate(
            order.user,
            {
                $inc: {
                    loyaltyPoints: pointsToCredit,
                    totalPointsEarned: pointsToCredit
                }
            },
            { new: true }
        );

        await LoyaltyTransaction.create({
            user: order.user,
            type: 'earn',
            points: pointsToCredit,
            order: orderId,
            description: `Earned ${pointsToCredit} points from order`,
            balanceAfter: user.loyaltyPoints
        });

        console.log(`Credited ${pointsToCredit} loyalty points to user ${order.user}`);
    } catch (err) {
        console.error('Failed to credit loyalty points:', err);
    }
};
