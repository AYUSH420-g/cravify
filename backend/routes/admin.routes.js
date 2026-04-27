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
        const partnerCount = await User.countDocuments({ role: 'restaurant_partner', isVerified: true });
        const deliveryCount = await User.countDocuments({ role: 'delivery_partner', isVerified: true });
        const orderCount = await Order.countDocuments();
        
        // Count unapproved for quick action indicators (optional but good for future)
        const unapprovedRestaurants = await User.countDocuments({ role: 'restaurant_partner', isVerified: false });
        const unapprovedRiders = await User.countDocuments({ role: 'delivery_partner', isVerified: false });

        // Calculate detailed revenue from delivered orders
        const revenueStats = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { 
                $group: { 
                    _id: null, 
                    totalPlatformFees: { $sum: '$platformFee' },
                    totalGST: { $sum: '$gst' },
                    totalDiscounts: { $sum: '$offerDiscount' },
                    totalAmount: { $sum: '$totalAmount' }
                } 
            }
        ]);

        const stats = revenueStats.length > 0 ? revenueStats[0] : {
            totalPlatformFees: 0,
            totalGST: 0,
            totalDiscounts: 0,
            totalAmount: 0
        };

        // Revenue for the platform = Platform Fees + GST - (Discounts if covered by platform)
        // User said: "Total Revenue = Platform Fees + GST - Discounts"
        const netRevenue = stats.totalPlatformFees + stats.totalGST - stats.totalDiscounts;

        res.json({
            users: userCount,
            restaurants: partnerCount,
            riders: deliveryCount,
            orders: orderCount,
            revenue: netRevenue,
            breakdown: {
                platformFees: stats.totalPlatformFees,
                gst: stats.totalGST,
                discounts: stats.totalDiscounts
            }
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
        const users = await User.find().select('-password').lean();
        const restaurants = await Restaurant.find().select('vendor').lean();
        
        // Map restaurant ID to each user if they are a restaurant partner
        const usersWithRest = users.map(user => {
            if (user.role === 'restaurant_partner') {
                const rest = restaurants.find(r => r.vendor.toString() === user._id.toString());
                return { ...user, restaurantId: rest ? rest._id : null };
            }
            return user;
        });

        res.json(usersWithRest);
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

// @route   GET api/admin/settings/public
// @desc    Get non-sensitive platform settings
// @access  Public
router.get('/settings/public', adminController.getPublicSettings);

// @route   GET api/admin/settings
// @desc    Get platform settings
// @access  Admin
router.get('/settings', authMiddleware, roleAuth('admin'), adminController.getSettings);

// @route   PUT api/admin/settings
// @desc    Update platform settings
// @access  Admin
router.put('/settings', authMiddleware, roleAuth('admin'), adminController.updateSettings);

// @route   POST api/admin/broadcast
router.post('/broadcast', authMiddleware, roleAuth('admin'), adminController.broadcastMessage);

// @route   POST api/admin/maintenance
router.post('/maintenance', authMiddleware, roleAuth('admin'), adminController.toggleMaintenanceMode);

module.exports = router;
