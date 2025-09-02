// Test script to check if we have employees in the database
const mongoose = require('mongoose');
require('dotenv').config();

// User model (simplified version for testing)
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  role: String,
  department: String,
  designation: String,
  salary: Number,
  status: { type: String, default: 'active' }
});

const User = mongoose.model('User', userSchema);

async function checkEmployees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms_db');
    console.log('Connected to MongoDB');
    
    // Count total users
    const totalUsers = await User.countDocuments();
    console.log(`Total users in database: ${totalUsers}`);
    
    // Get sample users
    const sampleUsers = await User.find().limit(5);
    console.log('Sample users:');
    sampleUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    
    // Check for HR users
    const hrUsers = await User.find({ role: { $in: ['hr', 'admin'] } });
    console.log(`\nHR/Admin users: ${hrUsers.length}`);
    hrUsers.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - ${user.role}`);
    });
    
    await mongoose.disconnect();
    console.log('\nDatabase check completed');
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkEmployees();
