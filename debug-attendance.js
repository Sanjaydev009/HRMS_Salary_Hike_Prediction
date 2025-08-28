// Debug script to run in browser console
// Go to http://localhost:5173, open browser dev tools (F12), and paste this in the Console tab

console.log('🔄 Starting attendance debug...');

// Check if user is logged in
const token = localStorage.getItem('token');
console.log('Token from localStorage:', token ? 'Found' : 'Not found');

if (!token) {
  console.log('❌ No token found. User is not logged in.');
  console.log('Please login first, then run this script again.');
} else {
  // Test attendance API calls
  const testAttendance = async () => {
    try {
      console.log('🔄 Testing attendance/my endpoint...');
      
      const myResponse = await fetch('http://localhost:5001/api/attendance/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const myData = await myResponse.json();
      console.log('attendance/my response:', myData);
      
      console.log('🔄 Testing attendance/today endpoint...');
      
      const todayResponse = await fetch('http://localhost:5001/api/attendance/today', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const todayData = await todayResponse.json();
      console.log('attendance/today response:', todayData);
      
      if (myData.success && todayData.success) {
        console.log('✅ Both APIs working! The issue might be in React component rendering.');
      } else {
        console.log('❌ API calls failed. Check network tab for more details.');
      }
      
    } catch (error) {
      console.error('❌ Error testing APIs:', error);
    }
  };
  
  testAttendance();
}
