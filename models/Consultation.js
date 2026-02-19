const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Consultation = sequelize.define('Consultation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    consultationType: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['school', 'teacher']]
        }
    },
    consultName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    consultEmail: {
        type: DataTypes.STRING,
        allowNull: false
    },
    consultPhone: {
        type: DataTypes.STRING,
        allowNull: false
    },
    consultOrg: {
        type: DataTypes.STRING
    },
    consultDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    consultTime: {
        type: DataTypes.STRING,
        allowNull: false
    },
    consultTopic: {
        type: DataTypes.STRING,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: 'scheduled',
        validate: {
            isIn: [['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled']]
        }
    },
    viewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    timestamps: true,
    tableName: 'consultations'
});

module.exports = Consultation;
