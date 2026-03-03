const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EducatorContact = sequelize.define('EducatorContact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    contactName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    contactPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactSubject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contactMessage: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'new',
        validate: {
            isIn: [['new', 'read', 'replied', 'closed']]
        }
    }
}, {
    timestamps: true,
    tableName: 'educator_contacts'
});

module.exports = EducatorContact;
