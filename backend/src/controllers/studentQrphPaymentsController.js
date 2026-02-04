// backend/src/controllers/studentQrphPaymentsController.js
const pool = require("../config/database");
const crypto = require("crypto");

function toCentavos(amountPhp) {
  const n = Number(amountPhp);
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

// 1) Create payment ref (no reservation yet)
async function createQrphPayment(req, res) {
  try {
    const userId = Number(req.session?.user_id);
    if (!userId)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const scheduleId = Number(req.body?.schedule_id);
    const courseId = Number(req.body?.course_id);
    const notes = req.body?.notes || null;

    if (!Number.isFinite(scheduleId) || scheduleId < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule_id" });
    }
    if (!Number.isFinite(courseId) || courseId < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid course_id" });
    }

    // ✅ verify course + fee (source of truth)
    const [courseRows] = await pool.execute(
      `SELECT id, course_fee FROM courses WHERE id = ? AND status='active' LIMIT 1`,
      [courseId],
    );
    if (!courseRows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }

    const amountCentavos = toCentavos(courseRows[0].course_fee);
    if (!Number.isFinite(amountCentavos) || amountCentavos <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid amount" });
    }

    // ✅ verify schedule exists (and matches course if your schedules has course_id)
    const [schedRows] = await pool.execute(
      `SELECT schedule_id, course_id FROM schedules WHERE schedule_id = ? LIMIT 1`,
      [scheduleId],
    );
    if (!schedRows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    }
    if (Number(schedRows[0].course_id) !== courseId) {
      return res
        .status(400)
        .json({ status: "error", message: "Schedule does not match course" });
    }

    const paymentRef = `QRPH-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    await pool.execute(
      `INSERT INTO student_payment_submissions
        (payment_ref, student_id, course_id, schedule_id,
         amount_centavos, currency, payment_method, status, proof_url, notes, created_at, updated_at)
       VALUES
        (?, ?, ?, ?,
         ?, 'PHP', 'gcash_qrph', 'FOR_VERIFICATION', NULL, ?, NOW(), NOW())`,
      [paymentRef, userId, courseId, scheduleId, amountCentavos, notes],
    );

    return res.json({
      status: "success",
      data: { payment_ref: paymentRef, status: "FOR_VERIFICATION" },
    });
  } catch (err) {
    console.error("createQrphPayment error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message || "Failed to create QRPH payment",
    });
  }
}

// 2) Upload proof -> then create reservation (pending)
async function uploadQrphProof(req, res) {
  const conn = await pool.getConnection();
  try {
    const userId = Number(req.session?.user_id);
    if (!userId) {
      conn.release();
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const paymentRef = String(req.params?.paymentRef || "").trim();
    if (!paymentRef) {
      conn.release();
      return res
        .status(400)
        .json({ status: "error", message: "Invalid payment_ref" });
    }
    if (!req.file) {
      conn.release();
      return res
        .status(400)
        .json({ status: "error", message: "No file uploaded" });
    }

    const proofUrl = `/uploads/${req.file.filename}`;

    await conn.beginTransaction();

    // get payment row (must belong to student)
    const [payRows] = await conn.execute(
      `SELECT id, payment_ref, student_id, course_id, schedule_id, status
       FROM student_payment_submissions
       WHERE payment_ref = ? AND student_id = ?
       LIMIT 1`,
      [paymentRef, userId],
    );
    if (!payRows.length) {
      await conn.rollback();
      conn.release();
      return res
        .status(404)
        .json({ status: "error", message: "Payment ref not found" });
    }

    const pay = payRows[0];

    // update proof_url
    await conn.execute(
      `UPDATE student_payment_submissions
       SET proof_url = ?, updated_at = NOW()
       WHERE payment_ref = ? AND student_id = ?`,
      [proofUrl, paymentRef, userId],
    );

    // ✅ NOW create reservation (pending) AFTER proof upload
    // Prevent duplicates for same student+schedule
    const [existRes] = await conn.execute(
      `SELECT reservation_id
       FROM schedule_reservations
       WHERE student_id = ? AND schedule_id = ?
       LIMIT 1`,
      [userId, pay.schedule_id],
    );

    let reservationId;
    if (existRes.length) {
      reservationId = existRes[0].reservation_id;
    } else {
      const [ins] = await conn.execute(
        `INSERT INTO schedule_reservations
          (schedule_id, student_id, course_id, reservation_source, reservation_status, payment_method, notes, created_by, created_at, updated_at, fee_option_code)
         VALUES
          (?, ?, ?, 'online', 'PENDING', 'gcash_qrph', ?, ?, NOW(), NOW(), NULL)`,
        [pay.schedule_id, userId, pay.course_id, null, userId],
      );
      reservationId = ins.insertId;
    }

    await conn.commit();
    conn.release();

    return res.json({
      status: "success",
      data: {
        payment_ref: paymentRef,
        proof_url: proofUrl,
        reservation_id: reservationId,
      },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    conn.release();
    console.error("uploadQrphProof error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message || "Failed to upload proof",
    });
  }
}

module.exports = { createQrphPayment, uploadQrphProof };
