const { MongoClient } = require('mongodb');

async function fixCurrentMonthAttendance() {
  console.log('🔧 Fixing CURRENT MONTH attendance for immediate testing...\n');
  
  const MONGODB_URI = 'mongodb://localhost:27017/hrms';
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('hrms');
    const attendanceCollection = db.collection('attendances');
    const userCollection = db.collection('users');
    
    // Find the employee
    const employee = await userCollection.findOne({ email: 'employee.dev@gmail.com' });
    if (!employee) {
      throw new Error('Employee not found');
    }
    
    console.log(`📋 Employee ID: ${employee.employeeId}`);
    
    // Clear current month attendance
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    await attendanceCollection.deleteMany({
      employeeId: employee._id,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });
    
    console.log('🗑️  Cleared current month attendance');
    
    // Create current month attendance records (Sep 2025 - working days only)
    const attendanceRecords = [];
    let currentDay = new Date(startOfMonth);
    let workingDays = 0;
    let presentDays = 0;
    
    while (currentDay <= endOfMonth) {
      // Skip weekends
      if (currentDay.getDay() !== 0 && currentDay.getDay() !== 6) {
        workingDays++;
        
        // 95% attendance for current month
        const isPresent = Math.random() > 0.05; // 95% chance
        
        if (isPresent) {
          presentDays++;
          
          // Create realistic check-in/check-out times
          const checkInTime = new Date(currentDay);
          checkInTime.setHours(9, Math.floor(Math.random() * 30), 0, 0); // 9:00-9:30 AM
          
          const checkOutTime = new Date(currentDay);
          checkOutTime.setHours(18 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0, 0); // 6:00-8:00 PM
          
          const totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
          
          attendanceRecords.push({
            employeeId: employee._id,
            date: new Date(currentDay),
            checkIn: checkInTime,
            checkOut: checkOutTime,
            totalHours: Math.round(totalHours * 10) / 10,
            status: 'Present',
            location: 'Office',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    // Insert attendance records
    if (attendanceRecords.length > 0) {
      await attendanceCollection.insertMany(attendanceRecords);
    }
    
    const attendanceRate = (presentDays / workingDays) * 100;
    const avgHours = attendanceRecords.reduce((sum, rec) => sum + rec.totalHours, 0) / attendanceRecords.length;
    
    console.log(`✅ Created ${attendanceRecords.length} current month attendance records`);
    console.log(`📊 September 2025 Stats:`);
    console.log(`   Working days: ${workingDays}`);
    console.log(`   Present days: ${presentDays}`);
    console.log(`   Attendance rate: ${attendanceRate.toFixed(1)}%`);
    console.log(`   Average hours: ${avgHours.toFixed(1)}`);
    
    await client.close();
    console.log('\n🎉 Current month attendance fixed!');
    console.log('🔄 Now the attendance summary API should show ~95% attendance.');
    console.log('💡 Refresh your browser and test the salary prediction again.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.close();
  }
}

// Run the script
if (require.main === module) {
  fixCurrentMonthAttendance();
}

module.exports = { fixCurrentMonthAttendance };