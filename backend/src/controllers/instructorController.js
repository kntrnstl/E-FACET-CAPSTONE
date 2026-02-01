const pool = require("../config/database");

// GET /api/admin/instructors
exports.getInstructors = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
        instructor_id,
        instructor_code,
        firstname,
        lastname,
        fullname,
        email,
        contact_number,
        specialization,
        status,
        created_at,
        updated_at
      FROM instructors
      ORDER BY instructor_id DESC`,
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("[BACKEND] getInstructors error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch instructors" });
  }
};

// POST /api/admin/instructors
exports.createInstructor = async (req, res) => {
  try {
    const {
      instructor_code,
      firstname,
      lastname,
      email,
      contact_number,
      specialization,
      status,
    } = req.body;

    if (!instructor_code || !firstname || !lastname) {
      return res.status(400).json({
        status: "error",
        message: "instructor_code, firstname, and lastname are required",
      });
    }

    // ✅ DO NOT INSERT fullname (generated column)
    await pool.execute(
      `INSERT INTO instructors
        (instructor_code, firstname, lastname, email, contact_number, specialization, status)
       VALUES (?,?,?,?,?,?,?)`,
      [
        String(instructor_code).trim(),
        String(firstname).trim(),
        String(lastname).trim(),
        email ? String(email).trim() : null,
        contact_number ? String(contact_number).trim() : null,
        specialization ? String(specialization).trim() : null,
        status || "active",
      ],
    );

    return res
      .status(201)
      .json({ status: "success", message: "Instructor created" });
  } catch (err) {
    console.error("[BACKEND] createInstructor error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ status: "error", message: "Instructor code already exists" });
    }

    return res
      .status(500)
      .json({ status: "error", message: "Failed to create instructor" });
  }
};

// PUT /api/admin/instructors/:id
exports.updateInstructor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid instructor id" });
    }

    const {
      instructor_code,
      firstname,
      lastname,
      email,
      contact_number,
      specialization,
      status,
    } = req.body;

    if (!instructor_code || !firstname || !lastname) {
      return res.status(400).json({
        status: "error",
        message: "instructor_code, firstname, and lastname are required",
      });
    }

    // ✅ DO NOT UPDATE fullname (generated column)
    const [result] = await pool.execute(
      `UPDATE instructors
       SET instructor_code = ?,
           firstname = ?,
           lastname = ?,
           email = ?,
           contact_number = ?,
           specialization = ?,
           status = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE instructor_id = ?`,
      [
        String(instructor_code).trim(),
        String(firstname).trim(),
        String(lastname).trim(),
        email ? String(email).trim() : null,
        contact_number ? String(contact_number).trim() : null,
        specialization ? String(specialization).trim() : null,
        status || "active",
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Instructor not found" });
    }

    return res.json({ status: "success", message: "Instructor updated" });
  } catch (err) {
    console.error("[BACKEND] updateInstructor error:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ status: "error", message: "Instructor code already exists" });
    }

    return res
      .status(500)
      .json({ status: "error", message: "Failed to update instructor" });
  }
};

// DELETE /api/admin/instructors/:id
exports.deleteInstructor = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid instructor id" });
    }

    const [result] = await pool.execute(
      `DELETE FROM instructors WHERE instructor_id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Instructor not found" });
    }

    return res.json({ status: "success", message: "Instructor deleted" });
  } catch (err) {
    console.error("[BACKEND] deleteInstructor error:", err);

    if (err.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        status: "error",
        message: "Cannot delete instructor: used in schedules",
      });
    }

    return res
      .status(500)
      .json({ status: "error", message: "Failed to delete instructor" });
  }
};
