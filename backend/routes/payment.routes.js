const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/verify', authMiddleware, paymentController.verifyPayment);
router.get('/history', authMiddleware, paymentController.getPaymentHistory);
router.post('/wallet/topup', authMiddleware, paymentController.createWalletTopUp);
router.post('/wallet/verify', authMiddleware, paymentController.verifyWalletTopUp);

module.exports = router;
