const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkDashboardData = async () => {
  try {
    console.log('📊 Checking dashboard data...');
    
    // Check users
    const totalEmployees = await User.countDocuments({ role: 'employee', status: 'active' });
    const departments = await User.distinct('jobDetails.department', { role: 'employee', status: 'active' });
    const hrUsers = await User.countDocuments({ role: 'hr' });
    
    console.log('👥 User Statistics:');
    console.log(`  - Total Employees: ${totalEmployees}`);
    console.log(`  - Departments: ${departments.length} (${departments.join(', ')})`);
    console.log(`  - HR Users: ${hrUsers}`);
    
    // Check if we have HR users for testing
    if (hrUsers === 0) {
      console.log('Creating HR test user...');
      const hrUser = new User({
        email: 'hr@company.com',
        password: '$2b$10$placeholder', // This would be properly hashed in real app
        role: 'hr',
        status: 'active',
        employeeId: 'HR001',
        profile: {
          firstName: 'HR',
          lastName: 'Manager',
          dateOfBirth: new Date('1985-01-01'),
          nationality: 'Indian',
          phone: '+91-9876543299'
        },
        jobDetails: {
          designation: 'HR Manager',
          department: 'Human Resources',
          joiningDate: new Date('2023-01-01'),
          employmentType: 'Full-time',
          salary: {
            basic: 1000000,
            allowances: 200000
          }
        }
      });
      
      await hrUser.save();
      console.log('✅ HR test user created: hr@company.com');
    }
    
    // Department distribution for dashboard
    const departmentStats = await User.aggregate([
      { 
        $match: { 
          role: { $in: ['employee'] },
          status: 'active' 
        }
      },
      { 
        $group: { 
          _id: '$jobDetails.department', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } }
    ]);
    
    console.log('🏢 Department Distribution:');
    departmentStats.forEach(dept => {
      console.log(`  - ${dept._id}: ${dept.count} employees`);
    });
    
    // Recent hires (this month)
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const newHires = await User.countDocuments({
      'jobDetails.joiningDate': { $gte: firstDayOfMonth },
      role: { $in: ['employee'] },
      status: 'active'
    });
    
    console.log(`📅 New Hires This Month: ${newHires}`);
    
    console.log('\n✅ Dashboard data check complete!');
    console.log('🌐 You can now test the HR dashboard with real data at:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Login as HR: hr@company.com (use any password for demo)');
    
  } catch (error) {
    console.error('❌ Error checking dashboard data:', error);
  } finally {
    await mongoose.connection.close();
  }
};

checkDashboardData();
