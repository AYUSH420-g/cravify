const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const adminEmail = 'admin@cravify.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin already exists');
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin123', salt);

            const newAdmin = new User({
                name: 'Super Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                phone: '1234567890'
            });

            await newAdmin.save();
            console.log('Admin user created: admin@cravify.com / admin123');
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
