const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const Certification = require('../models/Certification');
const { auth, authorize } = require('../middleware/auth');

// GET /api/dashboard/stats - Get dashboard statistics
// Role-based access: Employee (limited), HR (department), Admin (all)
router.get('/stats', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    
    let statsQuery = {};
    let departmentFilter = {};
    
    // Role-based data filtering
    if (userRole === 'employee') {
      // Employees only see their own department stats
      departmentFilter = { 'jobDetails.department': req.user.jobDetails.department };
    }
    // HR and Admin see all data (no filter)
    
    const baseQuery = { 
      role: { $in: ['employee'] },
      status: 'active',
      ...departmentFilter
    };
    
    // Get total employees (role-filtered)
    const totalEmployees = await User.countDocuments(baseQuery);
    
    // Get departments count (role-filtered)
    const departments = await User.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$jobDetails.department', count: { $sum: 1 } } }
    ]);
    const totalDepartments = departments.length;
    
    // Get pending leave requests (role-filtered)
    let leaveQuery = { status: 'pending' };
    if (userRole === 'employee') {
      leaveQuery.employeeId = userId; // Only their own leaves
    }
    
    const pendingLeaves = await Leave.countDocuments(leaveQuery);
    
    // Get this month's payroll processed count (role-filtered)
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    let payrollQuery = {
      payPeriodStart: { $gte: firstDayOfMonth },
      payPeriodEnd: { $lte: lastDayOfMonth },
      status: 'processed'
    };
    
    if (userRole === 'employee') {
      payrollQuery.employeeId = userId; // Only their own payroll
    }
    
    const processedPayrolls = await Payroll.countDocuments(payrollQuery);
    
    // Get employee growth data for the last 6 months
    const employeeGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const count = await User.countDocuments({
        'jobDetails.joiningDate': { $lte: monthEnd },
        role: { $in: ['employee'] },
        $or: [
          { status: 'active' },
          { 
            status: 'inactive',
            // Assuming we have a field for when they left
            updatedAt: { $gt: monthEnd }
          }
        ]
      });
      
      employeeGrowth.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        employees: count
      });
    }
    
    // Get department distribution
    const departmentStats = await User.aggregate([
      { $match: { 
        role: { $in: ['employee'] },
        status: 'active' 
      }},
      { 
        $group: { 
          _id: '$jobDetails.department', 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);
    
    const departmentDistribution = departmentStats.map(dept => ({
      name: dept._id || 'Unassigned',
      value: dept.count
    }));
    
    // Get leave statistics
    const leaveStats = await Leave.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const leaveDistribution = leaveStats.map(stat => ({
      name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1),
      value: stat.count
    }));
    
    res.json({
      totalEmployees,
      totalDepartments,
      pendingLeaves,
      processedPayrolls,
      employeeGrowth,
      departmentDistribution,
      leaveDistribution,
      currency: 'INR',
      userRole: userRole,
      permissions: {
        canViewAllEmployees: ['hr', 'admin'].includes(userRole),
        canManageLeaves: ['hr', 'admin'].includes(userRole),
        canProcessPayroll: ['hr', 'admin'].includes(userRole),
        canManageUsers: ['admin'].includes(userRole),
        isRestricted: userRole === 'employee'
      },
      lastUpdated: new Date().toISOString(),
      refreshInterval: 30000 // 30 seconds for real-time updates
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics', 
      error: error.message 
    });
  }
});

// GET /api/dashboard/activities - Get recent activities
// Role-based access: Employee (own activities), HR/Admin (all)
router.get('/activities', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    const activities = [];
    
    // Role-based filtering
    let employeeFilter = {};
    let leaveFilter = {};
    let payrollFilter = {};
    
    if (userRole === 'employee') {
      // Employee only sees their own activities
      employeeFilter = { _id: userId };
      leaveFilter = { employeeId: userId };
      payrollFilter = { employeeId: userId };
    }
    // HR and Admin see all activities (no filter)
    
    // Get recent employees (role-filtered)
    const recentEmployees = await User.find({ 
      role: { $in: ['employee'] },
      status: 'active',
      ...employeeFilter
    })
      .sort({ 'jobDetails.joiningDate': -1 })
      .limit(userRole === 'employee' ? 2 : 5)
      .select('profile.firstName profile.lastName jobDetails.department jobDetails.joiningDate');
    
    recentEmployees.forEach(emp => {
      activities.push({
        id: `emp_${emp._id}`,
        type: 'employee_joined',
        title: 'New Employee Joined',
        description: `${emp.profile.firstName} ${emp.profile.lastName} joined ${emp.jobDetails.department}`,
        timestamp: emp.jobDetails.joiningDate,
        icon: 'PersonAdd',
        color: 'success'
      });
    });
    
    // Get recent leave requests (role-filtered)
    const recentLeaves = await Leave.find(leaveFilter)
      .sort({ createdAt: -1 })
      .limit(userRole === 'employee' ? 3 : 5)
      .populate('employeeId', 'profile.firstName profile.lastName')
      .select('leaveType status startDate endDate employeeId createdAt');
    
    recentLeaves.forEach(leave => {
      const isOwnLeave = leave.employeeId?._id.toString() === userId.toString();
      activities.push({
        id: `leave_${leave._id}`,
        type: 'leave_request',
        title: isOwnLeave ? 'Your Leave Request' : 'Leave Request',
        description: `${leave.employeeId?.profile?.firstName} ${leave.employeeId?.profile?.lastName} requested ${leave.leaveType} leave`,
        timestamp: leave.createdAt,
        icon: 'EventBusy',
        color: leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'warning',
        isPersonal: isOwnLeave
      });
    });
    
    // Get recent payroll activities (role-filtered, only for non-employees)
    if (userRole !== 'employee') {
      const recentPayrolls = await Payroll.find(payrollFilter)
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('employeeId', 'profile.firstName profile.lastName')
        .select('employeeId grossSalary status createdAt payPeriodStart payPeriodEnd');
      
      recentPayrolls.forEach(payroll => {
        activities.push({
          id: `payroll_${payroll._id}`,
          type: 'payroll_processed',
          title: 'Payroll Processed',
          description: `Payroll processed for ${payroll.employeeId?.profile?.firstName} ${payroll.employeeId?.profile?.lastName}`,
          timestamp: payroll.createdAt,
          icon: 'Payment',
          color: 'info'
        });
      });
    }
    
    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Return role-filtered activities with metadata
    res.json({
      activities: activities.slice(0, userRole === 'employee' ? 5 : 10),
      lastUpdated: new Date().toISOString(),
      totalActivities: activities.length,
      userRole: userRole,
      permissions: {
        canViewAllActivities: ['hr', 'admin'].includes(userRole),
        canViewTeamActivities: ['hr', 'admin'].includes(userRole),
        viewScope: userRole === 'employee' ? 'personal' : 'all'
      },
      refreshInterval: 15000 // 15 seconds for activities
    });
  } catch (error) {
    console.error('Error fetching dashboard activities:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard activities', 
      error: error.message 
    });
  }
});

// GET /api/dashboard/summary - Get quick summary for cards
// Accessible by all authenticated users
router.get('/summary', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    // Total active employees
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['employee'] },
      status: 'active' 
    });
    
    // Employees joined this month
    const newEmployeesThisMonth = await User.countDocuments({
      'jobDetails.joiningDate': { $gte: startOfMonth },
      role: { $in: ['employee'] },
      status: 'active'
    });
    
    // Pending leave requests
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    
    // Approved leaves today
    const leavesToday = await Leave.countDocuments({
      status: 'approved',
      startDate: { $lte: today },
      endDate: { $gte: today }
    });
    
    // Total departments
    const departments = await User.distinct('jobDetails.department', { 
      role: { $in: ['employee'] },
      status: 'active' 
    });
    const totalDepartments = departments.length;
    
    // This month's total payroll amount (in INR)
    const monthlyPayroll = await Payroll.aggregate([
      {
        $match: {
          payPeriodStart: { $gte: startOfMonth },
          status: 'processed'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$grossSalary' }
        }
      }
    ]);
    
    const totalPayrollAmount = monthlyPayroll.length > 0 ? monthlyPayroll[0].totalAmount : 0;
    
    // Format amount in Indian Rupees
    const formattedPayrollAmount = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(totalPayrollAmount);
    
    res.json({
      totalEmployees,
      newEmployeesThisMonth,
      pendingLeaves,
      leavesToday,
      totalDepartments,
      totalPayrollAmount,
      formattedPayrollAmount,
      currency: 'INR',
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard summary', 
      error: error.message 
    });
  }
});

// GET /api/dashboard/employee-stats - Employee-specific dashboard data
router.get('/employee-stats', auth, async (req, res) => {
  try {
    // Only employees can access their own data through this endpoint
    if (req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is for employees only'
      });
    }
    const userId = req.user._id;
    
    // Get employee's personal leave statistics
    const personalLeaves = await Leave.find({ employeeId: userId });
    const pendingLeaves = personalLeaves.filter(leave => leave.status === 'pending').length;
    const approvedLeaves = personalLeaves.filter(leave => leave.status === 'approved').length;
    
    // Calculate remaining leaves (assuming 21 days annual leave)
    const currentYear = new Date().getFullYear();
    const yearlyLeaves = personalLeaves.filter(leave => 
      new Date(leave.startDate).getFullYear() === currentYear && 
      leave.status === 'approved'
    );
    const usedLeaveDays = yearlyLeaves.reduce((total, leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
    
    // Get recent personal activities
    const recentActivities = [];
    
    // Personal leaves
    const recentLeaves = await Leave.find({ employeeId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('leaveType status startDate endDate createdAt');
    
    recentLeaves.forEach(leave => {
      recentActivities.push({
        id: `leave_${leave._id}`,
        type: 'leave_request',
        title: 'Your Leave Request',
        description: `${leave.leaveType} leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
        timestamp: leave.createdAt,
        isPersonal: true
      });
    });
    
    // Sort activities by timestamp
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Get attendance data (mock for now - integrate with real attendance system)
    const attendanceData = {
      daysPresent: Math.floor(0.95 * 22), // 95% of 22 working days
      totalWorkingDays: 22,
      attendancePercentage: 95,
      todayStatus: 'Present'
    };
    
    // Get certifications count (mock data - create certification model later)
    const certificationsCount = 3; // Mock data
    
    res.json({
      personalStats: {
        totalLeaves: personalLeaves.length,
        pendingLeaves,
        approvedLeaves,
        remainingLeaves: Math.max(0, 21 - usedLeaveDays)
      },
      recentActivities,
      leaveBalance: {
        casual: Math.max(0, 12 - Math.min(12, usedLeaveDays)),
        sick: Math.max(0, 6 - Math.min(6, usedLeaveDays)),
        annual: Math.max(0, 21 - usedLeaveDays)
      },
      attendanceData,
      certificationsCount,
      attendanceThisMonth: attendanceData.attendancePercentage,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching employee dashboard data:', error);
    res.status(500).json({ 
      message: 'Error fetching employee dashboard data', 
      error: error.message 
    });
  }
});

// GET /api/dashboard/user - Get user dashboard data based on role
router.get('/user', auth, async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    
    console.log('User dashboard request - User:', req.user?.email, 'Role:', userRole);
    
    // Route to appropriate dashboard based on role
    switch (userRole) {
      case 'employee':
        // Redirect to employee dashboard logic
        try {
          // Get employee profile data
          const employee = await User.findById(userId).populate('jobDetails.reportingManager', 'profile.firstName profile.lastName');
          
          // Get employee's personal leave statistics
          const personalLeaves = await Leave.find({ employeeId: userId });
          const pendingLeaves = personalLeaves.filter(leave => leave.status === 'pending').length;
          const approvedLeaves = personalLeaves.filter(leave => leave.status === 'approved').length;
          
          // Calculate remaining leaves (assuming 25 days annual leave)
          const currentYear = new Date().getFullYear();
          const yearlyLeaves = personalLeaves.filter(leave => 
            new Date(leave.startDate).getFullYear() === currentYear && 
            leave.status === 'approved'
          );
          const usedLeaveDays = yearlyLeaves.reduce((total, leave) => {
            const start = new Date(leave.startDate);
            const end = new Date(leave.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return total + days;
          }, 0);
          
          // Get current salary from user's job details
          const currentSalary = employee.jobDetails.salary.basic + (employee.jobDetails.salary.allowances || 0);
          
          // Get recent personal activities
          const recentActivities = [];
          
          // Personal leaves only (no payroll activities for employees)
          const recentLeaves = await Leave.find({ employeeId: userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('leaveType status startDate endDate createdAt');
          
          recentLeaves.forEach(leave => {
            recentActivities.push({
              id: `leave_${leave._id}`,
              type: 'leave_request',
              title: 'Your Leave Request',
              description: `${leave.leaveType} leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
              timestamp: leave.createdAt,
              isPersonal: true,
              status: leave.status
            });
          });
          
          // Get attendance data (real-time from attendance records)
          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          
          // Get today's attendance
          const todayAttendance = await Attendance.findOne({
            employeeId: userId,
            date: {
              $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
              $lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
            }
          });
          
          // Get this month's attendance records
          const monthlyAttendance = await Attendance.find({
            employeeId: userId,
            date: { $gte: startOfMonth, $lte: today }
          });
          
          // Calculate attendance stats
          const workingDaysThisMonth = monthlyAttendance.length;
          const presentDays = monthlyAttendance.filter(att => 
            ['Present', 'Half Day'].includes(att.status)
          ).length;
          
          const attendanceData = {
            daysPresent: presentDays,
            workingDays: workingDaysThisMonth,
            monthlyProgress: workingDaysThisMonth > 0 ? Math.round((presentDays / workingDaysThisMonth) * 100) : 0,
            thisMonthPresent: presentDays,
            todayStatus: todayAttendance ? {
              status: todayAttendance.status,
              checkIn: todayAttendance.checkIn,
              checkOut: todayAttendance.checkOut,
              totalHours: todayAttendance.totalHours,
              canCheckOut: todayAttendance.checkIn && !todayAttendance.checkOut
            } : {
              status: 'Not Checked In',
              checkIn: null,
              checkOut: null,
              totalHours: 0,
              canCheckOut: false
            }
          };
          
          // Get certifications data (real-time from certification records)
          const userCertifications = await Certification.find({
            employeeId: userId,
            status: 'Active'
          });
          
          // Calculate certification impact
          let totalImpactScore = 0;
          const categoryBreakdown = {};
          
          userCertifications.forEach(cert => {
            if (cert.calculateImpact) {
              cert.calculateImpact();
              totalImpactScore += cert.impactScore || 0;
            }
            
            if (!categoryBreakdown[cert.category]) {
              categoryBreakdown[cert.category] = 0;
            }
            categoryBreakdown[cert.category]++;
          });
          
          const certificationsData = {
            total: userCertifications.length,
            categories: Object.entries(categoryBreakdown).map(([name, count]) => ({
              name,
              count
            })),
            totalImpactScore,
            estimatedSalaryIncrease: Math.round((totalImpactScore * 0.2) * 100) / 100
          };
          
          // Calculate next payday (typically 1st of next month)
          const nextPayday = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          
          return res.json({
            userRole,
            personalStats: {
              totalLeaves: personalLeaves.length,
              pendingLeaves,
              approvedLeaves,
              remainingLeaves: Math.max(0, 25 - usedLeaveDays)
            },
            currentSalary,
            nextPayday: nextPayday.toLocaleDateString(),
            recentActivities,
            leaveBalance: {
              casual: employee.leaveBalance?.personal || Math.max(0, 12 - Math.min(12, usedLeaveDays)),
              sick: employee.leaveBalance?.sick || Math.max(0, 10 - Math.min(10, usedLeaveDays)),
              annual: employee.leaveBalance?.annual || Math.max(0, 25 - usedLeaveDays)
            },
            attendance: attendanceData,
            attendanceThisMonth: attendanceData.monthlyProgress,
            certifications: certificationsData,
            profile: {
              firstName: employee.profile.firstName,
              lastName: employee.profile.lastName,
              email: employee.email,
              employeeId: employee.employeeId,
              department: employee.jobDetails.department,
              jobTitle: employee.jobDetails.designation,
              profilePicture: employee.profile.profilePicture
            },
            upcomingEvents: [], // Mock data for now
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error('Error fetching employee dashboard:', error);
          throw error;
        }
        
      case 'hr':
        return res.json({
          userRole,
          message: 'HR dashboard data', 
          lastUpdated: new Date().toISOString()
        });
        
      case 'admin':
        return res.json({
          userRole,
          message: 'Admin dashboard data',
          lastUpdated: new Date().toISOString()
        });
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid user role',
          userRole
        });
    }
  } catch (error) {
    console.error('Error fetching user dashboard data:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user dashboard data', 
      error: error.message 
    });
  }
});

// GET /api/dashboard/employee - Enhanced employee dashboard data
router.get('/employee', auth, async (req, res) => {
  try {
    console.log('Employee dashboard request - User:', req.user?.email, 'Role:', req.user?.role);
    
    // Only employees can access their own data through this endpoint
    if (req.user.role !== 'employee') {
      console.log('Access denied - User role:', req.user.role, 'Expected: employee');
      return res.status(403).json({
        success: false,
        message: 'This endpoint is for employees only'
      });
    }
    const userId = req.user._id;
    
    // Get employee profile data
    const employee = await User.findById(userId).populate('jobDetails.reportingManager', 'profile.firstName profile.lastName');
    
    // Get employee's personal leave statistics
    const personalLeaves = await Leave.find({ employeeId: userId });
    const pendingLeaves = personalLeaves.filter(leave => leave.status === 'pending').length;
    const approvedLeaves = personalLeaves.filter(leave => leave.status === 'approved').length;
    
    // Calculate remaining leaves (assuming 25 days annual leave)
    const currentYear = new Date().getFullYear();
    const yearlyLeaves = personalLeaves.filter(leave => 
      new Date(leave.startDate).getFullYear() === currentYear && 
      leave.status === 'approved'
    );
    const usedLeaveDays = yearlyLeaves.reduce((total, leave) => {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
      return total + days;
    }, 0);
    
    // Get current salary from user's job details
    const currentSalary = employee.jobDetails.salary.basic + (employee.jobDetails.salary.allowances || 0);
    
    // Get recent personal activities
    const recentActivities = [];
    
    // Personal leaves only (employees don't need to see payroll processing details)
    const recentLeaves = await Leave.find({ employeeId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('leaveType status startDate endDate createdAt');
    
    recentLeaves.forEach(leave => {
      recentActivities.push({
        id: `leave_${leave._id}`,
        type: 'leave_request',
        title: 'Your Leave Request',
        description: `${leave.leaveType} leave from ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}`,
        timestamp: leave.createdAt,
        isPersonal: true,
        status: leave.status
      });
    });
    
    // Get attendance data (enhanced mock - integrate with real attendance system)
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const workingDays = Math.floor(daysInMonth * 0.71); // Approximate working days (excluding weekends)
    const presentDays = Math.floor(workingDays * 0.95); // Mock 95% attendance
    
    const attendanceData = {
      daysPresent: presentDays,
      workingDays: workingDays,
      monthlyProgress: Math.round((presentDays / workingDays) * 100),
      thisMonthPresent: presentDays
    };
    
    // Get certifications count (mock data - will be replaced with real data from certification model)
    const certificationsData = {
      total: 3,
      categories: [
        { name: 'Technical', count: 2 },
        { name: 'Management', count: 1 }
      ]
    };
    
    // Calculate next payday (typically 1st of next month)
    const nextPayday = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    
    res.json({
      personalStats: {
        totalLeaves: personalLeaves.length,
        pendingLeaves,
        approvedLeaves,
        remainingLeaves: Math.max(0, 25 - usedLeaveDays)
      },
      currentSalary,
      nextPayday: nextPayday.toLocaleDateString(),
      recentActivities,
      leaveBalance: {
        casual: employee.leaveBalance?.personal || Math.max(0, 12 - Math.min(12, usedLeaveDays)),
        sick: employee.leaveBalance?.sick || Math.max(0, 10 - Math.min(10, usedLeaveDays)),
        annual: employee.leaveBalance?.annual || Math.max(0, 25 - usedLeaveDays)
      },
      attendance: attendanceData,
      attendanceThisMonth: attendanceData.monthlyProgress,
      certifications: certificationsData,
      profile: {
        firstName: employee.profile.firstName,
        lastName: employee.profile.lastName,
        email: employee.email,
        employeeId: employee.employeeId,
        department: employee.jobDetails.department,
        jobTitle: employee.jobDetails.designation,
        profilePicture: employee.profile.profilePicture
      },
      upcomingEvents: [], // Mock data for now
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching enhanced employee dashboard data:', error);
    res.status(500).json({ 
      message: 'Error fetching enhanced employee dashboard data', 
      error: error.message 
    });
  }
});


// GET /api/dashboard/hr-stats - HR-specific dashboard data
router.get('/hr-stats', auth, async (req, res) => {
  try {
    // Only HR users can access this endpoint
    if (req.user.role !== 'hr') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is for HR users only'
      });
    }
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    // Organization statistics
    const totalEmployees = await User.countDocuments({ 
      role: { $in: ['employee'] },
      status: 'active' 
    });
    
    const totalDepartments = await User.distinct('jobDetails.department', { 
      role: { $in: ['employee'] },
      status: 'active' 
    }).length;
    
    const newHiresThisMonth = await User.countDocuments({
      'jobDetails.joiningDate': { $gte: firstDayOfMonth },
      role: { $in: ['employee'] },
      status: 'active'
    });
    
    // Leave statistics
    const totalPendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const leavesThisMonth = await Leave.countDocuments({
      createdAt: { $gte: firstDayOfMonth }
    });
    
    const totalLeaves = await Leave.countDocuments({});
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const leaveApprovalRate = totalLeaves > 0 ? Math.round((approvedLeaves / totalLeaves) * 100) : 0;
    
    // Payroll statistics
    const monthlyPayroll = await Payroll.aggregate([
      {
        $match: {
          payPeriodStart: { $gte: firstDayOfMonth },
          status: 'processed'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$grossSalary' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalPayrollAmount = monthlyPayroll.length > 0 ? monthlyPayroll[0].totalAmount : 0;
    const completedPayrolls = monthlyPayroll.length > 0 ? monthlyPayroll[0].count : 0;
    const pendingPayrolls = totalEmployees - completedPayrolls;
    
    // Department distribution
    const departmentDistribution = await User.aggregate([
      { 
        $match: { 
          role: { $in: ['employee', 'manager'] },
          status: 'active' 
        }
      },
      { 
        $group: { 
          _id: '$jobDetails.department', 
          value: { $sum: 1 } 
        } 
      },
      { $sort: { value: -1 } },
      { $limit: 8 }
    ]);
    
    const formattedDepartments = departmentDistribution.map(dept => ({
      name: dept._id || 'Unassigned',
      value: dept.value
    }));
    
    // Recent HR activities
    const recentActivities = [];
    
    // Recent employees
    const recentEmployees = await User.find({ 
      role: { $in: ['employee', 'manager'] },
      status: 'active'
    })
    .sort({ 'jobDetails.joiningDate': -1 })
    .limit(3)
    .select('profile.firstName profile.lastName jobDetails.department jobDetails.joiningDate');
    
    recentEmployees.forEach(emp => {
      recentActivities.push({
        id: `emp_${emp._id}`,
        type: 'employee_joined',
        title: 'New Employee Onboarded',
        description: `${emp.profile.firstName} ${emp.profile.lastName} joined ${emp.jobDetails.department}`,
        timestamp: emp.jobDetails.joiningDate,
        priority: 'normal'
      });
    });
    
    // Recent leave requests
    const recentLeaves = await Leave.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('employeeId', 'profile.firstName profile.lastName')
      .select('leaveType status startDate endDate employeeId createdAt');
    
    recentLeaves.forEach(leave => {
      recentActivities.push({
        id: `leave_${leave._id}`,
        type: 'leave_request',
        title: 'Leave Request Submitted',
        description: `${leave.employeeId?.profile?.firstName} ${leave.employeeId?.profile?.lastName} requested ${leave.leaveType} leave`,
        timestamp: leave.createdAt,
        priority: leave.status === 'pending' ? 'high' : 'normal'
      });
    });
    
    // Sort activities by timestamp
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      organizationStats: {
        totalEmployees,
        totalDepartments,
        newHiresThisMonth,
        exitingThisMonth: 2, // Mock data
        pendingOnboardings: 3 // Mock data
      },
      leaveStats: {
        totalPendingLeaves,
        leavesThisMonth,
        leaveApprovalRate
      },
      payrollStats: {
        totalPayrollAmount,
        pendingPayrolls: Math.max(0, pendingPayrolls),
        completedPayrolls
      },
      departmentDistribution: formattedDepartments,
      recentActivities,
      hrMetrics: {
        employeeSatisfaction: 85,
        averageTenure: 3.2,
        turnoverRate: 12
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching HR dashboard data:', error);
    res.status(500).json({ 
      message: 'Error fetching HR dashboard data', 
      error: error.message 
    });
  }
});

// GET /api/dashboard/admin-stats - Admin-specific dashboard data
router.get('/admin-stats', auth, async (req, res) => {
  try {
    // Only admin users can access this endpoint
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'This endpoint is for administrators only'
      });
    }
    // System statistics
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({ status: 'active' });
    
    // User role distribution
    const userManagement = {
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      totalHRUsers: await User.countDocuments({ role: 'hr' }),
      totalAdmins: await User.countDocuments({ role: 'admin' }),
      pendingApprovals: await Leave.countDocuments({ status: 'pending' })
    };
    
    // System health (mock data - integrate with actual system monitoring)
    const systemHealth = {
      serverStatus: 'healthy',
      databaseStatus: 'healthy',
      memoryUsage: 65,
      cpuUsage: 45,
      diskUsage: 72
    };
    
    // Recent system activities
    const recentActivities = [];
    
    // Recent user registrations
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('profile.firstName profile.lastName role createdAt');
    
    recentUsers.forEach(user => {
      recentActivities.push({
        id: `user_${user._id}`,
        type: 'user_created',
        title: 'New User Account',
        description: `${user.profile.firstName} ${user.profile.lastName} account created with role: ${user.role}`,
        timestamp: user.createdAt,
        critical: user.role === 'admin'
      });
    });
    
    // System events (mock data)
    recentActivities.push({
      id: 'backup_001',
      type: 'backup_completed',
      title: 'Database Backup Completed',
      description: 'Automated daily backup completed successfully',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      critical: false
    });
    
    res.json({
      systemStats: {
        totalUsers,
        activeUsers,
        systemUptime: '15d 6h',
        storageUsed: 45,
        apiRequests: 12543
      },
      userManagement,
      systemHealth,
      recentActivities,
      securityAlerts: [], // Mock data
      backupStatus: {
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString(),
        status: 'Success'
      },
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    res.status(500).json({ 
      message: 'Error fetching admin dashboard data', 
      error: error.message 
    });
  }
});

module.exports = router;
