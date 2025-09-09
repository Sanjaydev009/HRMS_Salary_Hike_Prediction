const mongoose = require('mongoose');
require('dotenv').config();
const Payroll = require('./models/Payroll');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const cleanupPayrollRecords = async () => {
  try {
    console.log('🧹 Cleaning up existing payroll records...');
    
    // Delete all payroll records (for testing purposes)
    const deletedRecords = await Payroll.deleteMany({});
    
    console.log(`✅ Deleted ${deletedRecords.deletedCount} payroll records`);
    console.log('💡 You can now create fresh payroll records for testing');
    
  } catch (error) {
    console.error('❌ Error cleaning up payroll records:', error);
  } finally {
    mongoose.disconnect();
  }
};

cleanupPayrollRecords();
