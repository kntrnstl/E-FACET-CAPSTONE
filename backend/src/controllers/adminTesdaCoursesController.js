const pool = require("../config/database");

// helpers
function parseRequirements(reqValue) {
  if (Array.isArray(reqValue)) return reqValue;
  if (typeof reqValue === "string") {
    const s = reqValue.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      // if plain text
      return [s];
    }
  }
  return [];
}

// =========================
// GET TESDA COURSES
// GET /api/admin/tesda/courses
// =========================
async function getTesdaCourses(req, res) {
  try {
    // adjust table name if different
    const [rows] = await pool.execute(
      `SELECT 
        id, course_code, course_name, description, duration, requirements, status, created_at
       FROM tesda_courses
       ORDER BY id DESC`
    );

    const data = rows.map((r) => ({
      ...r,
      requirements: parseRequirements(r.requirements),
    }));

    return res.json({ status: "success", data });
  } catch (err) {
    console.error("getTesdaCourses error:", err);
    return res.status(500).json({ status: "error", message: "Failed to load TESDA courses" });
  }
}

// =========================
// CREATE TESDA COURSE
// POST /api/admin/tesda/courses
// body: {course_code, course_name, description, duration, requirements, status}
// =========================
async function createTesdaCourse(req, res) {
  try {
    const { course_code, course_name, description, duration, requirements, status } = req.body;

    if (!course_code || !course_name || !duration) {
      return res.status(400).json({
        status: "error",
        message: "course_code, course_name, and duration are required",
      });
    }

    const reqArr = parseRequirements(requirements);
    const reqJson = JSON.stringify(reqArr);

    const [result] = await pool.execute(
      `INSERT INTO tesda_courses (course_code, course_name, description, duration, requirements, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        String(course_code).trim(),
        String(course_name).trim(),
        description ? String(description).trim() : "",
        String(duration).trim(),
        reqJson,
        status ? String(status).trim() : "active",
      ]
    );

    return res.status(201).json({
      status: "success",
      message: "TESDA course created",
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error("createTesdaCourse error:", err);
    return res.status(500).json({ status: "error", message: "Failed to create TESDA course" });
  }
}

// =========================
// UPDATE TESDA COURSE
// PUT /api/admin/tesda/courses/:id
// =========================
async function updateTesdaCourse(req, res) {
  try {
    const { id } = req.params;
    const { course_code, course_name, description, duration, requirements, status } = req.body;

    if (!id) return res.status(400).json({ status: "error", message: "Missing id" });

    const reqArr = parseRequirements(requirements);
    const reqJson = JSON.stringify(reqArr);

    const [result] = await pool.execute(
      `UPDATE tesda_courses
       SET course_code = ?, course_name = ?, description = ?, duration = ?, requirements = ?, status = ?
       WHERE id = ?`,
      [
        String(course_code || "").trim(),
        String(course_name || "").trim(),
        description ? String(description).trim() : "",
        String(duration || "").trim(),
        reqJson,
        status ? String(status).trim() : "active",
        Number(id),
      ]
    );

    return res.json({
      status: "success",
      message: result.affectedRows ? "TESDA course updated" : "No changes",
    });
  } catch (err) {
    console.error("updateTesdaCourse error:", err);
    return res.status(500).json({ status: "error", message: "Failed to update TESDA course" });
  }
}

// =========================
// DELETE TESDA COURSE
// DELETE /api/admin/tesda/courses/:id
// =========================
async function deleteTesdaCourse(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ status: "error", message: "Missing id" });

    const [result] = await pool.execute(`DELETE FROM tesda_courses WHERE id = ?`, [Number(id)]);

    return res.json({
      status: "success",
      message: result.affectedRows ? "TESDA course deleted" : "Course not found",
    });
  } catch (err) {
    console.error("deleteTesdaCourse error:", err);
    return res.status(500).json({ status: "error", message: "Failed to delete TESDA course" });
  }
}

module.exports = {
  getTesdaCourses,
  createTesdaCourse,
  updateTesdaCourse,
  deleteTesdaCourse,
};
