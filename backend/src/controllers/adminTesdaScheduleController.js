// backend/src/controllers/adminTesdaScheduleController.js
const pool = require("../config/database");

function timeToMinutes(t) {
  const [h, m] = String(t).split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * GET /api/admin/tesda/schedules
 * Optional query:
 *  - course_id
 *  - date_from (YYYY-MM-DD)
 *  - date_to (YYYY-MM-DD)
 */
exports.getTesdaSchedules = async (req, res) => {
  try {
    const { course_id, date_from, date_to } = req.query;

    const where = [];
    const params = [];

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

        -- IMPORTANT: para hindi na magbago template mo:
        -- gagamitin natin same keys ng driving:
        s.trainer_id AS instructor_id,
        CONCAT(t.firstname, ' ', t.lastname) AS instructor,

        DATE_FORMAT(s.schedule_date, '%Y-%m-%d') AS date,
        DATE_FORMAT(s.schedule_date, '%a') AS day,

        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        s.total_slots AS totalSlots,
        s.status AS scheduleStatus,

        0 AS reservedCount,
        GREATEST(s.total_slots - 0, 0) AS availableSlots,

        CASE
          WHEN s.status = 'closed' THEN 'Closed'
          WHEN s.total_slots = 0 THEN 'Full'
          ELSE 'Open'
        END AS computedStatus,

        s.created_at,
        s.updated_at
      FROM tesda_schedules s
      JOIN tesda_courses c ON c.id = s.course_id
      JOIN trainers t ON t.trainer_id = s.trainer_id
      ${whereSql}
      ORDER BY s.schedule_date DESC, s.start_time DESC, s.schedule_id DESC
      `,
      params,
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getTesdaSchedules error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * POST /api/admin/tesda/schedules
 */
exports.createTesdaSchedule = async (req, res) => {
  try {
    const {
      course_id,
      trainer_id,
      schedule_date,
      start_time,
      end_time,
      total_slots,
      status = "open",
    } = req.body;

    if (
      !course_id ||
      !trainer_id ||
      !schedule_date ||
      !start_time ||
      !end_time ||
      total_slots === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "course_id, trainer_id, schedule_date, start_time, end_time, total_slots are required",
      });
    }

    if (
      String(start_time) >= String(end_time) ||
      timeToMinutes(end_time) <= timeToMinutes(start_time)
    ) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "End time must be after start time",
        });
    }

    const slots = Number(total_slots);
    if (!Number.isFinite(slots) || slots < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Total slots must be >= 1" });
    }

    // validate course exists
    const [cRows] = await pool.execute(
      `SELECT id FROM tesda_courses WHERE id=? LIMIT 1`,
      [Number(course_id)],
    );
    if (!cRows.length)
      return res
        .status(404)
        .json({ status: "error", message: "TESDA course not found" });

    // validate trainer exists
    const [tRows] = await pool.execute(
      `SELECT trainer_id FROM trainers WHERE trainer_id=? LIMIT 1`,
      [Number(trainer_id)],
    );
    if (!tRows.length)
      return res
        .status(404)
        .json({ status: "error", message: "Trainer not found" });

    const normalizedStatus =
      String(status).toLowerCase() === "closed" ? "closed" : "open";

    const [result] = await pool.execute(
      `
      INSERT INTO tesda_schedules
        (course_id, trainer_id, schedule_date, start_time, end_time, total_slots, status)
      VALUES (?,?,?,?,?,?,?)
      `,
      [
        Number(course_id),
        Number(trainer_id),
        schedule_date,
        start_time,
        end_time,
        slots,
        normalizedStatus,
      ],
    );

    return res.status(201).json({
      status: "success",
      message: "TESDA schedule created",
      data: { schedule_id: result.insertId },
    });
  } catch (err) {
    console.error("createTesdaSchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * PUT /api/admin/tesda/schedules/:id
 */
exports.updateTesdaSchedule = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule id" });
    }

    const {
      course_id,
      trainer_id,
      schedule_date,
      start_time,
      end_time,
      total_slots,
      status = "open",
    } = req.body;

    if (
      !course_id ||
      !trainer_id ||
      !schedule_date ||
      !start_time ||
      !end_time ||
      total_slots === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "course_id, trainer_id, schedule_date, start_time, end_time, total_slots are required",
      });
    }

    if (
      String(start_time) >= String(end_time) ||
      timeToMinutes(end_time) <= timeToMinutes(start_time)
    ) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "End time must be after start time",
        });
    }

    const slots = Number(total_slots);
    if (!Number.isFinite(slots) || slots < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Total slots must be >= 1" });
    }

    const normalizedStatus =
      String(status).toLowerCase() === "closed" ? "closed" : "open";

    const [result] = await pool.execute(
      `
      UPDATE tesda_schedules
      SET course_id=?, trainer_id=?, schedule_date=?, start_time=?, end_time=?, total_slots=?, status=?
      WHERE schedule_id=?
      `,
      [
        Number(course_id),
        Number(trainer_id),
        schedule_date,
        start_time,
        end_time,
        slots,
        normalizedStatus,
        id,
      ],
    );

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ status: "error", message: "TESDA schedule not found" });
    }

    return res.json({ status: "success", message: "TESDA schedule updated" });
  } catch (err) {
    console.error("updateTesdaSchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

/**
 * DELETE /api/admin/tesda/schedules/:id
 */
exports.deleteTesdaSchedule = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule id" });
    }

    const [result] = await pool.execute(
      `DELETE FROM tesda_schedules WHERE schedule_id=?`,
      [id],
    );

    if (!result.affectedRows) {
      return res
        .status(404)
        .json({ status: "error", message: "TESDA schedule not found" });
    }

    return res.json({ status: "success", message: "TESDA schedule deleted" });
  } catch (err) {
    console.error("deleteTesdaSchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};
