// backend/src/controllers/adminTesdaAssignmentController.js
const pool = require("../config/database");

// ✅ palitan kung iba table name mo
const ASSIGN_TABLE = "tesda_course_assignments"; // <-- CHANGE THIS

// GET /api/admin/tesda/course-trainers
async function getCourseTrainers(req, res) {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        a.course_id,
        a.trainer_id,
        t.trainer_code,
        CONCAT(t.firstname, ' ', t.lastname) AS trainer_name
      FROM ${ASSIGN_TABLE} a
      LEFT JOIN trainers t
        ON t.trainer_id = a.trainer_id
      ORDER BY a.course_id ASC
      `
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getCourseTrainers error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load TESDA assignments",
      debug: {
        code: err.code,
        sqlMessage: err.sqlMessage,
        message: err.message,
      },
    });
  }
}

// POST /api/admin/tesda/course-trainers
// body: { course_id, trainer_id }
async function assignTrainerToCourse(req, res) {
  try {
    const course_id = Number(req.body.course_id);
    const trainer_id = Number(req.body.trainer_id);

    if (!course_id || !trainer_id) {
      return res.status(400).json({
        status: "error",
        message: "course_id and trainer_id are required",
      });
    }

    // ✅ dahil UNIQUE ang course_id, overwrite lang kapag may existing
    await pool.execute(
      `
      INSERT INTO ${ASSIGN_TABLE} (course_id, trainer_id)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE
        trainer_id = VALUES(trainer_id),
        updated_at = CURRENT_TIMESTAMP
      `,
      [course_id, trainer_id]
    );

    return res.json({ status: "success", message: "Trainer assigned to course" });
  } catch (err) {
    console.error("assignTrainerToCourse error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to assign trainer",
      debug: {
        code: err.code,
        sqlMessage: err.sqlMessage,
        message: err.message,
      },
    });
  }
}

// DELETE /api/admin/tesda/course-trainers/:courseId
async function removeTrainerFromCourse(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return res.status(400).json({ status: "error", message: "Invalid courseId" });
    }

    const [result] = await pool.execute(
      `DELETE FROM ${ASSIGN_TABLE} WHERE course_id = ?`,
      [courseId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "No assignment found for this course" });
    }

    return res.json({ status: "success", message: "Assignment removed" });
  } catch (err) {
    console.error("removeTrainerFromCourse error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to remove assignment",
      debug: {
        code: err.code,
        sqlMessage: err.sqlMessage,
        message: err.message,
      },
    });
  }
}

module.exports = {
  getCourseTrainers,
  assignTrainerToCourse,
  removeTrainerFromCourse,
};
