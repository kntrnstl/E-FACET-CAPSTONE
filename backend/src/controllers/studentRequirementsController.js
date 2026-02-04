// src/controllers/studentRequirementsController.js
const pool = require("../config/database");

/**
 * POST /api/student/reservations/:reservationId/requirements
 * multipart/form-data:
 *  - requirement_ids (repeat per file OR array)
 *  - files (repeat per file) field name = "files"
 */
exports.uploadRequirements = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const userId = Number(req.session?.user_id);
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const reservationId = Number(req.params.reservationId);
    if (!Number.isFinite(reservationId) || reservationId < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid reservation id" });
    }

    const raw = req.body.requirement_ids;
    const requirementIds = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const files = req.files || [];

    if (!requirementIds.length) {
      return res
        .status(400)
        .json({ status: "error", message: "requirement_ids is required" });
    }

    if (!files.length) {
      return res
        .status(400)
        .json({ status: "error", message: "No files uploaded" });
    }

    if (files.length !== requirementIds.length) {
      return res.status(400).json({
        status: "error",
        message: "Files count must match requirement_ids count",
      });
    }

    await conn.beginTransaction();

    // ensure reservation belongs to this student
    const [own] = await conn.execute(
      `SELECT reservation_id
       FROM schedule_reservations
       WHERE reservation_id = ? AND student_id = ?
       LIMIT 1`,
      [reservationId, userId],
    );

    if (!own.length) {
      await conn.rollback();
      return res.status(403).json({ status: "error", message: "Not allowed" });
    }

    for (let i = 0; i < files.length; i++) {
      const rid = Number(requirementIds[i]);
      if (!Number.isFinite(rid) || rid < 1) {
        await conn.rollback();
        return res
          .status(400)
          .json({ status: "error", message: "Invalid requirement id" });
      }

      const f = files[i];
      const filePath = `/uploads/requirements/${f.filename}`;

      // overwrite same requirement for same reservation
      await conn.execute(
        `DELETE FROM requirement_submissions
         WHERE reservation_id = ? AND requirement_id = ?`,
        [reservationId, rid],
      );

      await conn.execute(
        `INSERT INTO requirement_submissions
          (reservation_id, requirement_id, file_path, created_at)
         VALUES (?, ?, ?, NOW())`,
        [reservationId, rid, filePath],
      );
    }

    await conn.execute(
      `UPDATE schedule_reservations
       SET requirements_mode = 'online', updated_at = NOW()
       WHERE reservation_id = ?`,
      [reservationId],
    );

    await conn.commit();
    return res.json({ status: "success", message: "Requirements uploaded" });
  } catch (err) {
    try {
      await conn.rollback();
    } catch {}
    console.error("uploadRequirements error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  } finally {
    conn.release();
  }
};

/**
 * GET /api/student/reservations/:reservationId/requirements
 */
exports.listReservationRequirements = async (req, res) => {
  try {
    const userId = Number(req.session?.user_id);
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const reservationId = Number(req.params.reservationId);
    if (!Number.isFinite(reservationId) || reservationId < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid reservation id" });
    }

    const [rows] = await pool.execute(
      `SELECT
         rs.submission_id,
         rs.requirement_id,
         rs.file_path,
         rs.created_at
       FROM requirement_submissions rs
       JOIN schedule_reservations sr ON sr.reservation_id = rs.reservation_id
       WHERE rs.reservation_id = ? AND sr.student_id = ?
       ORDER BY rs.created_at DESC`,
      [reservationId, userId],
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listReservationRequirements error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};
