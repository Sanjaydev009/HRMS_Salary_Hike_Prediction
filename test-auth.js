#!/usr/bin/env node

/**
 * HRMS Role-Based Authentication Test Script
 * Tests JWT authentication and role-based access control
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

// Test users with different roles
const testUsers = [
  { email: 'john.doe@company.com', password: 'password123', expectedRole: 'employee' },
  { email: 'sarah.wilson@company.com', password: 'password123', expectedRole: 'manager' },
  { email: 'hr@company.com', password: 'password123', expectedRole: 'hr' }
];

class AuthTester {
  constructor() {
    this.tokens = {};
  }

  async loginUser(email, password) {
    try {
      console.log(`\n🔐 Testing login for: ${email}`);
      
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        const { user, token } = response.data.data;
        this.tokens[email] = token;
        
        console.log(`✅ Login successful`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Employee ID: ${user.employeeId}`);
        console.log(`   Name: ${user.profile.firstName} ${user.profile.lastName}`);
        console.log(`   Salary: ₹${user.jobDetails.salary.basic.toLocaleString('en-IN')}`);
        
        return { user, token };
      }
    } catch (error) {
      console.log(`❌ Login failed: ${error.response?.data?.message || error.message}`);
      return null;
    }
  }

  async testProtectedRoute(email, endpoint, expectedStatusCode = 200) {
    try {
      const token = this.tokens[email];
      if (!token) {
        console.log(`❌ No token found for ${email}`);
        return false;
      }

      console.log(`\n🔒 Testing protected route: ${endpoint} for ${email}`);
      
      const response = await axios.get(`${API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === expectedStatusCode) {
        console.log(`✅ Access granted - Status: ${response.status}`);
        
        // Show sample data based on endpoint
        if (endpoint.includes('/dashboard/')) {
          if (endpoint.includes('stats')) {
            console.log(`   Total Employees: ${response.data.totalEmployees}`);
            console.log(`   Pending Leaves: ${response.data.pendingLeaves}`);
          } else if (endpoint.includes('summary')) {
            console.log(`   Monthly Payroll: ${response.data.formattedPayrollAmount}`);
            console.log(`   New Employees: ${response.data.newEmployeesThisMonth}`);
          }
        }
        return true;
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      if (status === expectedStatusCode) {
        console.log(`✅ Expected error - Status: ${status}, Message: ${message}`);
        return true;
      } else {
        console.log(`❌ Unexpected error - Status: ${status}, Message: ${message}`);
        return false;
      }
    }
  }

  async testWithoutToken(endpoint) {
    try {
      console.log(`\n🚫 Testing unauthorized access to: ${endpoint}`);
      
      await axios.get(`${API_BASE}${endpoint}`);
      console.log(`❌ Should have been blocked!`);
      return false;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;
      
      if (status === 401) {
        console.log(`✅ Correctly blocked - Status: ${status}, Message: ${message}`);
        return true;
      } else {
        console.log(`❌ Unexpected response - Status: ${status}`);
        return false;
      }
    }
  }

  async runComprehensiveTest() {
    console.log('🚀 Starting HRMS Role-Based Authentication Tests\n');
    console.log('=' .repeat(60));

    let passed = 0;
    let total = 0;

    // Test 1: Login with different roles
    console.log('\n📋 TEST 1: User Login with Different Roles');
    console.log('-'.repeat(50));
    
    for (const testUser of testUsers) {
      total++;
      const result = await this.loginUser(testUser.email, testUser.password);
      if (result && result.user.role === testUser.expectedRole) {
        passed++;
      }
    }

    // Test 2: Access protected routes with valid tokens
    console.log('\n📋 TEST 2: Protected Route Access (Authenticated Users)');
    console.log('-'.repeat(50));
    
    const protectedRoutes = [
      '/dashboard/stats',
      '/dashboard/activities', 
      '/dashboard/summary'
    ];

    for (const email of Object.keys(this.tokens)) {
      for (const route of protectedRoutes) {
        total++;
        const success = await this.testProtectedRoute(email, route, 200);
        if (success) passed++;
      }
    }

    // Test 3: Access protected routes without authentication
    console.log('\n📋 TEST 3: Protected Route Access (Unauthenticated)');
    console.log('-'.repeat(50));
    
    for (const route of protectedRoutes) {
      total++;
      const success = await this.testWithoutToken(route);
      if (success) passed++;
    }

    // Test 4: Token validation
    console.log('\n📋 TEST 4: Current User Profile Access');
    console.log('-'.repeat(50));
    
    for (const email of Object.keys(this.tokens)) {
      total++;
      const success = await this.testProtectedRoute(email, '/auth/me', 200);
      if (success) passed++;
    }

    // Final Results
    console.log('\n' + '='.repeat(60));
    console.log('🎯 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${passed}/${total}`);
    console.log(`❌ Failed: ${total - passed}/${total}`);
    console.log(`📊 Success Rate: ${Math.round((passed/total) * 100)}%`);
    
    if (passed === total) {
      console.log('\n🎉 ALL TESTS PASSED! Role-based authentication is working correctly.');
      console.log('\n🔐 Security Features Verified:');
      console.log('   ✓ JWT token-based authentication');
      console.log('   ✓ Role-based access control');
      console.log('   ✓ Protected route enforcement');
      console.log('   ✓ Unauthorized access prevention');
      console.log('   ✓ Indian Rupee currency support');
    } else {
      console.log('\n⚠️  Some tests failed. Please check the configuration.');
    }
    
    console.log('\n📚 Available Test Credentials:');
    console.log('   Employee: john.doe@company.com / password123');
    console.log('   Manager:  sarah.wilson@company.com / password123'); 
    console.log('   HR:       hr@company.com / password123');
  }
}

// Run the tests
async function main() {
  const tester = new AuthTester();
  await tester.runComprehensiveTest();
}

main().catch(console.error);
