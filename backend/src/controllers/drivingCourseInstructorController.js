const pool = require("../config/database");

// ✅ GET /api/admin/driving/instructors
// Since instructor table is the actual instructors table,
// we list all active instructors (or filter by specialization if you want)
exports.listDrivingInstructors = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT instructor_id, instructor_code, firstname, lastname, fullname, specialization, status
      FROM instructor
      WHERE status = 'active'
      ORDER BY fullname ASC
      `
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listDrivingInstructors error:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ✅ GET /api/admin/driving/course-instructors
exports.listDrivingCourseAssignments = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT 
        dci.course_id,
        dci.instructor_id,
        i.fullname AS instructor_name,
        i.instructor_code
      FROM driving_course_instructors dci
      LEFT JOIN instructor i ON i.instructor_id = dci.instructor_id
      WHERE dci.status = 'active'
      `
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listDrivingCourseAssignments error:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

// ✅ POST /api/admin/driving/course-instructors
// body: { course_id, instructor_id }
exports.upsertDrivingCourseAssignment = async (req, res) => {
  try {
    const course_id = Number(req.body.course_id);
    const instructor_id = Number(req.body.instructor_id);

    if (!course_id || !instructor_id) {
      return res.status(400).json({
        status: "error",
        message: "course_id and instructor_id are required",
      });
    }

    // verify instructor exists + active
    const [ins] = await pool.execute(
      `SELECT instructor_id FROM instructor WHERE instructor_id=? AND status='active' LIMIT 1`,
      [instructor_id]
    );
    if (!ins.length) {
      return res.status(400).json({ status: "error", message: "Invalid instructor" });
    }

    // one instructor per course (upsert)
    await pool.execute(
      `
      INSERT INTO driving_course_instructors (course_id, instructor_id, status)
      VALUES (?, ?, 'active')
      ON DUPLICATE KEY UPDATE instructor_id = VALUES(instructor_id), status='active'
      `,
      [course_id, instructor_id]
    );

    return res.json({ status: "success", message: "Assigned instructor to driving course" });
  } catch (err) {
    console.error("upsertDrivingCourseAssignment error:", err);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
