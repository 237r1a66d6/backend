const mongoose = require('mongoose');

const SchoolRequirementSchema = new mongoose.Schema({
    schoolName: {
        type: String,
        required: true
    },
    schoolLocation: {
        type: String,
        required: true
    },
    contactPerson: {
        type: String,
        required: true
    },
    contactEmail: {
        type: String,
        required: true
    },
    contactPhone: {
        type: String,
        required: true
    },
    positionType: {
        type: String,
        required: true,
        enum: ['full-time', 'part-time', 'substitute', 'contract']
    },
    subject: {
        type: String,
        required: true
    },
    grades: {
        type: String,
        required: true
    },
    experience: {
        type: Number,
        default: 0
    },
    salary: {
        type: String
    },
    additionalInfo: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'fulfilled', 'closed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SchoolRequirement', SchoolRequirementSchema);
