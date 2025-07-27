const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @route   POST /api/attendance/check-in
// @desc    Employee check-in
// @access  Private (Employee only)
router.post('/check-in', auth, async (req, res) => {
  try {
    const { location, notes } = req.body;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Check if already checked in today
    let attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: dateOnly
    });
    
    if (attendance && attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
        data: { attendance }
      });
    }
    
    if (!attendance) {
      attendance = new Attendance({
        employeeId: req.user._id,
        date: dateOnly
      });
    }
    
    attendance.checkIn = new Date();
    attendance.location = location || 'Office';
    attendance.status = 'Present';
    attendance.ipAddress = req.ip;
    attendance.deviceInfo = req.get('User-Agent');
    if (notes) attendance.notes = notes;
    
    await attendance.save();
    
    // Populate employee details for notifications
    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('employeeId', 'profile.firstName profile.lastName jobDetails.department');
    
    // Create notification for HR
    const User = require('../models/User');
    
    // Find HR users
    const hrUsers = await User.find({ role: 'hr', status: 'active' });
    hrUsers.forEach(hrUser => {
      console.log(`📋 HR NOTIFICATION: ${populatedAttendance.employeeId.profile.firstName} ${populatedAttendance.employeeId.profile.lastName} from ${populatedAttendance.employeeId.jobDetails.department} checked in`);
    });
    
    res.json({
      success: true,
      message: 'Check-in successful',
      data: { 
        attendance: populatedAttendance,
        checkInTime: attendance.checkIn.toLocaleTimeString(),
        location: attendance.location
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-in',
      error: error.message
    });
  }
});

// @route   POST /api/attendance/check-out
// @desc    Employee check-out
// @access  Private (Employee only)
router.post('/check-out', auth, async (req, res) => {
  try {
    const { breakTime, notes } = req.body;
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: dateOnly
    });
    
    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }
    
    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today',
        data: { attendance }
      });
    }
    
    attendance.checkOut = new Date();
    if (breakTime) attendance.breakTime = breakTime;
    if (notes) attendance.notes = notes;
    
    await attendance.save();
    
    res.json({
      success: true,
      message: 'Check-out successful',
      data: { attendance }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during check-out',
      error: error.message
    });
  }
});

// @route   GET /api/attendance/my
// @desc    Get employee's attendance records
// @access  Private (Employee only)
router.get('/my', auth, async (req, res) => {
  try {
    const { month, year, page = 1, limit = 30 } = req.query;
    
    let filter = { employeeId: req.user._id };
    
    // Filter by month and year if provided
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const skip = (page - 1) * limit;
    
    const attendance = await Attendance.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Attendance.countDocuments(filter);
    
    // Calculate statistics
    const stats = {
      totalDays: total,
      presentDays: await Attendance.countDocuments({ ...filter, status: 'Present' }),
      absentDays: await Attendance.countDocuments({ ...filter, status: 'Absent' }),
      lateDays: await Attendance.countDocuments({ ...filter, status: 'Late' }),
      halfDays: await Attendance.countDocuments({ ...filter, status: 'Half Day' }),
      totalHours: attendance.reduce((sum, record) => sum + (record.totalHours || 0), 0)
    };
    
    stats.attendancePercentage = total > 0 ? Math.round((stats.presentDays / total) * 100) : 0;
    
    res.json({
      success: true,
      data: {
        attendance,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private (Employee only)
router.get('/today', auth, async (req, res) => {
  try {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const attendance = await Attendance.findOne({
      employeeId: req.user._id,
      date: dateOnly
    });
    
    res.json({
      success: true,
      data: {
        attendance: attendance || null,
        canCheckIn: !attendance || !attendance.checkIn,
        canCheckOut: attendance && attendance.checkIn && !attendance.checkOut
      }
    });
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s attendance',
      error: error.message
    });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get attendance summary for current month
// @access  Private (Employee only)
router.get('/summary', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const attendanceRecords = await Attendance.find({
      employeeId: req.user._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    const totalWorkingDays = 22; // Assuming 22 working days per month
    const presentDays = attendanceRecords.filter(record => 
      ['Present', 'Late', 'Half Day'].includes(record.status)
    ).length;
    
    const summary = {
      currentMonth: currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      totalWorkingDays,
      presentDays,
      absentDays: totalWorkingDays - presentDays,
      attendancePercentage: Math.round((presentDays / totalWorkingDays) * 100),
      totalHours: attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0),
      averageHoursPerDay: attendanceRecords.length > 0 
        ? Math.round((attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0) / attendanceRecords.length) * 100) / 100
        : 0,
      lateDays: attendanceRecords.filter(record => record.status === 'Late').length,
      halfDays: attendanceRecords.filter(record => record.status === 'Half Day').length
    };
    
    res.json({
      success: true,
      data: { summary }
    });
  } catch (error) {
    console.error('Get attendance summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching attendance summary',
      error: error.message
    });
  }
});

module.exports = router;
