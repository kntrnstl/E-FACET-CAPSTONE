// backend/src/controllers/reservationController.js
const pool = require("../config/database");
const { sendReservationConfirmation, sendAdminNotification } = require("../services/emailService");

// statuses that occupy slot
const OCCUPYING_STATUSES = ["PENDING", "CONFIRMED", "APPROVED", "ACTIVE"];

function ph(arr) {
  return arr.map(() => "?").join(",");
}

function toYMD(dateLike) {
  if (!dateLike) return "";
  const s = String(dateLike);
  return s.includes("T") ? s.split("T")[0] : s;
}

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
  const [h, m] = String(t || "")
    .split(":")
    .map(Number);
  return (h || 0) * 60 + (m || 0);
}

// ✅ Conflict check using schedules.schedule_date + overlap time
async function hasScheduleConflict(conn, studentId, scheduleId) {
  const [rows] = await conn.execute(
    `
    SELECT 1
    FROM schedule_reservations r
    JOIN schedules s1 ON s1.schedule_id = r.schedule_id
    JOIN schedules s2 ON s2.schedule_id = ?
    WHERE r.student_id = ?
      AND r.reservation_status != 'CANCELLED'
      AND s1.schedule_date = s2.schedule_date
      AND (s1.start_time < s2.end_time AND s2.start_time < s1.end_time)
    LIMIT 1
    `,
    [Number(scheduleId), Number(studentId)],
  );
  return rows.length > 0;
}

// ✅ find next available schedule (same course, after current date/time)
async function findNextAvailableSchedule(conn, courseId, fromScheduleId) {
  const [cur] = await conn.execute(
    `
    SELECT schedule_date, start_time
    FROM schedules
    WHERE schedule_id = ?
    LIMIT 1
    `,
    [Number(fromScheduleId)],
  );

  if (!cur.length) return null;

  const curDate = toYMD(cur[0].schedule_date);
  const curTime = cur[0].start_time;

  const [candidates] = await conn.execute(
    `
    SELECT schedule_id
    FROM schedules
    WHERE course_id = ?
      AND LOWER(status) = 'open'
      AND (schedule_date > ? OR (schedule_date = ? AND start_time > ?))
    ORDER BY schedule_date ASC, start_time ASC
    LIMIT 50
    `,
    [Number(courseId), curDate, curDate, curTime],
  );

  const placeholders = ph(OCCUPYING_STATUSES);

  for (const cand of candidates) {
    const sid = Number(cand.schedule_id);

    const [locked] = await conn.execute(
      `
      SELECT schedule_id, total_slots
      FROM schedules
      WHERE schedule_id = ?
      FOR UPDATE
      `,
      [sid],
    );
    if (!locked.length) continue;

    const totalSlots = Number(locked[0].total_slots || 0);
    if (totalSlots <= 0) continue;

    const [countRows] = await conn.execute(
      `
      SELECT COUNT(*) AS booked
      FROM schedule_reservations
      WHERE schedule_id = ?
        AND reservation_status IN (${placeholders})
      FOR UPDATE
      `,
      [sid, ...OCCUPYING_STATUSES],
    );

    const booked = Number(countRows[0].booked || 0);
    if (booked < totalSlots) return sid;
  }

  return null;
}

// ✅ optional fee options helper (safe kahit walang table)
async function resolveCourseFee(conn, courseId, feeOptionCode) {
  try {
    const [opts] = await conn.execute(
      `
      SELECT option_code, amount
      FROM course_fee_options
      WHERE course_id = ? AND is_active = 1
      ORDER BY sort_order ASC
      `,
      [Number(courseId)],
    );

    if (opts.length === 0) return { amount: 0.0, chosenOption: null };

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
    const match = opts.find(
      (o) => String(o.option_code).toUpperCase() === code,
    );

    if (!match) {
      return {
        error: "INVALID_FEE_OPTION",
        options: opts.map((o) => o.option_code),
      };
    }

    return { amount: Number(match.amount), chosenOption: match.option_code };
  } catch (e) {
    return { amount: 0.0, chosenOption: null };
  }
}

// 🆕 Helper: Get package info (day2 schedule)
async function getPackageInfo(conn, day1ScheduleId) {
  try {
    const [rows] = await conn.execute(
      `
      SELECT 
        s2.schedule_id AS day2_schedule_id,
        s2.schedule_date AS day2_date,
        TIME_FORMAT(s2.start_time, '%H:%i') AS day2_start_time,
        TIME_FORMAT(s2.end_time, '%H:%i') AS day2_end_time
      FROM schedules s1
      JOIN schedules s2 ON s1.package_group_id = s2.package_group_id 
        AND s2.package_day = 2
      WHERE s1.schedule_id = ?
        AND s1.package_day = 1
        AND s1.package_group_id IS NOT NULL
      LIMIT 1
      `,
      [Number(day1ScheduleId)]
    );

    if (!rows.length) return null;

    return {
      day2_schedule_id: rows[0].day2_schedule_id,
      day2_date: toYMD(rows[0].day2_date),
      day2_start_time: rows[0].day2_start_time,
      day2_end_time: rows[0].day2_end_time,
    };
  } catch (err) {
    console.error('getPackageInfo error:', err);
    return null;
  }
}

// ===================== STUDENT: MONTH AVAILABILITY (CALENDAR) =====================
// GET /api/student/schedules?course_id=1&month=YYYY-MM
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
    const placeholders = ph(OCCUPYING_STATUSES);

    const [rows] = await pool.execute(
      `
      SELECT
        s.schedule_date AS date,
        SUM(s.total_slots) AS totalSlots,
        COALESCE(SUM(r.reservedCount), 0) AS reservedCount,
        GREATEST(SUM(s.total_slots) - COALESCE(SUM(r.reservedCount),0), 0) AS availableSlots
      FROM schedules s
      LEFT JOIN (
        SELECT schedule_id, COUNT(*) AS reservedCount
        FROM schedule_reservations
        WHERE reservation_status IN (${placeholders})
        GROUP BY schedule_id
      ) r ON r.schedule_id = s.schedule_id
      WHERE s.course_id = ?
        AND LOWER(s.status) = 'open'
        AND s.schedule_date >= ?
        AND s.schedule_date < ?
      GROUP BY s.schedule_date
      ORDER BY s.schedule_date ASC
      `,
      [...OCCUPYING_STATUSES, Number(course_id), start, end],
    );

    const data = rows.map((x) => ({
      date: toYMD(x.date),
      totalSlots: Number(x.totalSlots || 0),
      reservedCount: Number(x.reservedCount || 0),
      availableSlots: Number(x.availableSlots || 0),
    }));

    return res.json({ status: "success", data });
  } catch (err) {
    console.error("getAvailability error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message || "Failed to load availability",
    });
  }
};

// ===================== STUDENT: CREATE RESERVATION (LOCK SLOT) =====================
// POST /api/student/reservations
exports.createReservation = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const studentId = Number(req.session?.user_id);
    if (!studentId) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });
    }

    const {
      schedule_id,
      course_id,
      payment_method,
      notes,
      fee_option_code,
      requirements_mode,
      payment_ref,
    } = req.body;

    if (!schedule_id || !course_id || !payment_method) {
      return res.status(400).json({
        status: "error",
        message: "schedule_id, course_id, payment_method are required",
      });
    }

    const sid = Number(schedule_id);
    const cid = Number(course_id);

    if (!Number.isFinite(sid) || sid < 1 || !Number.isFinite(cid) || cid < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule_id/course_id" });
    }

    const payMethod = String(payment_method).trim().toUpperCase();
    if (!["GCASH", "CASH"].includes(payMethod)) {
      return res.status(400).json({
        status: "error",
        message: "payment_method must be GCASH or CASH",
      });
    }

    const reqMode =
      String(requirements_mode || "walkin").toLowerCase() === "online"
        ? "online"
        : "walkin";

    await conn.beginTransaction();

    const [schedRows] = await conn.execute(
      `
      SELECT schedule_id, course_id, schedule_date, start_time, end_time, total_slots, status, instructor_id, package_group_id, package_day
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

    if (Number(sched.course_id) !== cid) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "course_id does not match schedule course",
      });
    }

    if (String(sched.status || "").toLowerCase() !== "open") {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "Schedule is not open" });
    }

    const scheduleDate = toYMD(sched.schedule_date);
    if (!scheduleDate) {
      await conn.rollback();
      return res.status(500).json({
        status: "error",
        message: "Schedule has invalid schedule_date",
      });
    }

    // prevent past schedule
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

    if (timeToMinutes(sched.end_time) <= timeToMinutes(sched.start_time)) {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule time range" });
    }

    const conflict = await hasScheduleConflict(conn, studentId, sid);
    if (conflict) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "You already have another reservation at the same date/time",
      });
    }

    const placeholders = ph(OCCUPYING_STATUSES);
    const [countRows] = await conn.execute(
      `
      SELECT COUNT(*) AS booked
      FROM schedule_reservations
      WHERE schedule_id = ?
        AND reservation_status IN (${placeholders})
      FOR UPDATE
      `,
      [sid, ...OCCUPYING_STATUSES],
    );

    const booked = Number(countRows[0].booked || 0);
    const totalSlots = Number(sched.total_slots || 0);

    if (totalSlots <= 0) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "This schedule is not open for reservation",
      });
    }

    if (booked >= totalSlots) {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "No slots available (FULL)" });
    }

    // ✅ if GCASH, require payment_ref + proof submitted
    if (payMethod === "GCASH") {
      const ref = String(payment_ref || "").trim();
      if (!ref) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "payment_ref is required for GCash",
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
        [ref, studentId],
      );

      if (!payRows.length) {
        await conn.rollback();
        return res
          .status(400)
          .json({ status: "error", message: "Invalid payment_ref" });
      }

      const p = payRows[0];
      if (Number(p.schedule_id) !== sid || Number(p.course_id) !== cid) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "payment_ref does not match the selected schedule/course.",
        });
      }

      if (
        String(p.status || "").toUpperCase() !== "PROOF_SUBMITTED" ||
        !p.proof_url
      ) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: "Upload proof first before reserving.",
        });
      }

      await conn.execute(
        `
        UPDATE student_payment_submissions
        SET status='FOR_VERIFICATION', updated_at=NOW()
        WHERE payment_ref=? AND student_id=?
        `,
        [ref, studentId],
      );
    }

    const fee = await resolveCourseFee(conn, cid, fee_option_code);
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

    const [ins] = await conn.execute(
      `
      INSERT INTO schedule_reservations
        (schedule_id, student_id, course_id,
         reservation_source, reservation_status,
         payment_method, notes, fee_option_code, requirements_mode,
         expires_at, created_by, created_at, updated_at)
      VALUES
        (?, ?, ?,
         'ONLINE', 'CONFIRMED',
         ?, ?, ?, ?,
         TIMESTAMP(?, '23:59:59'),
         ?, NOW(), NOW())
      `,
      [
        sid,
        studentId,
        cid,
        payMethod,
        notes ?? null,
        fee.chosenOption ?? null,
        reqMode,
        scheduleDate,
        studentId,
      ],
    );

    const reservationId = ins.insertId;

    // 🔥 GET STUDENT INFO
    const [studentRows] = await conn.execute(
      `SELECT fullname, email FROM users WHERE id = ? LIMIT 1`,
      [studentId]
    );

    // 🔥 GET COURSE INFO
    const [courseRows] = await conn.execute(
      `SELECT course_name, course_code, course_fee FROM courses WHERE id = ? LIMIT 1`,
      [cid]
    );

    // 🔥 GET INSTRUCTOR NAME
    let instructorName = "TBA";
    if (sched.instructor_id) {
      const [instructorRows] = await conn.execute(
        `SELECT CONCAT(first_name, ' ', last_name) AS fullname FROM instructors WHERE instructor_id = ? LIMIT 1`,
        [sched.instructor_id]
      );
      if (instructorRows.length) {
        instructorName = instructorRows[0].fullname;
      }
    }

    // 🆕 CHECK IF PACKAGE (2-day)
    const isPackage = Boolean(sched.package_group_id && Number(sched.package_day) === 1);
    let packageInfo = null;
    if (isPackage) {
      packageInfo = await getPackageInfo(conn, sid);
    }

    await conn.commit();

    // 🔥 SEND EMAIL NOTIFICATIONS (non-blocking)
    if (studentRows.length && courseRows.length) {
      const student = studentRows[0];
      const course = courseRows[0];

      const emailData = {
        studentEmail: student.email,
        studentName: student.fullname,
        courseName: course.course_name,
        courseCode: course.course_code || "",
        scheduleId: sid,
        date: scheduleDate,
        startTime: sched.start_time,
        endTime: sched.end_time,
        instructor: instructorName,
        courseFee: Number(course.course_fee || fee.amount || 0),
        paymentMethod: payMethod,
        paymentRef: payment_ref || null,
        requirementsMode: reqMode,
        notes: notes || null,
        reservationId,
        isPackage,
        // 🆕 Package data
        day2Date: packageInfo?.day2_date || null,
        day2StartTime: packageInfo?.day2_start_time || null,
        day2EndTime: packageInfo?.day2_end_time || null,
      };

      console.log("📧 ============================================");
      console.log("📧 PREPARING TO SEND EMAILS");
      console.log("📧 Student Email:", emailData.studentEmail);
      console.log("📧 Student Name:", emailData.studentName);
      console.log("📧 Course:", emailData.courseName);
      console.log("📧 Reservation ID:", emailData.reservationId);
      console.log("📧 Is Package:", emailData.isPackage);
      if (emailData.isPackage) {
        console.log("📧 Day 2 Date:", emailData.day2Date);
      }
      console.log("📧 ============================================");

      // Send emails asynchronously (non-blocking)
      setImmediate(() => {
        console.log("📧 Starting email send process...");
        
        Promise.all([
          sendReservationConfirmation(emailData)
            .then((result) => {
              console.log("✅ Student confirmation email sent successfully!");
              console.log("   Message ID:", result.messageId);
              return result;
            })
            .catch((err) => {
              console.error("❌ Student email FAILED:");
              console.error("   Error:", err.message);
              console.error("   Stack:", err.stack);
              throw err;
            }),
          
          sendAdminNotification(emailData)
            .then((result) => {
              console.log("✅ Admin notification email sent successfully!");
              console.log("   Message ID:", result.messageId);
              return result;
            })
            .catch((err) => {
              console.error("❌ Admin email FAILED:");
              console.error("   Error:", err.message);
              console.error("   Stack:", err.stack);
              throw err;
            }),
        ])
          .then(() => {
            console.log("📧 ============================================");
            console.log("📧 ALL EMAILS SENT SUCCESSFULLY!");
            console.log("📧 ============================================");
          })
          .catch((err) => {
            console.error("📧 ============================================");
            console.error("📧 EMAIL SENDING FAILED");
            console.error("📧 Error:", err.message);
            console.error("📧 ============================================");
          });
      });
    } else {
      console.log("⚠️ WARNING: Cannot send emails - missing student or course data");
      console.log("   Student rows:", studentRows.length);
      console.log("   Course rows:", courseRows.length);
    }

    return res.status(201).json({
      status: "success",
      message: "Reservation created (CONFIRMED). Check your email for confirmation!",
      data: { reservation_id: reservationId, schedule_date: scheduleDate },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    console.error("createReservation error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message || "Reservation failed",
    });
  } finally {
    conn.release();
  }
};

// ===================== STUDENT: LIST MY RESERVATIONS =====================
// GET /api/student/reservations
exports.listMyReservations = async (req, res) => {
  try {
    const studentId = Number(req.session?.user_id);
    if (!studentId)
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });

    const { schedule_id, status } = req.query;

    let sql = `
      SELECT
        r.reservation_id,
        r.reservation_status,
        r.payment_method,
        r.requirements_mode,
        r.notes,
        r.created_at,

        u.id AS student_id,
        u.fullname AS student_name,
        u.email AS email,

        COALESCE(c.course_name, '(unknown course)') AS course_name,

        s.schedule_id,
        s.schedule_date AS schedule_date,
        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        sp.payment_ref,
        sp.status AS payment_status,
        sp.proof_url,
        sp.amount_centavos,
        sp.currency,
        sp.created_at AS payment_created_at
      FROM schedule_reservations r
      LEFT JOIN users u ON u.id = r.student_id
      LEFT JOIN schedules s ON s.schedule_id = r.schedule_id
      LEFT JOIN courses c ON c.id = COALESCE(s.course_id, r.course_id)

      LEFT JOIN student_payment_submissions sp
        ON sp.id = (
          SELECT sp2.id
          FROM student_payment_submissions sp2
          WHERE sp2.student_id = r.student_id
            AND sp2.schedule_id = r.schedule_id
            AND sp2.course_id = r.course_id
          ORDER BY sp2.id DESC
          LIMIT 1
        )
    `;

    const params = [];
    const where = ["r.student_id = ?"];
    params.push(studentId);

    if (schedule_id) {
      where.push("r.schedule_id = ?");
      params.push(Number(schedule_id));
    }
    if (status) {
      where.push("UPPER(r.reservation_status) = ?");
      params.push(String(status).toUpperCase());
    }

    sql += ` WHERE ${where.join(" AND ")}`;
    sql += ` ORDER BY r.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listMyReservations error:", err);
    return res
      .status(500)
      .json({ status: "error", message: err.sqlMessage || err.message });
  }
};

// ===================== STUDENT: CANCEL MY RESERVATION =====================
// DELETE /api/student/reservations/:reservationId
exports.cancelMyReservation = async (req, res) => {
  try {
    const studentId = Number(req.session?.user_id);
    const reservationId = Number(req.params?.id); 

    if (!studentId)
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });
    if (!reservationId)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid reservationId" });

    const [result] = await pool.execute(
      `
      UPDATE schedule_reservations
      SET reservation_status='CANCELLED', updated_at=NOW()
      WHERE reservation_id=? AND student_id=?
      `,
      [reservationId, studentId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Reservation not found" });
    }

    return res.json({ status: "success", message: "Reservation cancelled" });
  } catch (err) {
    console.error("cancelMyReservation error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to cancel reservation" });
  }
};

// ===================== ADMIN: LIST RESERVATIONS =====================
// GET /api/admin/reservations?schedule_id=#&status=#
exports.listReservationsAdmin = async (req, res) => {
  try {
    const { schedule_id, status } = req.query;

    let sql = `
      SELECT
        r.reservation_id,
        r.reservation_status,
        r.payment_method,
        r.requirements_mode,
        r.notes,
        r.created_at,

        r.student_id,
        r.course_id,
        r.schedule_id,

        u.fullname AS student_name,
        u.email AS email,

        COALESCE(c.course_name, '(unknown course)') AS course_name,

        s.schedule_date AS schedule_date,
        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        sp.payment_ref,
        sp.status AS payment_status,
        sp.proof_url,
        sp.amount_centavos,
        sp.currency,

CASE
  WHEN UPPER(r.reservation_status) IN ('DONE','CANCELLED')
    THEN UPPER(r.reservation_status)

  WHEN UPPER(r.payment_method) = 'GCASH'
   AND UPPER(COALESCE(sp.status,'')) IN ('FOR_VERIFICATION','PROOF_SUBMITTED')
   AND UPPER(r.reservation_status) = 'CONFIRMED'
    THEN 'PENDING'

  ELSE UPPER(r.reservation_status)
END AS admin_status


      FROM schedule_reservations r
      LEFT JOIN users u ON u.id = r.student_id
      LEFT JOIN schedules s ON s.schedule_id = r.schedule_id
      LEFT JOIN courses c ON c.id = COALESCE(s.course_id, r.course_id)

      LEFT JOIN student_payment_submissions sp
        ON sp.id = (
          SELECT sp2.id
          FROM student_payment_submissions sp2
          WHERE sp2.student_id = r.student_id
            AND sp2.schedule_id = r.schedule_id
            AND sp2.course_id = r.course_id
          ORDER BY sp2.id DESC
          LIMIT 1
        )
    `;

    const params = [];
    const where = [];

    if (schedule_id) {
      where.push("r.schedule_id = ?");
      params.push(Number(schedule_id));
    }

    if (status) {
      const st = String(status).toUpperCase();

      if (st === "PENDING") {
        where.push(`
          UPPER(r.payment_method) = 'GCASH'
          AND UPPER(COALESCE(sp.status,'')) IN ('FOR_VERIFICATION','PROOF_SUBMITTED')
        `);
      } else {
        where.push("UPPER(r.reservation_status) = ?");
        params.push(st);
      }
    }

    if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
    sql += ` ORDER BY r.created_at DESC`;

    const [rows] = await pool.execute(sql, params);
    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listReservationsAdmin error:", err);
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
    const reservationId = Number(req.params?.id);
    const status = String(req.body?.status || "").toUpperCase();

    const allowed = [
      "PENDING",
      "CONFIRMED",
      "APPROVED",
      "ACTIVE",
      "DONE",
      "CANCELLED",
    ];

    if (!reservationId)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid reservationId" });
    if (!allowed.includes(status))
      return res
        .status(400)
        .json({ status: "error", message: "Invalid status" });

    const [result] = await pool.execute(
      `UPDATE schedule_reservations SET reservation_status=?, updated_at=NOW() WHERE reservation_id=?`,
      [status, reservationId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Reservation not found" });
    }

    return res.json({
      status: "success",
      message: `Reservation updated to ${status}`,
    });
  } catch (err) {
    console.error("updateReservationStatusAdmin error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to update reservation" });
  }
};

// ===================== ADMIN: CREATE WALK-IN RESERVATION =====================
// POST /api/admin/reservations/walkin
exports.createWalkInReservation = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const encoderId = Number(req.session?.user_id);
    if (!encoderId)
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });

    const {
      student_id,
      schedule_id,
      course_id,
      payment_method,
      notes,
      auto_confirm,
      reference_no,
      official_receipt_no,
      fee_option_code,
    } = req.body;

    if (!student_id || !schedule_id || !course_id) {
      return res.status(400).json({
        status: "error",
        message: "student_id, schedule_id, course_id are required",
      });
    }

    const studentId = Number(student_id);
    const sid = Number(schedule_id);
    const cid = Number(course_id);

    await conn.beginTransaction();

    const [schedRows] = await conn.execute(
      `
      SELECT schedule_id, course_id, schedule_date, total_slots, status
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

    if (Number(sched.course_id) !== cid) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "course_id does not match schedule course",
      });
    }

    if (String(sched.status || "").toLowerCase() !== "open") {
      await conn.rollback();
      return res
        .status(400)
        .json({ status: "error", message: "Schedule is not open" });
    }

    const [pastRows] = await conn.execute(
      `SELECT 1 FROM schedules WHERE schedule_id=? AND schedule_date < CURDATE() LIMIT 1`,
      [sid],
    );
    if (pastRows.length) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "Cannot reserve past schedule date.",
      });
    }

    const placeholders = ph(OCCUPYING_STATUSES);

    const [countRows] = await conn.execute(
      `
      SELECT COUNT(*) AS booked
      FROM schedule_reservations
      WHERE schedule_id = ?
        AND reservation_status IN (${placeholders})
      FOR UPDATE
      `,
      [sid, ...OCCUPYING_STATUSES],
    );

    const booked = Number(countRows[0].booked || 0);
    const totalSlots = Number(sched.total_slots || 0);

    if (totalSlots <= 0) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "This schedule is not open for reservation",
      });
    }

    let finalScheduleId = sid;
    let wasRescheduled = false;

    if (booked >= totalSlots) {
      const nextId = await findNextAvailableSchedule(conn, cid, sid);
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

    const conflict = await hasScheduleConflict(
      conn,
      studentId,
      finalScheduleId,
    );
    if (conflict) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: "Student already has another schedule at the same date/time",
      });
    }

    const payMethod = payment_method
      ? String(payment_method).toUpperCase()
      : "CASH";
    const resStatus = auto_confirm ? "CONFIRMED" : "PENDING";
    const scheduleDateYMD = toYMD(sched.schedule_date);

    const fee = await resolveCourseFee(conn, cid, fee_option_code);
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

    const [ins] = await conn.execute(
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
         'WALKIN', ?,
         ?, ?, ?,
         'walkin',
         TIMESTAMP(?, '23:59:59'),
         ?, NOW(), NOW())
      `,
      [
        Number(finalScheduleId),
        studentId,
        cid,
        resStatus,
        payMethod,
        notes ?? null,
        fee.chosenOption ?? null,
        scheduleDateYMD,
        encoderId,
      ],
    );

    const reservationId = ins.insertId;

    await conn.commit();

    return res.status(201).json({
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
        reference_no: reference_no ?? null,
        official_receipt_no: official_receipt_no ?? null,
      },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    console.error("createWalkInReservation error:", err);
    return res.status(500).json({
      status: "error",
      message: err.sqlMessage || err.message || "Walk-in reservation failed",
    });
  } finally {
    conn.release();
  }
};

// ===================== ADMIN: RESERVATION DETAILS =====================
// GET /api/admin/reservations/:reservationId/details
exports.getReservationDetailsAdmin = async (req, res) => {
  try {
    const reservationId = Number(req.params?.id);
    if (!reservationId) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid reservationId" });
    }

    const [rows] = await pool.execute(
      `
      SELECT
        r.reservation_id,
        r.reservation_status,
        r.payment_method,
        r.requirements_mode,
        r.notes,
        r.created_at,
        r.updated_at,

        r.student_id,
        r.course_id,
        r.schedule_id,

        u.fullname AS student_name,
        u.email,

        COALESCE(c.course_name, '(unknown course)') AS course_name,

        s.schedule_date AS schedule_date,
        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime
      FROM schedule_reservations r
      LEFT JOIN users u ON u.id = r.student_id
      LEFT JOIN schedules s ON s.schedule_id = r.schedule_id
      LEFT JOIN courses c ON c.id = COALESCE(s.course_id, r.course_id)
      WHERE r.reservation_id = ?
      LIMIT 1
      `,
      [reservationId],
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Reservation not found" });
    }

    const reservation = rows[0];

    const [payRows] = await pool.execute(
      `
      SELECT
        sp.id,
        sp.payment_ref,
        sp.student_id,
        sp.course_id,
        sp.schedule_id,
        sp.amount_centavos,
        sp.currency,
        sp.payment_method,
        sp.status,
        sp.proof_url,
        sp.notes,
        sp.admin_note,
        sp.verified_by,
        sp.verified_at,
        sp.created_at,
        sp.updated_at
      FROM student_payment_submissions sp
      WHERE sp.student_id = ?
        AND sp.course_id = ?
        AND sp.schedule_id = ?
      ORDER BY sp.id DESC
      LIMIT 1
      `,
      [
        Number(reservation.student_id),
        Number(reservation.course_id),
        Number(reservation.schedule_id),
      ],
    );

    const payment = payRows.length ? payRows[0] : null;

    const [reqRows] = await pool.execute(
      `
      SELECT
        rs.submission_id,
        rs.requirement_id,
        rs.file_path AS file_url,
        rs.created_at,
        cr.requirement_text
      FROM requirement_submissions rs
      LEFT JOIN course_requirements cr ON cr.requirement_id = rs.requirement_id
      WHERE rs.reservation_id = ?
      ORDER BY rs.created_at DESC
      `,
      [reservationId],
    );

    const requirements = (reqRows || []).map((x) => ({
      id: x.submission_id,
      requirement_id: x.requirement_id,
      requirement_text: x.requirement_text || null,
      file_url: x.file_url,
      created_at: x.created_at,
    }));

    return res.json({
      status: "success",
      data: { reservation, payment, requirements },
    });
  } catch (err) {
    console.error("getReservationDetailsAdmin error:", err);
    return res.status(500).json({
      status: "error",
      message:
        err.sqlMessage || err.message || "Failed to load reservation details",
    });
  }
};