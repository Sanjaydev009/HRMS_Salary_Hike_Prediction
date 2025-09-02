// Quick login test script
const loginData = {
  email: 'sanju.admin@gmail.com',
  password: 'admin123'
};

fetch('http://localhost:5001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(loginData)
})
.then(response => response.json())
.then(data => {
  console.log('Login response:', data);
  if (data.success && data.data?.token) {
    localStorage.setItem('token', data.data.token);
    console.log('Token saved to localStorage');
    
    // Test employees API with token
    return fetch('http://localhost:5001/api/employees', {
      headers: {
        'Authorization': `Bearer ${data.data.token}`,
        'Content-Type': 'application/json'
      }
    });
  }
  throw new Error('Login failed');
})
.then(response => response.json())
.then(employees => {
  console.log('Employees API response:', employees);
})
.catch(error => {
  console.error('Error:', error);
});
