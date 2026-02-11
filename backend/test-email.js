require('dotenv').config();
const { sendReservationConfirmation, sendAdminNotification } = require('./src/services/emailService');

console.log('📧 Testing email configuration...\n');

// Check if email credentials are loaded
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || '(using EMAIL_USER as default)\n');

// Test data
const testData = {
  studentEmail: 'louireano@gmail.com',  // ← CHANGE THIS TO YOUR EMAIL
  studentName: 'Test Student',
  courseName: 'Basic Driving Course',
  courseCode: 'TDC-01',
  scheduleId: 123,
  scheduleDate: '2026-03-15',
  startTime: '09:00',
  endTime: '11:00',
  courseFee: 5000,
  paymentMethod: 'CASH',
  requirementsMode: 'online',
  notes: 'This is a test reservation',
  reservationId: 999,
  paymentRef: null,
};

console.log('Sending test emails...\n');

// Send both emails
Promise.all([
  sendReservationConfirmation(testData)
    .then(() => console.log('✅ Student confirmation email sent!'))
    .catch(err => console.error('❌ Student email failed:', err.message)),
  
  sendAdminNotification(testData)
    .then(() => console.log('✅ Admin notification email sent!'))
    .catch(err => console.error('❌ Admin email failed:', err.message)),
])
.then(() => {
  console.log('\n✅ Test complete! Check your email inbox.');
  console.log('Note: Emails might take 1-2 minutes to arrive.');
  console.log('Check spam folder if not in inbox.');
  process.exit(0);
})
.catch(err => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});