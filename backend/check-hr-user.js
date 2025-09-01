const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    
    const users = await User.find({});
    console.log('All users in database:');
    users.forEach(user => {
      const fullName = user.fullName || 'No Name';
      const department = user.jobDetails?.department || 'No Department';
      const designation = user.jobDetails?.designation || 'No Designation';
      console.log(`- ${fullName} | ${user.email} | Role: ${user.role} | Department: ${department} | Position: ${designation}`);
    });
    
    const hrUsers = await User.find({ role: 'hr' });
    console.log('\nHR Users specifically:');
    hrUsers.forEach(user => {
      const fullName = user.fullName || 'No Name';
      const department = user.jobDetails?.department || 'No Department';
      const designation = user.jobDetails?.designation || 'No Designation';
      console.log(`- ${fullName} | ${user.email} | Department: ${department} | Position: ${designation}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();
