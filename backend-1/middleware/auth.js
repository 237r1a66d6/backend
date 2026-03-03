const jwt = require('jsonwebtoken');

// Simple admin auth middleware using JWT bearer token
module.exports = function adminAuth(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.replace('Bearer ', '') : null;

        if (!token) {
            return res.status(401).json({ success: false, message: 'Auth token missing' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.admin) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        req.admin = decoded.admin;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
};