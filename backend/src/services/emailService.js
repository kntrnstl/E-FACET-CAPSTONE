const transporter = require('../config/email.config');

/**
 * Send reservation confirmation email to student
 */
const sendReservationConfirmation = async (emailData) => {
  const {
    studentEmail,
    studentName,
    courseName,
    courseCode,
    scheduleId,
    date,
    startTime,
    endTime,
    instructor,
    courseFee,
    paymentMethod,
    paymentRef,
    requirementsMode,
    notes,
    isPackage,
    day2Date,
    day2StartTime,
    day2EndTime,
  } = emailData;

  const mailOptions = {
    from: `"Driving School Reservation System" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `✅ Reservation Confirmed - ${courseName} (${courseCode})`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background: linear-gradient(135deg, #15803d 0%, #166534 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 10px 10px 0 0;
          }
          .content {
            background: #f9fafb;
            padding: 30px 20px;
            border: 1px solid #e5e7eb;
          }
          .info-box {
            background: white;
            border-left: 4px solid #15803d;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #374151;
          }
          .value {
            color: #15803d;
            font-weight: 500;
          }
          .package-notice {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 15px;
            margin: 15px 0;
            border-radius: 8px;
          }
          .footer {
            background: #1f2937;
            color: #9ca3af;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            border-radius: 0 0 10px 10px;
          }
          .important {
            background: #fee2e2;
            border-left: 4px solid #dc2626;
            padding: 15px;
            margin: 15px 0;
            border-radius: 5px;
          }
          .success-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Reservation Confirmed!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.95;">Your slot has been successfully reserved</p>
        </div>

        <div class="content">
          <p>Dear <strong>${studentName}</strong>,</p>
          
          <p>Your reservation has been confirmed! Here are your booking details:</p>

          <div class="info-box">
            <h3 style="margin-top: 0; color: #15803d;">📚 Course Information</h3>
            <div class="info-row">
              <span class="label">Course:</span>
              <span class="value">${courseName}</span>
            </div>
            <div class="info-row">
              <span class="label">Course Code:</span>
              <span class="value">${courseCode}</span>
            </div>
            <div class="info-row">
              <span class="label">Course Fee:</span>
              <span class="value">₱${Number(courseFee).toLocaleString()}</span>
            </div>
          </div>

          ${isPackage ? `
            <div class="package-notice">
              <h3 style="margin-top: 0; color: #f59e0b;">📦 2-Day Package Reservation</h3>
              <p style="margin: 5px 0;"><strong>You have reserved BOTH days:</strong></p>
            </div>
          ` : ''}

          <div class="info-box">
            <h3 style="margin-top: 0; color: #15803d;">📅 Schedule Details ${isPackage ? '- Day 1' : ''}</h3>
            <div class="info-row">
              <span class="label">Schedule ID:</span>
              <span class="value">#${scheduleId}</span>
            </div>
            <div class="info-row">
              <span class="label">Date:</span>
              <span class="value">${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div class="info-row">
              <span class="label">Time:</span>
              <span class="value">${startTime} - ${endTime}</span>
            </div>
            <div class="info-row">
              <span class="label">Instructor:</span>
              <span class="value">${instructor}</span>
            </div>
          </div>

          ${isPackage && day2Date ? `
            <div class="info-box">
              <h3 style="margin-top: 0; color: #15803d;">📅 Schedule Details - Day 2</h3>
              <div class="info-row">
                <span class="label">Date:</span>
                <span class="value">${new Date(day2Date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div class="info-row">
                <span class="label">Time:</span>
                <span class="value">${day2StartTime} - ${day2EndTime}</span>
              </div>
            </div>
          ` : ''}

          <div class="info-box">
            <h3 style="margin-top: 0; color: #15803d;">💳 Payment Information</h3>
            <div class="info-row">
              <span class="label">Payment Method:</span>
              <span class="value">${paymentMethod === 'CASH' ? 'Cash On-Site' : paymentMethod}</span>
            </div>
            ${paymentRef ? `
              <div class="info-row">
                <span class="label">Payment Reference:</span>
                <span class="value" style="font-family: monospace;">${paymentRef}</span>
              </div>
            ` : ''}
            <div class="info-row">
              <span class="label">Requirements Mode:</span>
              <span class="value">${requirementsMode === 'walkin' ? 'Walk-in (On-site)' : 'Online Upload'}</span>
            </div>
          </div>

          ${notes ? `
            <div class="info-box">
              <h3 style="margin-top: 0; color: #15803d;">📝 Your Notes</h3>
              <p style="margin: 5px 0; font-style: italic;">${notes}</p>
            </div>
          ` : ''}

          ${paymentMethod === 'CASH' ? `
            <div class="important">
              <h4 style="margin-top: 0; color: #dc2626;">⚠️ Important Reminder</h4>
              <p style="margin: 5px 0;">Please bring the exact payment amount on your scheduled date:</p>
              <p style="margin: 5px 0; font-size: 20px; font-weight: bold; color: #15803d;">₱${Number(courseFee).toLocaleString()}</p>
            </div>
          ` : ''}

          ${requirementsMode === 'walkin' ? `
            <div class="important">
              <h4 style="margin-top: 0; color: #dc2626;">📋 Requirements Reminder</h4>
              <p style="margin: 5px 0;">Don't forget to bring all required documents on your scheduled date.</p>
            </div>
          ` : ''}

          <div style="margin: 30px 0; padding: 20px; background: #ecfdf5; border-radius: 8px; text-align: center;">
            <p style="margin: 0; font-size: 16px; color: #047857;">
              <strong>Reservation Status:</strong>
            </p>
            <span class="success-badge">CONFIRMED</span>
          </div>

          <p style="margin-top: 20px;">
            Thank you for choosing our driving school! If you have any questions, please don't hesitate to contact us.
          </p>

          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
            See you on your scheduled date!
          </p>
        </div>

        <div class="footer">
          <p style="margin: 0 0 10px 0;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Driving School Reservation System. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Reservation confirmation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending reservation email:', error);
    throw error;
  }
};

/**
 * Send notification to admin about new reservation
 */
const sendAdminNotification = async (emailData) => {
  const {
    studentName,
    studentEmail,
    courseName,
    courseCode,
    scheduleId,
    date,
    startTime,
    endTime,
    paymentMethod,
    paymentRef,
    isPackage,
    reservationId,
  } = emailData;

  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"Driving School System" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `🔔 New Reservation - ${studentName} - ${courseName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .info-row { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🔔 New Reservation Alert</h2>
          </div>
          <div class="content">
            <h3>Reservation Details</h3>
            <div class="info-row">
              <span class="label">Reservation ID:</span> #${reservationId}
            </div>
            <div class="info-row">
              <span class="label">Student:</span> ${studentName}
            </div>
            <div class="info-row">
              <span class="label">Email:</span> ${studentEmail}
            </div>
            <div class="info-row">
              <span class="label">Course:</span> ${courseName} (${courseCode})
            </div>
            <div class="info-row">
              <span class="label">Schedule:</span> #${scheduleId}
            </div>
            <div class="info-row">
              <span class="label">Date:</span> ${new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div class="info-row">
              <span class="label">Time:</span> ${startTime} - ${endTime}
            </div>
            <div class="info-row">
              <span class="label">Payment Method:</span> ${paymentMethod}
            </div>
            ${paymentRef ? `
              <div class="info-row">
                <span class="label">Payment Ref:</span> ${paymentRef}
              </div>
            ` : ''}
            ${isPackage ? `
              <div class="info-row" style="background: #fef3c7; padding: 10px; margin-top: 10px;">
                <strong>⚠️ This is a 2-DAY PACKAGE reservation</strong>
              </div>
            ` : ''}
            <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">
              Please review and process this reservation in the admin panel.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    throw error;
  }
};

module.exports = {
  sendReservationConfirmation,
  sendAdminNotification,
};