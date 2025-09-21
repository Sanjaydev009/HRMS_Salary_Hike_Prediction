#!/usr/bin/env node

/**
 * 🎯 SALARY HIKE ELIGIBILITY SETUP - COMPLETE DEMO SCRIPT
 * 
 * This script makes the demo employee 'employee.dev@gmail.com' fully eligible 
 * for salary hike by meeting all ML model criteria:
 * 
 * ✅ Experience >= 1 year (Updated to 2.7 years)
 * ✅ Attendance >= 90% (Set to 95.4%)  
 * ✅ Daily hours >= 9 (Set to 10.1 hours average)
 * ✅ Performance rating (Set to 4.5/5.0)
 * ✅ Certifications (Added 8 high-value certifications)
 * 
 * Expected Result: 30% salary hike (₹1,800,000 increase)
 */

console.log(`
╔══════════════════════════════════════════════════════════════╗
║               🎯 HRMS SALARY HIKE DEMO SETUP                ║
║                                                              ║
║  Making employee.dev@gmail.com eligible for MAXIMUM hike    ║
╚══════════════════════════════════════════════════════════════╝
`);

async function runCompleteSetup() {
  console.log('🚀 STARTING COMPLETE ELIGIBILITY SETUP...\n');
  
  try {
    // Step 1: Run the main eligibility script
    console.log('📝 Step 1: Running certification and data setup...');
    const { makeEmployeeHikeEligible } = require('./make-employee-hike-eligible.js');
    await makeEmployeeHikeEligible();
    console.log('✅ Certification and profile data updated\n');
    
    // Step 2: Run MongoDB database update
    console.log('💾 Step 2: Updating database with attendance and performance...');
    const { updateEmployeeForHikeEligibility } = require('./mongodb-hike-eligibility-update.js');
    await updateEmployeeForHikeEligibility();
    console.log('✅ Database updated successfully\n');
    
    // Step 3: Run final verification
    console.log('🧪 Step 3: Running final verification test...');
    const { testHikeEligibility } = require('./test-hike-eligibility.js');
    await testHikeEligibility();
    
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🎉 SETUP COMPLETE!                       ║
║                                                              ║
║  Employee is now FULLY ELIGIBLE for salary hike!            ║
║                                                              ║
║  📊 Expected Results:                                        ║
║  • Hike Percentage: 30%                                     ║
║  • Current Salary: ₹6,000,000                               ║
║  • New Salary: ₹7,800,000                                   ║
║  • Hike Amount: ₹1,800,000                                  ║
║  • Confidence: 95%                                          ║
║                                                              ║
║  🚀 Demo Instructions:                                       ║
║  1. Open: http://localhost:5173                             ║
║  2. Login: employee.dev@gmail.com / employee123             ║
║  3. Click "Salary Prediction" in sidebar                    ║
║  4. View the ML prediction results                          ║
║                                                              ║
║  ✅ All eligibility criteria have been met!                ║
╚══════════════════════════════════════════════════════════════╝
`);
    
  } catch (error) {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║                     ❌ SETUP FAILED                         ║
║                                                              ║
║  Error: ${error.message.padEnd(53)} ║
║                                                              ║
║  🔧 Troubleshooting:                                        ║
║  1. Ensure all services are running:                        ║
║     • Backend: http://localhost:5001                        ║
║     • Frontend: http://localhost:5173                       ║
║     • ML Service: http://localhost:8001                     ║
║     • MongoDB: mongodb://localhost:27017/hrms               ║
║                                                              ║
║  2. Run services individually:                              ║
║     • npm run backend                                       ║
║     • npm run frontend                                      ║
║     • npm run ml                                            ║
║                                                              ║
║  3. Check logs for specific errors                          ║
╚══════════════════════════════════════════════════════════════╝
`);
  }
}

// Self-executing function if run directly
if (require.main === module) {
  runCompleteSetup();
}

module.exports = { runCompleteSetup };
