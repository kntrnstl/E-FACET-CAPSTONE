// src/controllers/paymentController.js
const pool = require("../config/database");

// GET /api/admin/payments?reservation_id=#
exports.listPayments = async (req, res) => {
  try {
    const { reservation_id } = req.query;

    let sql = `
      SELECT 
        p.payment_id,
        p.reservation_id,
        p.student_id,
        u.fullname,
        p.amount,
        p.method,
        p.payment_status,
        p.reference_no,
        p.official_receipt_no,
        p.paid_at,
        p.created_by,
        p.created_at
      FROM payments p
      JOIN users u ON u.id = p.student_id
    `;
    const params = [];

    if (reservation_id) {
      sql += ` WHERE p.reservation_id = ?`;
      params.push(Number(reservation_id));
    }

    sql += ` ORDER BY p.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listPayments error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch payments" });
  }
};

// PUT /api/admin/payments/:paymentId
exports.updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const {
      payment_status,
      amount,
      method,
      reference_no,
      official_receipt_no,
    } = req.body;

    if (
      !payment_status ||
      !["UNPAID", "PAID", "REFUNDED", "VOID"].includes(
        String(payment_status).toUpperCase(),
      )
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid payment_status" });
    }

    const newStatus = String(payment_status).toUpperCase();
    const newMethod = method ? String(method).toUpperCase() : null;
    const paidAt = newStatus === "PAID" ? new Date() : null;

    const [result] = await pool.execute(
      `
      UPDATE payments
      SET amount = COALESCE(?, amount),
          method = COALESCE(?, method),
          payment_status = ?,
          reference_no = ?,
          official_receipt_no = ?,
          paid_at = ?,
          created_by = COALESCE(created_by, ?)
      WHERE payment_id = ?
      `,
      [
        amount !== undefined ? Number(amount) : null,
        newMethod,
        newStatus,
        reference_no ?? null,
        official_receipt_no ?? null,
        paidAt,
        req.session.user_id,
        Number(paymentId),
      ],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Payment not found" });
    }

    res.json({ status: "success", message: `Payment updated to ${newStatus}` });
  } catch (err) {
    console.error("updatePayment error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update payment" });
  }
};
