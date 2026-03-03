// Production-ready Database Backup Script
// Run this periodically to backup database

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function backupDatabase() {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'saira-acad.db');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const backupName = `saira-acad-backup-${timestamp}.db`;
    
    try {
        // Check if database exists
        if (!fs.existsSync(dbPath)) {
            console.error('❌ Database file not found at:', dbPath);
            return null;
        }
        
        // Get database stats
        const stats = fs.statSync(dbPath);
        console.log(`📦 Database size: ${(stats.size / 1024).toFixed(2)} KB`);
        
        // Create backup directory
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
            console.log('✅ Created backups directory');
        }
        
        // Create backup with timestamp
        const backupPath = path.join(backupDir, backupName);
        fs.copyFileSync(dbPath, backupPath);
        
        console.log(`✅ Backup saved: ${backupPath}`);
        
        // Create a "latest" backup for easy access
        const latestBackupPath = path.join(backupDir, 'saira-acad-latest.db');
        fs.copyFileSync(dbPath, latestBackupPath);
        console.log(`✅ Latest backup updated: ${latestBackupPath}`);
        
        // Clean old backups (keep last N days)
        const daysToKeep = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
        cleanOldBackups(backupDir, daysToKeep);
        
        return backupPath;
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
        throw error;
    }
}

function cleanOldBackups(backupDir, daysToKeep) {
    try {
        const files = fs.readdirSync(backupDir);
        const now = Date.now();
        const maxAge = daysToKeep * 24 * 60 * 60 * 1000; // Convert days to milliseconds
        let deletedCount = 0;
        
        files.forEach(file => {
            // Skip the "latest" backup
            if (file === 'saira-acad-latest.db') return;
            
            const filePath = path.join(backupDir, file);
            
            // Check if it's a file (not a directory)
            if (!fs.statSync(filePath).isFile()) return;
            
            const stats = fs.statSync(filePath);
            const age = now - stats.mtimeMs;
            
            if (age > maxAge) {
                fs.unlinkSync(filePath);
                deletedCount++;
                console.log(`🗑️  Deleted old backup: ${file}`);
            }
        });
        
        if (deletedCount === 0) {
            console.log('✅ No old backups to clean');
        } else {
            console.log(`✅ Cleaned ${deletedCount} old backup(s)`);
        }
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    }
}

function restoreDatabase(backupFile = 'saira-acad-latest.db') {
    try {
        const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'saira-acad.db');
        const backupPath = path.join(__dirname, 'backups', backupFile);
        
        if (!fs.existsSync(backupPath)) {
            console.error(`❌ Backup file not found: ${backupPath}`);
            return false;
        }
        
        // Create a backup of current database before restore
        if (fs.existsSync(dbPath)) {
            const preRestoreBackup = path.join(__dirname, 'backups', `pre-restore-${Date.now()}.db`);
            fs.copyFileSync(dbPath, preRestoreBackup);
            console.log(`✅ Created pre-restore backup: ${preRestoreBackup}`);
        }
        
        // Restore from backup
        fs.copyFileSync(backupPath, dbPath);
        console.log(`✅ Database restored from: ${backupPath}`);
        
        return true;
    } catch (error) {
        console.error('❌ Restore failed:', error);
        return false;
    }
}

// Run backup if called directly
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

module.exports = { backupDatabase, restoreDatabase, cleanOldBackups };
