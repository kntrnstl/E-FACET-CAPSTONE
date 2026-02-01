// src/controllers/classAssignmentController.js
const pool = require("../config/database");

// ADMIN: assign a class to an application
// POST /api/admin/applications/:applicationId/assign-class
// body: { class_id }
exports.assignClassToApplication = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { applicationId } = req.params;
    const { class_id } = req.body;

    if (!class_id) {
      return res
        .status(400)
        .json({ status: "error", message: "class_id is required" });
    }

    await conn.beginTransaction();

    // 1) Load application
    const [appRows] = await conn.execute(
      `SELECT application_id, student_id, course_id, application_status, assigned_class_id
       FROM enrollment_applications
       WHERE application_id = ?
       FOR UPDATE`,
      [applicationId],
    );

    if (appRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Application not found" });
    }

    const app = appRows[0];

    if (!["APPROVED", "WAITING_FOR_SLOT"].includes(app.application_status)) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: `Application must be APPROVED or WAITING_FOR_SLOT (current: ${app.application_status})`,
      });
    }

    // 2) Check class exists and matches course
    const [classRows] = await conn.execute(
      `SELECT class_id, course_id
       FROM classes
       WHERE class_id = ?`,
      [class_id],
    );

    if (classRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Class not found" });
    }

    const cls = classRows[0];

    if (Number(cls.course_id) !== Number(app.course_id)) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "Selected class does not match the course of this application",
      });
    }

    // 3) Update application assignment
    await conn.execute(
      `UPDATE enrollment_applications
       SET assigned_class_id = ?, assigned_at = NOW(), assigned_by = ?
       WHERE application_id = ?`,
      [class_id, req.session.user_id, applicationId],
    );

    // 4) Upsert enrollment record (so student schedule works)
    // If enrollment already exists: update class_id + application_id
    const [enrollExisting] = await conn.execute(
      `SELECT enrollment_id FROM enrollments
       WHERE student_id = ? AND course_id = ?
       LIMIT 1
       FOR UPDATE`,
      [app.student_id, app.course_id],
    );

    if (enrollExisting.length > 0) {
      await conn.execute(
        `UPDATE enrollments
         SET class_id = ?, application_id = ?, enrollment_status = 'ACTIVE'
         WHERE enrollment_id = ?`,
        [class_id, app.application_id, enrollExisting[0].enrollment_id],
      );
    } else {
      await conn.execute(
        `INSERT INTO enrollments (application_id, student_id, course_id, class_id, enrollment_status)
         VALUES (?, ?, ?, ?, 'ACTIVE')`,
        [app.application_id, app.student_id, app.course_id, class_id],
      );
    }

    await conn.commit();

    res.json({
      status: "success",
      message: "Class assigned successfully",
      data: {
        application_id: Number(applicationId),
        class_id: Number(class_id),
        student_id: app.student_id,
        course_id: app.course_id,
      },
    });
  } catch (err) {
    await conn.rollback();
    console.error("assignClassToApplication error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to assign class" });
  } finally {
    conn.release();
  }
};
