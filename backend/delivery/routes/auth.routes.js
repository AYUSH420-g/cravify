const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
