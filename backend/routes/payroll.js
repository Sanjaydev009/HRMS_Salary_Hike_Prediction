const express = require('express');
const Payroll = require('../models/Payroll');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

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
