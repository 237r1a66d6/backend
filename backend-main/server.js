const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { connectDatabase } = require('./config/database');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

// Initialize express app
const app = express();
const isProduction = process.env.NODE_ENV === 'production';

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

// Security Headers - Use Helmet
app.use(helmet({
    contentSecurityPolicy: false, // Disable if serving HTML directly
    crossOriginEmbedderPolicy: false
}));

// Compression middleware
app.use(compression());

// Request logging
if (isProduction) {
    // Production: log to file
    const accessLogStream = fs.createWriteStream(
        path.join(__dirname, 'access.log'),
        { flags: 'a' }
    );
    app.use(morgan('combined', { stream: accessLogStream }));
} else {
    // Development: log to console
    app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 1000, // Limit each IP
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later.',
    skipSuccessfulRequests: true
});

// Apply rate limiting
app.use('/api/', limiter);
app.use('/api/users/login', authLimiter);
app.use('/api/admin/login', authLimiter);

// Middleware
// CORS Configuration - Flexible for development and production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['*'];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow all origins if '*' is set, otherwise check whitelist
        if (allowedOrigins.includes('*') || allowedOrigins.indexOf(origin) !== -1 || !isProduction) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: allowedOrigins.includes('*') ? false : true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
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
                verify: 'POST /api/users/verify (Protected)',
                getCurrentUser: 'GET /api/users/me (Protected)',
                profile: 'GET /api/users/profile/:id (Protected)',
                updateProfile: 'PUT /api/users/profile/:id (Protected)'
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
    
    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: err.errors
        });
    }
    
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized access'
        });
    }
    
    res.status(err.status || 500).json({ 
        success: false, 
        message: isProduction ? 'Something went wrong!' : err.message,
        error: isProduction ? undefined : err.stack
    });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 API URL: http://localhost:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Security: Helmet enabled`);
    console.log(`⚡ Compression: Enabled`);
    console.log(`🛡️  Rate limiting: Active`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);
    
    server.close(() => {
        console.log('✅ HTTP server closed');
        
        // Close database connections
        const { sequelize } = require('./config/database');
        sequelize.close().then(() => {
            console.log('✅ Database connections closed');
            process.exit(0);
        }).catch(err => {
            console.error('❌ Error during shutdown:', err);
            process.exit(1);
        });
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});
