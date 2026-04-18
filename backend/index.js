const express = require('express');
const dns = require('dns');
const http = require('http');
const { Server } = require('socket.io');

// Force Google DNS to bypass ISP SRV resolution blocks
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ override: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST", "PUT"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Expose 'uploads' directory statically for public access to certificates
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/vendor', require('./routes/vendor.routes'));
app.use('/api/customer', require('./routes/customer.routes'));
app.use('/api/delivery', require('./routes/delivery.routes'));

app.get('/', (res) => {
    res.send('Cravify API is running');
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_delivery_room', () => {
        socket.join('delivery_partners');
        console.log(`Socket ${socket.id} joined delivery_partners room`);
    });

    // Tracking rooms for specific orders
    socket.on('join_order_room', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`Socket ${socket.id} joined tracking room for order ${orderId}`);
    });

    // Personal room for general notifications (like status updates while browsing)
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined personal room user_${userId}`);
    });

    // Handle live location updates from riders
    socket.on('update_location', async (data) => {
        const { orderId, userId, location } = data;
        
        // Relay location to everyone in the order room (customer, vendor)
        socket.to(`order_${orderId}`).emit('location_update', {
            orderId,
            location
        });

        // Optionally persist last known location to User model
        try {
            const User = require('./models/User');
            await User.findByIdAndUpdate(userId, {
                lastKnownLocation: location
            });
        } catch (err) {
            console.error('Error persisting location:', err.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Database Connection
const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, clientOptions);
        console.log('MongoDB Connected');
    } catch (err) {
        console.log('MongoDB Connection Error:', err);
        // Exit process with failure
        process.exit(1);
    }
}

connectDB();

// Export io for use in controllers
app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
