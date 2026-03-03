// Add this to your backend routes (e.g., backend/routes/admin.js)
// Database Download Endpoint (Admin Only)

const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Download database backup (Admin only)
router.get('/download-database', authenticateAdmin, (req, res) => {
    const dbPath = path.join(__dirname, '..', 'saira-acad.db');
    
    // Check if database exists
    if (!fs.existsSync(dbPath)) {
        return res.status(404).json({ 
            success: false, 
            message: 'Database file not found' 
        });
    }
    
    // Get file stats for size
    const stats = fs.statSync(dbPath);
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/x-sqlite3');
    res.setHeader('Content-Disposition', `attachment; filename=saira-acad-backup-${Date.now()}.db`);
    res.setHeader('Content-Length', stats.size);
    
    // Stream the file
    const fileStream = fs.createReadStream(dbPath);
    fileStream.pipe(res);
});

// Middleware to authenticate admin
function authenticateAdmin(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'No token provided' 
        });
    }
    
    // Verify admin token (implement your JWT verification)
    // For now, basic check:
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (decoded.role !== 'admin' && decoded.role !== 'super-admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Access denied. Admin only.' 
            });
        }
        
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid token' 
        });
    }
}

module.exports = router;
