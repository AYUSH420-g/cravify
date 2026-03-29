const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/auth');

// Middleware: check that the user is a restaurant_partner
const vendorMiddleware = (req, res, next) => {
    if (req.user.role !== 'restaurant_partner') {
        return res.status(403).json({ message: 'Access denied. Restaurant partners only.' });
    }
    next();
};

// All vendor routes require auth + vendor role
router.use(authMiddleware, vendorMiddleware);

// ==========================================
// Restaurant Profile
// ==========================================

// @route   GET api/vendor/profile
// @desc    Get restaurant profile for current vendor
// @access  Private (Vendor)
router.get('/profile', vendorController.getProfile);

// @route   PUT api/vendor/profile
// @desc    Update restaurant profile
// @access  Private (Vendor)
router.put('/profile', vendorController.updateProfile);

// ==========================================
// Menu Management
// ==========================================

// @route   GET api/vendor/menu
// @desc    Get all menu items
// @access  Private (Vendor)
router.get('/menu', vendorController.getMenu);

// @route   POST api/vendor/menu
// @desc    Add a new menu item
// @access  Private (Vendor)
router.post('/menu', vendorController.addMenuItem);

// @route   PUT api/vendor/menu/:itemId
// @desc    Update a specific menu item
// @access  Private (Vendor)
router.put('/menu/:itemId', vendorController.updateMenuItem);

// @route   DELETE api/vendor/menu/:itemId
// @desc    Delete a specific menu item
// @access  Private (Vendor)
router.delete('/menu/:itemId', vendorController.deleteMenuItem);

// ==========================================
// Order Management
// ==========================================

// @route   GET api/vendor/orders
// @desc    Get all orders for this restaurant
// @access  Private (Vendor)
router.get('/orders', vendorController.getOrders);

// @route   PUT api/vendor/orders/:id/status
// @desc    Update order status (Preparing, OutForDelivery, Cancelled)
// @access  Private (Vendor)
router.put('/orders/:id/status', vendorController.updateOrderStatus);

module.exports = router;
