const { MongoClient, ObjectId } = require('mongodb');

async function updateEmployeeForHikeEligibility() {
  console.log('🔧 Direct MongoDB Update for Hike Eligibility...\n');
  
  const MONGODB_URI = 'mongodb://localhost:27017/hrms';
  const EMPLOYEE_EMAIL = 'employee.dev@gmail.com';
  
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db('hrms');
    const usersCollection = db.collection('users');
    const attendanceCollection = db.collection('attendances');
    
    // Step 1: Update user profile for experience and performance
    console.log('📅 Step 1: Updating user profile...');
    
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    twoYearsAgo.setMonth(0); // January
    twoYearsAgo.setDate(15); // 15th
    
    const userUpdateResult = await usersCollection.updateOne(
      { email: EMPLOYEE_EMAIL },
      {
        $set: {
          'jobDetails.joiningDate': twoYearsAgo,
          'performanceHistory': [
            {
              year: 2024,
              rating: 4.5,
              comments: 'Excellent performance, consistently exceeds expectations',
              goals: [
                'Complete all assigned projects on time',
                'Mentor junior developers',
                'Improve system efficiency by 20%',
                'Lead cross-functional initiatives'
              ],
              achievements: [
                'Led successful product launch',
                'Reduced system downtime by 30%',
                'Completed advanced AWS certifications',
                'Mentored 3 junior developers',
                'Implemented automated testing framework'
              ],
              createdAt: new Date()
            },
            {
              year: 2023,
              rating: 4.2,
              comments: 'Strong performance with significant contributions',
              goals: [
                'Learn new technologies',
                'Improve code quality',
                'Contribute to architecture decisions'
              ],
              achievements: [
                'Migrated legacy systems to cloud',
                'Improved application performance by 40%',
                'Obtained Kubernetes certification'
              ],
              createdAt: new Date()
            }
          ]
        }
      }
    );
    
    if (userUpdateResult.modifiedCount > 0) {
      console.log('✅ User profile updated successfully');
      console.log(`   Joining date set to: ${twoYearsAgo.toLocaleDateString()}`);
      console.log('   Performance history added for 2023-2024');
    } else {
      console.log('⚠️  User not found or already updated');
    }
    
    // Step 2: Get user ID for attendance records
    const user = await usersCollection.findOne({ email: EMPLOYEE_EMAIL });
    if (!user) {
      throw new Error('Employee not found');
    }
    
    const employeeObjectId = user._id;
    console.log(`   Employee ID: ${employeeObjectId}\n`);
    
    // Step 3: Clear existing attendance records and create new ones
    console.log('📊 Step 2: Creating attendance records...');
    
    // Delete existing attendance records for this employee
    await attendanceCollection.deleteMany({ employeeId: employeeObjectId });
    console.log('   Cleared existing attendance records');
    
    // Generate comprehensive attendance records for the last 12 months
    const attendanceRecords = [];
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
    
    // Generate attendance for each day
    const date = new Date(oneYearAgo);
    let totalWorkingDays = 0;
    let presentDays = 0;
    
    while (date <= currentDate) {
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        totalWorkingDays++;
        
        // 96% attendance rate - be present for 96% of working days
        if (Math.random() < 0.96) {
          presentDays++;
          
          // Generate realistic work hours (9-11 hours)
          const baseHours = 9;
          const extraHours = Math.random() * 2; // 0-2 extra hours
          const totalHours = Math.round((baseHours + extraHours) * 10) / 10;
          
          const checkIn = new Date(date);
          checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 30), 0, 0); // 8:00-9:30 AM
          
          const checkOut = new Date(checkIn);
          checkOut.setTime(checkOut.getTime() + (totalHours * 60 * 60 * 1000)); // Add work hours
          
          attendanceRecords.push({
            employeeId: employeeObjectId,
            date: new Date(date),
            checkIn: checkIn,
            checkOut: checkOut,
            breakTime: 60, // 1 hour break
            totalHours: totalHours,
            status: 'Present',
            location: Math.random() > 0.1 ? 'Office' : 'Remote', // 90% office, 10% remote
            notes: 'Regular attendance',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        } else {
          // Absent day
          attendanceRecords.push({
            employeeId: employeeObjectId,
            date: new Date(date),
            status: 'Absent',
            totalHours: 0,
            notes: 'Personal leave',
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }
      
      // Move to next day
      date.setDate(date.getDate() + 1);
    }
    
    // Calculate metrics
    const attendanceRate = totalWorkingDays > 0 ? (presentDays / totalWorkingDays) * 100 : 0;
    const avgHours = presentDays > 0 ? attendanceRecords
      .filter(rec => rec.status === 'Present')
      .reduce((sum, rec) => sum + rec.totalHours, 0) / presentDays : 0;
    
    // Insert attendance records in batches
    if (attendanceRecords.length > 0) {
      await attendanceCollection.insertMany(attendanceRecords);
      
      console.log(`✅ ${attendanceRecords.length} attendance records created`);
      console.log(`   Working days: ${totalWorkingDays}`);
      console.log(`   Present days: ${presentDays}`);
      console.log(`   Attendance rate: ${attendanceRate.toFixed(1)}%`);
      console.log(`   Average hours per day: ${avgHours.toFixed(1)}\n`);
    }
    
    // Step 4: Add project completion and revenue data
    console.log('🎯 Step 3: Adding project metrics...');
    
    const projectMetrics = {
      'projectMetrics': {
        projectsCompleted: 15,
        projectsOnTime: 14,
        projectCompletionRate: 93.3,
        averageProjectDuration: 45, // days
        clientSatisfactionScore: 4.6,
        revenueGenerated: 750000, // INR
        costSavings: 120000, // INR
        lastUpdated: new Date()
      },
      'teamMetrics': {
        teamSize: 4,
        teamSatisfactionScore: 4.4,
        mentorshipHours: 120,
        trainingSessionsConducted: 8,
        lastUpdated: new Date()
      }
    };
    
    await usersCollection.updateOne(
      { email: EMPLOYEE_EMAIL },
      { $set: projectMetrics }
    );
    
    console.log('✅ Project and team metrics added');
    console.log(`   Project completion rate: ${projectMetrics.projectMetrics.projectCompletionRate}%`);
    console.log(`   Revenue generated: ₹${projectMetrics.projectMetrics.revenueGenerated.toLocaleString()}`);
    console.log(`   Team size managed: ${projectMetrics.teamMetrics.teamSize}\n`);
    
    // Step 5: Verify final eligibility
    console.log('🔍 Step 4: Verifying eligibility criteria...');
    
    const updatedUser = await usersCollection.findOne({ email: EMPLOYEE_EMAIL });
    const experience = (new Date() - updatedUser.jobDetails.joiningDate) / (1000 * 60 * 60 * 24 * 365);
    
    const eligibilityCheck = [
      {
        criterion: 'Experience >= 1 year',
        value: `${experience.toFixed(1)} years`,
        eligible: experience >= 1,
        required: '≥ 1.0 years'
      },
      {
        criterion: 'Attendance >= 90%',
        value: `${attendanceRate.toFixed(1)}%`,
        eligible: attendanceRate >= 90,
        required: '≥ 90%'
      },
      {
        criterion: 'Daily hours >= 9',
        value: `${avgHours.toFixed(1)} hours`,
        eligible: avgHours >= 9,
        required: '≥ 9.0 hours'
      },
      {
        criterion: 'Performance rating',
        value: '4.5/5.0',
        eligible: true,
        required: '> 3.5/5.0'
      }
    ];
    
    console.log('=====================================');
    eligibilityCheck.forEach(check => {
      const status = check.eligible ? '✅ ELIGIBLE' : '❌ NOT ELIGIBLE';
      console.log(`${status} ${check.criterion}`);
      console.log(`     Current: ${check.value}`);
      console.log(`     Required: ${check.required}\n`);
    });
    
    const allEligible = eligibilityCheck.every(check => check.eligible);
    
    if (allEligible) {
      console.log('🎉 SUCCESS: Employee is now FULLY ELIGIBLE for salary hike!');
      console.log('   All criteria met for maximum hike calculation.\n');
    } else {
      console.log('⚠️  WARNING: Some criteria still not met');
      console.log('   Please review and adjust data as needed.\n');
    }
    
    // Step 6: Calculate expected hike
    console.log('💰 EXPECTED SALARY HIKE CALCULATION');
    console.log('=====================================');
    
    const baseHike = Math.min((experience - 1) * 3, 15); // Experience hike
    const attendanceHike = attendanceRate >= 98 ? 10 : attendanceRate >= 95 ? 8 : 5;
    const hoursHike = avgHours >= 11 ? 8 : avgHours >= 10 ? 6 : 4;
    const performanceHike = (4.5 - 3.5) * 10; // 10% for performance
    const certificationHike = 12; // Assume 3 certifications × 4%
    
    const totalHike = baseHike + attendanceHike + hoursHike + performanceHike + certificationHike;
    const currentSalary = updatedUser.jobDetails.salary.basic;
    const newSalary = currentSalary * (1 + totalHike / 100);
    const hikeAmount = newSalary - currentSalary;
    
    console.log(`Experience hike: ${baseHike.toFixed(1)}%`);
    console.log(`Attendance hike: ${attendanceHike}%`);
    console.log(`Hours hike: ${hoursHike}%`);
    console.log(`Performance hike: ${performanceHike}%`);
    console.log(`Certification hike: ${certificationHike}%`);
    console.log(`------------------------`);
    console.log(`Total expected hike: ${totalHike.toFixed(1)}%`);
    console.log(`Current salary: ₹${currentSalary.toLocaleString()}`);
    console.log(`New salary: ₹${Math.round(newSalary).toLocaleString()}`);
    console.log(`Hike amount: ₹${Math.round(hikeAmount).toLocaleString()}\n`);
    
    console.log('🚀 READY FOR TESTING!');
    console.log('=====================================');
    console.log('1. Run the main eligibility script: node make-employee-hike-eligible.js');
    console.log('2. Test ML prediction at: http://localhost:5173/salary-prediction');
    console.log('3. Login with: employee.dev@gmail.com / employee123');
    console.log('4. Verify all hike criteria are met in the prediction dashboard\n');
    
  } catch (error) {
    console.error('❌ MongoDB update failed:', error.message);
    console.log('\n🔧 TROUBLESHOOTING:');
    console.log('1. Ensure MongoDB is running on localhost:27017');
    console.log('2. Verify database name is "hrms"');
    console.log('3. Check if employee account exists');
    console.log('4. Ensure MongoDB user has write permissions');
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 MongoDB connection closed');
    }
  }
}

// Run the script
if (require.main === module) {
  updateEmployeeForHikeEligibility();
}

module.exports = { updateEmployeeForHikeEligibility };
