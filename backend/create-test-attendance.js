const mongoose = require('mongoose');
require('dotenv').config();
const Attendance = require('./models/Attendance');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestAttendance = async () => {
  try {
    console.log('Creating test attendance data...');
    
    // Get the first employee from the database
    const employee = await User.findOne({ role: 'employee' });
    if (!employee) {
      console.log('No employee found. Please create an employee first.');
      return;
    }
    
    console.log(`Creating attendance for employee: ${employee.employeeId} (${employee.profile?.firstName} ${employee.profile?.lastName})`);
    
    // Create attendance records for current month (September 2025)
    const currentYear = 2025;
    const currentMonth = 9; // September
    
    // Generate attendance for working days in September 2025
    const attendanceRecords = [];
    const startDate = new Date(currentYear, currentMonth - 1, 1); // Sept 1, 2025
    const endDate = new Date(currentYear, currentMonth, 0); // Last day of September 2025
    
    let presentDays = 0;
    let halfDays = 0;
    let lateDays = 0;
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }
      
      // Create different types of attendance randomly
      const rand = Math.random();
      let status = 'Present';
      let checkIn = new Date(date);
      let checkOut = new Date(date);
      let totalHours = 8;
      
      if (rand < 0.1) {
        // 10% absent days
        continue; // Skip creating attendance record for absent days
      } else if (rand < 0.15) {
        // 5% half days
        status = 'Half Day';
        checkIn.setHours(9, 0, 0);
        checkOut.setHours(13, 30, 0);
        totalHours = 4.5;
        halfDays++;
      } else if (rand < 0.25) {
        // 10% late arrivals
        status = 'Late';
        checkIn.setHours(10, 30, 0); // Late arrival
        checkOut.setHours(18, 30, 0);
        totalHours = 8;
        lateDays++;
        presentDays++;
      } else if (rand < 0.35) {
        // 10% overtime days
        status = 'Present';
        checkIn.setHours(9, 0, 0);
        checkOut.setHours(19, 0, 0); // 1 hour overtime
        totalHours = 10;
        presentDays++;
      } else {
        // 65% normal working days
        status = 'Present';
        checkIn.setHours(9, 0, 0);
        checkOut.setHours(18, 0, 0);
        totalHours = 8;
        presentDays++;
      }
      
      const attendanceRecord = {
        employeeId: employee._id,
        date: new Date(date),
        checkIn,
        checkOut,
        totalHours,
        status,
        location: 'Office',
        notes: `Test attendance data for ${date.toDateString()}`
      };
      
      attendanceRecords.push(attendanceRecord);
    }
    
    // Delete existing attendance for this employee and month
    await Attendance.deleteMany({
      employeeId: employee._id,
      date: {
        $gte: startDate,
        $lt: new Date(currentYear, currentMonth, 1)
      }
    });
    
    // Insert new attendance records
    await Attendance.insertMany(attendanceRecords);
    
    console.log(`✅ Created ${attendanceRecords.length} attendance records for ${employee.employeeId}`);
    console.log(`📊 Summary: ${presentDays} present days, ${halfDays} half days, ${lateDays} late arrivals`);
    console.log(`📅 Month: ${currentMonth}/${currentYear}`);
    
  } catch (error) {
    console.error('Error creating test attendance:', error);
  } finally {
    mongoose.disconnect();
  }
};

createTestAttendance();
