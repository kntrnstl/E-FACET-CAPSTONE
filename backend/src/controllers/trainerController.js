const pool = require("../config/database"); // adjust kung iba path

// helper: get logged-in user's id from session/auth
function getLoggedInUserId(req) {
  // support both patterns: req.user (if middleware sets it) or req.session.user
  const u = req.user || req.session?.user;

  // common variants: u.id, u.user_id, u.account_id etc.
  return u?.user_id ?? u?.id ?? null;
}

// helper: lookup trainer_id using user_id (since your trainers table has user_id)
async function getTrainerIdByUserId(userId) {
  // ⚠️ PALITAN kung iba table name mo:
  // possible names: trainers, tesda_trainers
  const TABLE = "trainers";

  const [rows] = await pool.execute(
    `SELECT trainer_id FROM ${TABLE} WHERE user_id = ? LIMIT 1`,
    [userId]
  );

  return rows.length ? rows[0].trainer_id : null;
}

// ✅ GET /api/trainer/tesda/courses
const getMyTesdaCourses = async (req, res) => {
  try {
    const userId = getLoggedInUserId(req);
    if (!userId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: user id not found in session",
      });
    }

    const trainerId = await getTrainerIdByUserId(userId);
    if (!trainerId) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized: trainer id not found (no trainer record for this user)",
      });
    }

   const ASSIGN_TABLE = "tesda_course_assignments";


    const [rows] = await pool.execute(
      `
      SELECT
        c.id,
        c.course_code,
        c.course_name,
        c.description,
        c.duration,
        c.requirements,
        c.status
      FROM tesda_courses c
      INNER JOIN ${ASSIGN_TABLE} a
        ON a.course_id = c.id
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
      message: "Failed to load trainer TESDA courses",
      debug: {
        code: err.code,
        sqlMessage: err.sqlMessage,
        message: err.message,
      },
    });
  }
};

// --------------------
// STUBS (para di mag-crash kung may routes pa)
// --------------------
const createTrainer = async (req, res) => {
  return res.status(501).json({
    status: "error",
    message: "createTrainer not implemented yet",
  });
};

const updateTrainer = async (req, res) => {
  return res.status(501).json({
    status: "error",
    message: "updateTrainer not implemented yet",
  });
};

const deleteTrainer = async (req, res) => {
  return res.status(501).json({
    status: "error",
    message: "deleteTrainer not implemented yet",
  });
};

module.exports = {
  getMyTesdaCourses,
  createTrainer,
  updateTrainer,
  deleteTrainer,
};
