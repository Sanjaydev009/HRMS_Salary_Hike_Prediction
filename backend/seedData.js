const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

async function createSampleData() {
  try {
    console.log('Creating sample data...');

    // Clear existing data
    await User.deleteMany({});
    await Leave.deleteMany({});
    await Payroll.deleteMany({});

    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Sample users/employees
    const users = [
      {
        employeeId: 'EMP001',
        email: 'john.doe@company.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1-555-0101',
          dateOfBirth: new Date('1990-05-15'),
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Engineering',
          designation: 'Senior Developer',
          joiningDate: new Date('2022-01-15'),
          employmentType: 'full-time',
          salary: {
            basic: 6000000, // 6 LPA in INR
            allowances: 400000, // 4 LPA allowances
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 15,
          sick: 8,
          personal: 4
        }
      },
      {
        employeeId: 'EMP002',
        email: 'sarah.wilson@company.com',
        password: hashedPassword,
        role: 'manager',
        status: 'active',
        profile: {
          firstName: 'Sarah',
          lastName: 'Wilson',
          phone: '+1-555-0102',
          dateOfBirth: new Date('1988-08-22'),
          address: {
            street: '456 Oak Ave',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94102',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Marketing',
          designation: 'Marketing Manager',
          joiningDate: new Date('2021-03-10'),
          employmentType: 'full-time',
          salary: {
            basic: 6800000, // 6.8 LPA in INR
            allowances: 560000, // 5.6 LPA allowances
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 17,
          sick: 11,
          personal: 5
        }
      },
      {
        employeeId: 'EMP003',
        email: 'mike.johnson@company.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'Mike',
          lastName: 'Johnson',
          phone: '+1-555-0103',
          dateOfBirth: new Date('1992-12-03'),
          address: {
            street: '789 Pine St',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Finance',
          designation: 'Financial Analyst',
          joiningDate: new Date('2023-06-01'),
          employmentType: 'full-time',
          salary: {
            basic: 5200000, // 5.2 LPA in INR
            allowances: 320000, // 3.2 LPA allowances
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 15,
          sick: 10,
          personal: 5
        }
      },
      {
        employeeId: 'EMP004',
        email: 'emma.brown@company.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'Emma',
          lastName: 'Brown',
          phone: '+1-555-0104',
          dateOfBirth: new Date('1991-04-18'),
          address: {
            street: '321 Elm St',
            city: 'Austin',
            state: 'TX',
            zipCode: '73301',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Engineering',
          designation: 'Frontend Developer',
          joiningDate: new Date('2022-09-15'),
          employmentType: 'full-time',
          salary: {
            basic: 5600000, // 5.6 LPA in INR
            allowances: 440000, // 4.4 LPA allowances
            currency: 'INR'
          },
          workLocation: 'Remote'
        },
        leaveBalance: {
          annual: 13,
          sick: 7,
          personal: 4
        }
      },
      {
        employeeId: 'HR001',
        email: 'hr@company.com',
        password: hashedPassword,
        role: 'hr',
        status: 'active',
        profile: {
          firstName: 'Lisa',
          lastName: 'Davis',
          phone: '+1-555-0105',
          dateOfBirth: new Date('1985-11-25'),
          address: {
            street: '654 Maple Dr',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Human Resources',
          designation: 'HR Manager',
          joiningDate: new Date('2020-01-20'),
          employmentType: 'full-time',
          salary: {
            basic: 6400000, // 6.4 LPA in INR
            allowances: 480000, // 4.8 LPA allowances
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 15,
          sick: 10,
          personal: 4
        }
      }
    ];

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`Created ${createdUsers.length} users`);

    // Sample leave requests
    const leaves = [
      {
        employeeId: createdUsers[0]._id,
        leaveType: 'annual',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2025-08-05'),
        numberOfDays: 5,
        reason: 'Family vacation',
        status: 'pending',
        createdAt: new Date()
      },
      {
        employeeId: createdUsers[1]._id,
        leaveType: 'sick',
        startDate: new Date('2025-07-20'),
        endDate: new Date('2025-07-22'),
        numberOfDays: 3,
        reason: 'Medical appointment',
        status: 'approved',
        approvedBy: createdUsers[4]._id,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      {
        employeeId: createdUsers[2]._id,
        leaveType: 'personal',
        startDate: new Date('2025-08-10'),
        endDate: new Date('2025-08-12'),
        numberOfDays: 3,
        reason: 'Personal matters',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    const createdLeaves = await Leave.insertMany(leaves);
    console.log(`Created ${createdLeaves.length} leave requests`);

    // Skip payroll for now - too complex
    // const createdPayrolls = await Payroll.insertMany(payrolls);
    // console.log(`Created ${createdPayrolls.length} payroll records`);

    console.log('Sample data created successfully!');
    
    // Test the dashboard API
    console.log('\nTesting dashboard stats...');
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['employee', 'manager'] },
      status: 'active' 
    });
    console.log(`Total employees found: ${totalEmployees}`);

  } catch (error) {
    console.error('Error creating sample data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createSampleData();
