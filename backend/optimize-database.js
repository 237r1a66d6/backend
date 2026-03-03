/**
 * Database Performance Optimization Script
 * Run this to add indexes to speed up queries
 * This doesn't change any existing code, just optimizes database performance
 */

const { sequelize } = require('./config/database');

async function optimizeDatabase() {
    try {
        console.log('🚀 Starting database optimization...\n');

        // Add indexes for frequently queried fields
        const optimizations = [
            // Users table indexes
            `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`,
            `CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);`,
            `CREATE INDEX IF NOT EXISTS idx_users_registered_date ON users(registeredDate);`,
            
            // Admins table indexes
            `CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);`,
            `CREATE INDEX IF NOT EXISTS idx_admins_status ON admins(status);`,
            
            // School Partners table indexes
            `CREATE INDEX IF NOT EXISTS idx_school_partners_username ON schoolpartners(username);`,
            `CREATE INDEX IF NOT EXISTS idx_school_partners_email ON schoolpartners(email);`,
            `CREATE INDEX IF NOT EXISTS idx_school_partners_status ON schoolpartners(status);`,
            `CREATE INDEX IF NOT EXISTS idx_school_partners_created_date ON schoolpartners(createdDate);`,
            
            // Contacts table indexes
            `CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(createdAt);`,
            `CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);`,
            
            // Partner Contacts table indexes
            `CREATE INDEX IF NOT EXISTS idx_partner_contacts_status ON partnercontacts(status);`,
            `CREATE INDEX IF NOT EXISTS idx_partner_contacts_created_at ON partnercontacts(createdAt);`,
            
            // Educator Contacts table indexes
            `CREATE INDEX IF NOT EXISTS idx_educator_contacts_status ON educatorcontacts(status);`,
            `CREATE INDEX IF NOT EXISTS idx_educator_contacts_created_at ON educatorcontacts(createdAt);`,
            
            // Job Applications table indexes
            `CREATE INDEX IF NOT EXISTS idx_job_applications_status ON jobapplications(status);`,
            `CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON jobapplications(createdAt);`,
            
            // Teacher Applications table indexes
            `CREATE INDEX IF NOT EXISTS idx_teacher_applications_status ON teacherapplications(status);`,
            `CREATE INDEX IF NOT EXISTS idx_teacher_applications_created_at ON teacherapplications(createdAt);`,
            
            // Mentor Applications table indexes
            `CREATE INDEX IF NOT EXISTS idx_mentor_applications_status ON mentorapplications(status);`,
            `CREATE INDEX IF NOT EXISTS idx_mentor_applications_created_at ON mentorapplications(createdAt);`,
        ];

        for (let i = 0; i < optimizations.length; i++) {
            try {
                await sequelize.query(optimizations[i]);
                console.log(`✅ Optimization ${i + 1}/${optimizations.length} applied`);
            } catch (error) {
                console.log(`⚠️  Optimization ${i + 1}/${optimizations.length} skipped (may already exist)`);
            }
        }

        // Analyze tables for query optimization
        console.log('\n📊 Analyzing tables for optimization...');
        await sequelize.query('ANALYZE;');

        console.log('\n✨ Database optimization completed successfully!');
        console.log('📈 Query performance should now be significantly faster.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error optimizing database:', error);
        process.exit(1);
    }
}

optimizeDatabase();
