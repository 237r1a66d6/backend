// Health Check Utility
// Run this to check if the server is healthy

const http = require('http');
const https = require('https');

async function checkHealth(url) {
    return new Promise((resolve, reject) => {
        const apiUrl = url || process.env.PRODUCTION_URL || 'http://localhost:5000';
        const healthEndpoint = `${apiUrl}/api/health`;
        
        console.log(`🔍 Checking health at: ${healthEndpoint}`);
        
        const protocol = healthEndpoint.startsWith('https') ? https : http;
        const startTime = Date.now();
        
        protocol.get(healthEndpoint, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                
                try {
                    const health = JSON.parse(data);
                    
                    if (health.status === 'OK') {
                        console.log('✅ Server is healthy!');
                        console.log(`📊 Response time: ${responseTime}ms`);
                        console.log(`🌐 Environment: ${health.environment || 'unknown'}`);
                        console.log(`⏱️  Uptime: ${Math.floor(health.uptime || 0)}s`);
                        resolve(health);
                    } else {
                        console.log('⚠️  Server responded but status is not OK');
                        console.log(health);
                        reject(new Error('Health check failed'));
                    }
                } catch (err) {
                    console.error('❌ Invalid health response:', data);
                    reject(err);
                }
            });
        }).on('error', (err) => {
            console.error('❌ Health check failed:', err.message);
            reject(err);
        });
    });
}

// Run health check if called directly
if (require.main === module) {
    checkHealth()
        .then(() => {
            console.log('\n✅ Health check passed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Health check failed:', error.message);
            process.exit(1);
        });
}

module.exports = { checkHealth };
