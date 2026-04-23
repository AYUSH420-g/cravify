const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const authMiddleware = require('../middleware/auth');

// Restrict to delivery partners
const deliveryMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'delivery_partner') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Delivery Partners only.' });
    }
};

// Apply auth & role requirements to all routes inside
router.use(authMiddleware, deliveryMiddleware);

// Get available orders
router.get('/available', deliveryController.getAvailableOrders);

// Accept an order
router.put('/orders/:id/accept', deliveryController.acceptOrder);

// Get active order
router.get('/active', deliveryController.getActiveOrder);

// Update order status (OutForDelivery, Delivered)
router.put('/orders/:id/status', deliveryController.updateOrderStatus);

// Update online status
router.put('/online-status', deliveryController.toggleOnlineStatus);

// Get completion history and earnings
router.get('/history', deliveryController.getHistoryAndEarnings);

module.exports = router;
