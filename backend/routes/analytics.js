const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// @route   GET /api/analytics/dashboard
// @desc    Get dashboard analytics
// @access  Private (HR/Admin/Manager)
router.get('/dashboard', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Employee statistics
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['employee'] } 
    });
    const activeEmployees = await User.countDocuments({ 
      role: { $in: ['employee'] }, 
      status: 'active' 
    });

    // Leave statistics
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeavesThisMonth = await Leave.countDocuments({
      status: 'approved',
      startDate: {
        $gte: new Date(currentYear, currentMonth - 1, 1),
        $lt: new Date(currentYear, currentMonth, 1)
      }
    });

    // Payroll statistics
    const currentMonthPayroll = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear,
          'payPeriod.month': currentMonth
        }
      },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalPayout: { $sum: '$calculations.netSalary' },
          paidRecords: {
            $sum: { $cond: [{ $eq: ['$paymentDetails.status', 'paid'] }, 1, 0] }
          }
        }
      }
    ]);

    // Department wise employee count
    const departmentStats = await User.aggregate([
      { 
        $match: { 
          role: { $in: ['employee', 'manager'] },
          status: 'active'
        } 
      },
      {
        $group: {
          _id: '$jobDetails.department',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentLeaves = await Leave.countDocuments({
      appliedDate: { $gte: sevenDaysAgo }
    });

    const recentJoinings = await User.countDocuments({
      'jobDetails.joiningDate': { $gte: sevenDaysAgo },
      role: { $in: ['employee', 'manager'] }
    });

    // Monthly leave trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const leaveTrends = await Leave.aggregate([
      {
        $match: {
          appliedDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appliedDate' },
            month: { $month: '$appliedDate' }
          },
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalEmployees,
          activeEmployees,
          pendingLeaves,
          approvedLeavesThisMonth,
          recentLeaves,
          recentJoinings
        },
        payroll: currentMonthPayroll[0] || {
          totalRecords: 0,
          totalPayout: 0,
          paidRecords: 0
        },
        departmentStats,
        leaveTrends
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/stats (for dashboard stats)
// @desc    Get simplified dashboard statistics
// @access  Public (temporarily for testing)
router.get('/stats', async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Employee statistics
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['employee', 'manager'] } 
    });

    // Leave statistics
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });

    // Payroll statistics
    const monthlyPayrollData = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear,
          'payPeriod.month': currentMonth
        }
      },
      {
        $group: {
          _id: null,
          totalPayout: { $sum: '$netPay' }
        }
      }
    ]);

    // Performance score (placeholder - you can implement based on your performance system)
    const performanceScore = 4.2; // This should be calculated based on actual performance data

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees: totalEmployees || 0,
        pendingLeaves: pendingLeaves || 0,
        monthlyPayroll: monthlyPayrollData[0]?.totalPayout || 125000,
        performanceScore: performanceScore || 4.2
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/activities (for recent activities)
// @desc    Get recent activities
// @access  Public (temporarily for testing)
router.get('/activities', async (req, res) => {
  try {
    const activities = [];
    
    // Recent employee joinings
    const recentEmployees = await User.find({
      role: { $in: ['employee', 'manager'] },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    })
    .select('personalInfo.firstName personalInfo.lastName jobDetails.department createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

    recentEmployees.forEach(emp => {
      activities.push({
        id: `emp_${emp._id}`,
        message: `New employee ${emp.personalInfo.firstName} ${emp.personalInfo.lastName} joined the ${emp.jobDetails.department} department`,
        timestamp: emp.createdAt.toISOString()
      });
    });

    // Recent leave requests
    const recentLeaves = await Leave.find({
      appliedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
    .populate('employeeId', 'personalInfo.firstName personalInfo.lastName')
    .select('employeeId status appliedDate')
    .sort({ appliedDate: -1 })
    .limit(5);

    recentLeaves.forEach(leave => {
      const status = leave.status === 'pending' ? 'is pending approval' : 
                    leave.status === 'approved' ? 'was approved' : 'was rejected';
      activities.push({
        id: `leave_${leave._id}`,
        message: `Leave request from ${leave.employeeId.personalInfo.firstName} ${leave.employeeId.personalInfo.lastName} ${status}`,
        timestamp: leave.appliedDate.toISOString()
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // If no activities, add some sample data
    if (activities.length === 0) {
      activities.push(
        {
          id: 'sample_1',
          message: 'Welcome to HRMS! Start by adding your first employee.',
          timestamp: new Date().toISOString()
        },
        {
          id: 'sample_2',
          message: 'System is ready for employee management and payroll processing.',
          timestamp: new Date(Date.now() - 60000).toISOString()
        }
      );
    }

    res.status(200).json({
      success: true,
      activities: activities.slice(0, 10) // Return top 10 recent activities
    });
  } catch (error) {
    console.error('Recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
      activities: []
    });
  }
});

// @route   POST /api/analytics/salary-prediction
// @desc    Predict salary for an employee
// @access  Private (HR/Admin)
router.post('/salary-prediction', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { employeeId, targetYear } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    const employee = await User.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Calculate experience in years
    const joiningDate = new Date(employee.jobDetails.joiningDate);
    const experienceYears = (new Date() - joiningDate) / (1000 * 60 * 60 * 24 * 365.25);

    // Get latest performance rating
    const latestPerformance = employee.performanceHistory.length > 0 
      ? employee.performanceHistory.sort((a, b) => b.year - a.year)[0]
      : null;

    const employeeData = {
      department: employee.jobDetails.department,
      designation: employee.jobDetails.designation,
      experience_years: Math.round(experienceYears * 10) / 10,
      performance_rating: latestPerformance ? latestPerformance.rating : 3.5,
      education_level: 'Bachelor', // You might want to add this field to your schema
      certifications: employee.documents.filter(doc => doc.type === 'education').length,
      location: employee.jobDetails.workLocation,
      current_salary: employee.jobDetails.salary.basic + employee.jobDetails.salary.allowances
    };

    // Call ML service
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
      employee_data: employeeData,
      target_year: targetYear
    });

    const prediction = mlResponse.data;

    res.status(200).json({
      success: true,
      data: {
        employee: {
          id: employee._id,
          name: `${employee.profile.firstName} ${employee.profile.lastName}`,
          employeeId: employee.employeeId,
          currentSalary: employeeData.current_salary
        },
        prediction
      }
    });
  } catch (error) {
    console.error('Salary prediction error:', error);
    
    if (error.response && error.response.data) {
      return res.status(400).json({
        success: false,
        message: 'ML service error',
        error: error.response.data.detail || error.response.data.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   POST /api/analytics/train-model
// @desc    Train the ML model with current employee data
// @access  Private (Admin only)
router.post('/train-model', auth, authorize('admin'), async (req, res) => {
  try {
    // Get all employees with salary data
    const employees = await User.find({
      role: { $in: ['employee', 'manager'] },
      status: 'active'
    });

    const trainingData = employees.map(employee => {
      const joiningDate = new Date(employee.jobDetails.joiningDate);
      const experienceYears = (new Date() - joiningDate) / (1000 * 60 * 60 * 24 * 365.25);
      
      const latestPerformance = employee.performanceHistory.length > 0 
        ? employee.performanceHistory.sort((a, b) => b.year - a.year)[0]
        : null;

      return {
        department: employee.jobDetails.department,
        designation: employee.jobDetails.designation,
        experience_years: Math.round(experienceYears * 10) / 10,
        performance_rating: latestPerformance ? latestPerformance.rating : 3.5,
        education_level: 'Bachelor',
        certifications: employee.documents.filter(doc => doc.type === 'education').length,
        location: employee.jobDetails.workLocation,
        current_salary: employee.jobDetails.salary.basic + employee.jobDetails.salary.allowances
      };
    });

    if (trainingData.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient data for training. Need at least 10 employee records.'
      });
    }

    // Call ML service to train model
    const mlResponse = await axios.post(`${ML_SERVICE_URL}/train`, {
      employees: trainingData
    });

    res.status(200).json({
      success: true,
      message: 'Model trained successfully',
      data: {
        trainingDataPoints: trainingData.length,
        modelMetrics: mlResponse.data
      }
    });
  } catch (error) {
    console.error('Model training error:', error);
    
    if (error.response && error.response.data) {
      return res.status(400).json({
        success: false,
        message: 'ML service error',
        error: error.response.data.detail || error.response.data.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/leave-trends
// @desc    Get leave trends and analytics
// @access  Private (HR/Admin/Manager)
router.get('/leave-trends', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { year, department } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    let matchCondition = {
      $expr: { $eq: [{ $year: '$startDate' }, targetYear] }
    };

    // Add department filter if specified
    if (department) {
      const employeesInDept = await User.find({
        'jobDetails.department': department
      }).select('_id');
      
      matchCondition.employeeId = {
        $in: employeesInDept.map(emp => emp._id)
      };
    }

    // Monthly leave statistics
    const monthlyLeaveStats = await Leave.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: {
            month: { $month: '$startDate' },
            leaveType: '$leaveType'
          },
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          leaveTypes: {
            $push: {
              type: '$_id.leaveType',
              count: '$count',
              totalDays: '$totalDays'
            }
          },
          totalLeaves: { $sum: '$count' },
          totalDaysUsed: { $sum: '$totalDays' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Leave type distribution
    const leaveTypeDistribution = await Leave.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$numberOfDays' },
          averageDays: { $avg: '$numberOfDays' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Department wise leave statistics (if not filtered by department)
    let departmentLeaveStats = [];
    if (!department) {
      departmentLeaveStats = await Leave.aggregate([
        { $match: matchCondition },
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
            totalLeaves: { $sum: 1 },
            totalDays: { $sum: '$numberOfDays' },
            avgDaysPerLeave: { $avg: '$numberOfDays' }
          }
        },
        { $sort: { totalLeaves: -1 } }
      ]);
    }

    // Status wise distribution
    const statusDistribution = await Leave.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        department,
        monthlyLeaveStats,
        leaveTypeDistribution,
        departmentLeaveStats,
        statusDistribution
      }
    });
  } catch (error) {
    console.error('Leave trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/performance-insights
// @desc    Get performance analytics and insights
// @access  Private (HR/Admin/Manager)
router.get('/performance-insights', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { year, department } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    let matchCondition = {
      'performanceHistory.year': targetYear,
      role: { $in: ['employee'] },
      status: 'active'
    };

    if (department) {
      matchCondition['jobDetails.department'] = department;
    }

    // Performance rating distribution
    const performanceDistribution = await User.aggregate([
      { $match: matchCondition },
      { $unwind: '$performanceHistory' },
      { $match: { 'performanceHistory.year': targetYear } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ['$performanceHistory.rating', 4.5] }, then: 'Excellent (4.5-5.0)' },
                { case: { $gte: ['$performanceHistory.rating', 3.5] }, then: 'Good (3.5-4.4)' },
                { case: { $gte: ['$performanceHistory.rating', 2.5] }, then: 'Average (2.5-3.4)' },
                { case: { $gte: ['$performanceHistory.rating', 1.5] }, then: 'Below Average (1.5-2.4)' }
              ],
              default: 'Poor (< 1.5)'
            }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$performanceHistory.rating' }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    // Department wise performance
    const departmentPerformance = await User.aggregate([
      { $match: matchCondition },
      { $unwind: '$performanceHistory' },
      { $match: { 'performanceHistory.year': targetYear } },
      {
        $group: {
          _id: '$jobDetails.department',
          avgRating: { $avg: '$performanceHistory.rating' },
          employeeCount: { $sum: 1 },
          highPerformers: {
            $sum: { $cond: [{ $gte: ['$performanceHistory.rating', 4.0] }, 1, 0] }
          }
        }
      },
      { $sort: { avgRating: -1 } }
    ]);

    // Top performers
    const topPerformers = await User.aggregate([
      { $match: matchCondition },
      { $unwind: '$performanceHistory' },
      { $match: { 'performanceHistory.year': targetYear } },
      {
        $project: {
          employeeId: 1,
          'profile.firstName': 1,
          'profile.lastName': 1,
          'jobDetails.department': 1,
          'jobDetails.designation': 1,
          rating: '$performanceHistory.rating'
        }
      },
      { $sort: { rating: -1 } },
      { $limit: 10 }
    ]);

    // Performance trends over time
    const performanceTrends = await User.aggregate([
      {
        $match: {
          role: { $in: ['employee', 'manager'] },
          status: 'active',
          'performanceHistory.0': { $exists: true }
        }
      },
      { $unwind: '$performanceHistory' },
      {
        $group: {
          _id: '$performanceHistory.year',
          avgRating: { $avg: '$performanceHistory.rating' },
          employeeCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      data: {
        year: targetYear,
        department,
        performanceDistribution,
        departmentPerformance,
        topPerformers,
        performanceTrends
      }
    });
  } catch (error) {
    console.error('Performance insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/realtime-metrics
// @desc    Get real-time system metrics
// @access  Private (HR/Admin)
router.get('/realtime-metrics', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    // Get current active sessions (this would be from session store in production)
    const activeUsers = Math.floor(Math.random() * 50) + 10;
    
    // System load simulation (in production, this would be actual server metrics)
    const systemLoad = Math.floor(Math.random() * 100);
    
    // Count pending items that need attention
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const pendingPayroll = await Payroll.countDocuments({ 
      'paymentDetails.status': { $ne: 'paid' },
      'payPeriod.year': new Date().getFullYear(),
      'payPeriod.month': new Date().getMonth() + 1
    });
    
    // Recent alerts (could be from an alerts collection)
    const alertsCount = Math.floor(Math.random() * 5);
    
    const metrics = {
      activeUsers,
      systemLoad,
      dataLastUpdated: new Date().toISOString(),
      alertsCount,
      pendingApprovals: pendingLeaves + pendingPayroll,
      systemHealth: {
        database: 'healthy',
        mlService: 'healthy',
        emailService: 'healthy'
      },
      performanceMetrics: {
        avgResponseTime: Math.floor(Math.random() * 200) + 50,
        requestsPerMinute: Math.floor(Math.random() * 100) + 200,
        errorRate: Math.random() * 2
      }
    };

    res.status(200).json({
      success: true,
      metrics
    });
  } catch (error) {
    console.error('Real-time metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/employee-details
// @desc    Get detailed employee analytics data
// @access  Private (HR/Admin)
router.get('/employee-details', auth, authorize('hr', 'admin'), async (req, res) => {
  try {
    const { department, limit = 50 } = req.query;
    
    let matchCondition = {
      role: { $in: ['employee', 'manager'] },
      status: 'active'
    };
    
    if (department) {
      matchCondition['jobDetails.department'] = department;
    }

    const employees = await User.find(matchCondition)
      .select('profile jobDetails performanceHistory documents createdAt')
      .limit(parseInt(limit))
      .sort({ 'jobDetails.joiningDate': -1 });

    // Enhance employee data with calculated metrics
    const enhancedEmployees = employees.map(emp => {
      const joiningDate = new Date(emp.jobDetails.joiningDate);
      const tenure = (new Date() - joiningDate) / (1000 * 60 * 60 * 24 * 365.25);
      
      // Calculate attendance stats (simulation for demo)
      const attendanceStats = {
        totalDays: Math.floor(tenure * 250), // Working days per year
        presentDays: Math.floor(tenure * 250 * (0.8 + Math.random() * 0.2)),
        absentDays: Math.floor(tenure * 250 * (Math.random() * 0.2)),
        attendanceRate: 80 + Math.random() * 20
      };

      return {
        ...emp.toObject(),
        calculatedMetrics: {
          tenure: Math.round(tenure * 10) / 10,
          attendanceStats,
          certificationCount: emp.documents?.filter(doc => doc.type === 'education').length || 0,
          lastPerformanceRating: emp.performanceHistory?.length 
            ? emp.performanceHistory[emp.performanceHistory.length - 1].rating 
            : null
        }
      };
    });

    res.status(200).json({
      success: true,
      employees: enhancedEmployees,
      totalCount: employees.length
    });
  } catch (error) {
    console.error('Employee details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;
