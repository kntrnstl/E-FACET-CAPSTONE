const pool = require("../config/database.js");

// helper: requirements -> array -> json string
function normalizeRequirements(reqValue) {
  if (Array.isArray(reqValue)) return reqValue;
  if (typeof reqValue === "string") {
    const s = reqValue.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      return [s];
    }
  }
  return [];
}

// --------------------
// TESDA COURSES CRUD
// --------------------
exports.getTesdaCourses = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, course_code, course_name, description, duration, requirements, course_fee, status,
              class_date, start_time, end_time, room, section, student_count,
              created_at, updated_at
       FROM tesda_courses
       ORDER BY id DESC`
    );
    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getTesdaCourses error:", err);
    res.status(500).json({ status: "error", message: "Failed to load TESDA courses" });
  }
};


exports.createTesdaCourse = async (req, res) => {
  try {
    const {
      course_code,
      course_name,
      description,
      duration,
      requirements,
      course_fee,
      status,

      // ✅ schedule fields (Option B)
      class_date,
      start_time,
      end_time,
      room,
      section,
      student_count,
    } = req.body;

    if (!course_code || !course_name) {
      return res
        .status(400)
        .json({ status: "error", message: "course_code and course_name are required" });
    }

    // ✅ optional validation
    if (start_time && end_time && String(start_time) >= String(end_time)) {
      return res
        .status(400)
        .json({ status: "error", message: "End time must be after start time" });
    }

    const reqJson = JSON.stringify(normalizeRequirements(requirements));

    await pool.execute(
      `INSERT INTO tesda_courses
   (course_code, course_name, description, duration, requirements, course_fee, status,
    class_date, start_time, end_time, room, section, student_count)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(course_code).trim(),
        String(course_name).trim(),
        description ? String(description).trim() : null,
        duration ? String(duration).trim() : null,
        reqJson,
        Number(course_fee || 0),
        status === "inactive" ? "inactive" : "active",

        // schedule fields
        class_date || null,
        start_time || null,
        end_time || null,
        room ? String(room).trim() : null,
        section ? String(section).trim() : null,
        Number(student_count || 0),
      ]
    );

    res.json({ status: "success", message: "TESDA course created" });
  } catch (err) {
    console.error("createTesdaCourse error:", err);
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ status: "error", message: "course_code already exists" });
    }
    res.status(500).json({ status: "error", message: "Failed to create TESDA course" });
  }
};

exports.updateTesdaCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: "error", message: "Invalid id" });

    const {
      course_code,
      course_name,
      description,
      duration,
      requirements,
      course_fee,
      status,

      // ✅ schedule fields (Option B)
      class_date,
      start_time,
      end_time,
      room,
      section,
      student_count,
    } = req.body;

    if (!course_code || !course_name) {
      return res
        .status(400)
        .json({ status: "error", message: "course_code and course_name are required" });
    }

    // ✅ optional validation
    if (start_time && end_time && String(start_time) >= String(end_time)) {
      return res
        .status(400)
        .json({ status: "error", message: "End time must be after start time" });
    }

    const reqJson = JSON.stringify(normalizeRequirements(requirements));

    await pool.execute(
      `UPDATE tesda_courses
       SET course_code=?,
           course_name=?,
           description=?,
           duration=?,
           requirements=?,
           course_fee=?,
           status=?,
           class_date=?,
           start_time=?,
           end_time=?,
           room=?,
           section=?,
           student_count=?
       WHERE id=?`,
      [
        String(course_code).trim(),
        String(course_name).trim(),
        description ? String(description).trim() : null,
        duration ? String(duration).trim() : null,
        reqJson,
        Number(course_fee || 0),
        status === "inactive" ? "inactive" : "active",

        // schedule fields
        class_date || null,
        start_time || null,
        end_time || null,
        room ? String(room).trim() : null,
        section ? String(section).trim() : null,
        Number(student_count || 0),

        id,
      ]
    );

    res.json({ status: "success", message: "TESDA course updated" });
  } catch (err) {
    console.error("updateTesdaCourse error:", err);
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ status: "error", message: "course_code already exists" });
    }
    res.status(500).json({ status: "error", message: "Failed to update TESDA course" });
  }
};

exports.deleteTesdaCourse = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ status: "error", message: "Invalid id" });

    const [r] = await pool.execute(`DELETE FROM tesda_courses WHERE id=?`, [id]);
    if (r.affectedRows === 0)
      return res.status(404).json({ status: "error", message: "Course not found" });

    res.json({ status: "success", message: "TESDA course deleted" });
  } catch (err) {
    console.error("deleteTesdaCourse error:", err);
    res.status(500).json({ status: "error", message: "Failed to delete TESDA course" });
  }
};

// --------------------
// TRAINERS for dropdown
// --------------------
exports.getTrainersForTesda = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT trainer_id, trainer_code,
              CONCAT(firstname,' ',lastname) AS fullname,
              specialization, status
       FROM trainers
       WHERE status='active'
       ORDER BY trainer_id DESC`
    );
    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getTrainersForTesda error:", err);
    res.status(500).json({ status: "error", message: "Failed to load trainers" });
  }
};

// --------------------
// TESDA ASSIGNMENTS
// --------------------
// GET /api/admin/tesda/course-trainers
exports.getTesdaAssignments = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT 
          a.course_id,
          a.trainer_id,
          t.trainer_code,
          CONCAT(t.firstname,' ',t.lastname) AS trainer_name
       FROM tesda_course_trainers a
       JOIN trainers t ON t.trainer_id = a.trainer_id
       ORDER BY a.id DESC`
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getTesdaAssignments error:", err);
    res.status(500).json({ status: "error", message: "Failed to load TESDA assignments" });
  }
};

// POST /api/admin/tesda/course-trainers  (overwrite behavior)
exports.upsertTesdaAssignment = async (req, res) => {
  try {
    const course_id = Number(req.body.course_id);
    const trainer_id = Number(req.body.trainer_id);

    if (!course_id || !trainer_id) {
      return res.status(400).json({ status: "error", message: "course_id and trainer_id are required" });
    }

    await pool.execute(
      `INSERT INTO tesda_course_trainers (course_id, trainer_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE trainer_id = VALUES(trainer_id), updated_at = CURRENT_TIMESTAMP`,
      [course_id, trainer_id]
    );

    res.json({ status: "success", message: "TESDA trainer assigned" });
  } catch (err) {
    console.error("upsertTesdaAssignment error:", err);
    res.status(500).json({ status: "error", message: "Failed to assign TESDA trainer" });
  }
};

