const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

router.post('/register-vendor', upload.fields([
    { name: 'fssaiCert', maxCount: 1 },
    { name: 'gstCert', maxCount: 1 },
    { name: 'menuCard', maxCount: 1 }
]), authController.registerVendor);

router.post('/register-rider', upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'rc', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 }
]), authController.registerRider);
// @route   POST api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authController.login);

// @route   POST api/auth/google
// @desc    Google OAuth login
// @access  Public
router.post('/google', authController.googleLogin);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authMiddleware, authController.getProfile);

// @route   POST api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', authController.forgotPassword);

// @route   PUT api/auth/reset-password/:token
// @desc    Reset password using email token
// @access  Public
router.put('/reset-password/:token', authController.resetPasswordWithToken);

module.exports = router;
