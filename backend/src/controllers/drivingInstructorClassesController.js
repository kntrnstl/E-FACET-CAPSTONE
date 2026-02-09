const pool = require("../config/database");

exports.getDrivingInstructorClasses = async (req, res) => {
  try {
    // 1) Find instructor_id using session user_id
    const userId = req.session.user_id;
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Not logged in" });
    }

    const [insRows] = await pool.execute(
      "SELECT instructor_id, fullname FROM instructors WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!insRows.length) {
      return res.status(404).json({
        status: "error",
        message: "Instructor profile not found for this user_id",
      });
    }

    const instructorId = insRows[0].instructor_id;

    // 2) Get classes assigned to this instructor
    // ✅ I-ADJUST mo table name/columns based sa system mo.
    // Example: driving_classes table has: class_id, course_id, instructor_id, class_date, start_time, end_time, room, status, student_count
    const [rows] = await pool.execute(
      `SELECT 
          dc.class_id,
          dc.course_id,
          c.course_name,
          c.course_code,
          dc.section,
          dc.room,
          dc.class_date,
          dc.start_time,
          dc.end_time,
          dc.status,
          dc.student_count
        FROM driving_classes dc
        JOIN courses c ON c.id = dc.course_id
        WHERE dc.instructor_id = ?
        ORDER BY dc.class_date ASC, dc.start_time ASC`,
      [instructorId]
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getDrivingInstructorClasses error:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
