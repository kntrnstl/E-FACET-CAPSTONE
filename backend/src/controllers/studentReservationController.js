// src/controllers/studentReservationController.js
const pool = require("../config/database");

// ✅ these statuses OCCUPY a slot (counted against total_slots)
const OCCUPYING_STATUSES = ["PENDING", "CONFIRMED", "APPROVED", "ACTIVE"];

// helper: normalize date to YYYY-MM-DD
// helper: normalize date to YYYY-MM-DD (accepts Date string too)
const toYMD = (dateLike) => {
  if (!dateLike) return "";

  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return "";

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
};


// helper: add days to YYYY-MM-DD
const addDaysYMD = (ymd, days) => {
  const d = new Date(`${String(ymd)}T00:00:00`);
  d.setDate(d.getDate() + Number(days || 0));
  return toYMD(d);
};

// helper: build placeholders
const ph = (arr) => arr.map(() => "?").join(",");

// normalize payment_method to match DB enum('GCASH','BANK','CASH')
function normalizePaymentMethod(pm) {
  const s = String(pm || "")
    .trim()
    .toUpperCase();
  if (s === "GCASH") return "GCASH";
  if (s === "BANK") return "BANK";
  if (s === "CASH") return "CASH";
  return null;
}

// normalize requirements_mode to match DB enum('online','walkin')
function normalizeRequirementsMode(mode) {
  const s = String(mode || "")
    .trim()
    .toLowerCase();
  if (s === "online") return "online";
  if (s === "walkin") return "walkin";
  return "walkin";
}

// ✅ Detect “2-day package” courses by course_code (recommended)
function isTwoDayCourseByCode(course_code) {
  const code = String(course_code || "")
    .trim()
    .toUpperCase();
  return code === "PDC-AB" || code === "TDC";
}

/**
 * GET /api/student/availability?date=YYYY-MM-DD&course_id=1
 *
 * ✅ If course is 2-day package (TDC, PDC-AB):
 *    returns paired schedules: day1_schedule_id + day2_schedule_id
 *    availableSlots = MIN(day1 available, day2 available)
 *
 * ✅ Else:
 *    returns normal per-schedule availability
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

    // If no course_id, keep your original behavior (simple list)
    // (Recommended: force course selection in frontend)
    if (!course_id) {
      const where = ["s.schedule_date = ?", "LOWER(s.status) = 'open'"];
      const params = [...OCCUPYING_STATUSES, schedule_date];

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
        LEFT JOIN courses c ON c.id = s.course_id
        LEFT JOIN instructors i ON i.instructor_id = s.instructor_id
        LEFT JOIN (
          SELECT schedule_id, COUNT(*) AS reservedCount
          FROM schedule_reservations
          WHERE reservation_status IN (${ph(OCCUPYING_STATUSES)})
          GROUP BY schedule_id
        ) r ON r.schedule_id = s.schedule_id
        ${whereSql}
        ORDER BY s.start_time ASC, s.schedule_id ASC
        `,
        params,
      );

      const data = rows
        .map((x) => ({
          isPackage: false,
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
    }

    // ✅ fetch course_code to know if package
    const [courseRows] = await pool.execute(
      `SELECT id, course_code, course_name FROM courses WHERE id = ? LIMIT 1`,
      [Number(course_id)],
    );
    const course = courseRows[0] || null;

    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course not found",
      });
    }

    const isTwoDay = isTwoDayCourseByCode(course.course_code);
    const placeholders = ph(OCCUPYING_STATUSES);

    // ✅ PACKAGE (TDC / PDC-AB): pair day1 + day2
    if (isTwoDay) {
      const day2 = addDaysYMD(schedule_date, 1);

      // NOTE:
      // we pair schedules by same course_id + instructor_id + time and next-day date
      const [rows] = await pool.execute(
        `
        SELECT
          s1.schedule_id AS day1_schedule_id,
          s2.schedule_id AS day2_schedule_id,

          s1.course_id,
          COALESCE(c.course_name, '(unknown course)') AS course,

          s1.instructor_id,
          CONCAT(i.firstname,' ',i.lastname) AS instructor,

          DATE_FORMAT(s1.schedule_date, '%Y-%m-%d') AS day1_date,
          DATE_FORMAT(s2.schedule_date, '%Y-%m-%d') AS day2_date,

          TIME_FORMAT(s1.start_time, '%H:%i') AS startTime,
          TIME_FORMAT(s1.end_time, '%H:%i') AS endTime,

          s1.total_slots AS totalSlots,

          COALESCE(r1.reservedCount,0) AS reservedCount1,
          COALESCE(r2.reservedCount,0) AS reservedCount2,

          GREATEST(s1.total_slots - COALESCE(r1.reservedCount,0), 0) AS available1,
          GREATEST(s2.total_slots - COALESCE(r2.reservedCount,0), 0) AS available2,

          LEAST(
            GREATEST(s1.total_slots - COALESCE(r1.reservedCount,0), 0),
            GREATEST(s2.total_slots - COALESCE(r2.reservedCount,0), 0)
          ) AS availableSlots
        FROM schedules s1
        JOIN schedules s2
          ON s2.course_id = s1.course_id
         AND s2.instructor_id = s1.instructor_id
         AND s2.start_time = s1.start_time
         AND s2.end_time = s1.end_time
         AND s2.schedule_date = ?
        LEFT JOIN courses c ON c.id = s1.course_id
        LEFT JOIN instructors i ON i.instructor_id = s1.instructor_id

        LEFT JOIN (
          SELECT schedule_id, COUNT(*) AS reservedCount
          FROM schedule_reservations
          WHERE reservation_status IN (${placeholders})
          GROUP BY schedule_id
        ) r1 ON r1.schedule_id = s1.schedule_id

        LEFT JOIN (
          SELECT schedule_id, COUNT(*) AS reservedCount
          FROM schedule_reservations
          WHERE reservation_status IN (${placeholders})
          GROUP BY schedule_id
        ) r2 ON r2.schedule_id = s2.schedule_id

        WHERE s1.schedule_date = ?
          AND LOWER(s1.status) = 'open'
          AND LOWER(s2.status) = 'open'
          AND s1.course_id = ?
        ORDER BY s1.start_time ASC, s1.schedule_id ASC
        `,
        [
          day2,
          ...OCCUPYING_STATUSES,
          ...OCCUPYING_STATUSES,
          schedule_date,
          Number(course_id),
        ],
      );

      const data = rows
        .map((x) => ({
          isPackage: true,
          course_id: x.course_id,
          course: x.course,
          instructor_id: x.instructor_id,
          instructor: x.instructor,

          day1_schedule_id: x.day1_schedule_id,
          day2_schedule_id: x.day2_schedule_id,

          day1_date: x.day1_date,
          day2_date: x.day2_date,

          startTime: x.startTime,
          endTime: x.endTime,

          totalSlots: Number(x.totalSlots || 0),
          availableSlots: Number(x.availableSlots || 0),
        }))
        .filter((x) => x.availableSlots > 0);

      return res.json({ status: "success", data });
    }

    // ✅ NORMAL (1-day course): your original query
    {
      const where = [
        "s.schedule_date = ?",
        "LOWER(s.status) = 'open'",
        "s.course_id = ?",
      ];
      const params = [...OCCUPYING_STATUSES, schedule_date, Number(course_id)];
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
        LEFT JOIN courses c ON c.id = s.course_id
        LEFT JOIN instructors i ON i.instructor_id = s.instructor_id

        LEFT JOIN (
          SELECT schedule_id, COUNT(*) AS reservedCount
          FROM schedule_reservations
          WHERE reservation_status IN (${ph(OCCUPYING_STATUSES)})
          GROUP BY schedule_id
        ) r ON r.schedule_id = s.schedule_id

        ${whereSql}
        ORDER BY s.start_time ASC, s.schedule_id ASC
        `,
        params,
      );

      const data = rows
        .map((x) => ({
          isPackage: false,
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
    }
  } catch (err) {
    console.error("getAvailability error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message,
    });
  }
};

/**
 * POST /api/student/reservations
 *
 * ✅ For TDC / PDC-AB (2-day package):
 *    student sends schedule_id = day1_schedule_id
 *    backend auto-locks day2 schedule (next day, same time/instructor/course)
 *    inserts 2 reservation rows in ONE transaction
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

    const {
      schedule_id,
      payment_method,
      requirements_mode,
      payment_ref,
      notes,
      fee_option_code,
    } = req.body;

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

    // ✅ only allow GCASH or CASH (no bank)
    const payMethod = normalizePaymentMethod(payment_method);
    if (!payMethod || !["GCASH", "CASH"].includes(payMethod)) {
      return res.status(400).json({
        status: "error",
        message: "payment_method must be GCASH or CASH",
      });
    }

    const reqMode = normalizeRequirementsMode(requirements_mode);
    const placeholders = ph(OCCUPYING_STATUSES);

    await conn.beginTransaction();

    // 1) lock schedule (DAY 1) + get course_id + schedule_date + instructor/time
    const [schedRows] = await conn.execute(
      `
      SELECT schedule_id, status, total_slots, course_id, schedule_date, instructor_id, start_time, end_time
      FROM schedules
      WHERE schedule_id = ?
      FOR UPDATE
      `,
      [sid],
    );

    if (!schedRows.length) {
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

    const scheduleDateYMD = toYMD(sched.schedule_date);
    if (!scheduleDateYMD) {
      await conn.rollback();
      return res.status(500).json({
        status: "error",
        message:
          "Schedule has no valid schedule_date. Fix schedules.schedule_date first.",
      });
    }

    // ✅ prevent reserving past schedules (DAY 1)
    const [pastRows] = await conn.execute(
      `SELECT 1 FROM schedules WHERE schedule_id = ? AND schedule_date < CURDATE() LIMIT 1`,
      [sid],
    );
    if (pastRows.length) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "Hindi puwede mag-reserve sa past date.",
      });
    }

    // ✅ course_code check: is this a 2-day package (TDC / PDC-AB)?
    const [courseRows] = await conn.execute(
      `SELECT id, course_code FROM courses WHERE id = ? LIMIT 1`,
      [course_id],
    );
    const course = courseRows[0] || null;
    const isTwoDay = isTwoDayCourseByCode(course?.course_code);

    // 2) ✅ One active reservation per student (any schedule, today or future)
    const [activeRows] = await conn.execute(
      `
      SELECT r.reservation_id
      FROM schedule_reservations r
      JOIN schedules s ON s.schedule_id = r.schedule_id
      WHERE r.student_id = ?
        AND r.reservation_status IN (${placeholders})
        AND s.schedule_date >= CURDATE()
      LIMIT 1
      `,
      [student_id, ...OCCUPYING_STATUSES],
    );

    if (activeRows.length) {
      await conn.rollback();
      return res.status(409).json({
        status: "error",
        message:
          "May active reservation ka pa. Tapusin muna yun bago mag-reserve ulit.",
      });
    }

    // 3) If GCASH => payment_ref required + proof must be submitted
    if (payMethod === "GCASH") {
      const ref = String(payment_ref || "").trim();
      if (!ref) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "payment_ref is required for GCash. Upload proof first.",
        });
      }

      const [payRows] = await conn.execute(
        `
        SELECT id, payment_ref, student_id, schedule_id, course_id, status, proof_url
        FROM student_payment_submissions
        WHERE payment_ref = ?
          AND student_id = ?
        LIMIT 1
        `,
        [ref, student_id],
      );

      if (!payRows.length) {
        await conn.rollback();
        return res
          .status(400)
          .json({ status: "error", message: "Invalid payment_ref." });
      }

      const pay = payRows[0];

      // ✅ For 2-day packages, we still require proof tied to DAY 1 schedule_id
      if (
        Number(pay.schedule_id) !== sid ||
        Number(pay.course_id) !== course_id
      ) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "payment_ref does not match the selected schedule/course.",
        });
      }

      if (String(pay.status) !== "PROOF_SUBMITTED" || !pay.proof_url) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "Upload proof first before reserving.",
        });
      }
    }

    // 4) count occupied slots (DAY 1) (lock)
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

    // 5) prevent duplicate same schedule (extra safety)
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

    if (dupRows.length) {
      await conn.rollback();
      return res.status(409).json({
        status: "error",
        message: "You already have an active reservation for this schedule",
      });
    }

    // ✅ If 2-day package, find & lock DAY 2 schedule and validate slots too
    let day2Schedule = null;
    if (isTwoDay) {
      const day2Date = addDaysYMD(scheduleDateYMD, 1);

      const [s2Rows] = await conn.execute(
        `
        SELECT schedule_id, status, total_slots, schedule_date, instructor_id, start_time, end_time
        FROM schedules
        WHERE course_id = ?
          AND instructor_id = ?
          AND schedule_date = ?
          AND start_time = ?
          AND end_time = ?
        FOR UPDATE
        `,
        [
          course_id,
          sched.instructor_id,
          day2Date,
          sched.start_time,
          sched.end_time,
        ],
      );

      if (!s2Rows.length) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message:
            "2-day course requires Day 2 schedule (next day) with same time/instructor.",
        });
      }

      day2Schedule = s2Rows[0];

      if (String(day2Schedule.status).toLowerCase() !== "open") {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "Day 2 schedule is not open.",
        });
      }

      // prevent reserving past schedules (DAY 2)
      const [past2] = await conn.execute(
        `SELECT 1 FROM schedules WHERE schedule_id = ? AND schedule_date < CURDATE() LIMIT 1`,
        [Number(day2Schedule.schedule_id)],
      );
      if (past2.length) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "Hindi puwede mag-reserve sa past date (Day 2).",
        });
      }

      // slots for DAY 2
      const [cnt2Rows] = await conn.execute(
        `
        SELECT COUNT(*) AS reservedCount
        FROM schedule_reservations
        WHERE schedule_id = ?
          AND reservation_status IN (${placeholders})
        FOR UPDATE
        `,
        [Number(day2Schedule.schedule_id), ...OCCUPYING_STATUSES],
      );

      const reserved2 = Number(cnt2Rows[0]?.reservedCount || 0);
      const avail2 = Number(day2Schedule.total_slots) - reserved2;

      if (avail2 <= 0) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "Day 2 schedule is full.",
        });
      }

      // prevent duplicate DAY 2 too
      const [dup2] = await conn.execute(
        `
        SELECT reservation_id
        FROM schedule_reservations
        WHERE student_id = ?
          AND schedule_id = ?
          AND reservation_status IN (${placeholders})
        LIMIT 1
        `,
        [student_id, Number(day2Schedule.schedule_id), ...OCCUPYING_STATUSES],
      );

      if (dup2.length) {
        await conn.rollback();
        return res.status(409).json({
          status: "error",
          message: "You already have an active reservation for Day 2 schedule",
        });
      }
    }

    // 6) INSERT (slot locked immediately)
    const reservation_status = "CONFIRMED";

    // DAY 1 insert
    const [r1] = await conn.execute(
      `
      INSERT INTO schedule_reservations
        (schedule_id, student_id, course_id,
         reservation_source, reservation_status,
         payment_method, notes, fee_option_code,
         requirements_mode,
         expires_at,
         created_by, created_at, updated_at)
      VALUES
        (?, ?, ?,
         'ONLINE', ?,
         ?, ?, ?,
         ?,
         TIMESTAMP(?, '23:59:59'),
         ?, NOW(), NOW())
      `,
      [
        sid,
        student_id,
        course_id,
        reservation_status,
        payMethod,
        notes ? String(notes).trim() : null,
        fee_option_code ? String(fee_option_code).trim() : null,
        reqMode,
        scheduleDateYMD,
        student_id,
      ],
    );

    const reservation_id = r1.insertId;

    // DAY 2 insert (only if package)
    let reservation_id_2 = null;
    if (isTwoDay && day2Schedule) {
      const day2Sid = Number(day2Schedule.schedule_id);
      const day2DateYMD = toYMD(day2Schedule.schedule_date);

      const [r2] = await conn.execute(
        `
        INSERT INTO schedule_reservations
          (schedule_id, student_id, course_id,
           reservation_source, reservation_status,
           payment_method, notes, fee_option_code,
           requirements_mode,
           expires_at,
           created_by, created_at, updated_at)
        VALUES
          (?, ?, ?,
           'ONLINE', ?,
           ?, ?, ?,
           ?,
           TIMESTAMP(?, '23:59:59'),
           ?, NOW(), NOW())
        `,
        [
          day2Sid,
          student_id,
          course_id,
          reservation_status,
          payMethod,
          notes ? String(notes).trim() : null,
          fee_option_code ? String(fee_option_code).trim() : null,
          reqMode,
          day2DateYMD,
          student_id,
        ],
      );

      reservation_id_2 = r2.insertId;
    }

    // 7) If GCASH, set payment submission status to FOR_VERIFICATION (admin checks)
    if (payMethod === "GCASH") {
      const ref = String(payment_ref || "").trim();
      await conn.execute(
        `
        UPDATE student_payment_submissions
        SET status = 'FOR_VERIFICATION',
            updated_at = NOW()
        WHERE payment_ref = ?
          AND student_id = ?
        `,
        [ref, student_id],
      );
    }

    await conn.commit();

    return res.status(201).json({
      status: "success",
      message: isTwoDay
        ? "Reservation created (2-day course: Day 1 + Day 2 locked)"
        : "Reservation created (slot is locked)",
      data: {
        reservation_id,
        reservation_id_2,
        schedule_date: scheduleDateYMD,
        reservation_status,
      },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    console.error("createReservation error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message,
    });
  } finally {
    conn.release();
  }
};

/**
 * GET /api/student/reservations/active
 *
 * ✅ If active reservation is a 2-day course, we also fetch day2 “sibling”
 */
exports.getMyActiveReservation = async (req, res) => {
  try {
    if (req.session.role !== "user") {
      return res.status(403).json({ status: "error", message: "Student only" });
    }

    const student_id = Number(req.session.user_id);
    if (!student_id) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const placeholders = ph(OCCUPYING_STATUSES);

    const [rows] = await pool.execute(
      `
      SELECT
        r.reservation_id,
        r.schedule_id,
        r.reservation_status,
        r.payment_method,
        r.notes,
        DATE_FORMAT(r.expires_at, '%Y-%m-%d %H:%i:%s') AS expires_at,
        r.created_at,

        DATE_FORMAT(s.schedule_date, '%Y-%m-%d') AS date,
        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        COALESCE(c.course_name, '(unknown course)') AS course,
        COALESCE(c.course_code, '') AS course_code,
        s.instructor_id
      FROM schedule_reservations r
      JOIN schedules s ON s.schedule_id = r.schedule_id
      LEFT JOIN courses c ON c.id = COALESCE(s.course_id, r.course_id)
      WHERE r.student_id = ?
        AND r.reservation_status IN (${placeholders})
        AND s.schedule_date >= CURDATE()
      ORDER BY r.created_at DESC
      LIMIT 1
      `,
      [student_id, ...OCCUPYING_STATUSES],
    );

    if (!rows.length) return res.json({ status: "success", data: null });

    const x = rows[0];
    const isTwoDay = isTwoDayCourseByCode(x.course_code);

    // sibling fetch (day2) if package
    let sibling = null;
    if (isTwoDay) {
      const day2 = addDaysYMD(toYMD(x.date), 1);

      const [sibRows] = await pool.execute(
        `
        SELECT
          r.reservation_id,
          r.schedule_id,
          r.reservation_status,
          DATE_FORMAT(s.schedule_date, '%Y-%m-%d') AS date,
          TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
          TIME_FORMAT(s.end_time, '%H:%i') AS endTime
        FROM schedule_reservations r
        JOIN schedules s ON s.schedule_id = r.schedule_id
        WHERE r.student_id = ?
          AND r.reservation_status IN (${placeholders})
          AND s.schedule_date = ?
          AND s.instructor_id = ?
          AND TIME_FORMAT(s.start_time, '%H:%i') = ?
          AND TIME_FORMAT(s.end_time, '%H:%i') = ?
        ORDER BY r.created_at DESC
        LIMIT 1
        `,
        [
          student_id,
          ...OCCUPYING_STATUSES,
          day2,
          Number(x.instructor_id),
          x.startTime,
          x.endTime,
        ],
      );

      if (sibRows.length) sibling = sibRows[0];
    }

    return res.json({
      status: "success",
      data: {
        reservation_id: x.reservation_id,
        schedule_id: x.schedule_id,
        reservation_status: x.reservation_status,
        payment_method: x.payment_method,
        notes: x.notes,
        expires_at: x.expires_at,
        created_at: x.created_at,

        isPackage: isTwoDay,
        date: toYMD(x.date),
        startTime: x.startTime,
        endTime: x.endTime,
        course: x.course,

        sibling: sibling
          ? {
              reservation_id: sibling.reservation_id,
              schedule_id: sibling.schedule_id,
              reservation_status: sibling.reservation_status,
              date: toYMD(sibling.date),
              startTime: sibling.startTime,
              endTime: sibling.endTime,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("getMyActiveReservation error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message,
    });
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
        r.requirements_mode,
        DATE_FORMAT(r.expires_at, '%Y-%m-%d %H:%i:%s') AS expires_at,
        r.done_at,
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

    const data = rows.map((x) => ({
      ...x,
      date: toYMD(x.date),
    }));

    return res.json({ status: "success", data });
  } catch (err) {
    console.error("listMyReservations error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message,
    });
  }
};

/**
 * DELETE /api/student/reservations/:reservationId
 *
 * ✅ If reservation is part of 2-day package (TDC / PDC-AB),
 *    also cancel the sibling on the next day (same time/instructor/student).
 */
exports.cancelMyReservation = async (req, res) => {
  const conn = await pool.getConnection();
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

    const placeholders = ph(OCCUPYING_STATUSES);

    await conn.beginTransaction();

    // get reservation + schedule details
    const [rRows] = await conn.execute(
      `
      SELECT
        r.reservation_id,
        r.schedule_id,
        s.course_id,
        c.course_code,
        s.instructor_id,
        DATE_FORMAT(s.schedule_date,'%Y-%m-%d') AS date,
        TIME_FORMAT(s.start_time,'%H:%i') AS startTime,
        TIME_FORMAT(s.end_time,'%H:%i') AS endTime
      FROM schedule_reservations r
      JOIN schedules s ON s.schedule_id = r.schedule_id
      LEFT JOIN courses c ON c.id = s.course_id
      WHERE r.reservation_id = ?
        AND r.student_id = ?
      LIMIT 1
      `,
      [reservationId, student_id],
    );

    if (!rRows.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Reservation not found" });
    }

    const r0 = rRows[0];
    const isTwoDay = isTwoDayCourseByCode(r0.course_code);

    // cancel the selected reservation (only if active)
    const [result] = await conn.execute(
      `
      UPDATE schedule_reservations
      SET reservation_status = 'CANCELLED', updated_at = NOW()
      WHERE reservation_id = ?
        AND student_id = ?
        AND reservation_status IN (${placeholders})
      `,
      [reservationId, student_id, ...OCCUPYING_STATUSES],
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res.status(404).json({
        status: "error",
        message: "Reservation not found or cannot be cancelled",
      });
    }

    // ✅ also cancel sibling if package
    if (isTwoDay) {
      const day2 = addDaysYMD(toYMD(r0.date), 1);

      await conn.execute(
        `
        UPDATE schedule_reservations r
        JOIN schedules s ON s.schedule_id = r.schedule_id
        SET r.reservation_status = 'CANCELLED', r.updated_at = NOW()
        WHERE r.student_id = ?
          AND r.reservation_status IN (${placeholders})
          AND s.course_id = ?
          AND s.instructor_id = ?
          AND DATE_FORMAT(s.schedule_date,'%Y-%m-%d') = ?
          AND TIME_FORMAT(s.start_time,'%H:%i') = ?
          AND TIME_FORMAT(s.end_time,'%H:%i') = ?
        `,
        [
          student_id,
          ...OCCUPYING_STATUSES,
          Number(r0.course_id),
          Number(r0.instructor_id),
          day2,
          r0.startTime,
          r0.endTime,
        ],
      );
    }

    await conn.commit();
    return res.json({
      status: "success",
      message: isTwoDay
        ? "Reservation cancelled (2-day package cancelled too)"
        : "Reservation cancelled",
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    console.error("cancelMyReservation error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message,
    });
  } finally {
    conn.release();
  }
};

/**
 * AUTO DONE JOB
 */
exports.autoMarkDone = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.execute(
      `
      UPDATE schedule_reservations r
      JOIN schedules s ON s.schedule_id = r.schedule_id
      SET r.reservation_status = 'DONE',
          r.done_at = NOW(),
          r.updated_at = NOW()
      WHERE r.reservation_status IN ('PENDING','CONFIRMED','APPROVED','ACTIVE')
        AND s.schedule_date < CURDATE()
      `,
    );

    await conn.commit();
    return Number(result.affectedRows || 0);
  } catch (err) {
    await conn.rollback();
    console.error("autoMarkDone error:", err);
    return 0;
  } finally {
    conn.release();
  }
};
