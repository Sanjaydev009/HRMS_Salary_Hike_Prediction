const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const addTestData = async () => {
  try {
    console.log('🚀 Adding test data for dashboard...');
    
    // Check if we already have users
    const existingUsers = await User.countDocuments({ role: 'employee' });
    console.log(`Found ${existingUsers} existing employees`);
    
    if (existingUsers === 0) {
      console.log('Creating test employees...');
      
      const testEmployees = [
        {
          email: 'john.doe@company.com',
          password: 'hashedpassword',
          role: 'employee',
          status: 'active',
          employeeId: 'EMP001',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date('1990-05-15'),
            nationality: 'Indian',
            phone: '+91-9876543210'
          },
          jobDetails: {
            designation: 'Software Engineer',
            department: 'Engineering',
            joiningDate: new Date('2024-01-15'),
            employmentType: 'Full-time',
            salary: {
              basic: 750000,
              allowances: 150000
            }
          }
        },
        {
          email: 'jane.smith@company.com',
          password: 'hashedpassword',
          role: 'employee',
          status: 'active',
          employeeId: 'EMP002',
          profile: {
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: new Date('1988-08-22'),
            nationality: 'Indian',
            phone: '+91-9876543211'
          },
          jobDetails: {
            designation: 'Product Manager',
            department: 'Product',
            joiningDate: new Date('2024-02-01'),
            employmentType: 'Full-time',
            salary: {
              basic: 1200000,
              allowances: 200000
            }
          }
        },
        {
          email: 'mike.wilson@company.com',
          password: 'hashedpassword',
          role: 'employee',
          status: 'active',
          employeeId: 'EMP003',
          profile: {
            firstName: 'Mike',
            lastName: 'Wilson',
            dateOfBirth: new Date('1992-03-10'),
            nationality: 'Indian',
            phone: '+91-9876543212'
          },
          jobDetails: {
            designation: 'Data Scientist',
            department: 'Analytics',
            joiningDate: new Date('2024-03-01'),
            employmentType: 'Full-time',
            salary: {
              basic: 950000,
              allowances: 150000
            }
          }
        }
      ];
      
      await User.insertMany(testEmployees);
      console.log('✅ Test employees created');
    }
    
    // Add some test leaves
    const existingLeaves = await Leave.countDocuments();
    console.log(`Found ${existingLeaves} existing leaves`);
    
    if (existingLeaves < 5) {
      console.log('Creating test leave requests...');
      
      const employees = await User.find({ role: 'employee' }).limit(3);
      
      const testLeaves = [
        {
          employeeId: employees[0]._id,
          leaveType: 'sick',
          startDate: new Date('2024-08-20'),
          endDate: new Date('2024-08-22'),
          reason: 'Medical checkup',
          status: 'pending',
          appliedDate: new Date()
        },
        {
          employeeId: employees[1]._id,
          leaveType: 'casual',
          startDate: new Date('2024-08-25'),
          endDate: new Date('2024-08-26'),
          reason: 'Family function',
          status: 'approved',
          appliedDate: new Date()
        },
        {
          employeeId: employees[2]._id,
          leaveType: 'annual',
          startDate: new Date('2024-09-01'),
          endDate: new Date('2024-09-05'),
          reason: 'Vacation',
          status: 'pending',
          appliedDate: new Date()
        }
      ];
      
      await Leave.insertMany(testLeaves);
      console.log('✅ Test leave requests created');
    }
    
    // Add some test payroll data
    const existingPayrolls = await Payroll.countDocuments();
    console.log(`Found ${existingPayrolls} existing payrolls`);
    
    if (existingPayrolls < 3) {
      console.log('Creating test payroll records...');
      
      const employees = await User.find({ role: 'employee' }).limit(3);
      const currentMonth = new Date();
      const payPeriodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const payPeriodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const testPayrolls = employees.map(emp => ({
        employeeId: emp._id,
        payPeriodStart,
        payPeriodEnd,
        basicSalary: emp.jobDetails.salary.basic,
        allowances: emp.jobDetails.salary.allowances || 0,
        deductions: 5000,
        grossSalary: emp.jobDetails.salary.basic + (emp.jobDetails.salary.allowances || 0),
        netSalary: emp.jobDetails.salary.basic + (emp.jobDetails.salary.allowances || 0) - 5000,
        status: 'processed',
        processedDate: new Date()
      }));
      
      await Payroll.insertMany(testPayrolls);
      console.log('✅ Test payroll records created');
    }
    
    console.log('🎉 Test data setup complete!');
    
    // Display summary
    const stats = {
      employees: await User.countDocuments({ role: 'employee' }),
      leaves: await Leave.countDocuments(),
      payrolls: await Payroll.countDocuments(),
      departments: (await User.distinct('jobDetails.department', { role: 'employee' })).length
    };
    
    console.log('📊 Current data summary:', stats);
    
  } catch (error) {
    console.error('❌ Error adding test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

addTestData();
