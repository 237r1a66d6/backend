// Automatic Database Backup Script
// Run this periodically to backup database to cloud storage

const fs = require('fs');
const path = require('path');

// Example using email attachment (simple method)
const nodemailer = require('nodemailer');

async function backupDatabase() {
    const dbPath = path.join(__dirname, 'saira-acad.db');
    const backupName = `saira-acad-backup-${new Date().toISOString().split('T')[0]}.db`;
    
    try {
        // Check if database exists
        if (!fs.existsSync(dbPath)) {
            console.error('❌ Database file not found');
            return;
        }
        
        // Read database file
        const dbBuffer = fs.readFileSync(dbPath);
        const stats = fs.statSync(dbPath);
        
        console.log(`📦 Database size: ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Option 1: Email backup (simple)
        if (process.env.EMAIL_BACKUP === 'true') {
            await emailBackup(dbBuffer, backupName);
        }
        
        // Option 2: Save to local backup folder
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }
        
        const backupPath = path.join(backupDir, backupName);
        fs.copyFileSync(dbPath, backupPath);
        
        console.log(`✅ Backup saved: ${backupPath}`);
        
        // Clean old backups (keep last 7 days)
        cleanOldBackups(backupDir, 7);
        
        return backupPath;
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
        throw error;
    }
}

async function emailBackup(dbBuffer, filename) {
    // Configure email (use environment variables)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.BACKUP_EMAIL,
            pass: process.env.BACKUP_EMAIL_PASSWORD
        }
    });
    
    await transporter.sendMail({
        from: process.env.BACKUP_EMAIL,
        to: process.env.BACKUP_EMAIL, // Send to yourself
        subject: `SAIRA Database Backup - ${new Date().toLocaleDateString()}`,
        text: 'Automatic database backup attached.',
        attachments: [{
            filename: filename,
            content: dbBuffer
        }]
    });
    
    console.log('✅ Backup emailed successfully');
}

function cleanOldBackups(backupDir, daysToKeep) {
    const files = fs.readdirSync(backupDir);
    const now = Date.now();
    const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    files.forEach(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        const age = now - stats.mtimeMs;
        
        if (age > maxAge) {
            fs.unlinkSync(filePath);
            console.log(`🗑️  Deleted old backup: ${file}`);
        }
    });
}

// Run backup
if (require.main === module) {
    backupDatabase()
        .then(() => {
            console.log('\n✅ Backup completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Backup failed:', error);
            process.exit(1);
        });
}

module.exports = { backupDatabase };
