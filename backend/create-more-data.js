const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
require('dotenv').config();

async function createMoreTestData() {
  try {
    console.log('Creating additional test data for HR Dashboard...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Hash password for demo users
    const hashedPassword = await bcrypt.hash('employee123', 10);

    // Create more employees for better dashboard data
    const additionalEmployees = [
      {
        employeeId: 'EMP005',
        email: 'alice.smith@company.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'Alice',
          lastName: 'Smith',
          phone: '+1-555-0105',
          dateOfBirth: new Date('1989-03-20'),
          address: {
            street: '789 Oak Ave',
            city: 'Seattle',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Marketing',
          designation: 'Marketing Specialist',
          joiningDate: new Date('2022-06-15'),
          employmentType: 'full-time',
          salary: {
            basic: 5800000, // 5.8 LPA
            allowances: 420000,
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 18,
          sick: 9,
          personal: 5
        }
      },
      {
        employeeId: 'EMP006',
        email: 'bob.wilson@company.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'Bob',
          lastName: 'Wilson',
          phone: '+1-555-0106',
          dateOfBirth: new Date('1985-11-10'),
          address: {
            street: '456 Pine St',
            city: 'Portland',
            state: 'OR',
            zipCode: '97201',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Engineering',
          designation: 'Backend Developer',
          joiningDate: new Date('2021-09-01'),
          employmentType: 'full-time',
          salary: {
            basic: 6500000, // 6.5 LPA
            allowances: 480000,
            currency: 'INR'
          },
          workLocation: 'Remote'
        },
        leaveBalance: {
          annual: 20,
          sick: 8,
          personal: 6
        }
      },
      {
        employeeId: 'EMP007',
        email: 'carol.davis@company.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'Carol',
          lastName: 'Davis',
          phone: '+1-555-0107',
          dateOfBirth: new Date('1993-07-25'),
          address: {
            street: '321 Elm Ave',
            city: 'Denver',
            state: 'CO',
            zipCode: '80201',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Finance',
          designation: 'Senior Financial Analyst',
          joiningDate: new Date('2023-01-10'),
          employmentType: 'full-time',
          salary: {
            basic: 5900000, // 5.9 LPA
            allowances: 360000,
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 22,
          sick: 12,
          personal: 4
        }
      },
      {
        employeeId: 'EMP008',
        email: 'david.brown@company.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'David',
          lastName: 'Brown',
          phone: '+1-555-0108',
          dateOfBirth: new Date('1987-09-12'),
          address: {
            street: '654 Maple Dr',
            city: 'Phoenix',
            state: 'AZ',
            zipCode: '85001',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Operations',
          designation: 'Operations Manager',
          joiningDate: new Date('2020-11-20'),
          employmentType: 'full-time',
          salary: {
            basic: 7200000, // 7.2 LPA
            allowances: 540000,
            currency: 'INR'
          },
          workLocation: 'Office'
        },
        leaveBalance: {
          annual: 16,
          sick: 7,
          personal: 3
        }
      },
      {
        employeeId: 'EMP009',
        email: 'eva.garcia@company.com',
        password: hashedPassword,
        role: 'employee',
        status: 'active',
        profile: {
          firstName: 'Eva',
          lastName: 'Garcia',
          phone: '+1-555-0109',
          dateOfBirth: new Date('1991-12-05'),
          address: {
            street: '987 Cedar St',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            country: 'USA'
          }
        },
        jobDetails: {
          department: 'Design',
          designation: 'UX Designer',
          joiningDate: new Date('2022-03-18'),
          employmentType: 'full-time',
          salary: {
            basic: 6100000, // 6.1 LPA
            allowances: 390000,
            currency: 'INR'
          },
          workLocation: 'Hybrid'
        },
        leaveBalance: {
          annual: 19,
          sick: 10,
          personal: 6
        }
      }
    ];

    // Add employees to existing data instead of replacing
    const createdEmployees = await User.insertMany(additionalEmployees);
    console.log(`✅ Created ${createdEmployees.length} additional employees`);

    // Create more leave requests for better data
    const additionalLeaves = [
      {
        employeeId: createdEmployees[0]._id, // Alice
        leaveType: 'annual',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-03'),
        numberOfDays: 3,
        reason: 'Family vacation',
        status: 'pending',
        createdAt: new Date()
      },
      {
        employeeId: createdEmployees[1]._id, // Bob
        leaveType: 'sick',
        startDate: new Date('2025-08-25'),
        endDate: new Date('2025-08-26'),
        numberOfDays: 2,
        reason: 'Medical appointment',
        status: 'approved',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        employeeId: createdEmployees[2]._id, // Carol
        leaveType: 'casual',
        startDate: new Date('2025-09-05'),
        endDate: new Date('2025-09-06'),
        numberOfDays: 2,
        reason: 'Personal work',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        employeeId: createdEmployees[3]._id, // David
        leaveType: 'annual',
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-08-25'),
        numberOfDays: 5,
        reason: 'Summer vacation',
        status: 'approved',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        employeeId: createdEmployees[4]._id, // Eva
        leaveType: 'sick',
        startDate: new Date('2025-08-28'),
        endDate: new Date('2025-08-29'),
        numberOfDays: 2,
        reason: 'Health checkup',
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      }
    ];

    const createdLeaves = await Leave.insertMany(additionalLeaves);
    console.log(`✅ Created ${createdLeaves.length} additional leave requests`);

    // Create some payroll records for current month
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const payrollRecords = createdEmployees.map(emp => ({
      employeeId: emp._id,
      payPeriodStart: firstDayOfMonth,
      payPeriodEnd: lastDayOfMonth,
      basicSalary: emp.jobDetails.salary.basic,
      allowances: emp.jobDetails.salary.allowances,
      deductions: {
        tax: Math.round(emp.jobDetails.salary.basic * 0.1), // 10% tax
        providentFund: Math.round(emp.jobDetails.salary.basic * 0.12), // 12% PF
        insurance: 5000 // Fixed insurance
      },
      grossSalary: emp.jobDetails.salary.basic + emp.jobDetails.salary.allowances,
      netSalary: emp.jobDetails.salary.basic + emp.jobDetails.salary.allowances - 
                 Math.round(emp.jobDetails.salary.basic * 0.22) - 5000, // Minus deductions
      status: Math.random() > 0.5 ? 'processed' : 'pending',
      processedAt: Math.random() > 0.5 ? new Date() : null,
      createdAt: new Date()
    }));

    const createdPayrolls = await Payroll.insertMany(payrollRecords);
    console.log(`✅ Created ${createdPayrolls.length} payroll records`);

    // Summary
    const totalEmployees = await User.countDocuments({ role: 'employee', status: 'active' });
    const totalDepartments = await User.distinct('jobDetails.department', { role: 'employee', status: 'active' });
    const totalLeaves = await Leave.countDocuments({});
    const totalPayrolls = await Payroll.countDocuments({});

    console.log('\n📊 Test Data Summary:');
    console.log(`Total Active Employees: ${totalEmployees}`);
    console.log(`Total Departments: ${totalDepartments.length}`);
    console.log(`Total Leave Requests: ${totalLeaves}`);
    console.log(`Total Payroll Records: ${totalPayrolls}`);
    console.log('\n🎉 Additional test data created successfully!');

    console.log('\n🔐 Login Credentials (all use password: employee123):');
    additionalEmployees.forEach(emp => {
      console.log(`  - ${emp.email} (${emp.jobDetails.department})`);
    });

  } catch (error) {
    console.error('❌ Error creating additional test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from MongoDB');
  }
}

createMoreTestData();
