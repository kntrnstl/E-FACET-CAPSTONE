// backend/src/jobs/reminderScheduler.js
const cron = require('node-cron');
const pool = require('../config/database');
const { sendReminderEmail } = require('../services/emailService');

/**
 * Helper: Get tomorrow's date in YYYY-MM-DD format
 */
function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Helper: Convert date to YYYY-MM-DD
 */
function toYMD(dateLike) {
  if (!dateLike) return "";
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Helper: Add days to date
 */
function addDaysYMD(ymd, days) {
  const d = new Date(`${String(ymd)}T00:00:00`);
  d.setDate(d.getDate() + Number(days || 0));
  return toYMD(d);
}

/**
 * Helper: Check if 2-day package course
 */
function isTwoDayCourseByCode(course_code) {
  const code = String(course_code || "").trim().toUpperCase();
  return code === "PDC-AB" || code === "TDC";
}

/**
 * Send reminders to all students with schedule tomorrow
 */
async function sendScheduleReminders() {
  const conn = await pool.getConnection();
  try {
    const tomorrow = getTomorrowDate();
    
    console.log('');
    console.log('⏰ ============================================');
    console.log('⏰ RUNNING REMINDER JOB');
    console.log('⏰ Current Time:', new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
    console.log('⏰ Target Date:', tomorrow);
    console.log('⏰ ============================================');

    // Get all active reservations for tomorrow
    const [reservations] = await conn.execute(
      `
      SELECT 
        r.reservation_id,
        r.schedule_id,
        r.student_id,
        r.payment_method,
        r.requirements_mode,
        r.notes,
        r.course_id,
        
        u.fullname AS student_name,
        u.email AS student_email,
        
        c.course_name,
        c.course_code,
        c.course_fee,
        
        s.schedule_date,
        TIME_FORMAT(s.start_time, '%H:%i') AS start_time,
        TIME_FORMAT(s.end_time, '%H:%i') AS end_time,
        s.instructor_id
        
      FROM schedule_reservations r
      JOIN users u ON u.id = r.student_id
      JOIN schedules s ON s.schedule_id = r.schedule_id
      JOIN courses c ON c.id = r.course_id
      
      WHERE r.reservation_status IN ('CONFIRMED', 'APPROVED', 'ACTIVE')
        AND DATE(s.schedule_date) = ?
        AND u.email IS NOT NULL
        AND u.email != ''
      
      ORDER BY s.start_time ASC
      `,
      [tomorrow]
    );

    if (reservations.length === 0) {
      console.log('⏰ No reservations found for tomorrow');
      console.log('⏰ ============================================');
      console.log('');
      return { sent: 0, failed: 0 };
    }

    console.log(`⏰ Found ${reservations.length} reservation(s) for tomorrow`);
    console.log('⏰ Starting to send reminder emails...');
    console.log('');

    let sentCount = 0;
    let failedCount = 0;

    // Send reminder to each student
    for (const res of reservations) {
      try {
        // Check if this is a 2-day package by course code
        const isPackage = isTwoDayCourseByCode(res.course_code);
        let day2Data = null;

        if (isPackage) {
          // For 2-day packages, find the Day 2 schedule
          // Day 2 = next day, same time, same instructor, same course
          const day2Date = addDaysYMD(tomorrow, 1);
          
          const [day2Rows] = await conn.execute(
            `
            SELECT 
              s.schedule_id,
              s.schedule_date,
              TIME_FORMAT(s.start_time, '%H:%i') AS start_time,
              TIME_FORMAT(s.end_time, '%H:%i') AS end_time
            FROM schedules s
            WHERE s.course_id = ?
              AND s.instructor_id = ?
              AND DATE(s.schedule_date) = ?
              AND TIME_FORMAT(s.start_time, '%H:%i') = ?
              AND TIME_FORMAT(s.end_time, '%H:%i') = ?
            LIMIT 1
            `,
            [
              res.course_id,
              res.instructor_id,
              day2Date,
              res.start_time,
              res.end_time
            ]
          );

          if (day2Rows.length) {
            day2Data = {
              schedule_date: day2Rows[0].schedule_date,
              start_time: day2Rows[0].start_time,
              end_time: day2Rows[0].end_time
            };
          }
        }

        // Get instructor name
        let instructorName = 'TBA';
        if (res.instructor_id) {
          const [instructorRows] = await conn.execute(
            `SELECT CONCAT(firstname, ' ', lastname) AS fullname 
             FROM instructors 
             WHERE instructor_id = ? 
             LIMIT 1`,
            [res.instructor_id]
          );
          if (instructorRows.length) {
            instructorName = instructorRows[0].fullname;
          }
        }

        // Prepare email data
        const emailData = {
          studentEmail: res.student_email,
          studentName: res.student_name,
          courseName: res.course_name,
          courseCode: res.course_code || '',
          scheduleId: res.schedule_id,
          date: tomorrow,
          startTime: res.start_time,
          endTime: res.end_time,
          instructor: instructorName,
          courseFee: Number(res.course_fee || 0),
          paymentMethod: res.payment_method,
          requirementsMode: res.requirements_mode || 'walkin',
          notes: res.notes || null,
          isPackage,
          day2Date: day2Data ? toYMD(day2Data.schedule_date) : null,
          day2StartTime: day2Data ? day2Data.start_time : null,
          day2EndTime: day2Data ? day2Data.end_time : null,
        };

        // Send email
        await sendReminderEmail(emailData);
        
        console.log(`✅ Sent to: ${res.student_name} (${res.student_email})`);
        console.log(`   Schedule: ${res.start_time} - ${res.end_time}`);
        console.log(`   Course: ${res.course_name}${isPackage ? ' (2-day package)' : ''}`);
        console.log('');
        
        sentCount++;

        // Small delay to avoid overwhelming email server
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to send to ${res.student_name}:`, error.message);
        console.log('');
        failedCount++;
      }
    }

    console.log('⏰ ============================================');
    console.log(`⏰ REMINDER JOB COMPLETED`);
    console.log(`⏰ Total: ${reservations.length} | Sent: ${sentCount} | Failed: ${failedCount}`);
    console.log('⏰ ============================================');
    console.log('');

    return { sent: sentCount, failed: failedCount };

  } catch (error) {
    console.error('❌ Error in reminder scheduler:', error);
    return { sent: 0, failed: 0 };
  } finally {
    conn.release();
  }
}

/**
 * Initialize cron jobs for reminders
 * Runs at 8:00 AM and 8:00 PM Manila time daily
 */
function initializeReminderScheduler() {
  console.log('');
  console.log('⏰ ============================================');
  console.log('⏰ REMINDER SCHEDULER INITIALIZED');
  console.log('⏰ ============================================');
  console.log('⏰ Schedule: Every day at 8:00 AM and 8:00 PM (Manila Time)');
  console.log('⏰ Purpose: Send reminders 1 day before schedule');
  console.log('⏰ ============================================');
  console.log('');

  // Run at 8:00 AM Manila time (0 8 * * *)
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ [8:00 AM] Starting morning reminder job...');
    await sendScheduleReminders();
  }, {
    timezone: "Asia/Manila"
  });

  // Run at 8:00 PM Manila time (0 20 * * *)
  cron.schedule('0 20 * * *', async () => {
    console.log('⏰ [8:00 PM] Starting evening reminder job...');
    await sendScheduleReminders();
  }, {
    timezone: "Asia/Manila"
  });

  console.log('✅ Reminder scheduler is now running!');
  console.log('   Next reminders will be sent at:');
  console.log('   - 8:00 AM Manila Time');
  console.log('   - 8:00 PM Manila Time');
  console.log('');
}

// Export for manual testing
module.exports = {
  initializeReminderScheduler,
  sendScheduleReminders, // for manual testing
};