const { sequelize } = require('./config/database');
const PartnerContact = require('./models/PartnerContact');
const EducatorContact = require('./models/EducatorContact');

async function testContacts() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // Check if tables exist
        console.log('\n📋 Checking tables...');
        const [partnerResult] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='partner_contacts'");
        const [educatorResult] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table' AND name='educator_contacts'");
        
        console.log('Partner contacts table exists:', partnerResult.length > 0 ? '✅' : '❌');
        console.log('Educator contacts table exists:', educatorResult.length > 0 ? '✅' : '❌');

        // Insert test partner contact
        console.log('\n📝 Inserting test partner contact...');
        const partnerContact = await PartnerContact.create({
            contactName: 'Test Partner',
            contactEmail: 'partner@test.com',
            contactPhone: '1234567890',
            contactSubject: 'Partnership Inquiry',
            contactMessage: 'This is a test message from a partner.'
        });
        console.log('✅ Partner contact created with ID:', partnerContact.id);

        // Insert test educator contact
        console.log('\n📝 Inserting test educator contact...');
        const educatorContact = await EducatorContact.create({
            contactName: 'Test Educator',
            contactEmail: 'educator@test.com',
            contactPhone: '0987654321',
            contactSubject: 'Teaching Opportunity',
            contactMessage: 'This is a test message from an educator.'
        });
        console.log('✅ Educator contact created with ID:', educatorContact.id);

        // Retrieve all partner contacts
        console.log('\n📊 Retrieving partner contacts...');
        const partners = await PartnerContact.findAll();
        console.log(`Found ${partners.length} partner contact(s)`);
        partners.forEach(p => console.log(`  - ${p.contactName} (${p.contactEmail})`));

        // Retrieve all educator contacts
        console.log('\n📊 Retrieving educator contacts...');
        const educators = await EducatorContact.findAll();
        console.log(`Found ${educators.length} educator contact(s)`);
        educators.forEach(e => console.log(`  - ${e.contactName} (${e.contactEmail})`));

        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testContacts();
