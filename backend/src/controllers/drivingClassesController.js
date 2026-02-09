// backend/src/controllers/drivingClassesController.js
const pool = require("../config/database");

exports.getDrivingClasses = async (req, res) => {
  try {
    // ✅ depende sa session mo. common is user_id
    const userId = req.session.user_id;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    // ✅ convert user -> instructor_id (since schedules/assignment uses instructor_id)
    const [insRows] = await pool.execute(
      `SELECT instructor_id FROM instructors WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!insRows.length) {
      return res.status(404).json({
        status: "error",
        message: "Instructor profile not found for this user.",
      });
    }

    const instructorId = insRows[0].instructor_id;

    // ✅ IMPORTANT: filter by driving_course_instructors (admin assignment)
    const [rows] = await pool.execute(
      `
      SELECT
        s.schedule_id AS class_id,
        c.course_name AS course_name,
        s.schedule_date AS class_date,
        s.start_time AS start_time,
        s.end_time AS end_time,
        s.status AS raw_status,

        (
          SELECT COUNT(*)
          FROM schedule_reservations sr
          WHERE sr.schedule_id = s.schedule_id
            AND sr.reservation_status <> 'CANCELLED'
        ) AS student_count

      FROM schedules s
      JOIN courses c ON c.id = s.course_id
      JOIN driving_course_instructors dci
        ON dci.course_id = s.course_id
      WHERE dci.instructor_id = ?
      ORDER BY s.schedule_date ASC, s.start_time ASC
      `,
      [instructorId]
    );

    // Map status to your frontend expected values
    const mapped = rows.map((r) => ({
      class_id: r.class_id,
      course_name: r.course_name,
      class_date: r.class_date,
      start_time: r.start_time,
      end_time: r.end_time,
      status: r.raw_status === "open" ? "active" : "completed", // or keep open/closed if you want
      student_count: r.student_count || 0,
    }));

    return res.json({ status: "success", data: mapped });
  } catch (err) {
    console.error("getDrivingClasses error:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
