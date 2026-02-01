// src/controllers/scheduleController.js
const pool = require("../config/database");

function timeToMinutes(t) {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + (m || 0);
}

// statuses that consume slots
const OCCUPYING_STATUSES = ["pending", "confirmed", "approved", "active"];

/**
 * GET /api/admin/schedules
 * Optional query:
 *  - course_id
 *  - date_from (YYYY-MM-DD)
 *  - date_to (YYYY-MM-DD)
 */
exports.getSchedules = async (req, res) => {
  try {
    const { course_id, date_from, date_to } = req.query;

    const where = [];
    // reserved status placeholders first (used in subquery)
    const params = [...OCCUPYING_STATUSES];

    if (course_id) {
      where.push("s.course_id = ?");
      params.push(Number(course_id));
    }
    if (date_from) {
      where.push("s.schedule_date >= ?");
      params.push(date_from);
    }
    if (date_to) {
      where.push("s.schedule_date <= ?");
      params.push(date_to);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await pool.execute(
      `
      SELECT
        s.schedule_id AS id,
        s.course_id,
        c.course_name AS course,

        s.instructor_id,
        CONCAT(i.firstname, ' ', i.lastname) AS instructor,

        -- ✅ FORCE YYYY-MM-DD STRING (para sa calendar compare)
        DATE_FORMAT(s.schedule_date, '%Y-%m-%d') AS date,
        DATE_FORMAT(s.schedule_date, '%a') AS day,

        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        s.total_slots AS totalSlots,
        s.status AS scheduleStatus,

        COALESCE(r.reservedCount, 0) AS reservedCount,
        GREATEST(s.total_slots - COALESCE(r.reservedCount, 0), 0) AS availableSlots,

        CASE
          WHEN s.status = 'closed' THEN 'Closed'
          WHEN GREATEST(s.total_slots - COALESCE(r.reservedCount, 0), 0) = 0 THEN 'Full'
          ELSE 'Open'
        END AS computedStatus,

        s.created_at,
        s.updated_at
      FROM schedules s
      JOIN courses c ON c.id = s.course_id
      JOIN instructors i ON i.instructor_id = s.instructor_id
      LEFT JOIN (
        SELECT schedule_id, COUNT(*) AS reservedCount
        FROM schedule_reservations
        WHERE reservation_status IN (?,?,?,?)
        GROUP BY schedule_id
      ) r ON r.schedule_id = s.schedule_id
      ${whereSql}
      ORDER BY s.schedule_date DESC, s.start_time DESC, s.schedule_id DESC
      `,
      params,
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getSchedules error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * POST /api/admin/schedules
 * body: { course_id, instructor_id, schedule_date, start_time, end_time, total_slots, status? }
 */
exports.createSchedule = async (req, res) => {
  try {
    const {
      course_id,
      instructor_id,
      schedule_date,
      start_time,
      end_time,
      total_slots,
      status = "open",
    } = req.body;

    if (
      !course_id ||
      !instructor_id ||
      !schedule_date ||
      !start_time ||
      !end_time ||
      total_slots === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "course_id, instructor_id, schedule_date, start_time, end_time, total_slots are required",
      });
    }

    if (timeToMinutes(end_time) <= timeToMinutes(start_time)) {
      return res.status(400).json({
        status: "error",
        message: "end_time must be after start_time",
      });
    }

    const slots = Number(total_slots);
    if (!Number.isFinite(slots) || slots < 1) {
      return res.status(400).json({
        status: "error",
        message: "total_slots must be a number >= 1",
      });
    }

    // ✅ validate course exists (PK = courses.id)
    const [courseRows] = await pool.execute(
      `SELECT id FROM courses WHERE id = ? LIMIT 1`,
      [Number(course_id)],
    );
    if (courseRows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }

    // ✅ validate instructor exists
    const [instRows] = await pool.execute(
      `SELECT instructor_id FROM instructors WHERE instructor_id = ? LIMIT 1`,
      [Number(instructor_id)],
    );
    if (instRows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Instructor not found" });
    }

    const normalizedStatus =
      String(status).toLowerCase() === "closed" ? "closed" : "open";

    const [result] = await pool.execute(
      `
      INSERT INTO schedules
        (course_id, instructor_id, schedule_date, start_time, end_time, total_slots, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        Number(course_id),
        Number(instructor_id),
        schedule_date, // expect YYYY-MM-DD from UI
        start_time,
        end_time,
        slots,
        normalizedStatus,
      ],
    );

    return res.status(201).json({
      status: "success",
      message: "Schedule created",
      data: { schedule_id: result.insertId },
    });
  } catch (err) {
    console.error("createSchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * PUT /api/admin/schedules/:id
 */
exports.updateSchedule = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule id" });
    }

    const {
      course_id,
      instructor_id,
      schedule_date,
      start_time,
      end_time,
      total_slots,
      status,
    } = req.body;

    if (
      !course_id ||
      !instructor_id ||
      !schedule_date ||
      !start_time ||
      !end_time ||
      total_slots === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "course_id, instructor_id, schedule_date, start_time, end_time, total_slots are required",
      });
    }

    if (timeToMinutes(end_time) <= timeToMinutes(start_time)) {
      return res.status(400).json({
        status: "error",
        message: "end_time must be after start_time",
      });
    }

    const slots = Number(total_slots);
    if (!Number.isFinite(slots) || slots < 1) {
      return res.status(400).json({
        status: "error",
        message: "total_slots must be a number >= 1",
      });
    }

    // block shrinking below reserved count
    const placeholders = OCCUPYING_STATUSES.map(() => "?").join(",");
    const [cntRows] = await pool.execute(
      `
      SELECT COUNT(*) AS reservedCount
      FROM schedule_reservations
      WHERE schedule_id = ?
        AND reservation_status IN (${placeholders})
      `,
      [id, ...OCCUPYING_STATUSES],
    );

    const reservedCount = Number(cntRows[0]?.reservedCount || 0);
    if (slots < reservedCount) {
      return res.status(400).json({
        status: "error",
        message: `total_slots cannot be less than reserved (${reservedCount})`,
      });
    }

    // validate course exists
    const [courseRows] = await pool.execute(
      `SELECT id FROM courses WHERE id = ? LIMIT 1`,
      [Number(course_id)],
    );
    if (courseRows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }

    // validate instructor exists
    const [instRows] = await pool.execute(
      `SELECT instructor_id FROM instructors WHERE instructor_id = ? LIMIT 1`,
      [Number(instructor_id)],
    );
    if (instRows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Instructor not found" });
    }

    const normalizedStatus =
      String(status).toLowerCase() === "closed" ? "closed" : "open";

    const [result] = await pool.execute(
      `
      UPDATE schedules
      SET
        course_id = ?,
        instructor_id = ?,
        schedule_date = ?,
        start_time = ?,
        end_time = ?,
        total_slots = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE schedule_id = ?
      `,
      [
        Number(course_id),
        Number(instructor_id),
        schedule_date,
        start_time,
        end_time,
        slots,
        normalizedStatus,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    }

    return res.json({ status: "success", message: "Schedule updated" });
  } catch (err) {
    console.error("updateSchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * DELETE /api/admin/schedules/:id
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule id" });
    }

    const placeholders = OCCUPYING_STATUSES.map(() => "?").join(",");
    const [cntRows] = await pool.execute(
      `
      SELECT COUNT(*) AS reservedCount
      FROM schedule_reservations
      WHERE schedule_id = ?
        AND reservation_status IN (${placeholders})
      `,
      [id, ...OCCUPYING_STATUSES],
    );

    if (Number(cntRows[0]?.reservedCount || 0) > 0) {
      return res.status(400).json({
        status: "error",
        message: "Cannot delete schedule with active reservations",
      });
    }

    const [result] = await pool.execute(
      `DELETE FROM schedules WHERE schedule_id = ?`,
      [id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    }

    return res.json({ status: "success", message: "Schedule deleted" });
  } catch (err) {
    console.error("deleteSchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};
