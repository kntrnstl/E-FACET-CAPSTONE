// src/controllers/studentScheduleController.js
const pool = require("../config/database");

const OCCUPYING_STATUSES = ["pending", "confirmed", "approved", "active"];

function ymd(d) {
  // expects YYYY-MM-DD already or Date, returns YYYY-MM-DD
  if (!d) return null;
  if (typeof d === "string" && d.includes("-") && d.length >= 10)
    return d.slice(0, 10);
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// GET /api/student/schedules?month=YYYY-MM&course_id=1
exports.getStudentSchedules = async (req, res) => {
  try {
    const { month, course_id } = req.query;

    // default: current month
    const now = new Date();
    const monthStr =
      month && /^\d{4}-\d{2}$/.test(month)
        ? month
        : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    const dateFrom = `${monthStr}-01`;
    const dateTo = ymd(
      new Date(Number(monthStr.slice(0, 4)), Number(monthStr.slice(5, 7)), 0),
    ); // last day of month

    const where = [];
    const params = [...OCCUPYING_STATUSES];

    where.push("s.status = 'open'"); // show open schedules only
    where.push("s.schedule_date >= ?");
    where.push("s.schedule_date <= ?");
    params.push(dateFrom, dateTo);

    if (course_id) {
      where.push("s.course_id = ?");
      params.push(Number(course_id));
    }

    const whereSql = `WHERE ${where.join(" AND ")}`;

    const [rows] = await pool.execute(
      `
      SELECT
        s.schedule_id AS schedule_id,
        s.course_id,
        c.course_name,
        c.course_code,

        s.instructor_id,
        CONCAT(i.firstname, ' ', i.lastname) AS instructor,

        DATE_FORMAT(s.schedule_date, '%Y-%m-%d') AS date,
        DATE_FORMAT(s.schedule_date, '%a') AS day,

        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        s.total_slots AS totalSlots,
        COALESCE(r.reservedCount, 0) AS reservedCount,
        GREATEST(s.total_slots - COALESCE(r.reservedCount, 0), 0) AS availableSlots
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
      ORDER BY s.schedule_date ASC, s.start_time ASC
      `,
      params,
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getStudentSchedules error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};
