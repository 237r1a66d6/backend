const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('phoneNumber').matches(/^[0-9]{10}$/).withMessage('Phone number must be 10 digits'),
    body('qualification').notEmpty().withMessage('Qualification is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ 
                success: false, 
                errors: errors.array() 
            });
        }

        const { fullName, phoneNumber, qualification, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.status(400).json({ 
                success: false, 
                message: 'An account with this email already exists' 
            });
        }

        // Check if username is taken
        user = await User.findOne({ fullName: { $regex: new RegExp(`^${fullName}$`, 'i') } });
        if (user) {
            return res.status(400).json({ 
                success: false, 
                message: 'An account with this name already exists. Please use a different name.' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            fullName,
            phoneNumber,
            qualification,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await user.save();

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                type: 'user'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    message: 'Registration successful!',
                    token,
                    user: {
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        qualification: user.qualification,
                        registeredDate: user.registeredDate,
                        progress: user.progress,
                        enrolledCourses: user.enrolledCourses,
                        completedCourses: user.completedCourses,
                        inProgressCourses: user.inProgressCourses
                    }
                });
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during registration' 
        });
    }
});

// @route   POST /api/users/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
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

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(400).json({ 
                success: false, 
                message: 'Account is not active. Please contact support.' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }

        // Create JWT token
        const payload = {
            user: {
                id: user.id,
                email: user.email,
                type: 'user'
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '7d' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    success: true,
                    message: 'Login successful!',
                    token,
                    user: {
                        id: user._id,
                        fullName: user.fullName,
                        email: user.email,
                        phoneNumber: user.phoneNumber,
                        qualification: user.qualification,
                        registeredDate: user.registeredDate,
                        progress: user.progress,
                        enrolledCourses: user.enrolledCourses,
                        completedCourses: user.completedCourses,
                        inProgressCourses: user.inProgressCourses
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during login' 
        });
    }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile
// @access  Private (add auth middleware in production)
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// @route   PUT /api/users/profile/:id
// @desc    Update user profile
// @access  Private
router.put('/profile/:id', async (req, res) => {
    try {
        const { fullName, phoneNumber, qualification } = req.body;
        
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        await user.update({ fullName, phoneNumber, qualification });
        // Refetch without password
        const updatedUser = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] }
        });

        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: updatedUser 
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

module.exports = router;
