const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');

// Test route to ensure basic functionality
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Calendar route is working',
    timestamp: new Date().toISOString()
  });
});

// @route   GET /api/calendar/events
// @desc    Get calendar events for leave management with real-time data
// @access  Public (for testing)
router.get('/events', async (req, res) => {
  try {
    const { month, year, department, view } = req.query;

    console.log('Calendar events request:', { month, year, department, view });

    // Build date filter
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      
      dateFilter = {
        $or: [
          { startDate: { $gte: startDate, $lte: endDate } },
          { endDate: { $gte: startDate, $lte: endDate } },
          { 
            startDate: { $lte: startDate }, 
            endDate: { $gte: endDate } 
          }
        ]
      };
    }

    // Build department filter
    let departmentFilter = {};
    if (department && department !== 'all') {
      const departmentUsers = await User.find({ 'jobDetails.department': department }).select('employeeId');
      const employeeIds = departmentUsers.map(user => user.employeeId);
      departmentFilter = { employeeId: { $in: employeeIds } };
    }

    // Fetch leaves from database
    const leaves = await Leave.find({
      ...dateFilter,
      ...departmentFilter,
      status: { $in: ['approved', 'pending'] }
    }).populate('employeeId', 'profile.firstName profile.lastName jobDetails.department jobDetails.position employeeId');

    // Convert to calendar event format
    const events = leaves.map(leave => {
      const employee = leave.employeeId;
      const fullName = employee ? `${employee.profile?.firstName || ''} ${employee.profile?.lastName || ''}`.trim() : 'Unknown Employee';
      
      return {
        id: leave._id.toString(),
        title: `${fullName} - ${leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}`,
        start: leave.startDate.toISOString().split('T')[0],
        end: leave.endDate.toISOString().split('T')[0],
        employeeId: employee?.employeeId || leave.employeeId,
        employeeName: fullName,
        employeeAvatar: '',
        department: employee?.jobDetails?.department || 'Unknown',
        position: employee?.jobDetails?.position || 'Unknown',
        leaveType: leave.leaveType,
        reason: leave.reason,
        status: leave.status,
        duration: leave.duration,
        appliedDate: leave.appliedDate,
        approvedBy: leave.approvedBy,
        approvedDate: leave.approvedDate,
        color: getLeaveTypeColor(leave.leaveType),
        backgroundColor: getLeaveTypeColor(leave.leaveType) + '20',
        borderColor: getLeaveTypeColor(leave.leaveType)
      };
    });

    // Add sample data if no real data exists (for demo purposes)
    if (events.length === 0) {
      const sampleEvents = [
        {
          id: 'sample-1',
          title: 'John Doe - Vacation',
          start: new Date().toISOString().split('T')[0],
          end: new Date().toISOString().split('T')[0],
          employeeId: 'emp1',
          employeeName: 'John Doe',
          employeeAvatar: '',
          department: 'Engineering',
          position: 'Software Engineer',
          leaveType: 'vacation',
          reason: 'Family vacation',
          status: 'approved',
          duration: 1,
          appliedDate: new Date(),
          approvedBy: 'Manager',
          approvedDate: new Date(),
          color: '#2196f3',
          backgroundColor: '#2196f320',
          borderColor: '#2196f3'
        },
        {
          id: 'sample-2',
          title: 'Jane Smith - Sick Leave',
          start: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          end: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          employeeId: 'emp2',
          employeeName: 'Jane Smith',
          employeeAvatar: '',
          department: 'HR',
          position: 'HR Manager',
          leaveType: 'sick',
          reason: 'Medical appointment',
          status: 'approved',
          duration: 1,
          appliedDate: new Date(),
          approvedBy: 'Director',
          approvedDate: new Date(),
          color: '#f44336',
          backgroundColor: '#f4433620',
          borderColor: '#f44336'
        }
      ];
      
      console.log('No real leave data found, returning sample data');
      return res.json({
        success: true,
        data: sampleEvents,
        message: 'Sample calendar events (no real data available)'
      });
    }

    console.log(`Returning ${events.length} real leave events`);

    res.json({
      success: true,
      data: events,
      message: `Found ${events.length} leave events`
    });

  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @route   GET /api/calendar/team-availability  
// @desc    Get team availability data
// @access  Public (for testing)
router.get('/team-availability', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Sample team availability data
    const sampleAvailability = [
      { employeeId: 'emp1', employeeName: 'John Doe', department: 'Engineering', totalLeaveDays: 2, availability: 90 },
      { employeeId: 'emp2', employeeName: 'Jane Smith', department: 'HR', totalLeaveDays: 1, availability: 95 },
      { employeeId: 'emp3', employeeName: 'Mike Johnson', department: 'Finance', totalLeaveDays: 0, availability: 100 }
    ];

    res.json({
      success: true,
      data: sampleAvailability,
      message: `Team availability for ${month}/${year}`
    });

  } catch (error) {
    console.error('Error fetching team availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch team availability',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to get color for leave types
function getLeaveTypeColor(leaveType) {
  const colors = {
    vacation: '#2196f3',
    sick: '#f44336', 
    personal: '#ff9800',
    emergency: '#e91e63',
    maternity: '#9c27b0',
    paternity: '#3f51b5',
    default: '#607d8b'
  };
  return colors[leaveType] || colors.default;
}

module.exports = router;
