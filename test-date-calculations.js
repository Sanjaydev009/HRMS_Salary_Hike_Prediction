// Test to identify date calculation discrepancies
const testDateCalculations = () => {
  console.log('🔍 TESTING DATE CALCULATIONS');
  console.log('=' .repeat(50));
  
  // Test case: 09/09/2025 - 14/09/2025 (6 days as mentioned by user)
  const startDate = new Date('2025-09-09');
  const endDate = new Date('2025-09-14');
  
  console.log('📅 Test Case: 09/09/2025 - 14/09/2025');
  console.log(`Start Date: ${startDate.toDateString()}`);
  console.log(`End Date: ${endDate.toDateString()}`);
  console.log('');
  
  // Method 1: Simple days calculation (what user expects)
  const simpleDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  console.log(`📊 Simple Days Calculation: ${simpleDays} days`);
  
  // Method 2: Working days calculation (used in backend - inline version)
  let workingDaysInline = 0;
  const currentDate = new Date(startDate);
  console.log('📋 Working Days (Inline Method):');
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
    const isWorkingDay = dayOfWeek !== 0 && dayOfWeek !== 6; // Not Sunday (0) or Saturday (6)
    
    console.log(`   ${currentDate.toDateString()} (${dayName}): ${isWorkingDay ? '✅ Working Day' : '❌ Weekend'}`);
    
    if (isWorkingDay) {
      workingDaysInline++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  console.log(`📊 Working Days (Inline): ${workingDaysInline} days`);
  
  // Method 3: Working days calculation (Leave model method simulation)
  let workingDaysModel = 0;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      workingDaysModel++;
    }
  }
  console.log(`📊 Working Days (Model Method): ${workingDaysModel} days`);
  
  console.log('');
  console.log('🎯 ANALYSIS:');
  console.log(`Simple Days: ${simpleDays}`);
  console.log(`Working Days (Inline): ${workingDaysInline}`);  
  console.log(`Working Days (Model): ${workingDaysModel}`);
  
  if (simpleDays !== workingDaysInline) {
    console.log('⚠️  MISMATCH: Simple days vs Working days (inline)');
  }
  
  if (workingDaysInline !== workingDaysModel) {
    console.log('⚠️  MISMATCH: Inline method vs Model method');
  }
  
  if (simpleDays === workingDaysInline && workingDaysInline === workingDaysModel) {
    console.log('✅ All calculations match');
  }
  
  console.log('');
  console.log('💡 LIKELY ISSUE:');
  console.log('- Employees might see "simple days" calculation in UI');
  console.log('- Backend uses "working days" which excludes weekends');
  console.log('- This causes discrepancy between what employee sees vs what HR sees');
};

testDateCalculations();
