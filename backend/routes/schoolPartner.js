const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const SchoolPartner = require('../models/SchoolPartner');
const JobApplication = require('../models/JobApplication');
const TeacherApplication = require('../models/TeacherApplication');
const MentorApplication = require('../models/MentorApplication');
const adminAuth = require('../middleware/auth');

// Partner authentication middleware
const partnerAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'No authentication token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const partner = await SchoolPartner.findByPk(decoded.partner.id, {
            attributes: { exclude: ['password'] }
        });
        
        if (!partner || partner.status !== 'active') {
            return res.status(401).json({ success: false, message: 'Partner not authorized' });
        }

        req.partner = partner;
        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// @route   POST /api/school-partner/login
// @desc    School partner login
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

        // Find school partner
        const partner = await SchoolPartner.findOne({ where: { username, status: 'active' } });
        if (!partner) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, partner.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Create JWT token
        const payload = {
            partner: {
                id: partner.id,
                username: partner.username,
                schoolName: partner.schoolName
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    token,
                    partner: {
                        id: partner.id,
                        username: partner.username,
                        schoolName: partner.schoolName,
                        email: partner.email
                    }
                });
            }
        );
    } catch (err) {
        console.error('School partner login error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// @route   POST /api/school-partner/create
// @desc    Create new school partner (Admin only)
// @access  Private (Admin)
router.post('/create', adminAuth, [
    body('schoolName').trim().notEmpty().withMessage('School name is required'),
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { schoolName, username, email, password } = req.body;

        // Check if username exists
        let partner = await SchoolPartner.findOne({ username: username.toLowerCase() });
        if (partner) {
            return res.status(400).json({ 
                success: false, 
                message: 'Username already exists' 
            });
        }

        // Check if email exists
        partner = await SchoolPartner.findOne({ email: email.toLowerCase() });
        if (partner) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new school partner
        partner = await SchoolPartner.create({
            schoolName,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            createdBy: req.admin.id
        });

        res.json({
            success: true,
            message: 'School partner created successfully',
            partner: {
                id: partner.id,
                schoolName: partner.schoolName,
                username: partner.username,
                email: partner.email,
                createdDate: partner.createdDate
            }
        });
    } catch (err) {
        console.error('Create school partner error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error creating school partner' 
        });
    }
});

// @route   GET /api/school-partner/all
// @desc    Get all school partners (Admin only)
// @access  Private (Admin)
router.get('/all', adminAuth, async (req, res) => {
    try {
        const partners = await SchoolPartner.findAll({
            attributes: { exclude: ['password'] },
            order: [['createdDate', 'DESC']]
        });

        res.json({
            success: true,
            partners
        });
    } catch (err) {
        console.error('Get school partners error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching school partners' 
        });
    }
});

// @route   PUT /api/school-partner/update/:id
// @desc    Update school partner (Admin only)
// @access  Private (Admin)
router.put('/update/:id', adminAuth, async (req, res) => {
    try {
        const { schoolName, username, email, password } = req.body;
        
        const partner = await SchoolPartner.findByPk(req.params.id);
        if (!partner) {
            return res.status(404).json({ 
                success: false, 
                message: 'School partner not found' 
            });
        }

        // Check if username is taken by another partner
        if (username && username !== partner.username) {
            const existingPartner = await SchoolPartner.findOne({ 
                username: username.toLowerCase(),
                _id: { $ne: req.params.id }
            });
            if (existingPartner) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Username already exists' 
                });
            }
            partner.username = username.toLowerCase();
        }

        // Check if email is taken by another partner
        if (email && email !== partner.email) {
            const existingPartner = await SchoolPartner.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: req.params.id }
            });
            if (existingPartner) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email already exists' 
                });
            }
            partner.email = email.toLowerCase();
        }

        if (schoolName) partner.schoolName = schoolName;

        // Update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            partner.password = await bcrypt.hash(password, salt);
        }

        await partner.save();

        res.json({
            success: true,
            message: 'School partner updated successfully',
            partner: {
                id: partner.id,
                schoolName: partner.schoolName,
                username: partner.username,
                email: partner.email
            }
        });
    } catch (err) {
        console.error('Update school partner error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error updating school partner' 
        });
    }
});

// @route   DELETE /api/school-partner/delete/:id
// @desc    Delete school partner (Admin only)
// @access  Private (Admin)
router.delete('/delete/:id', adminAuth, async (req, res) => {
    try {
        const partner = await SchoolPartner.findByPk(req.params.id);
        if (!partner) {
            return res.status(404).json({ 
                success: false, 
                message: 'School partner not found' 
            });
        }

        await partner.deleteOne();

        res.json({
            success: true,
            message: 'School partner deleted successfully'
        });
    } catch (err) {
        console.error('Delete school partner error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error deleting school partner' 
        });
    }
});

// @route   GET /api/school-partner/applications/jobs
// @desc    Get all job applications for partner dashboard
// @access  Private (Partner)
router.get('/applications/jobs', partnerAuth, async (req, res) => {
    try {
        const applications = await JobApplication.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            applications
        });
    } catch (err) {
        console.error('Get job applications error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching job applications' 
        });
    }
});

// @route   GET /api/school-partner/applications/teachers
// @desc    Get all teacher applications for partner dashboard
// @access  Private (Partner)
router.get('/applications/teachers', partnerAuth, async (req, res) => {
    try {
        const applications = await TeacherApplication.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            applications
        });
    } catch (err) {
        console.error('Get teacher applications error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching teacher applications' 
        });
    }
});

// @route   GET /api/school-partner/applications/mentors
// @desc    Get all mentor applications for partner dashboard
// @access  Private (Partner)
router.get('/applications/mentors', partnerAuth, async (req, res) => {
    try {
        const applications = await MentorApplication.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            applications
        });
    } catch (err) {
        console.error('Get mentor applications error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching mentor applications' 
        });
    }
});

module.exports = router;
