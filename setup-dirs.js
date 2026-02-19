// Script to create necessary directories for file uploads
const fs = require('fs');
const path = require('path');

const directories = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads', 'resumes')
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    } else {
        console.log(`ℹ️  Directory already exists: ${dir}`);
    }
});

console.log('✨ All directories ready!');
