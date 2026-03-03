const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    program: {
        type: String,
        required: true,
        enum: ['foundation', 'advanced', 'leadership', 'digital', 'subject', 'special']
    },
    experience: {
        type: Number,
        default: 0
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'enrolled', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
