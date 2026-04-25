const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const imagekit = require('../utils/imagekit');
const { validatePincode } = require('../utils/pincode');
const WalletTransaction = require('../models/WalletTransaction');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'DUMMY_CLIENT_ID');

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { user: { id: user.id, role: user.role } },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    );
};

// Helper to generate unique referral code
const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Register User
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role, referralCode: usedReferralCode } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required' });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character.' 
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        if (role === 'admin') {
            return res.status(403).json({ message: 'Admin registration is not allowed directly.' });
        }

        const resolvedRole = role || 'customer';
        const isVerified = resolvedRole === 'customer';

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: resolvedRole,
            isVerified,
            referralCode: generateReferralCode()
        });


// Handle referral
if (usedReferralCode) {
    const referrer = await User.findOne({ referralCode: usedReferralCode.toUpperCase() });
    if (referrer) {
        user.referredBy = referrer._id;
        // Reward both with ₹50
        user.walletBalance = 50;
        referrer.walletBalance += 50;
        await referrer.save();

        // Log transactions
        await WalletTransaction.create([
            {
                user: user._id,
                type: 'credit',
                amount: 50,
                description: 'Referral Signup Bonus',
                balanceAfter: 50
            },
            {
                user: referrer._id,
                type: 'credit',
                amount: 50,
                description: `Referral Bonus for inviting ${user.name}`,
                balanceAfter: referrer.walletBalance
            }
        ]);
    }
}

        await user.save();

        if (!isVerified) {
            return res.status(201).json({
                message: 'Registration successful. Waiting for admin approval.',
                user: { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }
            });
        }

        const token = generateToken(user);
        res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        console.error("Register Error:", err.message);
        const error = new Error('Server error');
        error.statusCode = 500;
        next(error);
    }
};

// Register Vendor (Multipart)
exports.registerVendor = async (req, res, next) => {
    try {
        const { ownerName, email, password, phone, role, restaurantName, address, cuisine, fssai } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character.' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Files via ImageKit
        let restaurantImageUrl = '';
        let fssaiCertUrl = '';
        let gstCertUrl = '';
        let menuCardUrl = '';

        if (req.files) {
            try {
                if (req.files.restaurantImage && req.files.restaurantImage[0]) {
                    const upload = await imagekit.upload({ file: req.files.restaurantImage[0].buffer, fileName: req.files.restaurantImage[0].originalname, folder: '/cravify/restaurants' });
                    restaurantImageUrl = upload.url;
                }
                if (req.files.fssaiCert && req.files.fssaiCert[0]) {
                    const upload = await imagekit.upload({ file: req.files.fssaiCert[0].buffer, fileName: req.files.fssaiCert[0].originalname, folder: '/cravify/vendors' });
                    fssaiCertUrl = upload.url;
                }
                if (req.files.gstCert && req.files.gstCert[0]) {
                    const upload = await imagekit.upload({ file: req.files.gstCert[0].buffer, fileName: req.files.gstCert[0].originalname, folder: '/cravify/vendors' });
                    gstCertUrl = upload.url;
                }
                if (req.files.menuCard && req.files.menuCard[0]) {
                    const upload = await imagekit.upload({ file: req.files.menuCard[0].buffer, fileName: req.files.menuCard[0].originalname, folder: '/cravify/vendors' });
                    menuCardUrl = upload.url;
                }
            } catch (err) {
                console.error('ImageKit Vendor Upload Error:', err);
                return res.status(500).json({ success: false, message: 'File upload failed', errorCode: 'UPLOAD_FAILED' });
            }
        }

        let location = null; // Only set if geocoding succeeds
        let validPincode = req.body.pincode || '';

        try {
            if (validPincode) {
                const pinData = await validatePincode(validPincode);
                if (pinData && pinData.lat) {
                    location = { lat: pinData.lat, lng: pinData.lng };
                }
            }
            if (!location && address) {
                const query = encodeURIComponent(address);
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
                const geoData = await geoRes.json();
                if (geoData && geoData.length > 0) {
                    location = { lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) };
                }
            }
        } catch (geoErr) {
            console.error('Vendor Geocoding failed', geoErr);
        }

        user = new User({
            name: ownerName,
            email,
            password: hashedPassword,
            phone,
            role: 'restaurant_partner',
            isVerified: false,
            referralCode: generateReferralCode(),
            restaurantDetails: {
                restaurantName,
                address,
                pincode: validPincode,
                cuisine,
                fssai,
                imageUrl: restaurantImageUrl,
                location,
                documents: {
                    fssaiCertUrl,
                    gstCertUrl,
                    menuCardUrl
                }
            }
        });

        await user.save();
        return res.status(201).json({ message: 'Registration successful. Waiting for admin approval.' });

    } catch (err) {
        console.error("Register Vendor Error:", err.message);
        const error = new Error('Server error');
        error.statusCode = 500;
        next(error);
    }
};

// Register Delivery Partner (Multipart)
exports.registerRider = async (req, res, next) => {
    try {
        const { name, email, password, phone, city, vehicleType, vehicleNumber } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Password strength validation
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters and include an uppercase letter, a number, and a special character.' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Documents via ImageKit
        let licenseUrl = '';
        let rcUrl = '';
        let aadharUrl = '';

        if (req.files) {
            try {
                if (req.files.license && req.files.license[0]) {
                    const upload = await imagekit.upload({ file: req.files.license[0].buffer, fileName: req.files.license[0].originalname, folder: '/cravify/riders' });
                    licenseUrl = upload.url;
                }
                if (req.files.rc && req.files.rc[0]) {
                    const upload = await imagekit.upload({ file: req.files.rc[0].buffer, fileName: req.files.rc[0].originalname, folder: '/cravify/riders' });
                    rcUrl = upload.url;
                }
                if (req.files.aadhar && req.files.aadhar[0]) {
                    const upload = await imagekit.upload({ file: req.files.aadhar[0].buffer, fileName: req.files.aadhar[0].originalname, folder: '/cravify/riders' });
                    aadharUrl = upload.url;
                }
            } catch (err) {
                console.error('ImageKit Rider Upload Error:', err);
                return res.status(500).json({ success: false, message: 'File upload failed', errorCode: 'UPLOAD_FAILED' });
            }
        }

        user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'delivery_partner',
            isVerified: false,
            referralCode: generateReferralCode(),
            deliveryDetails: {
                isOnline: false,
                city,
                vehicleType,
                vehicleNumber,
                documents: {
                    licenseUrl,
                    rcUrl,
                    aadharUrl
                }
            }
        });

        await user.save();
        return res.status(201).json({ message: 'Registration successful. Waiting for admin approval.' });

    } catch (err) {
        console.error("Register Rider Error:", err.message);
        const error = new Error('Server error');
        error.statusCode = 500;
        next(error);
    }
};

// Login User
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        if ((user.role === 'restaurant_partner' || user.role === 'delivery_partner') && !user.isVerified) {
            return res.status(403).json({ message: 'Account pending admin approval' });
        }

        const token = generateToken(user);

        // Ensure user has a referral code (for existing users)
        if (!user.referralCode) {
            user.referralCode = generateReferralCode();
            await user.save();
        }

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, referralCode: user.referralCode, theme: user.theme } });

    } catch (err) {
        console.error("Login Error:", err.message);
        const error = new Error('Server error');
        error.statusCode = 500;
        next(error);
    }
};

// Google Login SSO
exports.googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;
        // Skip verification if using dummy key in dev, rely on decoded data
        // For production, verification is strictly required!
        let payload;
        if (process.env.GOOGLE_CLIENT_ID) {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            payload = ticket.getPayload();
        } else {
            // DEV MOCK: Decode without verification if no client ID is set
            payload = jwt.decode(credential);
        }

        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Auto register Google user as Customer
            user = new User({
                name,
                email,
                role: 'customer',
                isVerified: true,
                referralCode: generateReferralCode()
            });
            await user.save();
        } else {
            if ((user.role === 'restaurant_partner' || user.role === 'delivery_partner') && !user.isVerified) {
                return res.status(403).json({ message: 'Account pending admin approval' });
            }
        }

        const token = generateToken(user);

        // Ensure user has a referral code
        if (!user.referralCode) {
            user.referralCode = generateReferralCode();
            await user.save();
        }

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, referralCode: user.referralCode, theme: user.theme } });

    } catch (err) {
        console.error("Google Login Error:", err.message);
        const error = new Error('Google authentication failed');
        error.statusCode = 500;
        next(error);
    }
};

// Get User Profile
exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        const error = new Error('Server error');
        error.statusCode = 500;
        next(error);
    }
};

// Forgot Password Flow (Email Link)
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'No account with that email found' });
        }

        // Generate Reset Token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash it and set to User record
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now

        await user.save();

        const frontendBaseUrl = req.headers.referer ? new URL(req.headers.referer).origin : (req.headers.origin || 'http://localhost:5173');
        const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`;
        const message = `You requested a password reset. Click this link to set a new password: \n\n${resetUrl}`;

        try {
            // Mocking the transporter if credentials aren't set yet
            if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
                console.log("\n--- DEVELOPMENT MODE EMAIL ---");
                console.log(`To: ${user.email}\nSubject: Password Reset Token\nMessage: ${message}`);
                console.log("------------------------------\n");
                return res.json({ message: 'Email sent (Printed to backend console in DEV mode)' });
            }

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_EMAIL,
                    pass: process.env.SMTP_PASSWORD
                }
            });

            await transporter.sendMail({
                from: `${process.env.SMTP_EMAIL}`,
                to: user.email,
                subject: 'Cravify Password Reset',
                text: message
            });

            res.json({ message: 'Email sent successfully' });

        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (err) {
        console.error(err.message);
        const error = new Error('Server error');
        error.statusCode = 500;
        next(error);
    }
};

// Reset Password via Token
exports.resetPasswordWithToken = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() } // Ensure it isn't expired
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);

        // Clear fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You may now log in.' });
    } catch (err) {
        console.error(err.message);
        const error = new Error('Server error');
        error.statusCode = 500;
        next(error);
    }
};
// Update User Theme Preference
exports.updateTheme = async (req, res, next) => {
    try {
        const { theme } = req.body;
        if (!['light', 'dark'].includes(theme)) {
            return res.status(400).json({ message: 'Invalid theme' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.theme = theme;
        await user.save();

        res.json({ success: true, theme: user.theme });
    } catch (err) {
        console.error("Update Theme Error:", err.message);
        const error = new Error('Server error');
        error.statusCode = 500;
        next(error);
    }
};
