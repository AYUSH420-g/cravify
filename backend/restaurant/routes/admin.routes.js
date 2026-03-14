const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

// Middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// @route   GET api/admin/stats
// @desc    Get system-wide statistics
// @access  Admin
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const userCount = await User.countDocuments({ role: 'customer' });
        const partnerCount = await User.countDocuments({ role: 'restaurant_partner' });
        const deliveryCount = await User.countDocuments({ role: 'delivery_partner' });

        res.json({
            users: userCount,
            restaurants: partnerCount,
            riders: deliveryCount,
            orders: 0, // Placeholder until Order model is ready
            revenue: 0 // Placeholder
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Admin
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
