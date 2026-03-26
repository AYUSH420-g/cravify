const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const auth = require('../middleware/auth');

// All delivery routes should be protected by auth middleware
// Note: We might want a role check here too, but auth middleware gives us req.user

router.get('/profile', auth, deliveryController.getProfile);
router.put('/profile/status', auth, deliveryController.toggleOnline);

router.get('/tasks/available', auth, deliveryController.getAvailableTasks);
router.get('/tasks/active', auth, deliveryController.getActiveTask);
router.put('/tasks/:taskId/accept', auth, deliveryController.acceptTask);
router.put('/tasks/:taskId/status', auth, deliveryController.updateTaskStatus);

router.get('/history', auth, deliveryController.getHistory);

module.exports = router;
