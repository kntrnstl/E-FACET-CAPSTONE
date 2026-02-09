// backend/src/controllers/paymentController.js
const pool = require("../config/database");

// =============================================
// ADMIN: LIST PAYMENTS (QRPH submissions)
// GET /api/admin/payments
// Optional query: ?status=FOR_VERIFICATION
// =============================================
exports.listPayments = async (req, res) => {
  try {
    const status = String(req.query.status || "")
      .trim()
      .toUpperCase();

    // default: show pending/verifiable payments
    let whereSql = `WHERE sp.payment_method = 'GCASH'`;
    const params = [];

    if (status) {
      whereSql += ` AND sp.status = ?`;
      params.push(status);
    } else {
      whereSql += ` AND sp.status IN ('FOR_VERIFICATION','PROOF_SUBMITTED')`;
    }

    const [rows] = await pool.execute(
      `
      SELECT
        sp.id,
        sp.payment_ref,
        sp.student_id,
        u.fullname AS student_name,
        u.email,
        sp.course_id,
        c.course_name,
        sp.schedule_id,
        s.schedule_date,
        TIME_FORMAT(s.start_time,'%H:%i') AS startTime,
        TIME_FORMAT(s.end_time,'%H:%i') AS endTime,
        sp.amount_centavos,
        (sp.amount_centavos / 100) AS amount_php,
        sp.currency,
        sp.payment_method,
        sp.status,
        sp.proof_url,
        sp.notes,
        sp.created_at,
        sp.updated_at,

        -- If reservation exists for same student+schedule, show it
        r.reservation_id,
        r.reservation_status
      FROM student_payment_submissions sp
      LEFT JOIN users u ON u.id = sp.student_id
      LEFT JOIN courses c ON c.id = sp.course_id
      LEFT JOIN schedules s ON s.schedule_id = sp.schedule_id
      LEFT JOIN schedule_reservations r
        ON r.student_id = sp.student_id
       AND r.schedule_id = sp.schedule_id
       AND r.reservation_status IN ('PENDING','CONFIRMED','APPROVED','ACTIVE','DONE')
      ${whereSql}
      ORDER BY sp.created_at DESC
      `,
      params,
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listPayments error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message || "Failed to fetch payments",
    });
  }
};

// =============================================
// ADMIN: UPDATE PAYMENT STATUS
// PUT /api/admin/payments/:paymentRef
// body: { action: "confirm" | "reject" }
// If confirm => set payment submission VERIFIED
// and set reservation_status => APPROVED
// =============================================
exports.updatePayment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const paymentRef = String(req.params.paymentRef || "").trim();
    const action = String(req.body?.action || "")
      .trim()
      .toLowerCase();

    if (!paymentRef) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid paymentRef" });
    }
    if (!["confirm", "reject"].includes(action)) {
      return res.status(400).json({
        status: "error",
        message: "action must be confirm or reject",
      });
    }

    await conn.beginTransaction();

    // lock payment row
    const [payRows] = await conn.execute(
      `
      SELECT id, payment_ref, student_id, schedule_id, course_id, status, proof_url
      FROM student_payment_submissions
      WHERE payment_ref = ?
      FOR UPDATE
      `,
      [paymentRef],
    );

    if (!payRows.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Payment not found" });
    }

    const pay = payRows[0];

    if (!pay.proof_url) {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "No proof uploaded" });
    }

    if (action === "confirm") {
      // mark payment verified
      await conn.execute(
        `
        UPDATE student_payment_submissions
        SET status = 'VERIFIED', updated_at = NOW()
        WHERE payment_ref = ?
        `,
        [paymentRef],
      );

      // OPTIONAL: auto approve reservation (logic you said)
      await conn.execute(
        `
        UPDATE schedule_reservations
        SET reservation_status = 'APPROVED', updated_at = NOW()
        WHERE student_id = ?
          AND schedule_id = ?
          AND reservation_status IN ('PENDING','CONFIRMED','ACTIVE')
        `,
        [Number(pay.student_id), Number(pay.schedule_id)],
      );

      await conn.commit();
      return res.json({
        status: "success",
        message: "Payment VERIFIED and reservation APPROVED",
      });
    }

    // action === reject
    await conn.execute(
      `
      UPDATE student_payment_submissions
      SET status = 'REJECTED', updated_at = NOW()
      WHERE payment_ref = ?
      `,
      [paymentRef],
    );

    // if rejected, you can keep reservation CONFIRMED or set back to PENDING
    // here: set reservation back to PENDING (optional)
    await conn.execute(
      `
      UPDATE schedule_reservations
      SET reservation_status = 'PENDING', updated_at = NOW()
      WHERE student_id = ?
        AND schedule_id = ?
        AND reservation_status IN ('CONFIRMED','ACTIVE')
      `,
      [Number(pay.student_id), Number(pay.schedule_id)],
    );

    await conn.commit();
    return res.json({
      status: "success",
      message: "Payment REJECTED (reservation set to PENDING)",
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    console.error("updatePayment error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message || "Failed to update payment",
    });
  } finally {
    conn.release();
  }
};
