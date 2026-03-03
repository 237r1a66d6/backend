const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// Models
const Enrollment = require('../models/Enrollment');
const SchoolRequirement = require('../models/SchoolRequirement');
const TeacherApplication = require('../models/TeacherApplication');
const MentorApplication = require('../models/MentorApplication');
const JobApplication = require('../models/JobApplication');
const Contact = require('../models/Contact');
const Consultation = require('../models/Consultation');
const PartnerContact = require('../models/PartnerContact');
const EducatorContact = require('../models/EducatorContact');

// @route   POST /api/forms/enrollment
// @desc    Submit enrollment for mentorship/training program
// @access  Public
router.post('/enrollment', async (req, res) => {
    try {
        const { fullName, email, phone, program, experience, message } = req.body;

        // Create new enrollment
        const enrollment = new Enrollment({
            fullName,
            email,
            phone,
            program,
            experience,
            message
        });

        await enrollment.save();

        res.json({ 
            success: true,
            message: 'Enrollment submitted successfully',
            enrollmentId: enrollment._id
        });
    } catch (error) {
        console.error('Enrollment error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error submitting enrollment' 
        });
    }
});

// @route   POST /api/forms/school-requirement
// @desc    Submit school teacher requirement
// @access  Public
router.post('/school-requirement', async (req, res) => {
    try {
        const {
            schoolName,
            schoolLocation,
            contactPerson,
            contactEmail,
            contactPhone,
            positionType,
            subject,
            grades,
            experience,
            salary,
            additionalInfo
        } = req.body;

        const requirement = new SchoolRequirement({
            schoolName,
            schoolLocation,
            contactPerson,
            contactEmail,
            contactPhone,
            positionType,
            subject,
            grades,
            experience,
            salary,
            additionalInfo
        });

        await requirement.save();

        res.json({
            success: true,
            message: 'School requirement submitted successfully',
            requirementId: requirement._id
        });
    } catch (error) {
        console.error('School requirement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting school requirement'
        });
    }
});

// @route   POST /api/forms/teacher-application
// @desc    Submit teacher job application
// @access  Public
router.post('/teacher-application', upload.single('teacherResume'), async (req, res) => {
    try {
        const {
            teacherName,
            teacherEmail,
            teacherPhone,
            teacherQualification,
            teacherSubject,
            teacherExperience,
            preferredLocation,
            currentSalary,
            coverLetter
        } = req.body;

        const application = new TeacherApplication({
            teacherName,
            teacherEmail,
            teacherPhone,
            teacherQualification,
            teacherSubject,
            teacherExperience,
            preferredLocation,
            currentSalary,
            coverLetter,
            resumeUrl: req.file ? req.file.path : null
        });

        await application.save();

        res.json({
            success: true,
            message: 'Teacher application submitted successfully',
            applicationId: application._id
        });
    } catch (error) {
        console.error('Teacher application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting teacher application'
        });
    }
});

// @route   POST /api/forms/mentor-application
// @desc    Submit mentor application
// @access  Public
router.post('/mentor-application', async (req, res) => {
    try {
        const {
            mentorName,
            mentorEmail,
            mentorPhone,
            mentorQualification,
            mentorExperience,
            mentorSpecialization,
            mentorAchievements,
            mentorAvailability,
            mentorWhy
        } = req.body;

        const application = new MentorApplication({
            mentorName,
            mentorEmail,
            mentorPhone,
            mentorQualification,
            mentorExperience,
            mentorSpecialization,
            mentorAchievements,
            mentorAvailability,
            mentorWhy
        });

        await application.save();

        res.json({
            success: true,
            message: 'Mentor application submitted successfully',
            applicationId: application._id
        });
    } catch (error) {
        console.error('Mentor application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting mentor application'
        });
    }
});

// @route   POST /api/forms/job-application
// @desc    Submit job application for careers
// @access  Public
router.post('/job-application', upload.single('applicantResume'), async (req, res) => {
    try {
        const {
            applicantName,
            applicantEmail,
            applicantPhone,
            position,
            currentLocation,
            totalExperience,
            currentCompany,
            noticePeriod,
            coverLetterText
        } = req.body;

        const application = new JobApplication({
            applicantName,
            applicantEmail,
            applicantPhone,
            position,
            currentLocation,
            totalExperience,
            currentCompany,
            noticePeriod,
            coverLetterText,
            resumeUrl: req.file ? req.file.path : null
        });

        await application.save();

        res.json({
            success: true,
            message: 'Job application submitted successfully',
            applicationId: application._id
        });
    } catch (error) {
        console.error('Job application error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting job application'
        });
    }
});

// @route   POST /api/forms/contact
// @desc    Submit contact form (routes to separate tables based on type)
// @access  Public
router.post('/contact', async (req, res) => {
    try {
        const {
            contactName,
            contactEmail,
            contactPhone,
            contactType,
            contactSubject,
            contactMessage
        } = req.body;

        // Route to appropriate table based on contactType
        if (contactType === 'partner') {
            // Check for duplicate email in PartnerContact
            const existingPartner = await PartnerContact.findOne({ 
                where: { contactEmail } 
            });

            if (existingPartner) {
                return res.json({
                    success: true,
                    duplicate: true,
                    message: 'You have already submitted a message as a partner'
                });
            }

            const partnerContact = await PartnerContact.create({
                contactName,
                contactEmail,
                contactPhone,
                contactSubject,
                contactMessage
            });

            return res.json({
                success: true,
                message: 'Partner contact form submitted successfully',
                contactId: partnerContact.id,
                contactType: 'partner'
            });

        } else if (contactType === 'educator') {
            // Check for duplicate email in EducatorContact
            const existingEducator = await EducatorContact.findOne({ 
                where: { contactEmail } 
            });

            if (existingEducator) {
                return res.json({
                    success: true,
                    duplicate: true,
                    message: 'You have already submitted a message as an educator'
                });
            }

            const educatorContact = await EducatorContact.create({
                contactName,
                contactEmail,
                contactPhone,
                contactSubject,
                contactMessage
            });

            return res.json({
                success: true,
                message: 'Educator contact form submitted successfully',
                contactId: educatorContact.id,
                contactType: 'educator'
            });

        } else {
            // Fallback to general Contact table if type is not specified
            const contact = new Contact({
                contactName,
                contactEmail,
                contactPhone,
                contactType,
                contactSubject,
                contactMessage
            });

            await contact.save();

            return res.json({
                success: true,
                message: 'Contact form submitted successfully',
                contactId: contact._id
            });
        }
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting contact form',
            error: error.message
        });
    }
});

// @route   POST /api/forms/consultation
// @desc    Book a consultation
// @access  Public
router.post('/consultation', async (req, res) => {
    try {
        const {
            consultationType,
            consultName,
            consultEmail,
            consultPhone,
            consultOrg,
            consultDate,
            consultTime,
            consultTopic
        } = req.body;

        const consultation = await Consultation.create({
            consultationType,
            consultName,
            consultEmail,
            consultPhone,
            consultOrg,
            consultDate,
            consultTime,
            consultTopic
        });

        res.json({
            success: true,
            message: 'Consultation booked successfully',
            consultationId: consultation.id
        });
    } catch (error) {
        console.error('Consultation booking error:', error);
        res.status(500).json({
            success: false,
            message: 'Error booking consultation'
        });
    }
});

// @route   DELETE /api/forms/consultation/:id
// @desc    Delete a consultation
// @access  Private (Admin)
router.delete('/consultation/:id', async (req, res) => {
    try {
        const consultation = await Consultation.findByPk(req.params.id);
        
        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: 'Consultation not found'
            });
        }

        await consultation.destroy();

        res.json({
            success: true,
            message: 'Consultation deleted successfully'
        });
    } catch (error) {
        console.error('Delete consultation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting consultation'
        });
    }
});

// @route   GET /api/forms/consultations
// @desc    Get all consultations (Admin)
// @access  Private (Admin)
router.get('/consultations', async (req, res) => {
    try {
        const consultations = await Consultation.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        res.json({
            success: true,
            consultations
        });
    } catch (error) {
        console.error('Get consultations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching consultations'
        });
    }
});

module.exports = router;
