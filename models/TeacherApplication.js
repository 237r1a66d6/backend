const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TeacherApplication = sequelize.define('TeacherApplication', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    teacherName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    teacherEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    teacherPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    teacherQualification: {
        type: DataTypes.STRING,
        allowNull: false
    },
    teacherSubject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    teacherExperience: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    preferredLocation: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currentSalary: {
        type: DataTypes.STRING
    },
    coverLetter: {
        type: DataTypes.TEXT
    },
    resumeUrl: {
        type: DataTypes.STRING
    },
    status: {
        type: DataTypes.ENUM('submitted', 'reviewing', 'shortlisted', 'placed', 'rejected'),
        defaultValue: 'submitted'
    }
}, {
    timestamps: true,
    tableName: 'teacher_applications'
});

module.exports = TeacherApplication;
