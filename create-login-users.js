const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function createLoginUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const hrPassword = await bcrypt.hash('hrmanager123', salt);
    const empPassword = await bcrypt.hash('employee123', salt);

    // Users matching LOGIN_CREDENTIALS.md
    const users = [
      {
        employeeId: 'ADMIN001',
        email: 'sanju.admin@gmail.com',
        password: adminPassword,
        role: 'admin',
        status: 'active',
        profile: {
          firstName: 'Sanju',
          lastName: 'Admin',
          phone: '+91 9999999999',
          dateOfBirth: new Date('1985-01-01'),
          address: {
            street: 'Admin Office',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          }
        },
        jobDetails: {
          department: 'Administration',
          designation: 'System Administrator',
          joiningDate: new Date('2020-01-01'),
          employmentType: 'full-time',
          salary: {
            basic: 10000000,
            allowances: 2000000,
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 30,
          sick: 15,
          personal: 10
        }
      },
      {
        employeeId: 'HR001',
        email: 'hr.manager@gmail.com',
        password: hrPassword,
        role: 'hr',
        status: 'active',
        profile: {
          firstName: 'HR',
          lastName: 'Manager',
          phone: '+91 9888888888',
          dateOfBirth: new Date('1988-05-15'),
          address: {
            street: 'HR Office',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          }
        },
        jobDetails: {
          department: 'Human Resources',
          designation: 'HR Manager',
          joiningDate: new Date('2021-01-01'),
          employmentType: 'full-time',
          salary: {
            basic: 8000000,
            allowances: 1200000,
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 25,
          sick: 12,
          personal: 8
        }
      },
      {
        employeeId: 'EMP001',
        email: 'employee.dev@gmail.com',
        password: empPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'Employee',
          lastName: 'Developer',
          phone: '+91 9777777777',
          dateOfBirth: new Date('1992-10-10'),
          address: {
            street: 'Dev Office',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India'
          }
        },
        jobDetails: {
          department: 'Engineering',
          designation: 'Software Developer',
          joiningDate: new Date('2023-01-01'),
          employmentType: 'full-time',
          salary: {
            basic: 6000000,
            allowances: 800000,
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 20,
          sick: 10,
          personal: 6
        }
      }
    ];

    // Delete existing users with these emails
    await User.deleteMany({ 
      email: { 
        $in: ['sanju.admin@gmail.com', 'hr.manager@gmail.com', 'employee.dev@gmail.com'] 
      } 
    });

    // Insert new users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users:`);
    createdUsers.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    console.log('\n🎉 Login credentials ready:');
    console.log('Admin: sanju.admin@gmail.com / admin123');
    console.log('HR: hr.manager@gmail.com / hrmanager123');
    console.log('Employee: employee.dev@gmail.com / employee123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔐 Disconnected from MongoDB');
  }
}

createLoginUsers();
