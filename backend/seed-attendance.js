const mongoose = require('mongoose');
const User = require('./models/User');
const Attendance = require('./models/Attendance');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/hrms');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedAttendance = async () => {
  await connectDB();
  
  try {
    // Find user with email employee.dev@gmail.com
    const user = await User.findOne({ email: 'employee.dev@gmail.com' });
    
    if (!user) {
      console.log('Employee user not found');
      return;
    }
    
    console.log('Found user:', user.email, user._id);
    
    // Check if attendance already exists for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);
    
    const existingAttendance = await Attendance.find({ 
      employeeId: user._id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    if (existingAttendance.length > 0) {
      console.log('Attendance already exists for current month:', existingAttendance.length, 'records');
      return;
    }
    
    // Create attendance records for the current month
    const attendanceRecords = [];
    const today = new Date();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    for (let day = 1; day <= Math.min(daysInMonth, today.getDate()); day++) {
      const date = new Date(currentYear, currentMonth, day);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) {
        continue;
      }
      
      // Randomly assign status (mostly present with some variations)
      const random = Math.random();
      let status = 'Present';
      let checkIn = new Date(date);
      checkIn.setHours(9, 0, 0, 0); // 9 AM
      let checkOut = new Date(date);
      checkOut.setHours(18, 0, 0, 0); // 6 PM
      
      if (random < 0.1) { // 10% chance
        status = 'Late';
        checkIn.setHours(9, 30, 0, 0); // 9:30 AM
      } else if (random < 0.15) { // 5% chance
        status = 'Absent';
        checkIn = null;
        checkOut = null;
      } else if (random < 0.2) { // 5% chance
        status = 'Half Day';
        checkOut.setHours(13, 0, 0, 0); // 1 PM
      }
      
      const totalHours = checkIn && checkOut ? 
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) : 0;
      
      attendanceRecords.push({
        employeeId: user._id,
        date: date,
        checkIn: checkIn,
        checkOut: checkOut,
        status: status,
        totalHours: totalHours,
        location: 'Office',
        notes: status === 'Late' ? 'Traffic delay' : null
      });
    }
    
    await Attendance.insertMany(attendanceRecords);
    console.log(`Created ${attendanceRecords.length} attendance records for current month`);
    
    // Summary
    const summary = {
      present: attendanceRecords.filter(r => r.status === 'Present').length,
      late: attendanceRecords.filter(r => r.status === 'Late').length,
      absent: attendanceRecords.filter(r => r.status === 'Absent').length,
      halfDay: attendanceRecords.filter(r => r.status === 'Half Day').length,
    };
    
    console.log('Attendance summary:', summary);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAttendance();
