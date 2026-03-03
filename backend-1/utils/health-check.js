// Health Check and Monitoring Script
// Run this to check if your production server is healthy

const https = require('https');
const http = require('http');

const config = {
    // Update this with your production URL
    url: process.env.PRODUCTION_URL || 'http://localhost:5000',
    healthEndpoint: '/api/health',
    timeout: 10000 // 10 seconds
};

function checkHealth() {
    const url = new URL(config.healthEndpoint, config.url);
    const client = url.protocol === 'https:' ? https : http;
    
    console.log(`🔍 Checking health of: ${url.href}`);
    console.log(`⏱️  Timeout: ${config.timeout}ms\n`);
    
    const startTime = Date.now();
    
    const req = client.get(url, { timeout: config.timeout }, (res) => {
        const responseTime = Date.now() - startTime;
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const health = JSON.parse(data);
                
                console.log('✅ Server is healthy!\n');
                console.log('📊 Response Details:');
                console.log(`   Status Code: ${res.statusCode}`);
                console.log(`   Response Time: ${responseTime}ms`);
                console.log(`   Server Status: ${health.status}`);
                console.log(`   Environment: ${health.environment}`);
                console.log(`   Uptime: ${formatUptime(health.uptime)}`);
                console.log(`   Timestamp: ${health.timestamp}`);
                
                // Check response time
                if (responseTime > 1000) {
                    console.log('\n⚠️  Warning: Response time is high (>1s)');
                } else if (responseTime > 500) {
                    console.log('\n⚠️  Warning: Response time is moderate (>500ms)');
                } else {
                    console.log('\n✅ Response time is good');
                }
                
                // Check environment
                if (health.environment !== 'production') {
                    console.log('⚠️  Warning: Not running in production mode');
                }
                
                process.exit(0);
                
            } catch (error) {
                console.error('❌ Failed to parse response:', error.message);
                console.error('Response data:', data);
                process.exit(1);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error('❌ Health check failed!');
        console.error('Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 The server appears to be down or not accessible.');
            console.error('   Check if the server is running and the URL is correct.');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('\n💡 Request timed out.');
            console.error('   The server might be overloaded or unresponsive.');
        }
        
        process.exit(1);
    });
    
    req.on('timeout', () => {
        req.destroy();
        console.error(`❌ Health check timed out after ${config.timeout}ms`);
        process.exit(1);
    });
}

function formatUptime(seconds) {
    if (!seconds) return 'N/A';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
    
    return parts.join(' ');
}

// Run the health check
if (require.main === module) {
    checkHealth();
}

module.exports = { checkHealth };
