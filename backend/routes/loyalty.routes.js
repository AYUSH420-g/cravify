const express = require('express');
const router = express.Router();
const loyaltyController = require('../controllers/loyaltyController');
const authMiddleware = require('../middleware/auth');

router.get('/balance', authMiddleware, loyaltyController.getBalance);

module.exports = router;
