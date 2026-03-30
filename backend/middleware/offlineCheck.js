// ==========================================
// Offline Check Middleware
// Detects MongoDB connection status and provides
// a graceful fallback when the database is unreachable
// ==========================================

const mongoose = require('mongoose');

const offlineCheck = (req, res, next) => {
    // Check MongoDB connection state
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const state = mongoose.connection.readyState;

    if (state !== 1) {
        // Database is not connected
        return res.status(503).json({
            message: 'Database is currently unavailable. Please ensure MongoDB is running.',
            offline: true,
            hint: 'Start MongoDB locally with: mongod --dbpath /data/db',
            connectionState: ['disconnected', 'connected', 'connecting', 'disconnecting'][state]
        });
    }

    next();
};

module.exports = offlineCheck;
