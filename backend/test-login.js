const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function testLogin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Test credentials
    const testCredentials = [
      { email: 'sanju.admin@gmail.com', password: 'admin123' },
      { email: 'hr.manager@gmail.com', password: 'hrmanager123' },
      { email: 'employee.dev@gmail.com', password: 'employee123' }
    ];

    console.log('\n🔐 Testing Login Credentials...\n');

    for (const { email, password } of testCredentials) {
      console.log(`Testing: ${email} with password: ${password}`);
      
      // Find user
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }

      console.log(`✅ User found: ${user.profile.firstName} ${user.profile.lastName}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
      console.log(`   Stored password hash: ${user.password.substring(0, 20)}...`);

      // Test password comparison
      const isMatch = await user.comparePassword(password);
      console.log(`   Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
      
      if (user.status !== 'active') {
        console.log(`   ⚠️  Account status: ${user.status} (should be 'active')`);
      }
      
      console.log('   ---');
    }

    // Test wrong password
    console.log('\n🔍 Testing with wrong password...');
    const user = await User.findOne({ email: 'sanju.admin@gmail.com' }).select('+password');
    if (user) {
      const wrongMatch = await user.comparePassword('wrongpassword');
      console.log(`Wrong password test: ${wrongMatch ? '❌ FAILED (should be false)' : '✅ PASSED (correctly false)'}`);
    }

  } catch (error) {
    console.error('❌ Error testing login:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from MongoDB');
  }
}

testLogin();
