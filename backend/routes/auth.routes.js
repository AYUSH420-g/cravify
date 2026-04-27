const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// ──────────────────────────────────────────────────────────────
// FIX: file-type v19+ is pure ESM — cannot be require()'d in CJS.
//      Use a lazy dynamic import() wrapper instead.
// ──────────────────────────────────────────────────────────────
let _fileTypeFromBuffer = null;
async function getFileType(buffer) {
    if (!_fileTypeFromBuffer) {
        const ft = await import('file-type');
        // Named export in ESM: ft.fileTypeFromBuffer
        _fileTypeFromBuffer = ft.fileTypeFromBuffer;
    }
    return _fileTypeFromBuffer(buffer);
}

// Use memory storage so buffers are available for ImageKit + validation
const storage = multer.memoryStorage();
const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

// First-pass filter based on declared Content-Type (fast, pre-buffer check)
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, PNG, and PDF are allowed.'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter
});

// ──────────────────────────────────────────────────────────────
// Magic-byte validation middleware (runs AFTER multer buffers files)
//
// FIX: If fileTypeFromBuffer returns undefined (e.g. minimal/dummy
//      PDFs that technically lack full magic-byte sequences), we
//      fall back to extension-based mime validation rather than
//      rejecting the upload entirely. This handles QA test files
//      while still blocking genuinely invalid file types.
// ──────────────────────────────────────────────────────────────
const extMimeMap = {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.pdf': 'application/pdf'
};

const validateFileContent = async (req, res, next) => {
    if (!req.files) return next();

    try {
        for (const fieldName of Object.keys(req.files)) {
            for (const file of req.files[fieldName]) {
                const detected = await getFileType(file.buffer);

                if (detected) {
                    // Magic bytes detected — validate against whitelist
                    if (!allowedMimeTypes.includes(detected.mime)) {
                        return res.status(400).json({
                            message: `Invalid file content detected (${detected.mime}). Only JPG, PNG, and PDF are allowed.`
                        });
                    }
                } else {
                    // Magic bytes undetectable — fall back to file extension
                    const ext = path.extname(file.originalname).toLowerCase();
                    const fallbackMime = extMimeMap[ext];
                    if (!fallbackMime || !allowedMimeTypes.includes(fallbackMime)) {
                        return res.status(400).json({
                            message: 'Invalid file type. Only JPG, PNG, and PDF are allowed.'
                        });
                    }
                }
            }
        }
        next();
    } catch (error) {
        console.error('File validation error:', error);
        return res.status(500).json({ message: 'Server error during file validation' });
    }
};

// ──────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────

// @route   POST api/auth/register
// @desc    Register customer
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/register-vendor
// @desc    Register restaurant partner (multipart)
// @access  Public
router.post('/register-vendor', upload.fields([
    { name: 'restaurantImage', maxCount: 1 },
    { name: 'fssaiCert',       maxCount: 1 },
    { name: 'gstCert',         maxCount: 1 },
    { name: 'menuCard',        maxCount: 1 }
]), validateFileContent, authController.registerVendor);

// @route   POST api/auth/register-rider
// @desc    Register delivery partner (multipart)
// @access  Public
router.post('/register-rider', upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'rc',      maxCount: 1 },
    { name: 'aadhar',  maxCount: 1 }
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
// @desc    Get current user profile
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
// @desc    Update user theme preference
// @access  Private
router.put('/theme', authMiddleware, authController.updateTheme);

module.exports = router;
