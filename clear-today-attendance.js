const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Attendance = require('./backend/models/Attendance');

async function clearTodayAttendance() {
  try {
    const today = new Date();
    const dateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const result = await Attendance.deleteMany({
      date: dateOnly
    });
    
    console.log(`✅ Cleared ${result.deletedCount} attendance records for today`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing attendance:', error);
    process.exit(1);
  }
}

clearTodayAttendance();
