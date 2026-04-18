const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const authMiddleware = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const adminController = require('../controllers/adminController');

// @route   GET api/admin/stats
// @desc    Get system-wide statistics (real data)
// @access  Admin
router.get('/stats', authMiddleware, roleAuth('admin'), async (req, res) => {
    try {
        const userCount = await User.countDocuments({ role: 'customer' });
        const partnerCount = await User.countDocuments({ role: 'restaurant_partner' });
        const deliveryCount = await User.countDocuments({ role: 'delivery_partner' });
        const orderCount = await Order.countDocuments();

        // Sum revenue from delivered orders
        const revenueResult = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const revenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        res.json({
            users: userCount,
            restaurants: partnerCount,
            riders: deliveryCount,
            orders: orderCount,
            revenue
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', authMiddleware, roleAuth('admin'), async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/pending-approvals
router.get('/pending-approvals', authMiddleware, roleAuth('admin'), adminController.getPendingApprovals);

// @route   PUT api/admin/approve/:id
router.put('/approve/:id', authMiddleware, roleAuth('admin'), adminController.approveUser);

// @route   DELETE api/admin/reject/:id
router.delete('/reject/:id', authMiddleware, roleAuth('admin'), adminController.rejectUser);

// @route   GET api/admin/orders
// @desc    Get all platform orders
// @access  Admin
router.get('/orders', authMiddleware, roleAuth('admin'), adminController.getAllOrders);

// @route   PUT api/admin/orders/:id/cancel
// @desc    Cancel an order
// @access  Admin
router.put('/orders/:id/cancel', authMiddleware, roleAuth('admin'), adminController.cancelOrder);

// @route   GET api/admin/restaurants
// @desc    Get all restaurants
// @access  Admin
router.get('/restaurants', authMiddleware, roleAuth('admin'), adminController.getAllRestaurants);

// @route   GET api/admin/settings
// @desc    Get platform settings
// @access  Admin
router.get('/settings', authMiddleware, roleAuth('admin'), adminController.getSettings);

// @route   PUT api/admin/settings
// @desc    Update platform settings
// @access  Admin
router.put('/settings', authMiddleware, roleAuth('admin'), adminController.updateSettings);

module.exports = router;
