const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const testUsers = [
      {
        employeeId: 'ADMIN001',
        email: 'sanju.admin@gmail.com',
        password: 'admin123',
        role: 'admin',
        profile: {
          firstName: 'Sanju',
          lastName: 'Admin',
          phone: '+91 9999999999',
        },
        jobDetails: {
          department: 'IT',
          designation: 'System Administrator',
          joiningDate: new Date('2024-01-01'),
        }
      },
      {
        employeeId: 'HR001',
        email: 'hr.manager@gmail.com',
        password: 'hrmanager123',
        role: 'hr',
        profile: {
          firstName: 'HR',
          lastName: 'Manager',
          phone: '+91 9999999998',
        },
        jobDetails: {
          department: 'Human Resources',
          designation: 'HR Manager',
          joiningDate: new Date('2024-01-01'),
        }
      },
      {
        employeeId: 'EMP001',
        email: 'employee.dev@gmail.com',
        password: 'employee123',
        role: 'employee',
        profile: {
          firstName: 'Employee',
          lastName: 'Developer',
          phone: '+91 9999999997',
        },
        jobDetails: {
          department: 'Development',
          designation: 'Software Engineer',
          joiningDate: new Date('2024-01-01'),
        }
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        console.log(`ℹ️  User ${userData.email} already exists`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      // Create user
      const user = new User({
        ...userData,
        password: hashedPassword,
        status: 'active',
      });

      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('🎉 Test users creation completed');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error creating test users:', error);
    await mongoose.disconnect();
  }
}

// Run the function
createTestUsers();