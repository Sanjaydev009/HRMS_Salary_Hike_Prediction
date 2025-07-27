const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  breakTime: {
    type: Number, // Minutes
    default: 0
  },
  totalHours: {
    type: Number, // Hours
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'Holiday', 'Leave'],
    default: 'Absent'
  },
  location: {
    type: String,
    enum: ['Office', 'Remote', 'Field'],
    default: 'Office'
  },
  notes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  }
}, {
  timestamps: true
});

// Ensure one record per employee per day
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

attendanceSchema.pre('save', function(next) {
  // Calculate total hours if both check-in and check-out are present
  if (this.checkIn && this.checkOut) {
    const timeDiff = this.checkOut - this.checkIn;
    const hours = (timeDiff / (1000 * 60 * 60)) - (this.breakTime / 60);
    this.totalHours = Math.max(0, Math.round(hours * 100) / 100);
    
    // Determine status based on hours
    if (this.totalHours >= 8) {
      this.status = 'Present';
    } else if (this.totalHours >= 4) {
      this.status = 'Half Day';
    } else {
      this.status = 'Late';
    }
  } else if (this.checkIn && !this.checkOut) {
    this.status = 'Present'; // Currently working
  }
  
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);
