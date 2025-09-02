const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('email role status profile.firstName profile.lastName employeeId');
    
    console.log(`\n📊 Found ${users.length} users in the database:`);
    console.log('==========================================');
    
    if (users.length === 0) {
      console.log('❌ No users found in the database!');
      console.log('📝 Run "node create-login-users.js" to create test users');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. 📧 Email: ${user.email}`);
        console.log(`   👤 Name: ${user.profile?.firstName || 'N/A'} ${user.profile?.lastName || 'N/A'}`);
        console.log(`   🏷️  Role: ${user.role}`);
        console.log(`   📊 Status: ${user.status}`);
        console.log(`   🆔 Employee ID: ${user.employeeId || 'N/A'}`);
        console.log('   ---');
      });
    }

    // Check database connection
    console.log('\n🔍 Database Info:');
    console.log(`Database Name: ${mongoose.connection.db.databaseName}`);
    console.log(`Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Collections: ${collections.map(c => c.name).join(', ')}`);

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from MongoDB');
  }
}

checkUsers();
