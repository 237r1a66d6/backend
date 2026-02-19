const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'saira-acad.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 SAIRA ACAD Database Contents\n');
console.log('================================\n');

// View Admins Table
db.all('SELECT * FROM Admins', [], (err, rows) => {
    if (err) {
        console.error('Error fetching admins:', err);
    } else {
        console.log('👤 ADMINS TABLE:');
        console.log('----------------');
        if (rows && rows.length === 0) {
            console.log('No admins found.\n');
        } else if (rows) {
            rows.forEach((row) => {
                console.log(`ID: ${row.id}`);
                console.log(`Username: ${row.username}`);
                console.log(`Email: ${row.email || 'N/A'}`);
                console.log(`Role: ${row.role}`);
                console.log(`Status: ${row.status}`);
                console.log(`Created: ${row.createdAt}`);
                console.log('---');
            });
        }
        console.log('\n');
    }
});

// View School Partners Table
db.all('SELECT * FROM SchoolPartners', [], (err, rows) => {
    if (err) {
        console.error('Error fetching school partners:', err);
    } else {
        console.log('🏫 SCHOOL PARTNERS TABLE:');
        console.log('-------------------------');
        if (rows && rows.length === 0) {
            console.log('No school partners found.\n');
        } else if (rows) {
            rows.forEach((row) => {
                console.log(`ID: ${row.id}`);
                console.log(`School Name: ${row.schoolName}`);
                console.log(`Username: ${row.username}`);
                console.log(`Email: ${row.email}`);
                console.log(`Status: ${row.status}`);
                console.log(`Created: ${row.createdAt}`);
                console.log('---');
            });
        }
        console.log('\n');
    }
});

// View Users Table
db.all('SELECT * FROM Users', [], (err, rows) => {
    if (err) {
        console.error('Error fetching users:', err);
    } else {
        console.log('👥 USERS TABLE:');
        console.log('----------------');
        if (rows && rows.length === 0) {
            console.log('No users found.\n');
        } else if (rows) {
            rows.forEach((row) => {
                console.log(`ID: ${row.id}`);
                console.log(`Full Name: ${row.fullName}`);
                console.log(`Email: ${row.email}`);
                console.log(`Phone: ${row.phoneNumber}`);
                console.log(`Qualification: ${row.qualification}`);
                console.log(`Status: ${row.status}`);
                console.log(`Created: ${row.createdAt}`);
                console.log('---');
            });
        }
        console.log('\n');
    }
});

// View Job Applications Table
db.all('SELECT * FROM JobApplications ORDER BY createdAt DESC LIMIT 10', [], (err, rows) => {
    if (err) {
        console.error('Error fetching job applications:', err);
    } else {
        console.log('💼 JOB APPLICATIONS TABLE (Latest 10):');
        console.log('---------------------------------------');
        if (rows && rows.length === 0) {
            console.log('No job applications found.\n');
        } else if (rows) {
            rows.forEach((row) => {
                console.log(`ID: ${row.id}`);
                console.log(`Name: ${row.applicantName}`);
                console.log(`Email: ${row.applicantEmail}`);
                console.log(`Position: ${row.position}`);
                console.log(`Experience: ${row.totalExperience} years`);
                console.log(`Status: ${row.status}`);
                console.log(`Created: ${row.createdAt}`);
                console.log('---');
            });
        }
        console.log('\n');
    }
});

// View Teacher Applications Table
db.all('SELECT * FROM TeacherApplications ORDER BY createdAt DESC LIMIT 10', [], (err, rows) => {
    if (err) {
        console.error('Error fetching teacher applications:', err);
    } else {
        console.log('👨‍🏫 TEACHER APPLICATIONS TABLE (Latest 10):');
        console.log('--------------------------------------------');
        if (rows && rows.length === 0) {
            console.log('No teacher applications found.\n');
        } else if (rows) {
            rows.forEach((row) => {
                console.log(`ID: ${row.id}`);
                console.log(`Name: ${row.teacherName}`);
                console.log(`Email: ${row.teacherEmail}`);
                console.log(`Subject: ${row.teacherSubject}`);
                console.log(`Experience: ${row.teacherExperience} years`);
                console.log(`Status: ${row.status}`);
                console.log(`Created: ${row.createdAt}`);
                console.log('---');
            });
        }
        console.log('\n');
    }
});

// View Mentor Applications Table
db.all('SELECT * FROM MentorApplications ORDER BY createdAt DESC LIMIT 10', [], (err, rows) => {
    if (err) {
        console.error('Error fetching mentor applications:', err);
    } else {
        console.log('🎓 MENTOR APPLICATIONS TABLE (Latest 10):');
        console.log('-----------------------------------------');
        if (rows && rows.length === 0) {
            console.log('No mentor applications found.\n');
        } else if (rows) {
            rows.forEach((row) => {
                console.log(`ID: ${row.id}`);
                console.log(`Name: ${row.mentorName}`);
                console.log(`Email: ${row.mentorEmail}`);
                console.log(`Specialization: ${row.mentorSpecialization}`);
                console.log(`Experience: ${row.mentorExperience} years`);
                console.log(`Status: ${row.status}`);
                console.log(`Created: ${row.createdAt}`);
                console.log('---');
            });
        }
        console.log('\n');
        
        // Close database after all queries
        db.close(() => {
            console.log('✅ Database connection closed.');
        });
    }
});
