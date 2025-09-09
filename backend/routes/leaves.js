const express = require('express');
const User = require('../models/User');
const Leave = require('../models/Leave');
const { auth, authorize, ownerOrAdmin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/leaves
// @desc    Get leaves (filtered by user role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, leaveType, startDate, endDate, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    // Role-based filtering
    if (req.user.role === 'employee') {
      query.employeeId = req.user._id;
    }
    // HR and Admin can see all leaves (no additional filtering)
    
    // Apply filters
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const leaves = await Leave.find(query)
      .populate('employeeId', 'employeeId profile.firstName profile.lastName jobDetails.department')
      .populate('approvedBy', 'profile.firstName profile.lastName')
      .sort({ appliedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Leave.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        leaves,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/leaves/my
// @desc    Get current employee's leaves with balance info
// @access  Private (Employee only)
router.get('/my', auth, async (req, res) => {
  try {
    const { status, leaveType, year = new Date().getFullYear(), page = 1, limit = 10 } = req.query;
    
    let query = { employeeId: req.user._id };
    
    // Apply filters
    if (status) query.status = status;
    if (leaveType) query.leaveType = leaveType;
    
    // Filter by year if provided
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31);
      query.startDate = { $gte: startOfYear };
      query.endDate = { $lte: endOfYear };
    }

    const leaves = await Leave.find(query)
      .populate('approvedBy', 'profile.firstName profile.lastName')
      .sort({ appliedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log('DEBUG: Employee leaves data:', JSON.stringify(leaves.map(l => ({
      id: l._id, 
      status: l.status, 
      hrNotes: l.hrNotes, 
      rejectionReason: l.rejectionReason
    })), null, 2));

    const total = await Leave.countDocuments(query);

    // Calculate leave balances
    const user = await User.findById(req.user._id);
    const currentYear = new Date().getFullYear();
    
    // Calculate used leaves this year
    const yearQuery = {
      employeeId: req.user._id,
      status: 'approved',
      startDate: { $gte: new Date(currentYear, 0, 1) },
      endDate: { $lte: new Date(currentYear, 11, 31) }
    };
    
    const approvedLeaves = await Leave.find(yearQuery);
    const usedLeaves = {
      annual: 0,
      sick: 0,
      casual: 0,
      maternity: 0,
      paternity: 0
    };
    
    approvedLeaves.forEach(leave => {
      if (usedLeaves.hasOwnProperty(leave.leaveType)) {
        usedLeaves[leave.leaveType] += leave.numberOfDays;
      }
    });

    const leaveBalances = {
      annual: { 
        total: user.leaveBalance?.annual || 25, 
        used: usedLeaves.annual,
        remaining: Math.max(0, (user.leaveBalance?.annual || 25) - usedLeaves.annual)
      },
      sick: { 
        total: user.leaveBalance?.sick || 10, 
        used: usedLeaves.sick,
        remaining: Math.max(0, (user.leaveBalance?.sick || 10) - usedLeaves.sick)
      },
      casual: { 
        total: user.leaveBalance?.casual || 7, 
        used: usedLeaves.casual,
        remaining: Math.max(0, (user.leaveBalance?.casual || 7) - usedLeaves.casual)
      },
      maternity: { 
        total: user.leaveBalance?.maternity || 90, 
        used: usedLeaves.maternity,
        remaining: Math.max(0, (user.leaveBalance?.maternity || 90) - usedLeaves.maternity)
      },
      paternity: { 
        total: user.leaveBalance?.paternity || 15, 
        used: usedLeaves.paternity,
        remaining: Math.max(0, (user.leaveBalance?.paternity || 15) - usedLeaves.paternity)
      }
    };

    // Calculate leave statistics
    const leaveStats = {
      totalApplied: total,
      approved: await Leave.countDocuments({ ...query, status: 'approved' }),
      pending: await Leave.countDocuments({ ...query, status: 'pending' }),
      rejected: await Leave.countDocuments({ ...query, status: 'rejected' }),
      totalDaysUsed: Object.values(usedLeaves).reduce((sum, days) => sum + days, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        leaves,
        leaveBalances,
        leaveStats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/leaves
// @desc    Apply for leave
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const {
      leaveType, startDate, endDate, reason, halfDay = false,
      emergencyContact, handoverNotes
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply for leave in the past'
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be after end date'
      });
    }

    // Check for overlapping leaves
    const hasOverlap = await Leave.checkOverlap(req.user._id, start, end);
    if (hasOverlap) {
      return res.status(400).json({
        success: false,
        message: 'You have overlapping leave applications'
      });
    }

    // Calculate number of days
    const leave = new Leave({
      employeeId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      halfDay,
      emergencyContact,
      handoverNotes
    });

    const workingDays = leave.calculateWorkingDays();
    leave.numberOfDays = workingDays;

    // Check leave balance
    const user = await User.findById(req.user._id);
    if (!user.canApplyLeave(leaveType, workingDays)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalance[leaveType]} days`
      });
    }

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'employeeId profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: { leave: populatedLeave }
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/leaves/apply
// @desc    Apply for leave (alias route)
// @access  Private
router.post('/apply', auth, async (req, res) => {
  try {
    const {
      leaveType, startDate, endDate, reason, halfDay = false,
      emergencyContact, handoverNotes
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply for leave in the past'
      });
    }

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Calculate working days
    let workingDays = 0;
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (halfDay) {
      workingDays = workingDays / 2;
    }

    // Get user and check leave balance
    const user = await User.findById(req.user._id);
    if (!user.canApplyLeave(leaveType, workingDays)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient leave balance'
      });
    }

    // Create leave application
    const leave = new Leave({
      employeeId: req.user._id,
      leaveType,
      startDate: start,
      endDate: end,
      numberOfDays: workingDays,
      reason,
      halfDay,
      emergencyContact,
      handoverNotes,
      appliedDate: new Date(),
      status: 'pending'
    });

    await leave.save();

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'employeeId profile.firstName profile.lastName');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: { leave: populatedLeave }
    });
  } catch (error) {
    console.error('Apply leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/leaves/:id
// @desc    Get single leave
// @access  Private
router.get('/:id', auth, ownerOrAdmin, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employeeId', 'employeeId profile jobDetails.department')
      .populate('approvedBy', 'profile.firstName profile.lastName')
      .populate('comments.commentBy', 'profile.firstName profile.lastName');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { leave }
    });
  } catch (error) {
    console.error('Get leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/leaves/:id/approve
// @desc    Approve/Reject leave with HR notes
// @access  Private (HR/Admin)
router.put('/:id/approve', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { status, rejectionReason, hrNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved or rejected'
      });
    }

    const leave = await Leave.findById(req.params.id)
      .populate('employeeId');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave has already been processed'
      });
    }

    leave.status = status;
    leave.approvedBy = req.user._id;
    leave.approvedDate = new Date();

    // Add HR notes (for both approval and rejection)
    if (hrNotes) {
      leave.hrNotes = hrNotes;
    }

    // Keep backward compatibility with rejectionReason
    if (status === 'rejected') {
      if (rejectionReason) {
        leave.rejectionReason = rejectionReason;
      }
      // If no specific rejection reason but HR notes exist, use HR notes as rejection reason
      if (!rejectionReason && hrNotes) {
        leave.rejectionReason = hrNotes;
      }
    }

    // If approved, deduct from leave balance
    if (status === 'approved') {
      const user = await User.findById(leave.employeeId._id);
      if (user.leaveBalance[leave.leaveType] >= leave.numberOfDays) {
        user.leaveBalance[leave.leaveType] -= leave.numberOfDays;
        await user.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'Insufficient leave balance'
        });
      }
    }

    await leave.save();

    const updatedLeave = await Leave.findById(leave._id)
      .populate('employeeId', 'employeeId profile.firstName profile.lastName')
      .populate('approvedBy', 'profile.firstName profile.lastName');

    res.status(200).json({
      success: true,
      message: `Leave ${status} successfully`,
      data: { leave: updatedLeave }
    });
  } catch (error) {
    console.error('Approve leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/leaves/:id/cancel
// @desc    Cancel leave application
// @access  Private (Employee - own leaves only)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave not found'
      });
    }

    // Only employee who applied can cancel (or HR/Admin)
    if (leave.employeeId.toString() !== req.user._id.toString() && 
        !['hr', 'admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own leave applications'
      });
    }

    if (!['pending', 'approved'].includes(leave.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this leave application'
      });
    }

    // If leave was approved, restore leave balance
    if (leave.status === 'approved') {
      const user = await User.findById(leave.employeeId);
      user.leaveBalance[leave.leaveType] += leave.numberOfDays;
      await user.save();
    }

    leave.status = 'cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave cancelled successfully',
      data: { leave }
    });
  } catch (error) {
    console.error('Cancel leave error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/leaves/balance/me
// @desc    Get current user's leave balance
// @access  Private
router.get('/balance/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('leaveBalance');
    
    res.status(200).json({
      success: true,
      data: { leaveBalance: user.leaveBalance }
    });
  } catch (error) {
    console.error('Get leave balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
