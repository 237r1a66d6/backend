const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MentorApplication = sequelize.define('MentorApplication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    mentorName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mentorEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    mentorPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mentorQualification: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mentorExperience: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 10
        }
    },
    mentorSpecialization: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mentorAchievements: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    mentorAvailability: {
        type: DataTypes.INTEGER
    },
    mentorWhy: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('submitted', 'reviewing', 'interview', 'approved', 'rejected'),
        defaultValue: 'submitted'
    }
}, {
    timestamps: true,
    tableName: 'mentor_applications'
});

module.exports = MentorApplication;
