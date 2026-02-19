const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'saira-acad.db');
const db = new sqlite3.Database(dbPath);

console.log('📋 Database Schema Information\n');
console.log('================================\n');

// Get list of all tables
db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", [], (err, tables) => {
    if (err) {
        console.error('Error fetching tables:', err);
        db.close();
        return;
    }
    
    console.log('📁 TABLES IN DATABASE:');
    console.log('----------------------');
    
    if (tables.length === 0) {
        console.log('No tables found.');
        db.close();
        return;
    }
    
    tables.forEach(table => {
        console.log(`- ${table.name}`);
    });
    
    console.log('\n');
    
    // For each table, show its data
    let processed = 0;
    tables.forEach(table => {
        const tableName = table.name;
        
        // Skip internal SQLite tables
        if (tableName === 'sqlite_sequence') {
            processed++;
            if (processed === tables.length) {
                db.close();
            }
            return;
        }
        
        console.log(`\n📊 ${tableName.toUpperCase()} TABLE:`);
        console.log('='.repeat(tableName.length + 15));
        
        db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
            if (err) {
                console.error(`Error fetching ${tableName}:`, err);
            } else if (rows.length === 0) {
                console.log('(Empty table)\n');
            } else {
                console.log(`Total records: ${rows.length}\n`);
                rows.forEach((row, index) => {
                    console.log(`Record #${index + 1}:`);
                    Object.keys(row).forEach(key => {
                        console.log(`  ${key}: ${row[key]}`);
                    });
                    console.log('---');
                });
            }
            
            processed++;
            if (processed === tables.length) {
                console.log('\n✅ Database inspection complete.');
                db.close();
            }
        });
    });
});
