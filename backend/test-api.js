const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

async function testLoginAPI() {
  try {
    console.log('🔍 Testing Login API Endpoint...\n');

    const testCredentials = [
      { email: 'sanju.admin@gmail.com', password: 'admin123' },
      { email: 'hr.manager@gmail.com', password: 'hrmanager123' },
      { email: 'employee.dev@gmail.com', password: 'employee123' }
    ];

    const apiUrl = 'http://localhost:5001/api/auth/login';
    console.log(`API URL: ${apiUrl}\n`);

    for (const credentials of testCredentials) {
      console.log(`Testing login for: ${credentials.email}`);
      
      try {
        const response = await axios.post(apiUrl, credentials, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log(`✅ Login successful!`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Success: ${response.data.success}`);
        console.log(`   Message: ${response.data.message}`);
        console.log(`   User Role: ${response.data.data?.user?.role}`);
        console.log(`   Token: ${response.data.data?.token ? 'Generated' : 'Missing'}`);
        
      } catch (error) {
        console.log(`❌ Login failed!`);
        console.log(`   Status: ${error.response?.status}`);
        console.log(`   Message: ${error.response?.data?.message}`);
        console.log(`   Error: ${error.message}`);
      }
      
      console.log('   ---');
    }

    // Test wrong credentials
    console.log('\n🔍 Testing with wrong credentials...');
    try {
      const response = await axios.post(apiUrl, {
        email: 'sanju.admin@gmail.com',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed but succeeded!');
    } catch (error) {
      console.log('✅ Correctly rejected wrong password');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Message: ${error.response?.data?.message}`);
    }

  } catch (error) {
    console.error('❌ Error testing login API:', error.message);
  }
}

testLoginAPI();
