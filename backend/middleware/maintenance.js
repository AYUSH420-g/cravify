const Settings = require('../models/Settings');

/**
 * Maintenance Mode Middleware
 * Blocks all non-admin requests when maintenanceMode is active in Settings.
 */
module.exports = async (req, res, next) => {
    try {
        const settings = await Settings.getInstance();
        
        if (settings.maintenanceMode) {
            // 1. Always allow Admin routes (so admins can fix things)
            if (req.path.startsWith('/admin') || req.originalUrl.includes('/admin')) {
                return next();
            }

            // 2. Allow checking settings or health even in maintenance
            if (req.path === '/health' || req.path === '/settings') {
                return next();
            }

            // 3. Allow Admin login (so they can enter the dashboard)
            // Note: We don't know the role yet if they aren't logged in, 
            // but we allow the login attempt.
            if (req.path.startsWith('/auth/login')) {
                return next();
            }

            // 4. If the user is already authenticated and is an admin, let them through
            if (req.user && req.user.role === 'admin') {
                return next();
            }

            // Block everything else
            return res.status(503).json({
                success: false,
                message: settings.globalBroadcastMessage || 'Platform is currently under maintenance. We will be back shortly!',
                errorCode: 'MAINTENANCE_MODE',
                broadcast: settings.globalBroadcastMessage
            });
        }
        
        next();
    } catch (err) {
        console.error('Maintenance Middleware Error:', err.message);
        next(); // Fallback: don't block the site if settings fail
    }
};
