const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const User = require('../models/User');
const PartnerContact = require('../models/PartnerContact');
const EducatorContact = require('../models/EducatorContact');
const adminAuth = require('../middleware/auth');

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { username, password } = req.body;

        // Find admin
        const admin = await Admin.findOne({ where: { username, status: 'active' } });
        if (!admin) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid admin credentials' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid admin credentials' 
            });
        }

        // Create JWT token
        const payload = {
            admin: {
                id: admin.id,
                username: admin.username,
                type: 'admin'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    message: 'Admin login successful!',
                    token,
                    admin: {
                        id: admin._id,
                        username: admin.username,
                        role: admin.role,
                        status: admin.status
                    }
                });
            }
        );
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// @route   GET /api/admin/admins
// @desc    List all admins (without passwords)
// @access  Private (Admin only)
router.get('/admins', adminAuth, async (req, res) => {
    try {
        const admins = await Admin.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, count: admins.length, admins });
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   POST /api/admin/admins
// @desc    Create a new admin
// @access  Private (Admin only)
router.post('/admins', adminAuth, [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('role').optional().isIn(['super-admin', 'admin']).withMessage('Role is invalid')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { username, password, email, role } = req.body;

        const existing = await Admin.findOne({ username });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Admin username already exists' });
        }

        if (email) {
            const emailExists = await Admin.findOne({ email: email.toLowerCase() });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Admin email already exists' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const admin = new Admin({
            username,
            email: email ? email.toLowerCase() : undefined,
            password: hashedPassword,
            role: role || 'admin',
            status: 'active'
        });

        await admin.save();

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
                role: admin.role,
                status: admin.status,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt
            }
        });
    } catch (error) {
        console.error('Create admin error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/admins/:id
// @desc    Update admin details or password
// @access  Private (Admin only)
router.put('/admins/:id', adminAuth, [
    body('username').optional().trim().notEmpty().withMessage('Username is required'),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('role').optional().isIn(['super-admin', 'admin']).withMessage('Role is invalid'),
    body('status').optional().isIn(['active', 'inactive']).withMessage('Status is invalid')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const updates = { ...req.body };

        if (updates.username) {
            const exists = await Admin.findOne({ username: updates.username, _id: { $ne: req.params.id } });
            if (exists) {
                return res.status(400).json({ success: false, message: 'Username already in use' });
            }
        }

        if (updates.email) {
            updates.email = updates.email.toLowerCase();
            const emailExists = await Admin.findOne({ email: updates.email, _id: { $ne: req.params.id } });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }

        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const admin = await Admin.findByPk(req.params.id);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        await admin.update(updates);
        // Refetch without password
        const updatedAdmin = await Admin.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({ success: true, message: 'Admin updated successfully', admin: updatedAdmin });
    } catch (error) {
        console.error('Update admin error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/admins/:id
// @desc    Delete admin (except default admin)
// @access  Private (Admin only)
router.delete('/admins/:id', adminAuth, async (req, res) => {
    try {
        const admin = await Admin.findByPk(req.params.id);

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found' });
        }

        if (admin.username === 'admin') {
            return res.status(400).json({ success: false, message: 'Default admin cannot be deleted' });
        }

        await admin.destroy();

        res.json({ success: true, message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Delete admin error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
router.get('/users', adminAuth, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            order: [['registeredDate', 'DESC']]
        });
        res.json({ 
            success: true, 
            count: users.length,
            users 
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { status: 'active' } });
        const recentUsers = await User.findAll({
            order: [['registeredDate', 'DESC']],
            limit: 5,
            attributes: { exclude: ['password'] }
        });

        res.json({
            success: true,
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                recentUsers
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin only)
router.put('/users/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['active', 'inactive', 'suspended'].includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid status' 
            });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        await user.update({ status });
        // Refetch without password
        const updatedUser = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({ 
            success: true, 
            message: 'User status updated successfully',
            user 
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
router.delete('/users/:id', adminAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        await user.destroy();

        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   GET /api/admin/contacts/partners
// @desc    Get all partner contact messages
// @access  Private (Admin only)
router.get('/contacts/partners', adminAuth, async (req, res) => {
    try {
        const partnerContacts = await PartnerContact.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            contacts: partnerContacts
        });
    } catch (error) {
        console.error('Get partner contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   GET /api/admin/contacts/educators
// @desc    Get all educator contact messages
// @access  Private (Admin only)
router.get('/contacts/educators', adminAuth, async (req, res) => {
    try {
        const educatorContacts = await EducatorContact.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            contacts: educatorContacts
        });
    } catch (error) {
        console.error('Get educator contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/contacts/partners/:id/status
// @desc    Update partner contact status
// @access  Private (Admin only)
router.put('/contacts/partners/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const contact = await PartnerContact.findByPk(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        contact.status = status;
        await contact.save();

        res.json({
            success: true,
            message: 'Status updated successfully',
            contact
        });
    } catch (error) {
        console.error('Update partner contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/admin/contacts/educators/:id/status
// @desc    Update educator contact status
// @access  Private (Admin only)
router.put('/contacts/educators/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const contact = await EducatorContact.findByPk(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        contact.status = status;
        await contact.save();

        res.json({
            success: true,
            message: 'Status updated successfully',
            contact
        });
    } catch (error) {
        console.error('Update educator contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/admin/contacts/partners/:id
// @desc    Delete partner contact
// @access  Private (Admin only)
router.delete('/contacts/partners/:id', adminAuth, async (req, res) => {
    try {
        const contact = await PartnerContact.findByPk(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await contact.destroy();

        res.json({
            success: true,
            message: 'Partner contact deleted successfully'
        });
    } catch (error) {
        console.error('Delete partner contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/admin/contacts/educators/:id
// @desc    Delete educator contact
// @access  Private (Admin only)
router.delete('/contacts/educators/:id', adminAuth, async (req, res) => {
    try {
        const contact = await EducatorContact.findByPk(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        await contact.destroy();

        res.json({
            success: true,
            message: 'Educator contact deleted successfully'
        });
    } catch (error) {
        console.error('Delete educator contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;
