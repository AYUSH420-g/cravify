const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/auth');

// Public routes (no login needed to browse)
router.get('/restaurants', customerController.getRestaurants);
router.get('/restaurants/:id', customerController.getRestaurantById);
router.get('/offers', customerController.getOffers);

// Protected routes
router.post('/orders', authMiddleware, customerController.placeOrder);
router.post('/calculate-fees', authMiddleware, customerController.calculateFees);
router.get('/orders', authMiddleware, customerController.getMyOrders);
router.get('/orders/active', authMiddleware, customerController.getActiveOrder);
router.get('/order-details/:id', authMiddleware, customerController.getOrderDetails);
router.get('/profile', authMiddleware, customerController.getProfile);
router.post('/addresses', authMiddleware, customerController.addAddress);
router.delete('/addresses/:id', authMiddleware, customerController.deleteAddress);
router.post('/orders/:id/rate', authMiddleware, customerController.submitOrderRating);

module.exports = router;
