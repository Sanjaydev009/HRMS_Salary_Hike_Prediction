const mongoose = require('mongoose');
const Leave = require('./backend/models/Leave');
const User = require('./backend/models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const addSampleLeaveRequests = async () => {
  try {
    await connectDB();
    
    // Find users to create leave requests for
    const employees = await User.find({ role: 'employee' });
    
    if (employees.length === 0) {
      console.log('No employees found to create leave requests for');
      return;
    }

    const sampleLeaves = [
      {
        employeeId: employees[0]._id,
        leaveType: 'annual',
        startDate: new Date('2025-09-15'),
        endDate: new Date('2025-09-17'),
        numberOfDays: 3,
        reason: 'Family vacation',
        status: 'pending',
        appliedDate: new Date(),
        halfDay: false,
      },
      {
        employeeId: employees[0]._id,
        leaveType: 'sick',
        startDate: new Date('2025-09-10'),
        endDate: new Date('2025-09-11'),
        numberOfDays: 2,
        reason: 'Medical appointment',
        status: 'approved',
        appliedDate: new Date('2025-09-08'),
        halfDay: false,
      },
      {
        employeeId: employees[0]._id,
        leaveType: 'casual',
        startDate: new Date('2025-09-20'),
        endDate: new Date('2025-09-20'),
        numberOfDays: 1,
        reason: 'Personal work',
        status: 'pending',
        appliedDate: new Date(),
        halfDay: false,
      }
    ];

    // Add more leave requests for other employees if available
    if (employees.length > 1) {
      sampleLeaves.push(
        {
          employeeId: employees[1]._id,
          leaveType: 'annual',
          startDate: new Date('2025-09-25'),
          endDate: new Date('2025-09-27'),
          numberOfDays: 3,
          reason: 'Wedding attendance',
          status: 'pending',
          appliedDate: new Date(),
          halfDay: false,
        },
        {
          employeeId: employees[1]._id,
          leaveType: 'sick',
          startDate: new Date('2025-09-05'),
          endDate: new Date('2025-09-05'),
          numberOfDays: 1,
          reason: 'Fever',
          status: 'rejected',
          appliedDate: new Date('2025-09-04'),
          rejectionReason: 'Insufficient documentation',
          halfDay: false,
        }
      );
    }

    // Clear existing leave requests (optional)
    await Leave.deleteMany({});
    console.log('Cleared existing leave requests');

    // Insert sample leave requests
    const result = await Leave.insertMany(sampleLeaves);
    console.log(`✅ Successfully added ${result.length} sample leave requests`);

    // Display the created leave requests
    const allLeaves = await Leave.find()
      .populate('employeeId', 'profile.firstName profile.lastName employeeId')
      .sort({ appliedDate: -1 });
    
    console.log('\n📋 Sample Leave Requests Created:');
    allLeaves.forEach((leave, index) => {
      console.log(`${index + 1}. ${leave.employeeId.profile.firstName} ${leave.employeeId.profile.lastName} - ${leave.leaveType} (${leave.status})`);
      console.log(`   📅 ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()}`);
      console.log(`   📝 ${leave.reason}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample leave requests:', error);
    process.exit(1);
  }
};

addSampleLeaveRequests();
