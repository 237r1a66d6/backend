const jwt = require('jsonwebtoken');

// User authentication middleware using JWT bearer token
module.exports = function userAuth(req, res, next) {
    try {
        // Get token from Authorization header
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.replace('Bearer ', '') : null;

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's a user token (not admin)
        if (!decoded || !decoded.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid authentication token' 
            });
        }

        // Attach user info to request
        req.user = decoded.user;
        req.userId = decoded.user.id;
        
        next();
    } catch (error) {
        console.error('User auth error:', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: 'Your session has expired. Please login again.' 
            });
        }
        
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication failed. Please login again.' 
        });
    }
};
