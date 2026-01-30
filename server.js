const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { connectDatabase } = require('./config/database');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const resumesDir = path.join(__dirname, 'uploads', 'resumes');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
}
if (!fs.existsSync(resumesDir)) {
    fs.mkdirSync(resumesDir, { recursive: true });
    console.log('✅ Created resumes directory');
}

// Connect to SQLite Database
connectDatabase();

// Middleware
// CORS Configuration - Allow all origins for production deployment
app.use(cors({
    origin: '*', // Allow all origins (required for Render + Hostinger setup)
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/school-partner', require('./routes/schoolPartner'));
app.use('/api/forms', require('./routes/forms'));

// Health check route
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'SAIRA ACAD API is running',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Welcome to SAIRA ACAD API',
        version: '1.0.0',
        endpoints: {
            users: {
                register: 'POST /api/users/register',
                login: 'POST /api/users/login',
                profile: 'GET /api/users/profile/:id',
                updateProfile: 'PUT /api/users/profile/:id'
            },
            admin: {
                login: 'POST /api/admin/login',
                getUsers: 'GET /api/admin/users',
                getStats: 'GET /api/admin/stats',
                updateUserStatus: 'PUT /api/admin/users/:id/status',
                deleteUser: 'DELETE /api/admin/users/:id'
            },
            forms: {
                enrollment: 'POST /api/forms/enrollment',
                schoolRequirement: 'POST /api/forms/school-requirement',
                teacherApplication: 'POST /api/forms/teacher-application',
                mentorApplication: 'POST /api/forms/mentor-application',
                jobApplication: 'POST /api/forms/job-application',
                contact: 'POST /api/forms/contact',
                consultation: 'POST /api/forms/consultation'
            }
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
