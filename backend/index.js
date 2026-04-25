const express = require('express');
const dns = require('dns');
const http = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorMiddleware');

// dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ override: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for sockets in development to prevent CORS blocks
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Attach io to app so routes can access it
app.set('io', io);

const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',');
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(null, true); // Permissive in dev; restrict in production
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per window (generous for polling-heavy app)
    message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes', errorCode: 'RATE_LIMIT_EXCEEDED' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// Expose 'uploads' directory statically for public access to certificates
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const maintenance = require('./middleware/maintenance');
app.use('/api', maintenance);

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/vendor', require('./routes/vendor.routes'));
app.use('/api/customer', require('./routes/customer.routes'));
app.use('/api/delivery', require('./routes/delivery.routes'));
app.use('/api/payment', require('./routes/payment.routes'));
app.use('/api/loyalty', require('./routes/loyalty.routes'));
app.use('/api/chat', require('./routes/chat.routes'));
app.use('/api/route', require('./routes/route.routes'));

app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Cravify API is running', uptime: process.uptime() });
});

// Health check for load balancers
app.get('/health', (req, res) => {
    const isDbConnected = require('mongoose').connection.readyState === 1;
    res.status(isDbConnected ? 200 : 503).json({
        status: isDbConnected ? 'healthy' : 'unhealthy',
        database: isDbConnected ? 'connected' : 'disconnected',
        uptime: process.uptime()
    });
});

// Global Error Handler Middleware
app.use(errorHandler);

// Socket.io Connection Logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join_delivery_room', () => {
        socket.join('delivery_partners');
        console.log(`Socket ${socket.id} joined delivery_partners room`);
    });

    // Tracking rooms for specific orders
    socket.on('join_order_room', (orderId) => {
        if (!orderId) {
            console.warn(`Socket ${socket.id} tried to join order room without ID`);
            return;
        }
        const room = `order_${orderId.toString()}`;
        socket.join(room);
        console.log(`Socket ${socket.id} JOINED tracking room: ${room}`);
        
        // Confirmation back to client
        socket.emit('joined_room', { room });
    });

    // Personal room for general notifications (like status updates while browsing)
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined personal room user_${userId}`);
    });

    // Handle live location updates from riders
    socket.on('update_location', async (data, callback) => {
        const { orderId, userId, location } = data;
        if (!orderId || !userId || !location) {
            console.error('Invalid location update data');
            if (callback) callback({ success: false, error: 'Invalid location update data' });
            return;
        }
        if (orderId) {
            socket.to(`order_${orderId}`).emit('location_update', {
                orderId,
                location
            });
        }

        // Optionally persist last known location to User model and Order model
        try {
            const User = require('./models/User');
            const Order = require('./models/Order');

            await User.findByIdAndUpdate(userId, {
                lastKnownLocation: location
            });

            if (orderId) {
                await Order.findByIdAndUpdate(orderId, {
                    riderCurrentLocation: location
                });
            }
            if (callback) callback({ success: true });
        } catch (err) {
            console.error('Error persisting location:', err.message);
            if (callback) callback({ success: false, error: err.message });
        }
    });

    // Chat logic
    socket.on('send_message', async (data, callback) => {
        const { orderId, senderId, senderRole, text } = data;
        if (!orderId || !senderId || !senderRole || !text) {
            console.error('Invalid message data');
            if (callback) callback({ success: false, error: 'Invalid message data' });
            return;
        }
        try {
            const ChatMessage = require('./models/Chat');
            const message = await ChatMessage.create({
                order: orderId,
                sender: senderId,
                senderRole,
                text
            });

            // Populate sender info before emitting
            await message.populate('sender', 'name role');

            // Emit standard event to everyone in the order tracking room
            io.to(`order_${orderId}`).emit('receive_message', message);
            // Backward compatibility for old frontend clients
            io.to(`order_${orderId}`).emit('chat_message', message);

            if (callback) callback({ success: true, message });
        } catch (err) {
            console.error('Error saving/sending chat message:', err.message);
            if (callback) callback({ success: false, error: err.message });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Database Connection
const clientOptions = {
    serverApi: { version: '1', strict: true, deprecationErrors: true },
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000
};

async function connectDB(retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, clientOptions);
            console.log('MongoDB Connected');
            return;
        } catch (err) {
            console.log(`MongoDB Connection Attempt ${i + 1}/${retries} failed:`, err.message);
            if (i === retries - 1) {
                console.log('All retries exhausted. Exiting.');
                process.exit(1);
            }
            await new Promise(r => setTimeout(r, 3000));
        }
    }
}

// Validate critical env vars
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
    console.error(`\n❌ Missing required environment variables: ${missing.join(', ')}`);
    console.error('Please check your .env file.\n');
    process.exit(1);
}

connectDB();

// Export io for use in controllers
app.set('io', io);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
