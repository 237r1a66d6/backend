const { Sequelize } = require('sequelize');
const path = require('path');

// SQLite database setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DATABASE_PATH || path.join(__dirname, '..', 'saira-acad.db'),
    logging: process.env.NODE_ENV === 'development' ? console.log : false
});

const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ SQLite database connected successfully');
        
        // Sync all models
        await sequelize.sync({ alter: true });
        console.log('✅ Database tables synchronized');
        
        // Initialize default admin
        const bcrypt = require('bcryptjs');
        const Admin = require('../models/Admin');
        
        const adminCount = await Admin.count();
        if (adminCount === 0) {
            const hashedPassword = await bcrypt.hash(
                process.env.DEFAULT_ADMIN_PASSWORD || '1234567@_a', 
                10
            );
            await Admin.create({
                username: process.env.DEFAULT_ADMIN_USERNAME || 'admin',
                password: hashedPassword,
                role: 'super-admin',
                status: 'active'
            });
            console.log(`✅ Default admin created (username: ${process.env.DEFAULT_ADMIN_USERNAME || 'admin'})`);
        }
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDatabase };
