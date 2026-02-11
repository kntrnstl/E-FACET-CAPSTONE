const pool = require("../config/database");

// helper
function parseRequirements(reqValue) {
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

// ✅ GET ACTIVE COURSES (for student)
async function getActiveCourses(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT 
        id, course_code, course_name, description, duration, requirements, status, created_at
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
    console.error("getActiveCourses error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load TESDA courses",
    });
  }
}

module.exports = { getActiveCourses };
