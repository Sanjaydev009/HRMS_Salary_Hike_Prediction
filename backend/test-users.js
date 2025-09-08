const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  
  console.log('=== DATABASE USER ANALYSIS ===\n');
  
  const allUsers = await User.find({}).select('role email profile.firstName profile.lastName status');
  console.log('All users in database:');
  allUsers.forEach(user => {
    console.log(`- ${user.profile?.firstName || 'N/A'} ${user.profile?.lastName || 'N/A'} (${user.email}) - Role: ${user.role}, Status: ${user.status || 'N/A'}`);
  });
  console.log(`\nTotal users: ${allUsers.length}`);
  
  const employeeUsers = await User.find({ role: { $in: ['employee'] } });
  console.log(`\nEmployees only: ${employeeUsers.length}`);
  
  const allRoles = await User.find({ role: { $in: ['employee', 'hr', 'admin'] } });
  console.log(`\nAll roles (employee, hr, admin): ${allRoles.length}`);
  
  const activeUsers = await User.find({ status: 'active' });
  console.log(`\nActive users: ${activeUsers.length}`);
  
  // Group by role
  const roleGroups = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  console.log('\nUsers by role:');
  roleGroups.forEach(group => {
    console.log(`- ${group._id}: ${group.count}`);
  });
  
  mongoose.disconnect();
}).catch(console.error);
