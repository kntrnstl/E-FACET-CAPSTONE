// backend/src/services/emailReminderService.js
const { sendReminderEmail } = require('./emailService');

/**
 * Send reminder email to student
 * Called by cron job 1 day before schedule
 */
const sendScheduleReminder = async (emailData) => {
  try {
    console.log('📧 Sending reminder to:', emailData.studentEmail);
    
    const result = await sendReminderEmail(emailData);
    
    console.log('✅ Reminder email sent successfully!');
    console.log('   Message ID:', result.messageId);
    console.log('   Student:', emailData.studentName);
    console.log('   Schedule Date:', emailData.date);
    
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending reminder email:', error);
    throw error;
  }
};

module.exports = {
  sendScheduleReminder
};