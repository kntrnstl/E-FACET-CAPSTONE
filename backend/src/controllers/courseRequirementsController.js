// src/controllers/courseRequirementsController.js
const pool = require("../config/database");

// GET /api/admin/courses/:courseId/requirements
exports.getRequirementsByCourseAdmin = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [rows] = await pool.execute(
      `SELECT requirement_id, course_id, requirement_text, is_required, sort_order, is_active
       FROM course_requirements
       WHERE course_id = ?
       ORDER BY sort_order ASC, requirement_id ASC`,
      [courseId],
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getRequirementsByCourseAdmin error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch requirements" });
  }
};

// GET /api/student/courses/:courseId/requirements
// student should only see active requirements
exports.getRequirementsByCourseStudent = async (req, res) => {
  try {
    const { courseId } = req.params;

    const [rows] = await pool.execute(
      `SELECT requirement_id, course_id, requirement_text, is_required, sort_order
       FROM course_requirements
       WHERE course_id = ? AND is_active = 1
       ORDER BY sort_order ASC, requirement_id ASC`,
      [courseId],
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getRequirementsByCourseStudent error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch requirements" });
  }
};

// POST /api/admin/courses/:courseId/requirements
// body: { requirement_text, is_required?, sort_order? }
exports.addRequirement = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { requirement_text, is_required, sort_order } = req.body;

    if (!requirement_text || !String(requirement_text).trim()) {
      return res
        .status(400)
        .json({ status: "error", message: "requirement_text is required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO course_requirements (course_id, requirement_text, is_required, sort_order, is_active)
       VALUES (?, ?, ?, ?, 1)`,
      [
        courseId,
        String(requirement_text).trim(),
        is_required === undefined ? 1 : is_required ? 1 : 0,
        Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
      ],
    );

    res.status(201).json({
      status: "success",
      message: "Requirement added",
      requirement_id: result.insertId,
    });
  } catch (err) {
    console.error("addRequirement error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to add requirement" });
  }
};

// PUT /api/admin/requirements/:requirementId
// body can include: requirement_text, is_required, sort_order, is_active
exports.updateRequirement = async (req, res) => {
  try {
    const { requirementId } = req.params;
    const { requirement_text, is_required, sort_order, is_active } = req.body;

    // Build dynamic update safely
    const fields = [];
    const values = [];

    if (requirement_text !== undefined) {
      const text = String(requirement_text).trim();
      if (!text)
        return res
          .status(400)
          .json({
            status: "error",
            message: "requirement_text cannot be empty",
          });
      fields.push("requirement_text = ?");
      values.push(text);
    }

    if (is_required !== undefined) {
      fields.push("is_required = ?");
      values.push(is_required ? 1 : 0);
    }

    if (sort_order !== undefined) {
      fields.push("sort_order = ?");
      values.push(Number(sort_order) || 0);
    }

    if (is_active !== undefined) {
      fields.push("is_active = ?");
      values.push(is_active ? 1 : 0);
    }

    if (fields.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "No fields to update" });
    }

    values.push(requirementId);

    const [result] = await pool.execute(
      `UPDATE course_requirements
       SET ${fields.join(", ")}
       WHERE requirement_id = ?`,
      values,
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Requirement not found" });
    }

    res.json({ status: "success", message: "Requirement updated" });
  } catch (err) {
    console.error("updateRequirement error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update requirement" });
  }
};

// DELETE /api/admin/requirements/:requirementId
exports.deleteRequirement = async (req, res) => {
  try {
    const { requirementId } = req.params;

    const [result] = await pool.execute(
      `DELETE FROM course_requirements WHERE requirement_id = ?`,
      [requirementId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Requirement not found" });
    }

    res.json({ status: "success", message: "Requirement deleted" });
  } catch (err) {
    console.error("deleteRequirement error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to delete requirement" });
  }
};


module.exports = {
  getRequirementsByCourseAdmin: exports.getRequirementsByCourseAdmin,
  getRequirementsByCourseStudent: exports.getRequirementsByCourseStudent,
  addRequirement: exports.addRequirement,
  updateRequirement: exports.updateRequirement,
  deleteRequirement: exports.deleteRequirement,
};