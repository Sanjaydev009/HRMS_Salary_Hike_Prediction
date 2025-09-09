// Comprehensive test to identify exactly where the days discrepancy occurs
const fetch = require('node-fetch');

const testLeaveDaysDiscrepancy = async () => {
  try {
    console.log('🔍 TESTING LEAVE DAYS DISCREPANCY');
    console.log('=' .repeat(60));

    // Login as employee first
    const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employee.dev@gmail.com',
        password: 'employee123'
      })
    });

    const loginData = await loginResponse.json();
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.message);
      return;
    }

    const token = loginData.data.token;
    console.log('✅ Employee logged in successfully\n');

    // Test date range: 09/09/2025 - 14/09/2025 (6 calendar days, 4 working days)
    const testStartDate = '2025-09-09';
    const testEndDate = '2025-09-14';

    console.log('📅 TEST SCENARIO:');
    console.log(`Start Date: ${testStartDate} (Monday)`);
    console.log(`End Date: ${testEndDate} (Saturday)`);
    console.log('Expected: 6 calendar days, 4 working days (excludes Sat, Sun)\n');

    // Create a test leave application
    console.log('📋 STEP 1: Creating leave application...');
    const leaveData = {
      leaveType: 'annual',
      startDate: testStartDate,
      endDate: testEndDate,
      reason: 'Test leave for days calculation check',
      halfDay: false
    };

    const applyResponse = await fetch('http://localhost:5001/api/leaves/apply', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(leaveData)
    });

    const applyResult = await applyResponse.json();
    if (!applyResult.success) {
      console.error('❌ Leave application failed:', applyResult.message);
      return;
    }

    const createdLeaveId = applyResult.data.leave._id;
    console.log(`✅ Leave application created with ID: ${createdLeaveId}`);
    console.log(`📊 Backend calculated days: ${applyResult.data.leave.numberOfDays}`);

    // Get the leave details from employee perspective
    console.log('\n📋 STEP 2: Fetching leave from employee API...');
    const myLeavesResponse = await fetch('http://localhost:5001/api/leaves/my', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const myLeavesData = await myLeavesResponse.json();
    if (myLeavesData.success) {
      const targetLeave = myLeavesData.data.leaves.find(leave => leave._id === createdLeaveId);
      if (targetLeave) {
        console.log(`✅ Found leave in employee API`);
        console.log(`📊 Employee API shows: ${targetLeave.numberOfDays} days`);
        console.log(`📅 Dates: ${targetLeave.startDate} to ${targetLeave.endDate}`);
      } else {
        console.log('❌ Leave not found in employee API');
      }
    }

    // Login as HR to see how HR views this leave
    console.log('\n🔄 STEP 3: Logging in as HR...');
    const hrLoginResponse = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'hr.admin@gmail.com',
        password: 'hr123'
      })
    });

    const hrLoginData = await hrLoginResponse.json();
    if (!hrLoginData.success) {
      console.error('❌ HR login failed:', hrLoginData.message);
      return;
    }

    const hrToken = hrLoginData.data.token;
    console.log('✅ HR logged in successfully');

    // Get the leave details from HR perspective
    console.log('\n📋 STEP 4: Fetching leave from HR API...');
    const hrLeavesResponse = await fetch('http://localhost:5001/api/leaves', {
      headers: {
        'Authorization': `Bearer ${hrToken}`,
        'Content-Type': 'application/json'
      }
    });

    const hrLeavesData = await hrLeavesResponse.json();
    if (hrLeavesData.success) {
      const targetLeave = hrLeavesData.data.leaves.find(leave => leave._id === createdLeaveId);
      if (targetLeave) {
        console.log(`✅ Found leave in HR API`);
        console.log(`📊 HR API shows: ${targetLeave.numberOfDays} days`);
        console.log(`📅 Dates: ${targetLeave.startDate} to ${targetLeave.endDate}`);
      } else {
        console.log('❌ Leave not found in HR API');
      }
    }

    // Frontend calculation simulation
    console.log('\n📋 STEP 5: Simulating frontend calculation...');
    const startDate = new Date(testStartDate);
    const endDate = new Date(testEndDate);

    // Frontend working days calculation (matching LeaveRequestForm.tsx)
    let frontendWorkingDays = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Skip weekends
        frontendWorkingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    console.log(`📊 Frontend calculation: ${frontendWorkingDays} working days`);

    // Summary
    console.log('\n🎯 SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`Calendar days: 6`);
    console.log(`Backend calculated: ${applyResult.data.leave.numberOfDays} days`);
    console.log(`Frontend calculated: ${frontendWorkingDays} days`);
    
    if (applyResult.data.leave.numberOfDays === frontendWorkingDays) {
      console.log('✅ Backend and frontend calculations match');
    } else {
      console.log('❌ MISMATCH: Backend and frontend calculations differ');
    }
    
    console.log('\n💡 CONCLUSION:');
    if (applyResult.data.leave.numberOfDays === 4) {
      console.log('✅ System is correctly calculating working days (4)');
      console.log('ℹ️  If you see 6 days somewhere, it might be:');
      console.log('   1. A UI bug showing calendar days instead of working days');
      console.log('   2. A different date range being displayed');
      console.log('   3. A caching issue in the frontend');
    } else {
      console.log('❌ There is indeed a calculation error in the backend');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

testLeaveDaysDiscrepancy();
