// src/controllers/classController.js
const pool = require("../config/database");

// GET /api/admin/classes?course_id=#
exports.getClasses = async (req, res) => {
  try {
    const { course_id } = req.query;

    let sql = `
      SELECT class_id, course_id, instructor_id, start_date, end_date, batch_name
      FROM classes
    `;
    const params = [];

    if (course_id) {
      sql += ` WHERE course_id = ?`;
      params.push(Number(course_id));
    }

    sql += ` ORDER BY start_date DESC, class_id DESC`;

    const [rows] = await pool.execute(sql, params);
    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getClasses error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch classes" });
  }
};

// POST /api/admin/classes
exports.createClass = async (req, res) => {
  try {
    const { course_id, instructor_id, start_date, end_date, batch_name } =
      req.body;

    if (!course_id || !start_date || !end_date || !batch_name) {
      return res.status(400).json({
        status: "error",
        message: "course_id, start_date, end_date, batch_name are required",
      });
    }

    // Optional: validate dates
    if (new Date(end_date) < new Date(start_date)) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "end_date must be after start_date",
        });
    }

    const [result] = await pool.execute(
      `INSERT INTO classes (course_id, instructor_id, start_date, end_date, batch_name)
       VALUES (?, ?, ?, ?, ?)`,
      [
        Number(course_id),
        instructor_id ? Number(instructor_id) : null,
        start_date,
        end_date,
        String(batch_name).trim(),
      ],
    );

    res.status(201).json({
      status: "success",
      message: "Class created",
      data: { class_id: result.insertId },
    });
  } catch (err) {
    console.error("createClass error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to create class" });
  }
};

// PUT /api/admin/classes/:classId
exports.updateClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { course_id, instructor_id, start_date, end_date, batch_name } =
      req.body;

    if (!course_id || !start_date || !end_date || !batch_name) {
      return res.status(400).json({
        status: "error",
        message: "course_id, start_date, end_date, batch_name are required",
      });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "end_date must be after start_date",
        });
    }

    const [result] = await pool.execute(
      `UPDATE classes
       SET course_id=?, instructor_id=?, start_date=?, end_date=?, batch_name=?
       WHERE class_id=?`,
      [
        Number(course_id),
        instructor_id ? Number(instructor_id) : null,
        start_date,
        end_date,
        String(batch_name).trim(),
        Number(classId),
      ],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Class not found" });
    }

    res.json({ status: "success", message: "Class updated" });
  } catch (err) {
    console.error("updateClass error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update class" });
  }
};

// DELETE /api/admin/classes/:classId
exports.deleteClass = async (req, res) => {
  try {
    const { classId } = req.params;

    const [result] = await pool.execute(
      `DELETE FROM classes WHERE class_id=?`,
      [Number(classId)],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Class not found" });
    }

    res.json({ status: "success", message: "Class deleted" });
  } catch (err) {
    console.error("deleteClass error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to delete class" });
  }
};
