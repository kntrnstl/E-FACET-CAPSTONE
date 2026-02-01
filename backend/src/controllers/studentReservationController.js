// src/controllers/studentReservationController.js
const pool = require("../config/database");

// ✅ match DB values (UPPERCASE)
const OCCUPYING_STATUSES = ["PENDING", "CONFIRMED", "APPROVED", "ACTIVE"];

// helper: normalize date to YYYY-MM-DD
const toYMD = (dateLike) => {
  if (!dateLike) return "";
  const s = String(dateLike);
  return s.includes("T") ? s.split("T")[0] : s;
};

/**
 * GET /api/student/availability?date=YYYY-MM-DD&course_id=1
 * Returns available schedules (time slots) on that date (optionally per course)
 */
exports.getAvailability = async (req, res) => {
  try {
    if (req.session.role !== "user") {
      return res.status(403).json({ status: "error", message: "Student only" });
    }

    const { date, course_id } = req.query;
    const schedule_date = toYMD(date);

    if (!schedule_date) {
      return res.status(400).json({
        status: "error",
        message: "date (YYYY-MM-DD) is required",
      });
    }

    const where = ["s.schedule_date = ?", "LOWER(s.status) = 'open'"];
    const params = [...OCCUPYING_STATUSES, schedule_date];

    if (course_id) {
      where.push("s.course_id = ?");
      params.push(Number(course_id));
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const [rows] = await pool.execute(
      `
      SELECT
        s.schedule_id,
        s.course_id,
        COALESCE(c.course_name, '(unknown course)') AS course,

        s.instructor_id,
        CONCAT(i.firstname,' ',i.lastname) AS instructor,

        s.schedule_date AS date,
        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        s.total_slots AS totalSlots,
        COALESCE(r.reservedCount, 0) AS reservedCount,
        GREATEST(s.total_slots - COALESCE(r.reservedCount, 0), 0) AS availableSlots

      FROM schedules s

      -- ✅ safest: courses uses id
      LEFT JOIN courses c ON c.id = s.course_id

      LEFT JOIN instructors i ON i.instructor_id = s.instructor_id

      LEFT JOIN (
        SELECT schedule_id, COUNT(*) AS reservedCount
        FROM schedule_reservations
        WHERE reservation_status IN (?,?,?,?)
        GROUP BY schedule_id
      ) r ON r.schedule_id = s.schedule_id

      ${whereSql}
      ORDER BY s.start_time ASC, s.schedule_id ASC
      `,
      params,
    );

    const data = rows
      .map((x) => ({
        schedule_id: x.schedule_id,
        course_id: x.course_id,
        course: x.course,
        instructor_id: x.instructor_id,
        instructor: x.instructor,
        date: toYMD(x.date),
        startTime: x.startTime,
        endTime: x.endTime,
        totalSlots: Number(x.totalSlots || 0),
        reservedCount: Number(x.reservedCount || 0),
        availableSlots: Number(x.availableSlots || 0),
      }))
      .filter((x) => x.availableSlots > 0);

    return res.json({ status: "success", data });
  } catch (err) {
    console.error("getAvailability error:", err);
    return res
      .status(500)
      .json({ status: "error", message: err.sqlMessage || err.message });
  }
};

/**
 * POST /api/student/reservations
 * body: { schedule_id, payment_method, notes?, fee_option_code? }
 */
exports.createReservation = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    if (req.session.role !== "user") {
      return res.status(403).json({ status: "error", message: "Student only" });
    }

    const student_id = Number(req.session.user_id);
    if (!student_id) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const { schedule_id, payment_method, notes, fee_option_code } = req.body;

    if (!schedule_id || !payment_method) {
      return res.status(400).json({
        status: "error",
        message: "schedule_id and payment_method are required",
      });
    }

    const sid = Number(schedule_id);
    if (!Number.isFinite(sid) || sid < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule_id" });
    }

    await conn.beginTransaction();

    // lock schedule + get course_id
    const [schedRows] = await conn.execute(
      `
      SELECT schedule_id, status, total_slots, course_id
      FROM schedules
      WHERE schedule_id = ?
      FOR UPDATE
      `,
      [sid],
    );

    if (schedRows.length === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    }

    const sched = schedRows[0];

    if (String(sched.status).toLowerCase() !== "open") {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "Schedule is not open" });
    }

    const course_id = Number(sched.course_id);
    if (!Number.isFinite(course_id) || course_id < 1) {
      await conn.rollback();
      return res.status(500).json({
        status: "error",
        message:
          "Schedule has no valid course_id. Fix schedules.course_id first.",
      });
    }

    // count occupied slots
    const placeholders = OCCUPYING_STATUSES.map(() => "?").join(",");
    const [cntRows] = await conn.execute(
      `
      SELECT COUNT(*) AS reservedCount
      FROM schedule_reservations
      WHERE schedule_id = ?
        AND reservation_status IN (${placeholders})
      FOR UPDATE
      `,
      [sid, ...OCCUPYING_STATUSES],
    );

    const reservedCount = Number(cntRows[0]?.reservedCount || 0);
    const availableSlots = Number(sched.total_slots) - reservedCount;

    if (availableSlots <= 0) {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "Schedule is full" });
    }

    // prevent duplicate
    const [dupRows] = await conn.execute(
      `
      SELECT reservation_id
      FROM schedule_reservations
      WHERE student_id = ?
        AND schedule_id = ?
        AND reservation_status IN (${placeholders})
      LIMIT 1
      `,
      [student_id, sid, ...OCCUPYING_STATUSES],
    );

    if (dupRows.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        status: "error",
        message: "You already have an active reservation for this schedule",
      });
    }

    // INSERT ✅ include course_id and your table columns
    const [result] = await conn.execute(
      `
      INSERT INTO schedule_reservations
        (schedule_id, student_id, course_id, reservation_source, reservation_status,
         payment_method, notes, fee_option_code, created_by, created_at, updated_at)
      VALUES
        (?, ?, ?, 'ONLINE', 'PENDING', ?, ?, ?, ?, NOW(), NOW())
      `,
      [
        sid,
        student_id,
        course_id,
        String(payment_method).trim().toUpperCase(),
        notes ? String(notes).trim() : null,
        fee_option_code ? String(fee_option_code).trim() : null,
        student_id,
      ],
    );

    await conn.commit();

    return res.status(201).json({
      status: "success",
      message: "Reservation created",
      data: { reservation_id: result.insertId },
    });
  } catch (err) {
    await conn.rollback();
    console.error("createReservation error:", err);
    return res
      .status(500)
      .json({ status: "error", message: err.sqlMessage || err.message });
  } finally {
    conn.release();
  }
};

/**
 * GET /api/student/reservations
 */
exports.listMyReservations = async (req, res) => {
  try {
    if (req.session.role !== "user") {
      return res.status(403).json({ status: "error", message: "Student only" });
    }

    const student_id = Number(req.session.user_id);
    if (!student_id) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const [rows] = await pool.execute(
      `
      SELECT
        r.reservation_id,
        r.schedule_id,
        r.payment_method,
        r.notes,
        r.reservation_status,
        r.created_at,

        s.schedule_date AS date,
        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        COALESCE(c.course_name, '(unknown course)') AS course
      FROM schedule_reservations r
      JOIN schedules s ON s.schedule_id = r.schedule_id
      LEFT JOIN courses c ON c.id = COALESCE(s.course_id, r.course_id)
      WHERE r.student_id = ?
      ORDER BY r.created_at DESC
      `,
      [student_id],
    );

    const data = rows.map((x) => ({ ...x, date: toYMD(x.date) }));
    return res.json({ status: "success", data });
  } catch (err) {
    console.error("listMyReservations error:", err);
    return res
      .status(500)
      .json({ status: "error", message: err.sqlMessage || err.message });
  }
};

/**
 * DELETE /api/student/reservations/:reservationId
 * Cancels reservation (soft cancel)
 */
exports.cancelMyReservation = async (req, res) => {
  try {
    if (req.session.role !== "user") {
      return res.status(403).json({ status: "error", message: "Student only" });
    }

    const student_id = Number(req.session.user_id);
    if (!student_id) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const reservationId = Number(req.params.reservationId);
    if (!reservationId) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid reservation id" });
    }

    const [result] = await pool.execute(
      `
      UPDATE schedule_reservations
      SET reservation_status = 'CANCELLED', updated_at = NOW()
      WHERE reservation_id = ?
        AND student_id = ?
        AND reservation_status IN ('PENDING','CONFIRMED','APPROVED','ACTIVE')
      `,
      [reservationId, student_id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Reservation not found or cannot be cancelled",
      });
    }

    return res.json({ status: "success", message: "Reservation cancelled" });
  } catch (err) {
    console.error("cancelMyReservation error:", err);
    return res
      .status(500)
      .json({ status: "error", message: err.sqlMessage || err.message });
  }
};
