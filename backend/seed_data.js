// ==========================================
// Comprehensive Seed Data Script for Cravify
// Run: node seed_data.js
// This populates the database with demo data for offline/local testing
// ==========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');
const Restaurant = require('./models/Restaurant');
const Order = require('./models/Order');
const DeliveryProfile = require('./models/DeliveryProfile');
const DeliveryTask = require('./models/DeliveryTask');
const Promo = require('./models/Promo');
const Settings = require('./models/Settings');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data (comment out if you want to preserve data)
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Restaurant.deleteMany({});
        await Order.deleteMany({});
        await DeliveryProfile.deleteMany({});
        await DeliveryTask.deleteMany({});
        await Promo.deleteMany({});
        await Settings.deleteMany({});

        const salt = await bcrypt.genSalt(10);

        // ==========================================
        // 1. Create Users
        // ==========================================
        console.log('👤 Creating users...');

        const adminUser = await User.create({
            name: 'Super Admin',
            email: 'admin@cravify.com',
            password: await bcrypt.hash('admin123', salt),
            phone: '9876543210',
            role: 'admin',
            status: 'active',
            isVerified: true,
            applicationStatus: 'approved'
        });

        const customer1 = await User.create({
            name: 'Rahul Sharma',
            email: 'rahul@example.com',
            password: await bcrypt.hash('password123', salt),
            phone: '9876543211',
            role: 'customer',
            status: 'active',
            addresses: [
                { street: '123 CG Road', city: 'Ahmedabad', zip: '380009', type: 'Home' },
                { street: 'GIFT City Tower 2', city: 'Gandhinagar', zip: '382355', type: 'Work' }
            ]
        });

        const customer2 = await User.create({
            name: 'Priya Patel',
            email: 'priya@example.com',
            password: await bcrypt.hash('password123', salt),
            phone: '9876543212',
            role: 'customer',
            status: 'active',
            addresses: [
                { street: '45 SG Highway', city: 'Ahmedabad', zip: '380054', type: 'Home' }
            ]
        });

        const customer3 = await User.create({
            name: 'Amit Desai',
            email: 'amit@example.com',
            password: await bcrypt.hash('password123', salt),
            phone: '9876543213',
            role: 'customer',
            status: 'active',
            addresses: [
                { street: '78 Law Garden', city: 'Ahmedabad', zip: '380006', type: 'Home' }
            ]
        });

        // Restaurant Partners
        const vendor1 = await User.create({
            name: 'Rajesh Kumar (La Pino\'z)',
            email: 'vendor1@example.com',
            password: await bcrypt.hash('password123', salt),
            phone: '9876543220',
            role: 'restaurant_partner',
            status: 'active',
            isVerified: true,
            applicationStatus: 'approved'
        });

        const vendor2 = await User.create({
            name: 'Anita Saxena (Spice Kitchen)',
            email: 'vendor2@example.com',
            password: await bcrypt.hash('password123', salt),
            phone: '9876543221',
            role: 'restaurant_partner',
            status: 'active',
            isVerified: true,
            applicationStatus: 'approved'
        });

        const vendor3 = await User.create({
            name: 'New Restaurant Applicant',
            email: 'vendor3@example.com',
            password: await bcrypt.hash('password123', salt),
            phone: '9876543222',
            role: 'restaurant_partner',
            status: 'active',
            isVerified: false,
            applicationStatus: 'pending'
        });

        // Delivery Partners
        const rider1 = await User.create({
            name: 'Vikram Singh',
            email: 'rider1@example.com',
            password: await bcrypt.hash('password123', salt),
            phone: '9876543230',
            role: 'delivery_partner',
            status: 'active',
            isVerified: true,
            applicationStatus: 'approved'
        });

        const rider2 = await User.create({
            name: 'Karan Mehta',
            email: 'rider2@example.com',
            password: await bcrypt.hash('password123', salt),
            phone: '9876543231',
            role: 'delivery_partner',
            status: 'active',
            isVerified: false,
            applicationStatus: 'pending'
        });

        console.log('   ✅ Created 9 users (1 admin, 3 customers, 3 vendors, 2 riders)');

        // ==========================================
        // 2. Create Restaurants with Menus
        // ==========================================
        console.log('🍕 Creating restaurants...');

        const restaurant1 = await Restaurant.create({
            name: "La Pino'z Pizza",
            image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
            owner: vendor1._id,
            cuisines: ['Italian', 'Pizza', 'Fast Food'],
            rating: 4.2,
            deliveryTime: '30-35 mins',
            priceForTwo: '₹300 for two',
            offer: '50% OFF up to ₹100',
            address: 'CG Road, Navrangpura, Ahmedabad',
            menu: [
                { name: 'Margherita Pizza', description: 'Classic cheese pizza with fresh basil', price: 199, isVeg: true, category: 'Pizza', isBestseller: true },
                { name: '7 Cheese Pizza', description: 'Loaded with 7 types of premium cheese', price: 349, isVeg: true, category: 'Pizza', isBestseller: true },
                { name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella', price: 299, isVeg: false, category: 'Pizza', isBestseller: false },
                { name: 'Garlic Bread', description: 'Crispy garlic bread with cheese dip', price: 129, isVeg: true, category: 'Sides', isBestseller: false },
                { name: 'Choco Lava Cake', description: 'Warm chocolate cake with molten center', price: 99, isVeg: true, category: 'Desserts', isBestseller: true },
                { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 149, isVeg: true, category: 'Beverages', isBestseller: false },
                { name: 'Pasta Alfredo', description: 'Creamy white sauce pasta', price: 229, isVeg: true, category: 'Pasta', isBestseller: false },
                { name: 'Paneer Tikka Pizza', description: 'Indian style pizza with paneer tikka', price: 279, isVeg: true, category: 'Pizza', isBestseller: true }
            ]
        });

        const restaurant2 = await Restaurant.create({
            name: 'Spice Kitchen',
            image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
            owner: vendor2._id,
            cuisines: ['Indian', 'North Indian', 'Biryani'],
            rating: 4.5,
            deliveryTime: '25-30 mins',
            priceForTwo: '₹400 for two',
            offer: '20% OFF on first order',
            address: 'SG Highway, Bodakdev, Ahmedabad',
            menu: [
                { name: 'Paneer Tikka', description: 'Marinated cottage cheese grilled to perfection', price: 249, isVeg: true, category: 'Starters', isBestseller: true },
                { name: 'Veg Biryani', description: 'Fragrant basmati rice with mixed vegetables', price: 199, isVeg: true, category: 'Biryani', isBestseller: true },
                { name: 'Chicken Biryani', description: 'Hyderabadi style dum biryani', price: 299, isVeg: false, category: 'Biryani', isBestseller: true },
                { name: 'Dal Makhani', description: 'Slow cooked black lentils in creamy gravy', price: 179, isVeg: true, category: 'Main Course', isBestseller: false },
                { name: 'Butter Naan', description: 'Soft naan brushed with butter', price: 49, isVeg: true, category: 'Breads', isBestseller: false },
                { name: 'Gulab Jamun', description: 'Soft milk dumplings in sweet syrup', price: 89, isVeg: true, category: 'Desserts', isBestseller: false }
            ]
        });

        console.log('   ✅ Created 2 restaurants with full menus');

        // ==========================================
        // 3. Create Orders
        // ==========================================
        console.log('📦 Creating sample orders...');

        const order1 = await Order.create({
            user: customer1._id,
            restaurant: restaurant1._id,
            items: [
                { name: '7 Cheese Pizza', quantity: 1, price: 349 },
                { name: 'Choco Lava Cake', quantity: 2, price: 99 }
            ],
            totalAmount: 547,
            status: 'Delivered',
            deliveryAddress: { street: '123 CG Road', city: 'Ahmedabad', zip: '380009' },
            paymentMethod: 'UPI'
        });

        const order2 = await Order.create({
            user: customer1._id,
            restaurant: restaurant2._id,
            items: [
                { name: 'Paneer Tikka', quantity: 2, price: 249 },
                { name: 'Butter Naan', quantity: 4, price: 49 }
            ],
            totalAmount: 694,
            status: 'Delivered',
            deliveryAddress: { street: '123 CG Road', city: 'Ahmedabad', zip: '380009' },
            paymentMethod: 'Card'
        });

        const order3 = await Order.create({
            user: customer2._id,
            restaurant: restaurant1._id,
            items: [
                { name: 'Margherita Pizza', quantity: 2, price: 199 },
                { name: 'Garlic Bread', quantity: 1, price: 129 }
            ],
            totalAmount: 527,
            status: 'Preparing',
            deliveryAddress: { street: '45 SG Highway', city: 'Ahmedabad', zip: '380054' },
            paymentMethod: 'COD'
        });

        const order4 = await Order.create({
            user: customer2._id,
            restaurant: restaurant2._id,
            items: [
                { name: 'Chicken Biryani', quantity: 1, price: 299 },
                { name: 'Dal Makhani', quantity: 1, price: 179 }
            ],
            totalAmount: 478,
            status: 'OutForDelivery',
            deliveryAddress: { street: '45 SG Highway', city: 'Ahmedabad', zip: '380054' },
            paymentMethod: 'UPI'
        });

        const order5 = await Order.create({
            user: customer3._id,
            restaurant: restaurant1._id,
            items: [
                { name: 'Pasta Alfredo', quantity: 1, price: 229 },
                { name: 'Cold Coffee', quantity: 2, price: 149 }
            ],
            totalAmount: 527,
            status: 'Placed',
            deliveryAddress: { street: '78 Law Garden', city: 'Ahmedabad', zip: '380006' },
            paymentMethod: 'Card'
        });

        const order6 = await Order.create({
            user: customer3._id,
            restaurant: restaurant2._id,
            items: [
                { name: 'Veg Biryani', quantity: 3, price: 199 }
            ],
            totalAmount: 597,
            status: 'Delivered',
            deliveryAddress: { street: '78 Law Garden', city: 'Ahmedabad', zip: '380006' },
            paymentMethod: 'COD'
        });

        const order7 = await Order.create({
            user: customer1._id,
            restaurant: restaurant1._id,
            items: [
                { name: 'Paneer Tikka Pizza', quantity: 1, price: 279 }
            ],
            totalAmount: 279,
            status: 'Cancelled',
            deliveryAddress: { street: '123 CG Road', city: 'Ahmedabad', zip: '380009' },
            paymentMethod: 'UPI'
        });

        const order8 = await Order.create({
            user: customer2._id,
            restaurant: restaurant1._id,
            items: [
                { name: 'Pepperoni Pizza', quantity: 1, price: 299 },
                { name: 'Garlic Bread', quantity: 2, price: 129 }
            ],
            totalAmount: 557,
            status: 'Placed',
            deliveryAddress: { street: '45 SG Highway', city: 'Ahmedabad', zip: '380054' },
            paymentMethod: 'Card'
        });

        console.log('   ✅ Created 8 sample orders');

        // ==========================================
        // 4. Create Delivery Profiles & Tasks
        // ==========================================
        console.log('🛵 Creating delivery profiles...');

        const profile1 = await DeliveryProfile.create({
            user: rider1._id,
            isOnline: true,
            currentLocation: { lat: 23.0225, lng: 72.5714 },
            totalEarnings: 3450,
            totalDeliveries: 67
        });

        const profile2 = await DeliveryProfile.create({
            user: rider2._id,
            isOnline: false,
            currentLocation: { lat: 23.0300, lng: 72.5800 },
            totalEarnings: 0,
            totalDeliveries: 0
        });

        // Create delivery tasks for active orders
        await DeliveryTask.create({
            order: order4._id,
            deliveryPartner: rider1._id,
            status: 'picked_up',
            earnings: 45
        });

        await DeliveryTask.create({
            order: order1._id,
            deliveryPartner: rider1._id,
            status: 'delivered',
            earnings: 35
        });

        await DeliveryTask.create({
            order: order2._id,
            deliveryPartner: rider1._id,
            status: 'delivered',
            earnings: 40
        });

        console.log('   ✅ Created 2 delivery profiles and 3 delivery tasks');

        // ==========================================
        // 5. Create Promo Codes
        // ==========================================
        console.log('🎫 Creating promo codes...');

        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);

        await Promo.create([
            {
                code: 'WELCOME50',
                description: '50% OFF on your first order',
                discountType: 'percentage',
                discountValue: 50,
                minOrderValue: 200,
                maxDiscountValue: 150,
                isActive: true,
                expiryDate: futureDate
            },
            {
                code: 'FLAT100',
                description: 'Flat ₹100 OFF on orders above ₹300',
                discountType: 'fixed',
                discountValue: 100,
                minOrderValue: 300,
                maxDiscountValue: null,
                isActive: true,
                expiryDate: futureDate
            },
            {
                code: 'CRAVIFY30',
                description: '30% OFF up to ₹75',
                discountType: 'percentage',
                discountValue: 30,
                minOrderValue: 150,
                maxDiscountValue: 75,
                isActive: false,
                expiryDate: new Date('2026-01-01') // Expired
            }
        ]);

        console.log('   ✅ Created 3 promo codes');

        // ==========================================
        // 6. Create Default Settings
        // ==========================================
        console.log('⚙️  Creating default platform settings...');

        await Settings.create({
            singletonId: 'admin_config',
            platformFee: 5,
            referralBonus: 10,
            supportEmail: 'support@cravify.com',
            maintenanceMode: false,
            autoApproveRestaurants: false
        });

        console.log('   ✅ Created default platform settings');

        // ==========================================
        // Summary
        // ==========================================
        console.log('\n===================================================');
        console.log('🎉 Seed data created successfully!');
        console.log('===================================================');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin:    admin@cravify.com     / admin123');
        console.log('   Customer: rahul@example.com     / password123');
        console.log('   Customer: priya@example.com     / password123');
        console.log('   Customer: amit@example.com      / password123');
        console.log('   Vendor:   vendor1@example.com   / password123');
        console.log('   Vendor:   vendor2@example.com   / password123');
        console.log('   Vendor:   vendor3@example.com   / password123 (pending)');
        console.log('   Rider:    rider1@example.com    / password123');
        console.log('   Rider:    rider2@example.com    / password123 (pending)');
        console.log('===================================================\n');

        mongoose.disconnect();
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
};

seedData();
