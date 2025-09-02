// Test leave API with authentication
const fetch = require('node-fetch');

async function testLeaveAPI() {
    try {
        // Step 1: Login to get token
        console.log('1. Logging in as HR...');
        const loginResponse = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'hr.manager@gmail.com',
                password: 'hrmanager123'
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.statusText}`);
        }

        const loginData = await loginResponse.json();
        const token = loginData.token;
        console.log('✓ Login successful, token received');

        // Step 2: Get all leave requests (HR should see all)
        console.log('\n2. Fetching all leave requests...');
        const leavesResponse = await fetch('http://localhost:5001/api/leaves', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!leavesResponse.ok) {
            throw new Error(`Failed to fetch leaves: ${leavesResponse.statusText}`);
        }

        const leavesData = await leavesResponse.json();
        console.log('✓ Leaves API response structure:');
        console.log(JSON.stringify(leavesData, null, 2));

        if (leavesData.success && leavesData.data && leavesData.data.leaves) {
            console.log(`\n📊 Found ${leavesData.data.leaves.length} leave requests:`);
            leavesData.data.leaves.forEach((leave, index) => {
                console.log(`${index + 1}. ${leave.employeeId?.profile?.firstName || 'Unknown'} ${leave.employeeId?.profile?.lastName || ''} - ${leave.leaveType} (${leave.status}) - ${leave.startDate} to ${leave.endDate}`);
            });
        } else {
            console.log('⚠️ Unexpected response structure');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testLeaveAPI();
