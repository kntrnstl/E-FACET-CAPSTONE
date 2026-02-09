// backend/src/controllers/trainerTesdaController.js
const pool = require("../config/database");

// ✅ palitan kung iba table names mo
const ASSIGN_TABLE = "tesda_course_trainers"; // course_id, trainer_id
const COURSES_TABLE = "tesda_courses"; // id, course_name, course_code, description, duration, requirements, status

async function getMyTesdaCourses(req, res) {
  try {
    // ✅ depende sa auth middleware mo:
    // minsan req.user.user_id, minsan req.user.trainer_id
    // You said trainers table has user_id, so we will find trainer_id via user_id.
    const userId = req.user?.user_id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    // get trainer_id by user_id
    const [trows] = await pool.execute(
      `SELECT trainer_id FROM trainers WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    if (!trows.length) {
      return res.status(404).json({ status: "error", message: "Trainer profile not found" });
    }

    const trainerId = trows[0].trainer_id;

    // fetch assigned courses
    const [rows] = await pool.execute(
      `
      SELECT
        c.id AS course_id,
        c.course_name,
        c.course_code,
        c.description,
        c.duration,
        c.requirements,
        c.status
      FROM ${ASSIGN_TABLE} a
      INNER JOIN ${COURSES_TABLE} c
        ON c.id = a.course_id
      WHERE a.trainer_id = ?
      ORDER BY c.course_name ASC
      `,
      [trainerId]
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getMyTesdaCourses error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load assigned TESDA courses",
      debug: { code: err.code, sqlMessage: err.sqlMessage, message: err.message },
    });
  }
}

module.exports = { getMyTesdaCourses };
