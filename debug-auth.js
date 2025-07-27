const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function debugAuth() {
  try {
    console.log('🔍 Debugging Authentication Issue\n');

    // Test with employee login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'john.doe@company.com',
      password: 'password123'
    });

    console.log('Login Response:', {
      success: loginResponse.data.success,
      token: loginResponse.data.data?.token?.substring(0, 20) + '...',
      user: loginResponse.data.data?.user?.profile?.firstName
    });

    const token = loginResponse.data.data?.token;
    console.log('\nToken structure test:');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length);

    // Test the general stats endpoint first
    try {
      const statsResponse = await axios.get(`${API_BASE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ General stats endpoint works');
      console.log('User role:', statsResponse.data.userRole);
    } catch (error) {
      console.log('❌ General stats failed:', error.response?.data?.message);
    }

    // Test employee-specific endpoint
    try {
      const employeeResponse = await axios.get(`${API_BASE}/dashboard/employee-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Employee-specific endpoint works');
    } catch (error) {
      console.log('❌ Employee-specific failed:', error.response?.data?.message);
      console.log('Error details:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Debug error:', error.response?.data || error.message);
  }
}

debugAuth();
