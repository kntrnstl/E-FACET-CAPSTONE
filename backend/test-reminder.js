require('dotenv').config();
const { sendScheduleReminders } = require('./src/jobs/reminderScheduler');

console.log('🧪 Testing reminder system...\n');

sendScheduleReminders()
  .then(result => {
    console.log('\n✅ Test complete!');
    console.log('Result:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  });