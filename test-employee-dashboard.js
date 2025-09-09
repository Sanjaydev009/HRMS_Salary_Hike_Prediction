// Test employee dashboard to check HR notes display
const fetch = require('node-fetch');

const testEmployeeDashboard = async () => {
  try {
    // Login as employee
    console.log('🔑 Logging in as employee...');
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employee.dev@gmail.com',
        password: 'employee123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData.success ? 'SUCCESS' : 'FAILED');
    
    if (!loginData.success) {
      console.error('Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Employee logged in successfully');

    // Test the user dashboard API (what frontend actually calls)
    console.log('\n📊 Fetching user dashboard (frontend endpoint)...');
    const dashboardResponse = await fetch('http://localhost:5001/api/dashboard/user', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const dashboardData = await dashboardResponse.json();
    console.log('Dashboard API response:', dashboardResponse.status);
    console.log('Dashboard response structure:', JSON.stringify(dashboardData, null, 2));
    
    if (dashboardData.recentActivities || dashboardData.data?.recentActivities) {
      const activities = dashboardData.recentActivities || dashboardData.data?.recentActivities;
      console.log('✅ Dashboard data loaded successfully');
      
      // Check for recent activities with HR notes
      console.log('\n📋 Recent Activities with HR Notes:');
      activities.forEach((activity, index) => {
        console.log(`\n${index + 1}. ${activity.title}`);
        console.log(`   Status: ${activity.status}`);
        console.log(`   Description: ${activity.description}`);
        
        if (activity.hrNotes) {
          console.log(`   🎯 HR NOTES: ${activity.hrNotes}`);
        } else {
          console.log('   ❌ No HR notes found');
        }
        
        if (activity.rejectionReason) {
          console.log(`   📝 Rejection Reason: ${activity.rejectionReason}`);
        }
      });
    } else {
      console.log('❌ No recent activities found in dashboard data');
    }

    // Check personal stats
    const personalStats = dashboardData.personalStats || dashboardData.data?.personalStats;
    if (personalStats) {
      console.log('\n📈 Personal Stats:');
      console.log(`   Total Leaves: ${personalStats.totalLeaves}`);
      console.log(`   Pending: ${personalStats.pendingLeaves}`);
      console.log(`   Approved: ${personalStats.approvedLeaves}`);
    }

    // Also test the detailed leaves API to compare
    console.log('\n📋 Testing detailed leaves API for comparison...');
    const leavesResponse = await fetch('http://localhost:5001/api/leaves/my', {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const leavesData = await leavesResponse.json();
    if (leavesData.success && leavesData.data?.leaves) {
      console.log(`✅ Found ${leavesData.data.leaves.length} detailed leave records`);
      leavesData.data.leaves.forEach((leave, index) => {
        console.log(`\n${index + 1}. Leave ID: ${leave._id}`);
        console.log(`   Status: ${leave.status}`);
        if (leave.hrNotes) {
          console.log(`   🎯 HR NOTES in detailed API: ${leave.hrNotes}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testEmployeeDashboard();
