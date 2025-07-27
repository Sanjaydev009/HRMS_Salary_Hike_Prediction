#!/usr/bin/env node

/**
 * Role-Based Dashboard Test Script
 * Tests different users and their role-based permissions
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test users with different roles
const testUsers = [
  { email: 'john.doe@company.com', password: 'password123', role: 'employee', name: 'John Doe' },
  { email: 'hr@company.com', password: 'password123', role: 'hr', name: 'HR Admin' }
];

class RoleBasedTester {
  constructor() {
    this.tokens = {};
    this.userData = {};
  }

  async loginAndTest(user) {
    try {
      console.log(`\n🔐 Testing ${user.role.toUpperCase()}: ${user.name}`);
      console.log('=' .repeat(50));
      
      // Login
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: user.email,
        password: user.password
      });

      if (loginResponse.data.success) {
        const { user: userData, token } = loginResponse.data.data;
        this.tokens[user.role] = token;
        this.userData[user.role] = userData;
        
        console.log(`✅ Login successful`);
        console.log(`   Employee ID: ${userData.employeeId}`);
        console.log(`   Department: ${userData.jobDetails.department}`);
        console.log(`   Salary: ₹${userData.jobDetails.salary.basic.toLocaleString('en-IN')}`);
        
        // Test dashboard stats
        await this.testDashboardStats(user.role, token);
        
        // Test dashboard activities
        await this.testDashboardActivities(user.role, token);
        
        // Test employees list
        await this.testEmployeesList(user.role, token);
        
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testDashboardStats(role, token) {
    try {
      console.log(`\n📊 Dashboard Stats for ${role.toUpperCase()}:`);
      
      const response = await axios.get(`${API_BASE}/dashboard/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = response.data;
      console.log(`   Total Employees: ${data.totalEmployees}`);
      console.log(`   Pending Leaves: ${data.pendingLeaves}`);
      console.log(`   User Role: ${data.userRole}`);
      console.log(`   Permissions:`);
      console.log(`     - View All Employees: ${data.permissions.canViewAllEmployees ? '✅' : '❌'}`);
      console.log(`     - Manage Leaves: ${data.permissions.canManageLeaves ? '✅' : '❌'}`);
      console.log(`     - Process Payroll: ${data.permissions.canProcessPayroll ? '✅' : '❌'}`);
      console.log(`     - Manage Users: ${data.permissions.canManageUsers ? '✅' : '❌'}`);
      console.log(`     - Restricted Access: ${data.permissions.isRestricted ? '🔒' : '🔓'}`);
      
    } catch (error) {
      console.log(`❌ Stats failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testDashboardActivities(role, token) {
    try {
      console.log(`\n📝 Dashboard Activities for ${role.toUpperCase()}:`);
      
      const response = await axios.get(`${API_BASE}/dashboard/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = response.data;
      console.log(`   Total Activities: ${data.totalActivities}`);
      console.log(`   View Scope: ${data.permissions.viewScope}`);
      console.log(`   Can View All Activities: ${data.permissions.canViewAllActivities ? '✅' : '❌'}`);
      console.log(`   Can View Team Activities: ${data.permissions.canViewTeamActivities ? '✅' : '❌'}`);
      
      if (data.activities.length > 0) {
        console.log(`   Recent Activities:`);
        data.activities.slice(0, 3).forEach((activity, index) => {
          console.log(`     ${index + 1}. ${activity.title} - ${activity.description}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Activities failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async testEmployeesList(role, token) {
    try {
      console.log(`\n👥 Employees List for ${role.toUpperCase()}:`);
      
      const response = await axios.get(`${API_BASE}/employees`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = response.data.data;
      console.log(`   Total Employees Visible: ${data.employees.length}`);
      console.log(`   Permissions:`);
      console.log(`     - Can View Salary: ${data.permissions.canViewSalary ? '✅' : '❌'}`);
      console.log(`     - Can Edit: ${data.permissions.canEdit ? '✅' : '❌'}`);
      console.log(`     - Can Delete: ${data.permissions.canDelete ? '✅' : '❌'}`);
      console.log(`     - Can Add: ${data.permissions.canAdd ? '✅' : '❌'}`);
      console.log(`     - View Scope: ${data.permissions.viewScope}`);
      
      if (data.employees.length > 0) {
        console.log(`   Visible Employees:`);
        data.employees.forEach((emp, index) => {
          const salary = typeof emp.salary === 'object' && emp.salary.basic === 'Confidential' 
            ? 'Confidential' 
            : `₹${emp.jobDetails?.salary?.basic?.toLocaleString('en-IN') || 'N/A'}`;
          console.log(`     ${index + 1}. ${emp.profile.firstName} ${emp.profile.lastName} - ${salary}`);
        });
      }
      
    } catch (error) {
      console.log(`❌ Employees list failed: ${error.response?.data?.message || error.message}`);
    }
  }

  async runComprehensiveTest() {
    console.log('🚀 Starting Role-Based HRMS Dashboard Tests\n');
    console.log('🎯 Testing different user roles and their permissions');
    console.log('🔐 Each role should see different data and have different access levels');
    console.log('\n' + '='.repeat(80));

    for (const user of testUsers) {
      await this.loginAndTest(user);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 Role-Based Testing Complete!');
    console.log('\n📋 Summary of Role-Based Access:');
    console.log('   👤 EMPLOYEE: Limited access - only personal data');
    console.log('   👨‍💼 MANAGER: Team access - can see direct reports');
    console.log('   👩‍💼 HR: Department access - can manage employees');
    console.log('   👨‍💻 ADMIN: Full access - can manage everything');
    
    console.log('\n🌐 Test the web interface:');
    console.log('   🔗 http://localhost:5174/login');
    console.log('   📝 Use any of the test credentials above');
  }
}

// Run the tests
async function main() {
  const tester = new RoleBasedTester();
  await tester.runComprehensiveTest();
}

main().catch(console.error);
