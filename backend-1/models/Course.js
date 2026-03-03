const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Mathematics', 'Science', 'Language', 'Social Studies', 'Arts', 'Technology']
    },
    duration: {
        type: String,
        default: '8-12 weeks'
    },
    price: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'coming-soon'],
        default: 'active'
    },
    enrolledCount: {
        type: Number,
        default: 0
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
