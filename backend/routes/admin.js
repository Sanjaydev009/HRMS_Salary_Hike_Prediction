const express = require('express');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users with admin privileges
// @access  Private (Admin only)
router.get('/users', auth, authorize('admin'), async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    
    if (search) {
      query.$or = [
        { 'profile.firstName': { $regex: search, $options: 'i' } },
        { 'profile.lastName': { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .populate('jobDetails.reportingManager', 'profile.firstName profile.lastName employeeId')
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private (Admin only)
router.put('/users/:id/role', auth, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['employee', 'manager', 'hr', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow changing your own role
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: { user: { id: user._id, role: user.role } }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin only)
router.put('/users/:id/status', auth, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'terminated', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status specified'
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deactivating your own account
    if (user._id.toString() === req.user._id.toString() && status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: { user: { id: user._id, status: user.status } }
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/admin/analytics/overview
// @desc    Get comprehensive system analytics
// @access  Private (Admin only)
router.get('/analytics/overview', auth, authorize('admin'), async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    // User statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          employees: { $sum: { $cond: [{ $eq: ['$role', 'employee'] }, 1, 0] } },
          managers: { $sum: { $cond: [{ $eq: ['$role', 'manager'] }, 1, 0] } },
          hrStaff: { $sum: { $cond: [{ $eq: ['$role', 'hr'] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
        }
      }
    ]);

    // Leave statistics
    const leaveStats = await Leave.aggregate([
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          pendingApplications: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approvedApplications: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejectedApplications: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          thisMonthApplications: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [{ $year: '$appliedDate' }, currentYear] },
                    { $eq: [{ $month: '$appliedDate' }, currentMonth] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Payroll statistics
    const payrollStats = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalPayout: { $sum: '$calculations.netSalary' },
          pendingPayrolls: { $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'pending'] }, 1, 0] } },
          processedPayrolls: { $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'processed'] }, 1, 0] } },
          paidPayrolls: { $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'paid'] }, 1, 0] } }
        }
      }
    ]);

    // Department wise breakdown
    const departmentBreakdown = await User.aggregate([
      {
        $match: {
          role: { $in: ['employee', 'manager'] },
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$jobDetails.department',
          employeeCount: { $sum: 1 },
          totalSalary: { $sum: { $add: ['$jobDetails.salary.basic', '$jobDetails.salary.allowances'] } },
          avgSalary: { $avg: { $add: ['$jobDetails.salary.basic', '$jobDetails.salary.allowances'] } }
        }
      },
      { $sort: { employeeCount: -1 } }
    ]);

    // Recent activities (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivities = {
      newEmployees: await User.countDocuments({
        'jobDetails.joiningDate': { $gte: thirtyDaysAgo },
        role: { $in: ['employee', 'manager'] }
      }),
      newLeaveApplications: await Leave.countDocuments({
        appliedDate: { $gte: thirtyDaysAgo }
      }),
      processedPayrolls: await Payroll.countDocuments({
        'paymentDetails.paymentDate': { $gte: thirtyDaysAgo }
      })
    };

    // System health metrics
    const systemHealth = {
      databaseConnected: true, // Mongoose connection status
      totalCollections: 4, // Users, Leaves, Payrolls, etc.
      lastBackup: null, // You might implement backup tracking
      systemUptime: process.uptime()
    };

    res.status(200).json({
      success: true,
      data: {
        userStats: userStats[0] || {},
        leaveStats: leaveStats[0] || {},
        payrollStats: payrollStats[0] || {},
        departmentBreakdown,
        recentActivities,
        systemHealth
      }
    });
  } catch (error) {
    console.error('Admin analytics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/admin/system/backup
// @desc    Trigger system backup
// @access  Private (Admin only)
router.post('/system/backup', auth, authorize('admin'), async (req, res) => {
  try {
    // This is a placeholder for backup functionality
    // You would implement actual backup logic here
    
    const backupInfo = {
      timestamp: new Date(),
      collections: ['users', 'leaves', 'payrolls'],
      status: 'completed',
      size: '125.6 MB' // Placeholder
    };

    res.status(200).json({
      success: true,
      message: 'Backup completed successfully',
      data: backupInfo
    });
  } catch (error) {
    console.error('System backup error:', error);
    res.status(500).json({
      success: false,
      message: 'Backup failed',
      error: error.message
    });
  }
});

// @route   GET /api/admin/system/logs
// @desc    Get system logs
// @access  Private (Admin only)
router.get('/system/logs', auth, authorize('admin'), async (req, res) => {
  try {
    const { level = 'all', limit = 100 } = req.query;
    
    // This is a placeholder for log functionality
    // You would implement actual log retrieval here
    
    const logs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'User login successful',
        userId: req.user._id,
        ip: req.ip
      },
      {
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        level: 'warning',
        message: 'High number of failed login attempts',
        ip: '192.168.1.100'
      }
    ];

    res.status(200).json({
      success: true,
      data: {
        logs: logs.slice(0, limit),
        total: logs.length,
        filters: { level, limit }
      }
    });
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/system/settings
// @desc    Update system settings
// @access  Private (Admin only)
router.put('/system/settings', auth, authorize('admin'), async (req, res) => {
  try {
    const { settings } = req.body;
    
    // This is a placeholder for system settings
    // You would implement actual settings storage here
    
    const updatedSettings = {
      maintenance_mode: false,
      max_login_attempts: 5,
      session_timeout: 30,
      email_notifications: true,
      backup_frequency: 'daily',
      ...settings
    };

    res.status(200).json({
      success: true,
      message: 'System settings updated successfully',
      data: { settings: updatedSettings }
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Permanently delete user (use with caution)
// @access  Private (Admin only)
router.delete('/users/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow deleting your own account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user has associated data
    const hasLeaves = await Leave.countDocuments({ employeeId: user._id });
    const hasPayroll = await Payroll.countDocuments({ employeeId: user._id });

    if (hasLeaves > 0 || hasPayroll > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with associated data. Consider deactivating instead.',
        data: {
          associatedLeaves: hasLeaves,
          associatedPayrolls: hasPayroll
        }
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted permanently'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
