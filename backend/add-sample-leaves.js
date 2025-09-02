require('dotenv').config();
const mongoose = require('mongoose');
const Leave = require('./models/Leave');
const User = require('./models/User');

async function addSampleLeaves() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find some existing employees
    const employees = await User.find({ role: 'employee' }).limit(3);
    if (employees.length === 0) {
      console.log('No employees found. Please create some employees first.');
      return;
    }

    // Sample leave requests
    const sampleLeaves = [
      {
        employeeId: employees[0]._id,
        leaveType: 'sick',
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-01-17'),
        reason: 'Flu and fever',
        status: 'pending',
        numberOfDays: 3
      },
      {
        employeeId: employees[1]._id,
        leaveType: 'annual',
        startDate: new Date('2025-02-10'),
        endDate: new Date('2025-02-14'),
        reason: 'Family vacation',
        status: 'pending',
        numberOfDays: 5
      },
      {
        employeeId: employees[0]._id,
        leaveType: 'casual',
        startDate: new Date('2025-01-25'),
        endDate: new Date('2025-01-25'),
        reason: 'Personal work',
        status: 'pending',
        numberOfDays: 1
      }
    ];

    if (employees[2]) {
      sampleLeaves.push({
        employeeId: employees[2]._id,
        leaveType: 'annual',
        startDate: new Date('2025-03-05'),
        endDate: new Date('2025-03-12'),
        reason: 'Annual vacation',
        status: 'pending',
        numberOfDays: 8
      });
    }

    // Clear existing leaves first
    await Leave.deleteMany({});
    console.log('Cleared existing leaves');

    // Add sample leaves
    const createdLeaves = await Leave.insertMany(sampleLeaves);
    console.log(`✅ Created ${createdLeaves.length} sample leave requests:`);
    
    createdLeaves.forEach((leave, index) => {
      console.log(`${index + 1}. ${leave.leaveType} leave for ${leave.numberOfDays} days - Status: ${leave.status}`);
    });

    mongoose.connection.close();
    console.log('✅ Sample leave data added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample leaves:', error);
    mongoose.connection.close();
  }
}

addSampleLeaves();
