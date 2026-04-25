const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FileType = require('file-type');

// Use memory storage for ImageKit uploads
const storage = multer.memoryStorage();
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

// Basic filter for initial check (will be validated again after upload)
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
    }
};

// Middleware to validate actual file content after upload
const validateFileContent = async (req, res, next) => {
    if (!req.files) return next();
    
    for (const fieldName of Object.keys(req.files)) {
        for (const file of req.files[fieldName]) {
            const fileType = await FileType(file.buffer);
            if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
                return res.status(400).json({ 
                    message: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' 
                });
            }
        }
    }
    next();
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter
});

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

router.post('/register-vendor', upload.fields([
    { name: 'restaurantImage', maxCount: 1 },
    { name: 'fssaiCert', maxCount: 1 },
    { name: 'gstCert', maxCount: 1 },
    { name: 'menuCard', maxCount: 1 }
]), validateFileContent, authController.registerVendor);

router.post('/register-rider', upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'rc', maxCount: 1 },
    { name: 'aadhar', maxCount: 1 }
]), validateFileContent, authController.registerRider);
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

// @route   PUT api/auth/theme
// @access  Private
router.put('/theme', authMiddleware, authController.updateTheme);

module.exports = router;
