const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Restrict to vendors
const vendorMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'restaurant_partner') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Vendor only.' });
    }
};

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'menu-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Dashboard overview
router.get('/dashboard', authMiddleware, vendorMiddleware, vendorController.getDashboardData);

// Update status
router.put('/status', authMiddleware, vendorMiddleware, vendorController.toggleStatus);

// Menu management
router.get('/menu', authMiddleware, vendorMiddleware, vendorController.getMenu);
router.post('/menu', authMiddleware, vendorMiddleware, upload.single('image'), vendorController.addMenuItem);
router.put('/menu/:id', authMiddleware, vendorMiddleware, upload.single('image'), vendorController.updateMenuItem);
router.delete('/menu/:id', authMiddleware, vendorMiddleware, vendorController.deleteMenuItem);

// Order management
router.get('/orders', authMiddleware, vendorMiddleware, vendorController.getOrders);
router.put('/orders/:id/status', authMiddleware, vendorMiddleware, vendorController.updateOrderStatus);

module.exports = router;
