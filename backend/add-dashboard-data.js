const mongoose = require('mongoose');
const User = require('./models/User');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
require('dotenv').config();

async function addLeaveAndPayrollData() {
  try {
    console.log('Adding leave and payroll data for HR Dashboard...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Get all employees (not admin or hr)
    const employees = await User.find({ role: 'employee', status: 'active' });
    console.log(`📊 Found ${employees.length} employees`);

    // Create leave requests for better dashboard data
    const leaveRequests = [
      {
        employeeId: employees[0]._id, // First employee
        leaveType: 'annual',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-09-03'),
        numberOfDays: 3,
        reason: 'Family vacation',
        status: 'pending',
        appliedDate: new Date()
      },
      {
        employeeId: employees[1]._id, // Second employee
        leaveType: 'sick',
        startDate: new Date('2025-08-25'),
        endDate: new Date('2025-08-26'),
        numberOfDays: 2,
        reason: 'Medical appointment',
        status: 'approved',
        appliedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      },
      {
        employeeId: employees[2]._id, // Third employee
        leaveType: 'casual',
        startDate: new Date('2025-09-05'),
        endDate: new Date('2025-09-06'),
        numberOfDays: 2,
        reason: 'Personal work',
        status: 'pending',
        appliedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        employeeId: employees[3]._id, // Fourth employee
        leaveType: 'annual',
        startDate: new Date('2025-08-20'),
        endDate: new Date('2025-08-25'),
        numberOfDays: 5,
        reason: 'Summer vacation',
        status: 'approved',
        appliedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        employeeId: employees[4]._id, // Fifth employee
        leaveType: 'sick',
        startDate: new Date('2025-08-28'),
        endDate: new Date('2025-08-29'),
        numberOfDays: 2,
        reason: 'Health checkup',
        status: 'pending',
        appliedDate: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        employeeId: employees[0]._id, // Add another for first employee
        leaveType: 'emergency',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-08-16'),
        numberOfDays: 2,
        reason: 'Family emergency',
        status: 'approved',
        appliedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      }
    ];

    // Check existing leaves to avoid duplicates
    const existingLeaves = await Leave.countDocuments({});
    console.log(`📋 Found ${existingLeaves} existing leave requests`);

    if (existingLeaves === 0) {
      const createdLeaves = await Leave.insertMany(leaveRequests);
      console.log(`✅ Created ${createdLeaves.length} leave requests`);
    } else {
      console.log('ℹ️ Leave requests already exist, skipping...');
    }

    // Create payroll records for current month
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // Check existing payroll
    const existingPayrolls = await Payroll.countDocuments({});
    console.log(`💰 Found ${existingPayrolls} existing payroll records`);

    if (existingPayrolls === 0) {
      // Get HR user ID for generatedBy field
      const hrUser = await User.findOne({ role: 'hr' });
      
      const payrollRecords = employees.map(emp => {
        const basicSalary = emp.jobDetails?.salary?.basic || 600000; // Default 6 LPA
        const allowances = emp.jobDetails?.salary?.allowances || 100000; // Default allowances
        const tax = Math.round(basicSalary * 0.1); // 10% tax
        const pf = Math.round(basicSalary * 0.12); // 12% PF
        const insurance = 5000; // Fixed insurance
        const workingDays = 22;
        const presentDays = Math.floor(Math.random() * 3) + 20; // 20-22 days
        
        return {
          employeeId: emp._id,
          payPeriod: {
            month: currentMonth.getMonth() + 1,
            year: currentMonth.getFullYear()
          },
          basicSalary: basicSalary,
          allowances: {
            housing: Math.round(allowances * 0.4),
            transport: Math.round(allowances * 0.3),
            medical: Math.round(allowances * 0.2),
            food: Math.round(allowances * 0.1)
          },
          deductions: {
            tax: tax,
            providentFund: pf,
            insurance: insurance
          },
          attendance: {
            workingDays: workingDays,
            presentDays: presentDays,
            absentDays: workingDays - presentDays,
            halfDays: Math.floor(Math.random() * 2),
            overtimeHours: Math.floor(Math.random() * 10)
          },
          calculations: {
            grossSalary: 0, // Will be calculated by pre-save middleware
            totalAllowances: 0, // Will be calculated by pre-save middleware
            totalDeductions: 0, // Will be calculated by pre-save middleware
            netSalary: 0 // Will be calculated by pre-save middleware
          },
          paymentDetails: {
            status: Math.random() > 0.3 ? 'processed' : 'pending',
            paymentDate: Math.random() > 0.3 ? new Date() : null,
            paymentMethod: 'bank-transfer'
          },
          generatedBy: hrUser._id,
          createdAt: new Date()
        };
      });

      const createdPayrolls = await Payroll.insertMany(payrollRecords);
      console.log(`✅ Created ${createdPayrolls.length} payroll records`);
    } else {
      console.log('ℹ️ Payroll records already exist, skipping...');
    }

    // Summary
    const totalEmployees = await User.countDocuments({ role: 'employee', status: 'active' });
    const totalDepartments = await User.distinct('jobDetails.department', { role: 'employee', status: 'active' });
    const totalLeaves = await Leave.countDocuments({});
    const totalPayrolls = await Payroll.countDocuments({});
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const processedPayrolls = await Payroll.countDocuments({ 'paymentDetails.status': 'processed' });

    console.log('\n📊 Dashboard Data Summary:');
    console.log('==========================================');
    console.log(`👥 Total Active Employees: ${totalEmployees}`);
    console.log(`🏢 Total Departments: ${totalDepartments.length}`);
    console.log(`📋 Total Leave Requests: ${totalLeaves}`);
    console.log(`⏳ Pending Leave Requests: ${pendingLeaves}`);
    console.log(`✅ Approved Leave Requests: ${approvedLeaves}`);
    console.log(`💰 Total Payroll Records: ${totalPayrolls}`);
    console.log(`💸 Processed Payrolls: ${processedPayrolls}`);
    console.log('\n🎉 Dashboard data ready!');

    console.log('\n🌐 Dashboard URLs:');
    console.log('Frontend: http://localhost:5173');
    console.log('Login with HR credentials: hr.manager@gmail.com / hrmanager123');

  } catch (error) {
    console.error('❌ Error adding dashboard data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔐 Disconnected from MongoDB');
  }
}

addLeaveAndPayrollData();
