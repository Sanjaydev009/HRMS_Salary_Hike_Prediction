const express = require('express');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/payroll/attendance/:employeeId
// @desc    Get attendance data for payroll calculation
// @access  Private (HR/Admin)
router.get('/attendance/:employeeId', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    // Validate employee exists
    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate date range for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // Last day of the month

    // Get attendance records for the month
    const attendanceRecords = await Attendance.find({
      employeeId: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    // Calculate working days (exclude weekends)
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Monday = 1, Sunday = 0, Saturday = 6
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate attendance statistics
    let presentDays = 0;
    let halfDays = 0;
    let lateArrivals = 0;
    let earlyDepartures = 0;
    let totalHours = 0;
    let overtimeHours = 0;

    attendanceRecords.forEach(record => {
      switch (record.status) {
        case 'Present':
          presentDays++;
          break;
        case 'Half Day':
          halfDays++;
          presentDays += 0.5; // Count half day as 0.5 present
          break;
        case 'Late':
          lateArrivals++;
          presentDays++; // Still considered present but late
          break;
      }

      totalHours += record.totalHours || 0;
      
      // Calculate overtime (assuming 8 hours is standard)
      if (record.totalHours > 8) {
        overtimeHours += record.totalHours - 8;
      }
    });

    const absentDays = workingDays - Math.ceil(presentDays);
    const attendancePercentage = workingDays > 0 ? ((presentDays / workingDays) * 100).toFixed(1) : '0.0';

    const attendanceSummary = {
      month: parseInt(month),
      year: parseInt(year),
      workingDays,
      presentDays: Math.ceil(presentDays), // Round up for payroll calculation
      halfDays,
      absentDays: Math.max(0, absentDays),
      lateArrivals,
      earlyDepartures,
      totalHours: Math.round(totalHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      attendancePercentage: parseFloat(attendancePercentage),
      records: attendanceRecords.map(record => ({
        date: record.date,
        status: record.status,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        totalHours: record.totalHours,
        location: record.location
      }))
    };

    res.status(200).json({
      success: true,
      data: {
        employee: {
          _id: employee._id,
          employeeId: employee.employeeId,
          name: `${employee.profile?.firstName || ''} ${employee.profile?.lastName || ''}`.trim(),
          department: employee.jobDetails?.department
        },
        attendance: attendanceSummary
      }
    });

  } catch (error) {
    console.error('Get attendance for payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance data',
      error: error.message
    });
  }
});

// @route   GET /api/payroll
// @desc    Get payroll records
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, employeeId, status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    }
    // HR and Admin can see all payroll records (no additional filtering)
    
    // Apply filters
    if (month) query['payPeriod.month'] = parseInt(month);
    if (year) query['payPeriod.year'] = parseInt(year);
    if (employeeId && ['hr', 'admin'].includes(req.user.role)) {
      query.employeeId = employeeId;
    }
    if (status) query['paymentDetails.status'] = status;

    const payrollRecords = await Payroll.find(query)
      .populate('employeeId', 'employeeId profile.firstName profile.lastName jobDetails.department')
      .populate('generatedBy', 'profile.firstName profile.lastName')
      .populate('approvedBy', 'profile.firstName profile.lastName')
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Payroll.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payrollRecords,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payroll/my
// @desc    Get current employee's payroll records with summary
// @access  Private (Employee only)
router.get('/my', auth, async (req, res) => {
  try {
    console.log('Fetching payroll for employee:', req.user._id);
    
    const { month, year, page = 1, limit = 12 } = req.query;
    
    let query = { employeeId: req.user._id };
    
    // Apply filters
    if (month) query['payPeriod.month'] = parseInt(month);
    if (year) query['payPeriod.year'] = parseInt(year);

    const payrollRecords = await Payroll.find(query)
      .populate('generatedBy', 'profile.firstName profile.lastName')
      .populate('approvedBy', 'profile.firstName profile.lastName')
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('Found payroll records:', payrollRecords.length);

    const total = await Payroll.countDocuments(query);

    // Get current year's summary
    const currentYear = new Date().getFullYear();
    const yearlyPayroll = await Payroll.find({
      employeeId: req.user._id,
      'payPeriod.year': currentYear
    });

    // Calculate yearly summary
    const yearlyEarnings = {
      totalGross: 0,
      totalNet: 0,
      totalDeductions: 0,
      totalAllowances: 0,
      totalTax: 0,
      totalBonus: 0,
      totalOvertime: 0
    };

    yearlyPayroll.forEach(record => {
      yearlyEarnings.totalGross += record.calculations?.grossSalary || 0;
      yearlyEarnings.totalNet += record.calculations?.netSalary || 0;
      yearlyEarnings.totalDeductions += record.calculations?.totalDeductions || 0;
      yearlyEarnings.totalAllowances += record.calculations?.totalAllowances || 0;
      yearlyEarnings.totalTax += (record.deductions?.tax || 0);
      yearlyEarnings.totalBonus += (record.allowances?.bonus || 0);
      yearlyEarnings.totalOvertime += (record.allowances?.overtime || 0);
    });

    // Get latest payslip for quick access
    const latestPayslip = payrollRecords.length > 0 ? payrollRecords[0] : null;

    // Calculate average monthly salary
    const avgMonthlySalary = yearlyPayroll.length > 0 
      ? Math.round(yearlyEarnings.totalNet / yearlyPayroll.length)
      : 0;

    const summary = {
      currentYear,
      totalPayslips: total,
      yearlyEarnings,
      avgMonthlySalary,
      latestPayslip: latestPayslip ? {
        month: latestPayslip.payPeriod.month,
        year: latestPayslip.payPeriod.year,
        netSalary: latestPayslip.calculations?.netSalary || 0,
        status: latestPayslip.paymentDetails?.status || 'pending',
        payDate: latestPayslip.paymentDetails?.paymentDate
      } : null
    };

    res.status(200).json({
      success: true,
      data: {
        payrollRecords,
        summary,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get my payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/payroll
// @desc    Create individual payroll record with real-time attendance data
// @access  Private (HR/Admin)
router.post('/', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    console.log('=== PAYROLL CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User making request:', req.user.employeeId, req.user.role);
    
    const {
      employeeId,
      payPeriod,
      basicSalary,
      allowances,
      deductions,
      overtime
    } = req.body;

    console.log('Extracted fields:', { employeeId, payPeriod, basicSalary });

    // Validate required fields
    if (!employeeId || !payPeriod || !basicSalary) {
      console.log('❌ Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Employee ID, pay period, and basic salary are required'
      });
    }

    console.log('✅ Basic validation passed');

    // Check if employee exists
    console.log('Checking if employee exists:', employeeId);
    const employee = await User.findById(employeeId);
    if (!employee) {
      console.log('❌ Employee not found:', employeeId);
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    console.log('✅ Employee found:', employee.employeeId, employee.profile?.firstName);

    // Check if payroll record already exists for this period
    console.log('Checking for existing payroll record...');
    const existingPayroll = await Payroll.findOne({
      employeeId,
      'payPeriod.month': payPeriod.month,
      'payPeriod.year': payPeriod.year
    });

    if (existingPayroll) {
      console.log('❌ Payroll record already exists:', existingPayroll._id);
      return res.status(400).json({
        success: false,
        message: `Payroll record already exists for ${payPeriod.month}/${payPeriod.year}`
      });
    }

    console.log('✅ No existing payroll record found');

    // Fetch real-time attendance data for the specified month/year
    console.log('Fetching attendance data for:', payPeriod.month, payPeriod.year);
    const startDate = new Date(payPeriod.year, payPeriod.month - 1, 1);
    const endDate = new Date(payPeriod.year, payPeriod.month, 0);

    // Get attendance records for the month
    const attendanceRecords = await Attendance.find({
      employeeId: employeeId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate working days (exclude weekends)
    let workingDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate attendance statistics from real data
    let presentDays = 0;
    let halfDays = 0;
    let lateArrivals = 0;
    let earlyDepartures = 0;
    let actualOvertimeHours = 0;

    attendanceRecords.forEach(record => {
      switch (record.status) {
        case 'Present':
          presentDays++;
          break;
        case 'Half Day':
          halfDays++;
          presentDays += 0.5;
          break;
        case 'Late':
          lateArrivals++;
          presentDays++;
          break;
      }

      // Calculate overtime from actual hours worked
      if (record.totalHours > 8) {
        actualOvertimeHours += record.totalHours - 8;
      }
    });

    const absentDays = workingDays - Math.ceil(presentDays);

    // Calculate pro-rated salary based on actual attendance
    const attendanceRatio = workingDays > 0 ? (presentDays / workingDays) : 1;
    const proRatedBasicSalary = basicSalary * attendanceRatio;

    // Use actual overtime hours from attendance, or fallback to manual entry
    const overtimeHours = actualOvertimeHours > 0 ? actualOvertimeHours : (overtime?.hours || 0);
    const overtimeRate = overtime?.rate || 0;
    const overtimePay = overtimeHours * overtimeRate;

    // Calculate total allowances
    const totalAllowances = Object.values(allowances || {}).reduce((sum, val) => sum + (val || 0), 0);
    
    // Calculate total deductions
    const totalDeductions = Object.values(deductions || {}).reduce((sum, val) => sum + (val || 0), 0);

    // Calculate gross and net salary
    const grossSalary = proRatedBasicSalary + totalAllowances + overtimePay;
    const netSalary = grossSalary - totalDeductions;

    // Create payroll record with real attendance data
    const payrollData = {
      employeeId,
      payPeriod: {
        month: payPeriod.month,
        year: payPeriod.year
      },
      basicSalary: proRatedBasicSalary,
      allowances: {
        housing: allowances?.housing || 0,
        transport: allowances?.transport || 0,
        medical: allowances?.medical || 0,
        food: allowances?.food || 0,
        overtime: overtimePay,
        bonus: 0,
        other: allowances?.other || 0
      },
      deductions: {
        tax: deductions?.tax || 0,
        socialSecurity: 0,
        insurance: deductions?.insurance || 0,
        providentFund: deductions?.providentFund || 0,
        loan: 0,
        advance: 0,
        other: deductions?.other || 0
      },
      attendance: {
        workingDays,
        presentDays: Math.ceil(presentDays),
        absentDays: Math.max(0, absentDays),
        halfDays,
        overtimeHours: Math.round(overtimeHours * 100) / 100,
        lateArrivals,
        earlyDepartures: 0 // This would need to be calculated based on checkout time vs expected time
      },
      calculations: {
        grossSalary,
        totalAllowances: totalAllowances + overtimePay,
        totalDeductions,
        netSalary
      },
      paymentDetails: {
        paymentMethod: 'bank-transfer',
        status: 'pending'
      },
      generatedBy: req.user._id,
      notes: `Payroll generated with real-time attendance data. Attendance: ${Math.ceil(presentDays)}/${workingDays} days (${Math.round(attendanceRatio * 100)}%)`
    };

    console.log('Step 6: Payroll data prepared:', JSON.stringify(payrollData, null, 2));
    
    console.log('Step 7: Creating Payroll instance');
    const payroll = new Payroll(payrollData);
    
    console.log('Step 8: Saving payroll to database');
    await payroll.save();
    
    console.log('Step 9: Payroll saved successfully, ID:', payroll._id);

    console.log('Step 10: Fetching populated payroll data');
    const populatedPayroll = await Payroll.findById(payroll._id)
      .populate('employeeId', 'employeeId profile jobDetails')
      .populate('generatedBy', 'profile.firstName profile.lastName');

    console.log('Step 11: Sending success response');
    res.status(201).json({
      success: true,
      message: 'Payroll record created successfully with real-time attendance data',
      data: { 
        payroll: populatedPayroll,
        attendanceInfo: {
          workingDays,
          presentDays: Math.ceil(presentDays),
          attendancePercentage: Math.round(attendanceRatio * 100),
          overtimeHours: Math.round(overtimeHours * 100) / 100
        }
      }
    });

  } catch (error) {
    console.error('=== PAYROLL CREATION ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      console.error('Mongoose validation errors:', error.errors);
    }
    
    if (error.code === 11000) {
      console.error('Duplicate key error:', error.keyPattern, error.keyValue);
    }
    
    console.error('=== END ERROR ===');
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payroll record',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? {
        name: error.name,
        code: error.code,
        keyPattern: error.keyPattern,
        keyValue: error.keyValue
      } : undefined
    });
  }
});

// @route   POST /api/payroll/generate
// @desc    Generate payroll for a specific month/year
// @access  Private (HR/Admin)
router.post('/generate', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Valid month (1-12) and year are required'
      });
    }

    // Check if payroll already generated for this period
    const existingPayroll = await Payroll.findOne({
      'payPeriod.month': month,
      'payPeriod.year': year
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: `Payroll for ${month}/${year} already exists`
      });
    }

    // Generate payroll for all active employees
    const payrollRecords = await Payroll.generateMonthlyPayroll(month, year, req.user._id);

    res.status(201).json({
      success: true,
      message: `Payroll generated for ${month}/${year}`,
      data: {
        recordsCreated: payrollRecords.length,
        payrollRecords: payrollRecords.slice(0, 5) // Return first 5 as sample
      }
    });
  } catch (error) {
    console.error('Generate payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payroll/:id
// @desc    Get single payroll record
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employeeId', 'employeeId profile jobDetails')
      .populate('generatedBy', 'profile.firstName profile.lastName')
      .populate('approvedBy', 'profile.firstName profile.lastName');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Check access permissions
    const canAccess = payroll.employeeId._id.toString() === req.user._id.toString() || 
                     ['hr', 'admin'].includes(req.user.role);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { payroll }
    });
  } catch (error) {
    console.error('Get payroll record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/payroll/:id
// @desc    Update payroll record
// @access  Private (HR/Admin)
router.put('/:id', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Don't allow updates if already paid
    if (payroll.paymentDetails.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update paid payroll record'
      });
    }

    const updateData = req.body;
    Object.assign(payroll, updateData);

    await payroll.save();

    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('employeeId', 'employeeId profile.firstName profile.lastName')
      .populate('generatedBy', 'profile.firstName profile.lastName')
      .populate('approvedBy', 'profile.firstName profile.lastName');

    res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      data: { payroll: updatedPayroll }
    });
  } catch (error) {
    console.error('Update payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/payroll/:id/approve
// @desc    Approve payroll
// @access  Private (HR/Admin)
router.put('/:id/approve', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    if (payroll.paymentDetails.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending payroll can be approved'
      });
    }

    payroll.approvedBy = req.user._id;
    payroll.approvedDate = new Date();
    payroll.paymentDetails.status = 'processed';

    await payroll.save();

    const updatedPayroll = await Payroll.findById(payroll._id)
      .populate('employeeId', 'employeeId profile.firstName profile.lastName')
      .populate('approvedBy', 'profile.firstName profile.lastName');

    res.status(200).json({
      success: true,
      message: 'Payroll approved successfully',
      data: { payroll: updatedPayroll }
    });
  } catch (error) {
    console.error('Approve payroll error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/payroll/:id/pay
// @desc    Mark payroll as paid
// @access  Private (HR/Admin)
router.put('/:id/pay', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { transactionId, paymentMethod } = req.body;

    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    if (payroll.paymentDetails.status !== 'processed') {
      return res.status(400).json({
        success: false,
        message: 'Payroll must be approved before marking as paid'
      });
    }

    payroll.paymentDetails.status = 'paid';
    payroll.paymentDetails.paymentDate = new Date();
    if (transactionId) payroll.paymentDetails.transactionId = transactionId;
    if (paymentMethod) payroll.paymentDetails.paymentMethod = paymentMethod;

    await payroll.save();

    res.status(200).json({
      success: true,
      message: 'Payroll marked as paid',
      data: { payroll }
    });
  } catch (error) {
    console.error('Mark payroll paid error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/payroll/:id/download
// @desc    Download payslip as PDF
// @access  Private
router.get('/:id/download', auth, async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate('employeeId', 'employeeId profile jobDetails')
      .populate('generatedBy', 'profile.firstName profile.lastName')
      .populate('approvedBy', 'profile.firstName profile.lastName');

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Check access permissions
    const canAccess = payroll.employeeId._id.toString() === req.user._id.toString() || 
                     ['hr', 'admin'].includes(req.user.role);

    if (!canAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // For now, return the payroll data as JSON with a special content type
    // Frontend can handle generating PDF or printing
    const payslipData = {
      employeeName: `${payroll.employeeId.profile.firstName} ${payroll.employeeId.profile.lastName}`,
      employeeId: payroll.employeeId.employeeId,
      department: payroll.employeeId.jobDetails?.department || 'N/A',
      payPeriod: `${getMonthName(payroll.payPeriod.month)} ${payroll.payPeriod.year}`,
      basicSalary: payroll.basicSalary,
      allowances: payroll.allowances,
      deductions: payroll.deductions,
      calculations: payroll.calculations,
      attendance: payroll.attendance,
      paymentDetails: payroll.paymentDetails,
      generatedBy: payroll.generatedBy ? `${payroll.generatedBy.profile.firstName} ${payroll.generatedBy.profile.lastName}` : 'System',
      generatedDate: payroll.createdAt,
      notes: payroll.notes
    };

    // Set headers for download
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="payslip-${payroll.employeeId.employeeId}-${payroll.payPeriod.month}-${payroll.payPeriod.year}.json"`);
    
    res.status(200).json({
      success: true,
      message: 'Payslip data for download',
      data: payslipData
    });

  } catch (error) {
    console.error('Download payslip error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Helper function for month names
function getMonthName(monthNumber) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthNumber - 1];
}

// @route   GET /api/payroll/stats/summary
// @desc    Get payroll summary statistics
// @access  Private (HR/Admin)
router.get('/stats/summary', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    // Monthly payroll summary for the year
    const monthlyStats = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear
        }
      },
      {
        $group: {
          _id: '$payPeriod.month',
          totalRecords: { $sum: 1 },
          totalGrossSalary: { $sum: '$calculations.grossSalary' },
          totalNetSalary: { $sum: '$calculations.netSalary' },
          totalDeductions: { $sum: '$calculations.totalDeductions' },
          paidRecords: {
            $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'paid'] }, 1, 0] }
          },
          pendingRecords: {
            $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'pending'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Department wise payroll summary
    const departmentStats = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'employeeId',
          foreignField: '_id',
          as: 'employee'
        }
      },
      { $unwind: '$employee' },
      {
        $group: {
          _id: '$employee.jobDetails.department',
          totalEmployees: { $sum: 1 },
          totalSalary: { $sum: '$calculations.netSalary' },
          averageSalary: { $avg: '$calculations.netSalary' }
        }
      }
    ]);

    // Overall statistics
    const overallStats = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear
        }
      },
      {
        $group: {
          _id: null,
          totalPayrollRecords: { $sum: 1 },
          totalGrossPayout: { $sum: '$calculations.grossSalary' },
          totalNetPayout: { $sum: '$calculations.netSalary' },
          averageGrossSalary: { $avg: '$calculations.grossSalary' },
          averageNetSalary: { $avg: '$calculations.netSalary' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        year: currentYear,
        monthlyStats,
        departmentStats,
        overallStats: overallStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Get payroll stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
