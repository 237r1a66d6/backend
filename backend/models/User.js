const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            is: /^[0-9]{10}$/
        }
    },
    qualification: {
        type: DataTypes.ENUM('B.Ed', 'M.Ed', 'B.A', 'M.A', 'B.Sc', 'M.Sc', 'PhD', 'Other'),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [8, 255]
        }
    },
    registeredDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    progress: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    enrolledCourses: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    completedCourses: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    inProgressCourses: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    courses: [{
        courseName: String,
        progress: Number,
        enrolledDate: Date,
        status: {
            type: String,
            enum: ['enrolled', 'in-progress', 'completed'],
            default: 'enrolled'
        }
    }],
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'suspended'),
        defaultValue: 'active'
    }
}, {
    timestamps: true,
    tableName: 'users'
});

module.exports = User;
