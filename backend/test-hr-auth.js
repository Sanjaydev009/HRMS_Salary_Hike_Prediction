const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function testAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    
    // Find HR user
    const hrUser = await User.findOne({ role: 'hr' });
    if (!hrUser) {
      console.log('No HR user found');
      return;
    }
    
    console.log('HR User Data:');
    console.log('================');
    console.log('Name:', hrUser.fullName);
    console.log('Email:', hrUser.email);
    console.log('Role:', hrUser.role);
    console.log('Department:', hrUser.jobDetails?.department);
    console.log('Position:', hrUser.jobDetails?.designation);
    console.log('Employee ID:', hrUser.employeeId);
    
    // Test what the /me endpoint would return
    const userForAPI = await User.findById(hrUser._id).select('-password');
    
    console.log('\nAPI Response Data (what /auth/me returns):');
    console.log('===========================================');
    console.log(JSON.stringify({
      id: userForAPI._id,
      employeeId: userForAPI.employeeId,
      email: userForAPI.email,
      role: userForAPI.role,
      profile: userForAPI.profile,
      jobDetails: userForAPI.jobDetails
    }, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAuth();
