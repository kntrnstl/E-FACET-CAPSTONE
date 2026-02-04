// backend/src/controllers/studentPaymentsController.js
const axios = require("axios");
const crypto = require("crypto");
const pool = require("../config/database");

function toCentavos(amountPhp) {
  return Math.round(Number(amountPhp || 0) * 100);
}
function basicAuth(secretKey) {
  return Buffer.from(`${secretKey}:`).toString("base64");
}

async function createGcashCheckout(req, res) {
  try {
    const userId = Number(req.session?.user_id);
    if (!userId)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

    const courseId = Number(req.body?.course_id);
    const scheduleId = Number(req.body?.schedule_id);
    const notes = req.body?.notes || null;

    if (!Number.isFinite(courseId) || courseId < 1)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid course_id" });
    if (!Number.isFinite(scheduleId) || scheduleId < 1)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule_id" });

    const [courseRows] = await pool.execute(
      `SELECT id, course_name, course_fee
       FROM courses
       WHERE id = ? AND status = 'active'
       LIMIT 1`,
      [courseId],
    );
    if (!courseRows.length)
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });

    const course = courseRows[0];
    const amount = toCentavos(course.course_fee);
    if (!Number.isFinite(amount) || amount <= 0)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid course fee" });

    // ✅ adjust this query if your schedules table is different
    const [schedRows] = await pool.execute(
      `SELECT schedule_id, course_id FROM schedules WHERE schedule_id = ? LIMIT 1`,
      [scheduleId],
    );
    if (!schedRows.length)
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    if (Number(schedRows[0].course_id) !== courseId)
      return res
        .status(400)
        .json({ status: "error", message: "Schedule does not match course" });

    const paymentRef = `PM-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    const appUrl = process.env.APP_URL;
    if (!secretKey)
      return res
        .status(500)
        .json({ status: "error", message: "PAYMONGO_SECRET_KEY not set" });
    if (!appUrl)
      return res
        .status(500)
        .json({ status: "error", message: "APP_URL not set" });

    const successUrl = `${appUrl}/student/payment-success?payment_ref=${encodeURIComponent(paymentRef)}`;
    const cancelUrl = `${appUrl}/student/payment-cancel?payment_ref=${encodeURIComponent(paymentRef)}`;

    const payload = {
      data: {
        attributes: {
          description: `Payment for ${course.course_name} (Schedule #${scheduleId})`,
          line_items: [
            { name: course.course_name, amount, currency: "PHP", quantity: 1 },
          ],
          payment_method_types: ["gcash"],
          success_url: successUrl,
          cancel_url: cancelUrl,
          metadata: {
            payment_ref: paymentRef,
            student_id: String(userId),
            course_id: String(courseId),
            schedule_id: String(scheduleId),
            notes: notes ? String(notes) : "",
          },
        },
      },
    };

    const pmRes = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      payload,
      {
        headers: {
          Authorization: `Basic ${basicAuth(secretKey)}`,
          "Content-Type": "application/json",
        },
      },
    );

    const session = pmRes.data?.data;
    const checkoutId = session?.id;
    const checkoutUrl = session?.attributes?.checkout_url;

    if (!checkoutId || !checkoutUrl) {
      return res
        .status(500)
        .json({
          status: "error",
          message: "PayMongo did not return checkout_url",
        });
    }

    await pool.execute(
      `INSERT INTO student_payments
       (payment_ref, student_id, course_id, schedule_id, amount_centavos, currency, status, paymongo_checkout_id, checkout_url, notes, created_at)
       VALUES (?, ?, ?, ?, ?, 'PHP', 'PENDING', ?, ?, ?, NOW())`,
      [
        paymentRef,
        userId,
        courseId,
        scheduleId,
        amount,
        checkoutId,
        checkoutUrl,
        notes,
      ],
    );

    return res.json({
      status: "success",
      data: {
        payment_ref: paymentRef,
        checkout_id: checkoutId,
        checkout_url: checkoutUrl,
      },
    });
  } catch (err) {
    console.error("createGcashCheckout error:", err.response?.data || err);
    return res.status(500).json({
      status: "error",
      message:
        err.response?.data?.errors?.[0]?.detail ||
        err.message ||
        "Payment init failed",
    });
  }
}

async function finalizeGcashPayment(req, res) {
  const conn = await pool.getConnection();
  try {
    const userId = Number(req.session?.user_id);
    if (!userId) {
      conn.release();
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const paymentRef = String(req.body?.payment_ref || "").trim();
    if (!paymentRef) {
      conn.release();
      return res
        .status(400)
        .json({ status: "error", message: "payment_ref is required" });
    }

    const [payRows] = await conn.execute(
      `SELECT * FROM student_payments WHERE payment_ref = ? AND student_id = ? LIMIT 1`,
      [paymentRef, userId],
    );
    if (!payRows.length) {
      conn.release();
      return res
        .status(404)
        .json({ status: "error", message: "Payment not found" });
    }

    const pay = payRows[0];
    if (pay.reservation_id) {
      conn.release();
      return res.json({
        status: "success",
        data: { reservation_id: pay.reservation_id, already_finalized: true },
      });
    }

    const secretKey = process.env.PAYMONGO_SECRET_KEY;
    if (!secretKey) {
      conn.release();
      return res
        .status(500)
        .json({ status: "error", message: "PAYMONGO_SECRET_KEY not set" });
    }

    const pmGet = await axios.get(
      `https://api.paymongo.com/v1/checkout_sessions/${pay.paymongo_checkout_id}`,
      {
        headers: {
          Authorization: `Basic ${basicAuth(secretKey)}`,
          "Content-Type": "application/json",
        },
      },
    );

    const sessionStatus = String(
      pmGet.data?.data?.attributes?.status || "",
    ).toLowerCase();
    if (sessionStatus !== "paid") {
      conn.release();
      return res
        .status(400)
        .json({
          status: "error",
          message: `Payment not completed. status=${sessionStatus}`,
        });
    }

    await conn.beginTransaction();

    const [existRes] = await conn.execute(
      `SELECT reservation_id FROM schedule_reservations WHERE student_id = ? AND schedule_id = ? LIMIT 1`,
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
          (?, ?, ?, 'online', 'PENDING', 'gcash', ?, ?, NOW(), NOW(), ?)`,
        [
          pay.schedule_id,
          userId,
          pay.course_id,
          pay.notes || null,
          userId,
          pay.fee_option_code || null,
        ],
      );
      reservationId = ins.insertId;
    }

    await conn.execute(
      `UPDATE student_payments SET status='PAID', reservation_id=?, updated_at=NOW() WHERE payment_ref=?`,
      [reservationId, paymentRef],
    );

    await conn.commit();
    conn.release();

    return res.json({
      status: "success",
      data: { reservation_id: reservationId, payment_ref: paymentRef },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    conn.release();
    console.error("finalizeGcashPayment error:", err.response?.data || err);
    return res
      .status(500)
      .json({ status: "error", message: err.message || "Finalize failed" });
  }
}

// ✅ IMPORTANT: eto yung fix sa “is not a function”
module.exports = {
  createGcashCheckout,
  finalizeGcashPayment,
};
