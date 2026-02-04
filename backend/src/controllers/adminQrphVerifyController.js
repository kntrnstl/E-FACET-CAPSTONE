const pool = require("../config/database");

// GET /api/admin/payments/qrph?status=FOR_VERIFICATION
async function listQrphPayments(req, res) {
  try {
    const status = String(
      req.query?.status || "FOR_VERIFICATION",
    ).toUpperCase();

    const allowed = new Set(["FOR_VERIFICATION", "PAID", "REJECTED"]);
    const st = allowed.has(status) ? status : "FOR_VERIFICATION";

    const [rows] = await pool.execute(
      `SELECT p.*, c.course_name
       FROM student_payment_submissions p
       JOIN courses c ON c.id = p.course_id
       WHERE p.status = ?
       ORDER BY p.created_at DESC`,
      [st],
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listQrphPayments error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to load payments" });
  }
}

// POST /api/admin/payments/qrph/:paymentRef/confirm
async function confirmQrphPayment(req, res) {
  const conn = await pool.getConnection();
  try {
    const adminId = Number(req.session?.user_id);
    if (!adminId) {
      conn.release();
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const paymentRef = String(req.params.paymentRef || "").trim();
    if (!paymentRef) {
      conn.release();
      return res
        .status(400)
        .json({ status: "error", message: "payment_ref is required" });
    }

    await conn.beginTransaction();

    const [payRows] = await conn.execute(
      `SELECT *
       FROM student_payment_submissions
       WHERE payment_ref = ?
       FOR UPDATE`,
      [paymentRef],
    );

    if (!payRows.length) {
      await conn.rollback();
      conn.release();
      return res
        .status(404)
        .json({ status: "error", message: "Payment not found" });
    }

    const pay = payRows[0];

    if (String(pay.status) === "PAID") {
      await conn.commit();
      conn.release();
      return res.json({ status: "success", data: { already_paid: true } });
    }

    if (!pay.proof_url) {
      await conn.rollback();
      conn.release();
      return res
        .status(400)
        .json({ status: "error", message: "No proof uploaded yet" });
    }

    // ✅ Create reservation NOW (only after verification)
    // You may want to check slot availability here to avoid overbooking.
    // For now: simple insert.
    const [ins] = await conn.execute(
      `INSERT INTO schedule_reservations
        (schedule_id, student_id, course_id, reservation_source, reservation_status, payment_method, notes, created_by, created_at, updated_at, fee_option_code)
       VALUES
        (?, ?, ?, 'online', 'CONFIRMED', 'gcash_qrph', ?, ?, NOW(), NOW(), NULL)`,
      [
        pay.schedule_id,
        pay.student_id,
        pay.course_id,
        pay.notes || null,
        adminId,
      ],
    );

    const reservationId = ins.insertId;

    await conn.execute(
      `UPDATE student_payment_submissions
       SET status='PAID', verified_by=?, verified_at=NOW(), updated_at=NOW()
       WHERE payment_ref=?`,
      [adminId, paymentRef],
    );

    await conn.commit();
    conn.release();

    return res.json({
      status: "success",
      data: { payment_ref: paymentRef, reservation_id: reservationId },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    conn.release();
    console.error("confirmQrphPayment error:", err);
    return res
      .status(500)
      .json({ status: "error", message: err.message || "Confirm failed" });
  }
}

// POST /api/admin/payments/qrph/:paymentRef/reject
async function rejectQrphPayment(req, res) {
  try {
    const adminId = Number(req.session?.user_id);
    if (!adminId)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const paymentRef = String(req.params.paymentRef || "").trim();
    const adminNote = req.body?.admin_note || null;

    await pool.execute(
      `UPDATE student_payment_submissions
       SET status='REJECTED', admin_note=?, verified_by=?, verified_at=NOW(), updated_at=NOW()
       WHERE payment_ref=? AND status <> 'PAID'`,
      [adminNote, adminId, paymentRef],
    );

    return res.json({ status: "success" });
  } catch (err) {
    console.error("rejectQrphPayment error:", err);
    return res.status(500).json({ status: "error", message: "Reject failed" });
  }
}

module.exports = {
  listQrphPayments,
  confirmQrphPayment,
  rejectQrphPayment,
};
