// src/controllers/adminStudentsController.js
const pool = require("../config/database");

// ✅ EDIT THIS IF NEEDED (depende sa schema mo)
const SR_STUDENT_COL = "student_id"; // change to "user_id" if yan ang column mo sa schedule_reservations
const SR_STATUS_COL = "reservation_status"; // change if ibang name (rare)
const SR_CREATED_COL = "created_at"; // change if wala (e.g., "createdAt")

exports.listDrivingStudentsConfirmed = async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    // optional, pero focus tayo sa Driving
    const courseKeyword = String(req.query.course || "Driving").trim();

    // search pattern
    const likeQ = `%${q}%`;
    const likeCourse = `%${courseKeyword}%`;

    // ✅ dynamic identifiers (safe: only allow these exact strings)
    const allowedStudentCols = new Set(["student_id", "user_id"]);
    const allowedStatusCols = new Set(["reservation_status", "status"]);
    const allowedCreatedCols = new Set(["created_at", "createdAt", "createdon", "createdOn"]);

    const studentCol = allowedStudentCols.has(SR_STUDENT_COL) ? SR_STUDENT_COL : "student_id";
    const statusCol = allowedStatusCols.has(SR_STATUS_COL) ? SR_STATUS_COL : "reservation_status";
    const createdCol = allowedCreatedCols.has(SR_CREATED_COL) ? SR_CREATED_COL : "created_at";

    const sql = `
      SELECT
        u.id AS id,
        u.fullname AS name,
        u.email AS email,
        c.course_name AS course,
        MAX(sr.${createdCol}) AS enrollmentDate
      FROM schedule_reservations sr
      JOIN users u
        ON u.id = sr.${studentCol}
      JOIN courses c
        ON c.id = sr.course_id
      WHERE UPPER(sr.${statusCol}) = 'CONFIRMED'
        AND c.course_name LIKE ?
        AND u.role = 'user'
        AND (
          ? = '' OR
          u.fullname LIKE ? OR
          u.username LIKE ? OR
          u.email LIKE ?
        )
      GROUP BY u.id, u.fullname, u.email, c.course_name
      ORDER BY enrollmentDate DESC
    `;

    const [rows] = await pool.execute(sql, [
      likeCourse,
      q, likeQ, likeQ, likeQ
    ]);

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listDrivingStudentsConfirmed error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch driving students",
      debug: {
        code: err.code,
        errno: err.errno,
        sqlMessage: err.sqlMessage,
        message: err.message,
      },
    });
  }
};