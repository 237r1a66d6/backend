// Quick Database Viewer for SAIRA ACAD
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./saira-acad.db');

console.log('\n🔍 QUICK DATABASE VIEW\n');
console.log('='.repeat(50));

// View Users
db.all('SELECT * FROM Users', [], (err, rows) => {
    if (err) {
        console.log('\n❌ Users table error:', err.message);
    } else {
        console.log(`\n👥 USERS (${rows.length} total):`);
        console.log('-'.repeat(50));
        if (rows.length === 0) {
            console.log('No users registered yet.');
        } else {
            rows.forEach((row, index) => {
                console.log(`\n${index + 1}. ${row.fullName}`);
                console.log(`   Email: ${row.email}`);
                console.log(`   Phone: ${row.phoneNumber}`);
                console.log(`   Qualification: ${row.qualification}`);
                console.log(`   Registered: ${row.createdAt}`);
            });
        }
    }
    
    // View Admins
    db.all('SELECT * FROM Admins', [], (err, rows) => {
        if (err) {
            console.log('\n❌ Admins table error:', err.message);
        } else {
            console.log(`\n\n👤 ADMINS (${rows.length} total):`);
            console.log('-'.repeat(50));
            rows.forEach((row, index) => {
                console.log(`\n${index + 1}. ${row.username}`);
                console.log(`   Role: ${row.role}`);
                console.log(`   Status: ${row.status}`);
                console.log(`   Created: ${row.createdAt}`);
            });
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('\n✅ View complete!\n');
        
        db.close();
    });
});
