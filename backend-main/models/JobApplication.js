const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const JobApplication = sequelize.define('JobApplication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    applicantName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    applicantEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    applicantPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    position: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currentLocation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    totalExperience: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    currentCompany: {
        type: DataTypes.STRING
    },
    noticePeriod: {
        type: DataTypes.INTEGER
    },
    coverLetterText: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    resumeUrl: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('submitted', 'reviewing', 'interview', 'offered', 'hired', 'rejected'),
        defaultValue: 'submitted'
    }
}, {
    timestamps: true,
    tableName: 'job_applications'
});

module.exports = JobApplication;
