const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const Payroll = require('./models/Payroll');
  
  console.log('=== PAYROLL DATA SEEDER ===\n');
  
  // Clear existing payroll data
  await Payroll.deleteMany({});
  console.log('Cleared existing payroll data');
  
  // Get all employees
  const employees = await User.find({ role: 'employee', status: 'active' });
  console.log(`Found ${employees.length} active employees`);
  
  // Create payroll records for current and previous months
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  
  const payrollRecords = [];
  
  // Get admin user for generatedBy field
  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    console.error('Admin user not found. Need admin user for generatedBy field.');
    process.exit(1);
  }
  
  for (const employee of employees) {
    // Base salary varies by employee
    const baseSalary = Math.floor(Math.random() * 5000) + 3000; // $3000-$8000
    
    // Create records for previous month (paid)
    const prevMonthRecord = {
      employeeId: employee._id,
      payPeriod: {
        month: prevMonth,
        year: prevYear
      },
      basicSalary: baseSalary,
      allowances: {
        housing: Math.floor(baseSalary * 0.15), // 15% housing allowance
        transport: Math.floor(baseSalary * 0.08), // 8% transport allowance
        medical: Math.floor(baseSalary * 0.05), // 5% medical allowance
        food: Math.floor(baseSalary * 0.03), // 3% food allowance
        overtime: Math.floor(Math.random() * 500), // Random overtime allowance
        bonus: Math.floor(Math.random() * 1000), // Random bonus
        other: Math.floor(Math.random() * 200) // Random other allowances
      },
      deductions: {
        tax: Math.floor(baseSalary * 0.12), // 12% tax
        socialSecurity: Math.floor(baseSalary * 0.04), // 4% social security
        insurance: Math.floor(baseSalary * 0.03), // 3% insurance
        providentFund: Math.floor(baseSalary * 0.05), // 5% PF
        loan: Math.floor(Math.random() * 300), // Random loan deduction
        advance: Math.floor(Math.random() * 200), // Random advance deduction
        other: Math.floor(Math.random() * 100) // Random other deductions
      },
      attendance: {
        workingDays: 22, // Standard working days
        presentDays: 20 + Math.floor(Math.random() * 3), // 20-22 present days
        absentDays: Math.floor(Math.random() * 3), // 0-2 absent days
        halfDays: Math.floor(Math.random() * 2), // 0-1 half days
        overtimeHours: Math.floor(Math.random() * 20), // 0-20 overtime hours
        lateArrivals: Math.floor(Math.random() * 5), // 0-4 late arrivals
        earlyDepartures: Math.floor(Math.random() * 3) // 0-2 early departures
      },
      leaveDeductions: {
        unpaidLeaves: Math.floor(Math.random() * 2), // 0-1 unpaid leaves
        leaveDeductionAmount: Math.floor(Math.random() * 200) // Random leave deduction
      },
      calculations: {
        grossSalary: 0, // Will be calculated by pre-save hook
        totalAllowances: 0, // Will be calculated by pre-save hook
        totalDeductions: 0, // Will be calculated by pre-save hook
        netSalary: 0 // Will be calculated by pre-save hook
      },
      paymentDetails: {
        paymentDate: new Date(prevYear, prevMonth - 1, 30),
        paymentMethod: 'bank-transfer',
        transactionId: 'TXN' + Date.now() + Math.floor(Math.random() * 1000),
        status: 'paid'
      },
      bankDetails: {
        accountNumber: '****' + Math.floor(Math.random() * 10000),
        bankName: ['Chase Bank', 'Wells Fargo', 'Bank of America', 'Citibank'][Math.floor(Math.random() * 4)],
        branchCode: '00' + Math.floor(Math.random() * 100),
        ifscCode: 'BANK000' + Math.floor(Math.random() * 1000)
      },
      generatedBy: adminUser._id,
      approvedBy: adminUser._id,
      approvedDate: new Date(prevYear, prevMonth - 1, 28)
    };
    
    payrollRecords.push(prevMonthRecord);
    
    // Create records for current month (processed but not paid yet)
    const currentMonthRecord = {
      employeeId: employee._id,
      payPeriod: {
        month: currentMonth,
        year: currentYear
      },
      basicSalary: baseSalary,
      allowances: {
        housing: Math.floor(baseSalary * 0.15),
        transport: Math.floor(baseSalary * 0.08),
        medical: Math.floor(baseSalary * 0.05),
        food: Math.floor(baseSalary * 0.03),
        overtime: Math.floor(Math.random() * 400),
        bonus: Math.floor(Math.random() * 800),
        other: Math.floor(Math.random() * 200)
      },
      deductions: {
        tax: Math.floor(baseSalary * 0.12),
        socialSecurity: Math.floor(baseSalary * 0.04),
        insurance: Math.floor(baseSalary * 0.03),
        providentFund: Math.floor(baseSalary * 0.05),
        loan: Math.floor(Math.random() * 300),
        advance: Math.floor(Math.random() * 200),
        other: Math.floor(Math.random() * 100)
      },
      attendance: {
        workingDays: 22,
        presentDays: 18 + Math.floor(Math.random() * 5), // 18-22 present days
        absentDays: Math.floor(Math.random() * 3),
        halfDays: Math.floor(Math.random() * 2),
        overtimeHours: Math.floor(Math.random() * 15),
        lateArrivals: Math.floor(Math.random() * 5),
        earlyDepartures: Math.floor(Math.random() * 3)
      },
      leaveDeductions: {
        unpaidLeaves: Math.floor(Math.random() * 2),
        leaveDeductionAmount: Math.floor(Math.random() * 200)
      },
      calculations: {
        grossSalary: 0, // Will be calculated by pre-save hook
        totalAllowances: 0, // Will be calculated by pre-save hook
        totalDeductions: 0, // Will be calculated by pre-save hook
        netSalary: 0 // Will be calculated by pre-save hook
      },
      paymentDetails: {
        paymentMethod: 'bank-transfer',
        status: Math.random() > 0.5 ? 'processed' : 'pending'
      },
      bankDetails: {
        accountNumber: '****' + Math.floor(Math.random() * 10000),
        bankName: ['Chase Bank', 'Wells Fargo', 'Bank of America', 'Citibank'][Math.floor(Math.random() * 4)],
        branchCode: '00' + Math.floor(Math.random() * 100),
        ifscCode: 'BANK000' + Math.floor(Math.random() * 1000)
      },
      generatedBy: adminUser._id
    };
    
    if (currentMonthRecord.paymentDetails.status === 'processed') {
      currentMonthRecord.approvedBy = adminUser._id;
      currentMonthRecord.approvedDate = new Date(currentYear, currentMonth - 1, 25);
    }
    
    payrollRecords.push(currentMonthRecord);
  }
  
  // Insert all payroll records
  const created = await Payroll.insertMany(payrollRecords);
  console.log(`Created ${created.length} payroll records`);
  
  // Summary
  console.log('\nPayroll Summary:');
  console.log(`- Previous month (${prevMonth}/${prevYear}): ${employees.length} paid records`);
  console.log(`- Current month (${currentMonth}/${currentYear}): ${employees.length} pending/processed records`);
  
  const totalPayroll = await Payroll.countDocuments();
  console.log(`\nTotal payroll records in database: ${totalPayroll}`);
  
  const paidRecords = await Payroll.countDocuments({ 'paymentDetails.status': 'paid' });
  const processedRecords = await Payroll.countDocuments({ 'paymentDetails.status': 'processed' });
  const pendingRecords = await Payroll.countDocuments({ 'paymentDetails.status': 'pending' });
  
  console.log(`\nPayroll Status Summary:`);
  console.log(`- Paid: ${paidRecords}`);
  console.log(`- Processed: ${processedRecords}`);
  console.log(`- Pending: ${pendingRecords}`);
  
  process.exit(0);
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});
