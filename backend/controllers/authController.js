const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'DUMMY_CLIENT_ID');

// Helper to generate JWT
const generateToken = (user) => {
    return jwt.sign(
        { user: { id: user.id, role: user.role } },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
    );
};

// Register User
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

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
            isVerified
        });

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
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Register Vendor (Multipart)
exports.registerVendor = async (req, res) => {
    try {
        const { ownerName, email, password, phone, role, restaurantName, address, cuisine, fssai } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Files
        let fssaiCertUrl = '';
        let gstCertUrl = '';
        let menuCardUrl = '';

        if (req.files) {
            if (req.files.fssaiCert && req.files.fssaiCert[0]) fssaiCertUrl = `/uploads/${req.files.fssaiCert[0].filename}`;
            if (req.files.gstCert && req.files.gstCert[0]) gstCertUrl = `/uploads/${req.files.gstCert[0].filename}`;
            if (req.files.menuCard && req.files.menuCard[0]) menuCardUrl = `/uploads/${req.files.menuCard[0].filename}`;
        }

        user = new User({
            name: ownerName,
            email,
            password: hashedPassword,
            phone,
            role: 'restaurant_partner',
            isVerified: false,
            restaurantDetails: {
                restaurantName,
                address,
                cuisine,
                fssai,
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
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Register Delivery Partner (Multipart)
exports.registerRider = async (req, res) => {
    try {
        const { name, email, password, phone, city, vehicleType, vehicleNumber } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Documents
        let licenseUrl = '';
        let rcUrl = '';
        let aadharUrl = '';

        if (req.files) {
            if (req.files.license && req.files.license[0]) licenseUrl = `/uploads/${req.files.license[0].filename}`;
            if (req.files.rc && req.files.rc[0]) rcUrl = `/uploads/${req.files.rc[0].filename}`;
            if (req.files.aadhar && req.files.aadhar[0]) aadharUrl = `/uploads/${req.files.aadhar[0].filename}`;
        }

        user = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'delivery_partner',
            isVerified: false,
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
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login User
exports.login = async (req, res) => {
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
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Google Login SSO
exports.googleLogin = async (req, res) => {
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
                isVerified: true
            });
            await user.save();
        } else {
            if ((user.role === 'restaurant_partner' || user.role === 'delivery_partner') && !user.isVerified) {
                return res.status(403).json({ message: 'Account pending admin approval' });
            }
        }

        const token = generateToken(user);
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });

    } catch (err) {
        console.error("Google Login Error:", err.message);
        res.status(500).json({ message: 'Google authentication failed' });
    }
};

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Forgot Password Flow (Email Link)
exports.forgotPassword = async (req, res) => {
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
            if(!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD){
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
        res.status(500).send('Server error');
    }
};

// Reset Password via Token
exports.resetPasswordWithToken = async (req, res) => {
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
        res.status(500).send('Server error');
    }
};
