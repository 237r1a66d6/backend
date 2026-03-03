const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'saira-acad.db');
const db = new sqlite3.Database(dbPath);

console.log('🔐 Login Debug Tool\n');
console.log('===================\n');

// Get email from command line argument or use default
const testEmail = process.argv[2] || 'test@example.com';
const testPassword = process.argv[3] || 'password123';

console.log(`Testing login for: ${testEmail}`);
console.log(`With password: ${'*'.repeat(testPassword.length)}\n`);

db.get('SELECT * FROM Users WHERE LOWER(email) = LOWER(?)', [testEmail], async (err, user) => {
    if (err) {
        console.error('❌ Database error:', err);
        db.close();
        return;
    }
    
    if (!user) {
        console.log('❌ User not found in database');
        console.log('\n📋 Available users:');
        db.all('SELECT id, fullName, email, status FROM Users', [], (err, users) => {
            if (err) {
                console.error('Error fetching users:', err);
            } else if (users.length === 0) {
                console.log('   No users registered yet.');
            } else {
                users.forEach(u => {
                    console.log(`   - ID: ${u.id}, Name: ${u.fullName}, Email: ${u.email}, Status: ${u.status}`);
                });
            }
            db.close();
        });
        return;
    }
    
    console.log('✅ User found in database:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Full Name: ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Phone: ${user.phoneNumber}`);
    console.log(`   Qualification: ${user.qualification}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Registered: ${user.createdAt}`);
    console.log(`\n🔑 Password Hash Information:`);
    console.log(`   Hash exists: ${!!user.password}`);
    console.log(`   Hash length: ${user.password ? user.password.length : 0}`);
    console.log(`   Hash prefix: ${user.password ? user.password.substring(0, 7) : 'N/A'}`);
    
    if (user.password.startsWith('$2y$')) {
        console.log(`   ⚠️  Hash type: PHP bcrypt ($2y$) - will be converted to $2b$`);
    } else if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
        console.log(`   ✅ Hash type: Node bcrypt (${user.password.substring(0, 4)})`);
    } else {
        console.log(`   ⚠️  Unknown hash type: ${user.password.substring(0, 4)}`);
    }
    
    // Check account status
    if (user.status !== 'active') {
        console.log(`\n⚠️  Account status is "${user.status}" - login will fail!`);
        console.log('   Only "active" accounts can login.');
    }
    
    // Try password verification
    console.log(`\n🔍 Testing password verification...`);
    try {
        let hash = user.password;
        
        // Convert PHP bcrypt to Node bcrypt format
        if (hash.startsWith('$2y$')) {
            hash = '$2b$' + hash.slice(4);
            console.log('   ✅ Converted $2y$ to $2b$');
        }
        
        const isMatch = await bcrypt.compare(testPassword, hash);
        
        if (isMatch) {
            console.log('\n✅ ✅ ✅ PASSWORD MATCHES! ✅ ✅ ✅');
            console.log('   Login should work with these credentials.');
            
            if (user.status === 'active') {
                console.log('   ✅ Account is active - login will succeed!');
            }
        } else {
            console.log('\n❌ ❌ ❌ PASSWORD DOES NOT MATCH! ❌ ❌ ❌');
            console.log('   Possible reasons:');
            console.log('   1. The password you entered is incorrect');
            console.log('   2. The password hash in database is corrupted');
            console.log('   3. The password was hashed differently than expected');
            console.log('\n💡 Suggestion: Try registering a new test user and login immediately.');
        }
    } catch (error) {
        console.error('\n❌ Error during password comparison:', error.message);
    }
    
    db.close();
});
