const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    contactName: {
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
    contactType: {
        type: String,
        required: true,
        enum: ['school', 'teacher', 'mentor', 'other']
    },
    contactSubject: {
        type: String,
        required: true
    },
    contactMessage: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'read', 'replied', 'closed'],
        default: 'new'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Contact', ContactSchema);
