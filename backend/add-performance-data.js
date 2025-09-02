const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/hrms', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function addPerformanceData() {
  try {
    console.log('Adding performance data to employees...');

    // Get all employees
    const employees = await User.find({ role: { $in: ['employee'] } });
    console.log(`Found ${employees.length} employees`);

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    for (const employee of employees) {
      // Generate performance data for current and previous year
      const performanceData = [
        {
          year: previousYear,
          rating: Math.random() * 2 + 3, // 3.0 to 5.0
          comments: 'Previous year performance evaluation',
          goals: ['Improve technical skills', 'Better team collaboration', 'Complete certifications'],
          achievements: ['Completed assigned projects', 'Helped team members', 'Improved efficiency'],
          reviewDate: new Date(previousYear, 11, 15) // December 15th of previous year
        },
        {
          year: currentYear,
          rating: Math.random() * 2 + 3, // 3.0 to 5.0
          comments: 'Current year performance evaluation',
          goals: ['Leadership development', 'Process improvement', 'Knowledge sharing'],
          achievements: ['Exceeded targets', 'Mentored junior staff', 'Innovation initiatives'],
          reviewDate: new Date(currentYear, 5, 15) // June 15th of current year
        }
      ];

      // Update employee with performance history
      await User.findByIdAndUpdate(
        employee._id,
        { $set: { performanceHistory: performanceData } },
        { new: true }
      );

      console.log(`Updated performance data for ${employee.profile.firstName} ${employee.profile.lastName}`);
    }

    console.log('✅ Performance data added successfully!');
  } catch (error) {
    console.error('Error adding performance data:', error);
  } finally {
    mongoose.connection.close();
  }
}

addPerformanceData();
