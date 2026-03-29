const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware to check if user is admin
const adminMiddleware = async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

// Protect all admin routes
router.use(authMiddleware, adminMiddleware);

// Dashboard Statistics
router.get('/stats', adminController.getDashboardStats);

// User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.toggleUserStatus);

// Restaurant Partner Management
router.get('/restaurants', adminController.getRestaurants);
router.put('/restaurants/:id/status', adminController.updateRestaurantStatus);

// Delivery Partner Management 
router.get('/delivery-partners', adminController.getDeliveryPartners);
router.put('/delivery-partners/:id/status', adminController.updateDeliveryPartnerStatus);

// Order Monitoring
router.get('/orders', adminController.getOrders);
router.put('/orders/:id/cancel', adminController.cancelOrder);

// Platform Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Promotional Campaigns
router.get('/promos', adminController.getPromos);
router.post('/promos', adminController.createPromo);
router.put('/promos/:id/toggle', adminController.togglePromoStatus);
router.delete('/promos/:id', adminController.deletePromo);

module.exports = router;
