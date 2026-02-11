// backend/src/controllers/tesdaCourseController.js
const pool = require("../config/database");

// =========================
// Helpers
// =========================
function parseRequirements(reqValue) {
  if (Array.isArray(reqValue)) return reqValue;

  if (typeof reqValue === "string") {
    const s = reqValue.trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      return Array.isArray(parsed) ? parsed : [String(parsed)];
    } catch {
      // plain text fallback
      return [s];
    }
  }

  return [];
}

function safeStr(v) {
  return String(v ?? "").trim();
}

function safeId(id) {
  const n = Number(id);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeStatus(status, fallback = "active") {
  const s = safeStr(status).toLowerCase();
  // adjust list if your system uses different statuses
  const allowed = new Set(["active", "inactive"]);
  return allowed.has(s) ? s : fallback;
}

// =========================
// (PUBLIC/STUDENT) GET TESDA COURSES
// GET /api/tesda/courses
// - returns only active courses
// =========================
async function getTesdaCoursesPublic(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id,
        course_code,
        course_name,
        description,
        duration,
        requirements,
        status,
        created_at
       FROM tesda_courses
       WHERE status = 'active'
       ORDER BY id DESC`,
    );

    const data = rows.map((r) => ({
      ...r,
      requirements: parseRequirements(r.requirements),
    }));

    return res.json({ status: "success", data });
  } catch (err) {
    console.error("getTesdaCoursesPublic error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to load TESDA courses" });
  }
}

// =========================
// (ADMIN) GET TESDA COURSES
// GET /api/admin/tesda/courses
// - returns all courses
// =========================
async function getTesdaCourses(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT
        id,
        course_code,
        course_name,
        description,
        duration,
        requirements,
        status,
        created_at
       FROM tesda_courses
       ORDER BY id DESC`,
    );

    const data = rows.map((r) => ({
      ...r,
      requirements: parseRequirements(r.requirements),
    }));

    return res.json({ status: "success", data });
  } catch (err) {
    console.error("getTesdaCourses error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to load TESDA courses" });
  }
}

// =========================
// (ADMIN) CREATE TESDA COURSE
// POST /api/admin/tesda/courses
// body: {course_code, course_name, description, duration, requirements, status}
// =========================
async function createTesdaCourse(req, res) {
  try {
    const {
      course_code,
      course_name,
      description,
      duration,
      requirements,
      status,
    } = req.body;

    if (!course_code || !course_name || !duration) {
      return res.status(400).json({
        status: "error",
        message: "course_code, course_name, and duration are required",
      });
    }

    const reqArr = parseRequirements(requirements);
    const reqJson = JSON.stringify(reqArr);

    const [result] = await pool.execute(
      `INSERT INTO tesda_courses
        (course_code, course_name, description, duration, requirements, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        safeStr(course_code),
        safeStr(course_name),
        safeStr(description),
        safeStr(duration),
        reqJson,
        normalizeStatus(status, "active"),
      ],
    );

    return res.status(201).json({
      status: "success",
      message: "TESDA course created",
      data: { id: result.insertId },
    });
  } catch (err) {
    console.error("createTesdaCourse error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to create TESDA course" });
  }
}

// =========================
// (ADMIN) UPDATE TESDA COURSE
// PUT /api/admin/tesda/courses/:id
// =========================
async function updateTesdaCourse(req, res) {
  try {
    const id = safeId(req.params.id);
    if (!id)
      return res.status(400).json({ status: "error", message: "Invalid id" });

    const {
      course_code,
      course_name,
      description,
      duration,
      requirements,
      status,
    } = req.body;

    // You can enforce required fields here if you want
    const reqArr = parseRequirements(requirements);
    const reqJson = JSON.stringify(reqArr);

    const [result] = await pool.execute(
      `UPDATE tesda_courses
       SET course_code = ?,
           course_name = ?,
           description = ?,
           duration = ?,
           requirements = ?,
           status = ?
       WHERE id = ?`,
      [
        safeStr(course_code),
        safeStr(course_name),
        safeStr(description),
        safeStr(duration),
        reqJson,
        normalizeStatus(status, "active"),
        id,
      ],
    );

    return res.json({
      status: "success",
      message: result.affectedRows
        ? "TESDA course updated"
        : "Course not found / no changes",
    });
  } catch (err) {
    console.error("updateTesdaCourse error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to update TESDA course" });
  }
}

// =========================
// (ADMIN) DELETE TESDA COURSE
// DELETE /api/admin/tesda/courses/:id
// =========================
async function deleteTesdaCourse(req, res) {
  try {
    const id = safeId(req.params.id);
    if (!id)
      return res.status(400).json({ status: "error", message: "Invalid id" });

    const [result] = await pool.execute(
      `DELETE FROM tesda_courses WHERE id = ?`,
      [id],
    );

    return res.json({
      status: "success",
      message: result.affectedRows
        ? "TESDA course deleted"
        : "Course not found",
    });
  } catch (err) {
    console.error("deleteTesdaCourse error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to delete TESDA course" });
  }
}

module.exports = {
  // Public/student
  getTesdaCoursesPublic,

  // Admin
  getTesdaCourses,
  createTesdaCourse,
  updateTesdaCourse,
  deleteTesdaCourse,
};
