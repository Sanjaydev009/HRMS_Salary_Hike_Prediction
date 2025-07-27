// Test script to debug frontend login
// Run this in browser console at http://localhost:5174/login

async function testFrontendLogin() {
  try {
    console.log('🔍 Testing frontend login...');
    
    // Test API connection first
    const apiResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'john.doe@company.com',
        password: 'password123'
      })
    });
    
    const data = await apiResponse.json();
    console.log('✅ Direct API test:', data);
    
    // Test through frontend API service
    const frontendAPI = await fetch('/api/auth/login', {
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'john.doe@company.com',
        password: 'password123'
      })
    });
    
    console.log('🔗 Frontend API status:', frontendAPI.status);
    
    if (frontendAPI.ok) {
      const frontendData = await frontendAPI.json();
      console.log('✅ Frontend API response:', frontendData);
    } else {
      console.log('❌ Frontend API error:', await frontendAPI.text());
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFrontendLogin();
