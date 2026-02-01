// src/controllers/enrollmentApplicationController.js
const pool = require("../config/database");

// STUDENT: submit application
// POST /api/student/applications
// body: { course_id }
exports.submitApplication = async (req, res) => {
  try {
    const studentId = req.session.user_id;
    const { course_id } = req.body;

    if (!course_id) {
      return res
        .status(400)
        .json({ status: "error", message: "course_id is required" });
    }

    // prevent duplicates (pending/approved/waiting)
    const [existing] = await pool.execute(
      `SELECT application_id, application_status
       FROM enrollment_applications
       WHERE student_id = ? AND course_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [studentId, course_id],
    );

    if (
      existing.length > 0 &&
      ["PENDING", "APPROVED", "WAITING_FOR_SLOT"].includes(
        existing[0].application_status,
      )
    ) {
      return res.status(400).json({
        status: "error",
        message: `You already have an application for this course (status: ${existing[0].application_status}).`,
      });
    }

    await pool.execute(
      `INSERT INTO enrollment_applications (student_id, course_id, application_status)
       VALUES (?, ?, 'PENDING')`,
      [studentId, course_id],
    );

    res
      .status(201)
      .json({ status: "success", message: "Application submitted (PENDING)" });
  } catch (err) {
    console.error("submitApplication error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to submit application" });
  }
};

// STUDENT: view my applications
// GET /api/student/applications
exports.getMyApplications = async (req, res) => {
  try {
    const studentId = req.session.user_id;

    const [rows] = await pool.execute(
      `SELECT 
        a.application_id,
        a.course_id,
        c.course_name,
        c.course_type AS division,
        a.application_status,
        a.admin_notes,
        a.created_at
      FROM enrollment_applications a
      JOIN courses c ON c.course_id = a.course_id
      WHERE a.student_id = ?
      ORDER BY a.created_at DESC`,
      [studentId],
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getMyApplications error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch applications" });
  }
};

// ADMIN: list applications (filter by status optional)
// GET /api/admin/applications?status=PENDING
exports.listApplicationsAdmin = async (req, res) => {
  try {
    const { status } = req.query;

    let sql = `
      SELECT 
        a.application_id,
        a.student_id,
        u.fullname,
        u.username,
        a.course_id,
        c.course_name,
        c.course_type AS division,
        a.application_status,
        a.admin_notes,
        a.created_at
      FROM enrollment_applications a
      JOIN users u ON u.id = a.student_id
      JOIN courses c ON c.course_id = a.course_id
    `;
    const params = [];

    if (status) {
      sql += ` WHERE a.application_status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY a.created_at DESC`;

    const [rows] = await pool.execute(sql, params);

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listApplicationsAdmin error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch applications" });
  }
};

// ADMIN: approve/reject application
// PUT /api/admin/applications/:applicationId
// body: { action: "APPROVE"|"REJECT", admin_notes? }
exports.updateApplicationStatusAdmin = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { action, admin_notes } = req.body;

    if (!action || !["APPROVE", "REJECT"].includes(action)) {
      return res
        .status(400)
        .json({ status: "error", message: "action must be APPROVE or REJECT" });
    }

    // Load course division so we can set TESDA rule
    const [rows] = await pool.execute(
      `SELECT a.course_id, c.course_type AS division, a.application_status
       FROM enrollment_applications a
       JOIN courses c ON c.course_id = a.course_id
       WHERE a.application_id = ?`,
      [applicationId],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Application not found" });
    }

    const division = (rows[0].division || "").toUpperCase();
    const current = rows[0].application_status;

    if (current !== "PENDING") {
      return res
        .status(400)
        .json({
          status: "error",
          message: `Only PENDING can be updated (current: ${current})`,
        });
    }

    let newStatus = "REJECTED";
    if (action === "APPROVE") {
      // TESDA → WAITING_FOR_SLOT after approval
      newStatus = division === "TESDA" ? "WAITING_FOR_SLOT" : "APPROVED";
    }

    await pool.execute(
      `UPDATE enrollment_applications
       SET application_status = ?, admin_notes = ?
       WHERE application_id = ?`,
      [newStatus, admin_notes ?? null, applicationId],
    );

    res.json({
      status: "success",
      message: `Application updated to ${newStatus}`,
    });
  } catch (err) {
    console.error("updateApplicationStatusAdmin error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update application" });
  }
};
