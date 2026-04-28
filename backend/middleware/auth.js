const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // Get token from header
    let token = req.header('x-auth-token');

    // Also check Authorization header (standard Bearer token)
    if (!token && req.header('Authorization')) {
        const authHeader = req.header('Authorization');
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        }
    }

    // Check if not token
    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err.message, 'Token prefix:', token.substring(0, 10) + '...');
        res.status(401).json({ message: 'Token is not valid' });
    }
};
