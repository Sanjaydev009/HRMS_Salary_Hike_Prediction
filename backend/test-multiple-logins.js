// Test multiple login attempts to diagnose the issue
const fs = require('fs');

async function testMultipleLogins() {
    const testResults = [];
    
    console.log('🔍 Testing Multiple Login Attempts');
    console.log('===================================');
    
    // Use fetch if available (Node 18+) or require node-fetch
    let fetch;
    try {
        fetch = (await import('node-fetch')).default;
    } catch (e) {
        console.log('Using global fetch (Node 18+)');
        fetch = global.fetch;
    }
    
    const loginData = {
        email: 'hr.manager@gmail.com',
        password: 'hrmanager123'
    };
    
    // Test 5 consecutive login attempts
    for (let i = 1; i <= 5; i++) {
        try {
            console.log(`\n🔄 Attempt ${i}:`);
            
            const startTime = Date.now();
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });
            
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            const data = await response.json();
            
            const result = {
                attempt: i,
                status: response.status,
                success: data.success,
                message: data.message,
                responseTime: responseTime + 'ms',
                hasToken: !!data.data?.token,
                rateLimitHeaders: {
                    remaining: response.headers.get('ratelimit-remaining'),
                    resetTime: response.headers.get('ratelimit-reset'),
                    limit: response.headers.get('ratelimit-limit')
                }
            };
            
            testResults.push(result);
            
            console.log(`   Status: ${response.status}`);
            console.log(`   Success: ${data.success}`);
            console.log(`   Message: ${data.message}`);
            console.log(`   Response Time: ${responseTime}ms`);
            console.log(`   Rate Limit Remaining: ${response.headers.get('ratelimit-remaining') || 'N/A'}`);
            
            if (!data.success) {
                console.log(`   ❌ Login failed on attempt ${i}`);
                break;
            } else {
                console.log(`   ✅ Login successful on attempt ${i}`);
            }
            
            // Wait 1 second between attempts
            await new Promise(resolve => setTimeout(resolve, 1000));
            
        } catch (error) {
            console.log(`   ❌ Network error on attempt ${i}: ${error.message}`);
            testResults.push({
                attempt: i,
                error: error.message,
                responseTime: 'N/A'
            });
            break;
        }
    }
    
    // Save results to file
    fs.writeFileSync('login-test-results.json', JSON.stringify(testResults, null, 2));
    
    console.log('\n📊 Test Summary:');
    console.log('================');
    console.log(`Total attempts: ${testResults.length}`);
    console.log(`Successful logins: ${testResults.filter(r => r.success).length}`);
    console.log(`Failed logins: ${testResults.filter(r => !r.success && !r.error).length}`);
    console.log(`Network errors: ${testResults.filter(r => r.error).length}`);
    console.log('\nResults saved to: login-test-results.json');
    
    // Test health endpoint
    console.log('\n🏥 Testing Health Endpoint:');
    try {
        const healthResponse = await fetch('http://localhost:5001/api/health');
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
    } catch (error) {
        console.log('Health check failed:', error.message);
    }
}

testMultipleLogins().catch(console.error);
