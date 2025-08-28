// Test frontend-backend connectivity
const testAuth = async () => {
  try {
    console.log('🔄 Testing frontend-backend connectivity...');
    
    // Test 1: Basic API connectivity
    const testResponse = await fetch('http://localhost:5001/api/test');
    const testData = await testResponse.json();
    console.log('✅ Backend test:', testData);
    
    // Test 2: Login API
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'employee.dev@gmail.com',
        password: 'employee123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login test:', loginData);
    
    if (loginData.success) {
      console.log('🎉 Authentication is working!');
      console.log('Token:', loginData.data.token);
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAuth();
