const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ MongoDB connected successfully');
        
        // Initialize default admin if doesn't exist
        const Admin = require('../models/Admin');
        const bcrypt = require('bcryptjs');
        
        const adminCount = await Admin.countDocuments();
        if (adminCount === 0) {
            const hashedPassword = await bcrypt.hash('1234567@_a', 10);
            const defaultAdmin = new Admin({
                username: 'admin',
                password: hashedPassword,
                role: 'super-admin',
                status: 'active'
            });
            await defaultAdmin.save();
            console.log('✅ Default admin created (username: admin, password: 1234567@_a)');
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
