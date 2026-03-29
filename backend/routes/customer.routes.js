const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/auth');

// ==========================================
// Public Routes (No auth required)
// ==========================================

// @route   GET api/customer/restaurants
// @desc    Browse all restaurants (with optional search/filter)
// @access  Public
router.get('/restaurants', customerController.getRestaurants);

// @route   GET api/customer/restaurants/:id
// @desc    Get a single restaurant with its menu
// @access  Public
router.get('/restaurants/:id', customerController.getRestaurantById);

// ==========================================
// Protected Routes (Auth required)
// ==========================================

// @route   POST api/customer/orders
// @desc    Place a new food order
// @access  Private (Customer)
router.post('/orders', authMiddleware, customerController.placeOrder);

// @route   GET api/customer/orders
// @desc    Get current user's order history
// @access  Private (Customer)
router.get('/orders', authMiddleware, customerController.getOrders);

// @route   GET api/customer/orders/:id
// @desc    Get a specific order by ID
// @access  Private (Customer)
router.get('/orders/:id', authMiddleware, customerController.getOrderById);

// @route   PUT api/customer/profile
// @desc    Update user profile and delivery addresses
// @access  Private (Customer)
router.put('/profile', authMiddleware, customerController.updateProfile);

module.exports = router;
