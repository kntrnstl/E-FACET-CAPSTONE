// src/controllers/studentMyScheduleController.js
const pool = require("../config/database");

exports.getMySchedule = async (req, res) => {
  try {
    const userId = Number(req.session?.user_id);
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const studentId = userId;

    const [rows] = await pool.execute(
      `
      SELECT
        sr.reservation_id AS id,
        sr.schedule_id,
        sr.course_id,
        sr.student_id,
        sr.reservation_status AS status,
        sr.payment_method,
        sr.created_at,
        sr.updated_at,

        DATE_FORMAT(sc.schedule_date, '%Y-%m-%d') AS date,
        CONCAT(
          TIME_FORMAT(sc.start_time, '%H:%i'),
          ' - ',
          TIME_FORMAT(sc.end_time, '%H:%i')
        ) AS time,

        c.course_name AS course,
        c.course_code AS course_code,

        COALESCE(i.fullname, CONCAT(i.firstname, ' ', i.lastname)) AS instructor

      FROM schedule_reservations sr
      JOIN schedules sc ON sc.schedule_id = sr.schedule_id
      JOIN courses c ON c.id = sr.course_id
      LEFT JOIN instructors i ON i.instructor_id = sc.instructor_id

      WHERE sr.student_id = ?
      ORDER BY sc.schedule_date ASC, sc.start_time ASC
      `,
      [studentId],
    );

    return res.json({ status: "success", schedules: rows });
  } catch (err) {
    console.error("getMySchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};
