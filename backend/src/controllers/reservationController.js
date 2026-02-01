// src/controllers/reservationController.js
const pool = require("../config/database");

function monthRange(monthStr) {
  const [y, m] = String(monthStr).split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const pad = (n) => String(n).padStart(2, "0");
  const toDate = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  return { start: toDate(start), end: toDate(end) };
}

function timeToMinutes(t) {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + (m || 0);
}

async function hasScheduleConflict(conn, studentId, scheduleId) {
  const [rows] = await conn.execute(
    `
    SELECT 1
    FROM schedule_reservations r
    JOIN schedules s1 ON s1.schedule_id = r.schedule_id
    JOIN schedules s2 ON s2.schedule_id = ?
    WHERE r.student_id = ?
      AND r.reservation_status != 'CANCELLED'
      AND s1.session_date = s2.session_date
      AND (
        s1.start_time < s2.end_time
        AND s2.start_time < s1.end_time
      )
    LIMIT 1
    `,
    [Number(scheduleId), Number(studentId)],
  );

  return rows.length > 0;
}

// ✅ find next available schedule (same course, after current date/time, same session_type)
async function findNextAvailableSchedule(conn, courseId, fromScheduleId) {
  const [cur] = await conn.execute(
    `
    SELECT s.session_date, s.start_time, s.session_type
    FROM schedules s
    WHERE s.schedule_id = ?
    `,
    [Number(fromScheduleId)],
  );

  if (cur.length === 0) return null;

  const curDate = cur[0].session_date;
  const curTime = cur[0].start_time;
  const curType = cur[0].session_type;

  const [candidates] = await conn.execute(
    `
    SELECT s.schedule_id
    FROM schedules s
    JOIN classes cl ON cl.class_id = s.class_id
    WHERE cl.course_id = ?
      AND (s.session_date > ? OR (s.session_date = ? AND s.start_time > ?))
      AND s.session_type = ?
    ORDER BY s.session_date ASC, s.start_time ASC
    LIMIT 50
    `,
    [Number(courseId), curDate, curDate, curTime, curType],
  );

  for (const cand of candidates) {
    // lock schedule row
    const [locked] = await conn.execute(
      `
      SELECT schedule_id, capacity
      FROM schedules
      WHERE schedule_id = ?
      FOR UPDATE
      `,
      [Number(cand.schedule_id)],
    );

    if (locked.length === 0) continue;

    const capacity = Number(locked[0].capacity);
    if (capacity <= 0) continue;

    // lock count
    const [countRows] = await conn.execute(
      `
      SELECT COUNT(*) AS booked
      FROM schedule_reservations
      WHERE schedule_id = ? AND reservation_status != 'CANCELLED'
      FOR UPDATE
      `,
      [Number(cand.schedule_id)],
    );

    const booked = Number(countRows[0].booked);

    if (booked < capacity) {
      return Number(cand.schedule_id);
    }
  }

  return null;
}

// ✅ compute fee from course_fee_options
async function resolveCourseFee(conn, courseId, feeOptionCode) {
  const [opts] = await conn.execute(
    `
    SELECT option_code, amount
    FROM course_fee_options
    WHERE course_id = ? AND is_active = 1
    ORDER BY sort_order ASC
    `,
    [Number(courseId)],
  );

  if (opts.length === 0) {
    return { amount: 0.0, chosenOption: null };
  }

  if (opts.length === 1) {
    return {
      amount: Number(opts[0].amount),
      chosenOption: opts[0].option_code,
    };
  }

  if (!feeOptionCode) {
    return {
      error: "FEE_OPTION_REQUIRED",
      options: opts.map((o) => o.option_code),
    };
  }

  const code = String(feeOptionCode).toUpperCase();
  const match = opts.find((o) => String(o.option_code).toUpperCase() === code);

  if (!match) {
    return {
      error: "INVALID_FEE_OPTION",
      options: opts.map((o) => o.option_code),
    };
  }

  return { amount: Number(match.amount), chosenOption: match.option_code };
}

// ===================== STUDENT: AVAILABILITY =====================
// GET /api/student/availability?course_id=1&month=2026-02
exports.getAvailability = async (req, res) => {
  try {
    const { course_id, month } = req.query;
    if (!course_id || !month) {
      return res.status(400).json({
        status: "error",
        message: "course_id and month are required (YYYY-MM)",
      });
    }

    const { start, end } = monthRange(month);

    const [rows] = await pool.execute(
      `
      SELECT 
        s.schedule_id,
        s.session_date,
        s.start_time,
        s.end_time,
        s.session_type,
        s.capacity,
        COALESCE(SUM(CASE WHEN r.reservation_status != 'CANCELLED' THEN 1 ELSE 0 END), 0) AS booked
      FROM schedules s
      JOIN classes cl ON cl.class_id = s.class_id
      LEFT JOIN schedule_reservations r ON r.schedule_id = s.schedule_id
      WHERE cl.course_id = ?
        AND s.session_date >= ?
        AND s.session_date < ?
      GROUP BY s.schedule_id
      ORDER BY s.session_date ASC, s.start_time ASC
      `,
      [Number(course_id), start, end],
    );

    const data = rows.map((r) => ({
      schedule_id: r.schedule_id,
      date: r.session_date,
      start_time: r.start_time,
      end_time: r.end_time,
      session_type: r.session_type,
      capacity: Number(r.capacity),
      booked: Number(r.booked),
      remaining: Math.max(Number(r.capacity) - Number(r.booked), 0),
      available: Number(r.capacity) > Number(r.booked),
    }));

    res.json({ status: "success", data });
  } catch (err) {
    console.error("getAvailability error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to load availability" });
  }
};

// ===================== STUDENT: CREATE RESERVATION (ONLINE) =====================
// POST /api/student/reservations
// body: { schedule_id, course_id, payment_method, notes, fee_option_code }
exports.createReservation = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const studentId = req.session.user_id;
    const { schedule_id, course_id, payment_method, notes, fee_option_code } =
      req.body;

    if (!studentId) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });
    }

    if (!schedule_id || !course_id) {
      return res.status(400).json({
        status: "error",
        message: "schedule_id and course_id are required",
      });
    }

    await conn.beginTransaction();

    const [schedRows] = await conn.execute(
      `
      SELECT s.schedule_id, s.capacity, s.start_time, s.end_time, cl.course_id
      FROM schedules s
      JOIN classes cl ON cl.class_id = s.class_id
      WHERE s.schedule_id = ?
      FOR UPDATE
      `,
      [Number(schedule_id)],
    );

    if (schedRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    }

    const sched = schedRows[0];

    if (Number(sched.course_id) !== Number(course_id)) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "course_id does not match schedule course",
      });
    }

    if (timeToMinutes(sched.end_time) <= timeToMinutes(sched.start_time)) {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule time range" });
    }

    const [countRows] = await conn.execute(
      `
      SELECT COUNT(*) AS booked
      FROM schedule_reservations
      WHERE schedule_id = ? AND reservation_status != 'CANCELLED'
      FOR UPDATE
      `,
      [Number(schedule_id)],
    );

    const booked = Number(countRows[0].booked);
    const capacity = Number(sched.capacity);

    if (capacity <= 0) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "This schedule is not open for reservation",
      });
    }

    if (booked >= capacity) {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "No slots available (FULL)" });
    }

    const payMethod = payment_method
      ? String(payment_method).toUpperCase()
      : null;

    const fee = await resolveCourseFee(conn, course_id, fee_option_code);

    if (fee.error === "FEE_OPTION_REQUIRED") {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "fee_option_code is required for this course",
        options: fee.options,
      });
    }

    if (fee.error === "INVALID_FEE_OPTION") {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "Invalid fee_option_code for this course",
        options: fee.options,
      });
    }

    const conflict = await hasScheduleConflict(conn, studentId, schedule_id);

    if (conflict) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "You already have another reservation at the same date/time",
      });
    }

    const [ins] = await conn.execute(
      `
      INSERT INTO schedule_reservations
        (schedule_id, student_id, course_id, reservation_source, reservation_status, payment_method, notes, fee_option_code, created_by)
      VALUES
        (?, ?, ?, 'ONLINE', 'PENDING', ?, ?, ?, NULL)
      `,
      [
        Number(schedule_id),
        Number(studentId),
        Number(course_id),
        payMethod,
        notes ?? null,
        fee.chosenOption,
      ],
    );

    const reservationId = ins.insertId;

    await conn.execute(
      `
      INSERT INTO payments (reservation_id, student_id, amount, method, payment_status, created_by)
      VALUES (?, ?, ?, ?, 'UNPAID', NULL)
      `,
      [
        Number(reservationId),
        Number(studentId),
        fee.amount,
        payMethod || "CASH",
      ],
    );

    await conn.commit();

    res.status(201).json({
      status: "success",
      message: "Reservation created (PENDING)",
      data: { reservation_id: reservationId },
    });
  } catch (err) {
    await conn.rollback();

    if (String(err.message || "").includes("uniq_student_schedule")) {
      return res.status(400).json({
        status: "error",
        message: "You already reserved this schedule",
      });
    }

    console.error("createReservation error:", err);
    res.status(500).json({ status: "error", message: "Reservation failed" });
  } finally {
    conn.release();
  }
};

// ===================== STUDENT: LIST MY RESERVATIONS =====================
// GET /api/student/reservations
exports.listMyReservations = async (req, res) => {
  try {
    const studentId = req.session.user_id;
    if (!studentId) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });
    }

    const [rows] = await pool.execute(
      `
      SELECT 
        r.reservation_id,
        r.reservation_status,
        r.reservation_source,
        r.payment_method,
        r.notes,
        r.created_at,
        c.course_name,
        s.session_date,
        s.start_time,
        s.end_time,
        s.session_type,
        p.payment_id,
        p.amount,
        p.payment_status,
        p.method,
        p.reference_no,
        p.official_receipt_no,
        p.paid_at
      FROM schedule_reservations r
      JOIN courses c ON c.course_id = r.course_id
      JOIN schedules s ON s.schedule_id = r.schedule_id
      LEFT JOIN payments p ON p.reservation_id = r.reservation_id
      WHERE r.student_id = ?
      ORDER BY r.created_at DESC
      `,
      [Number(studentId)],
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listMyReservations error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch reservations" });
  }
};

// ===================== STUDENT: CANCEL MY RESERVATION =====================
// DELETE /api/student/reservations/:reservationId
exports.cancelMyReservation = async (req, res) => {
  try {
    const studentId = req.session.user_id;
    const { reservationId } = req.params;

    const [result] = await pool.execute(
      `
      UPDATE schedule_reservations
      SET reservation_status='CANCELLED'
      WHERE reservation_id=? AND student_id=?
      `,
      [Number(reservationId), Number(studentId)],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Reservation not found" });
    }

    res.json({ status: "success", message: "Reservation cancelled" });
  } catch (err) {
    console.error("cancelMyReservation error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to cancel reservation" });
  }
};

// ===================== ADMIN: LIST RESERVATIONS =====================
// GET /api/admin/reservations?schedule_id=#
exports.listReservationsAdmin = async (req, res) => {
  try {
    const { schedule_id } = req.query;

    let sql = `
      SELECT
        r.reservation_id,
        r.reservation_status,
        r.created_at,

        u.id AS student_id,
        u.fullname AS student_name,
        u.email AS email,

        COALESCE(c.course_name, '(unknown course)') AS course_name,

        s.schedule_id,
        s.schedule_date AS schedule_date,
        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime

      FROM schedule_reservations r
      LEFT JOIN users u ON u.id = r.student_id
      LEFT JOIN schedules s ON s.schedule_id = r.schedule_id

      -- ✅ IMPORTANT: courses table mo uses id, so use this ONLY
      LEFT JOIN courses c ON c.id = COALESCE(s.course_id, r.course_id)
    `;

    const params = [];

    if (schedule_id) {
      sql += ` WHERE r.schedule_id = ?`;
      params.push(Number(schedule_id));
    }

    sql += ` ORDER BY r.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("[BACKEND] listReservationsAdmin error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message || "Failed to fetch reservations",
    });
  }
};

// ===================== ADMIN: UPDATE RESERVATION STATUS =====================
// PUT /api/admin/reservations/:reservationId
exports.updateReservationStatusAdmin = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["CONFIRMED", "CANCELLED", "PENDING"].includes(
        String(status).toUpperCase(),
      )
    ) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status" });
    }

    const newStatus = String(status).toUpperCase();

    const [result] = await pool.execute(
      `UPDATE schedule_reservations SET reservation_status=? WHERE reservation_id=?`,
      [newStatus, Number(reservationId)],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Reservation not found" });
    }

    res.json({
      status: "success",
      message: `Reservation updated to ${newStatus}`,
    });
  } catch (err) {
    console.error("updateReservationStatusAdmin error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update reservation" });
  }
};

// ===================== ADMIN: CREATE WALK-IN RESERVATION =====================
// POST /api/admin/reservations/walkin
exports.createWalkInReservation = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const encoderId = req.session.user_id;

    const {
      student_id,
      schedule_id,
      course_id,
      payment_method,
      notes,
      auto_confirm,
      official_receipt_no,
      reference_no,
      fee_option_code,
    } = req.body;

    if (!encoderId) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });
    }

    if (!student_id || !schedule_id || !course_id) {
      return res.status(400).json({
        status: "error",
        message: "student_id, schedule_id, course_id are required",
      });
    }

    await conn.beginTransaction();

    // lock chosen schedule + validate course
    const [schedRows] = await conn.execute(
      `
      SELECT s.schedule_id, s.capacity, cl.course_id
      FROM schedules s
      JOIN classes cl ON cl.class_id = s.class_id
      WHERE s.schedule_id = ?
      FOR UPDATE
      `,
      [Number(schedule_id)],
    );

    if (schedRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    }

    const sched = schedRows[0];

    if (Number(sched.course_id) !== Number(course_id)) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "course_id does not match schedule course",
      });
    }

    // lock count for chosen schedule
    const [countRows] = await conn.execute(
      `
      SELECT COUNT(*) AS booked
      FROM schedule_reservations
      WHERE schedule_id=? AND reservation_status!='CANCELLED'
      FOR UPDATE
      `,
      [Number(schedule_id)],
    );

    const booked = Number(countRows[0].booked);
    const capacity = Number(sched.capacity);

    if (capacity <= 0) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "This schedule is not open for reservation",
      });
    }

    // ✅ auto resched if full
    let finalScheduleId = Number(schedule_id);
    let wasRescheduled = false;

    if (booked >= capacity) {
      const nextId = await findNextAvailableSchedule(
        conn,
        course_id,
        schedule_id,
      );

      if (!nextId) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "Fully booked. No next available schedule found.",
        });
      }

      finalScheduleId = nextId;
      wasRescheduled = true;
    }

    const payMethod = payment_method
      ? String(payment_method).toUpperCase()
      : "CASH";
    const resStatus = auto_confirm ? "CONFIRMED" : "PENDING";
    const paidNow = !!auto_confirm;

    // ✅ compute fee
    const fee = await resolveCourseFee(conn, course_id, fee_option_code);

    if (fee.error === "FEE_OPTION_REQUIRED") {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "fee_option_code is required for this course",
        options: fee.options,
      });
    }

    if (fee.error === "INVALID_FEE_OPTION") {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "Invalid fee_option_code for this course",
        options: fee.options,
      });
    }

    // insert reservation (using finalScheduleId)
    const [ins] = await conn.execute(
      `
      INSERT INTO schedule_reservations
        (schedule_id, student_id, course_id, reservation_source, reservation_status, payment_method, notes, fee_option_code, created_by)
      VALUES
        (?, ?, ?, 'WALKIN', ?, ?, ?, ?, ?)
      `,
      [
        Number(finalScheduleId),
        Number(student_id),
        Number(course_id),
        resStatus,
        payMethod,
        notes ?? null,
        fee.chosenOption,
        Number(encoderId),
      ],
    );

    const reservationId = ins.insertId;

    // ✅ FIXED: amount must be fee.amount (not payMethod)
    await conn.execute(
      `
      INSERT INTO payments
        (reservation_id, student_id, amount, method, payment_status, reference_no, official_receipt_no, paid_at, created_by)
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        Number(reservationId),
        Number(student_id),
        fee.amount,
        payMethod,
        paidNow ? "PAID" : "UNPAID",
        reference_no ?? null,
        official_receipt_no ?? null,
        paidNow ? new Date() : null,
        Number(encoderId),
      ],
    );

    await conn.commit();

    res.status(201).json({
      status: "success",
      message: wasRescheduled
        ? `Walk-in reservation created (${resStatus}) and auto-rescheduled`
        : `Walk-in reservation created (${resStatus})`,
      data: {
        reservation_id: reservationId,
        schedule_id: finalScheduleId,
        was_rescheduled: wasRescheduled,
        amount: fee.amount,
        fee_option_code: fee.chosenOption,
      },
    });
  } catch (err) {
    await conn.rollback();

    if (String(err.message || "").includes("uniq_student_schedule")) {
      return res.status(400).json({
        status: "error",
        message: "Student already reserved this schedule",
      });
    }

    console.error("createWalkInReservation error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Walk-in reservation failed" });
  } finally {
    conn.release();
  }

  const conflict = await hasScheduleConflict(conn, student_id, finalScheduleId);

  if (conflict) {
    await conn.rollback();
    return res.status(400).json({
      status: "error",
      message: "Student already has another schedule at the same date/time",
    });
  }
};
