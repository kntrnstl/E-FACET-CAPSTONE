// backend/src/controllers/scheduleController.js
const pool = require("../config/database");

function timeToMinutes(t) {
  const [h, m] = String(t || "")
    .split(":")
    .map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function addDaysYMD(ymd, daysToAdd) {
  const d = new Date(`${ymd}T00:00:00`);
  d.setDate(d.getDate() + Number(daysToAdd || 0));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseYmdToDate(ymd) {
  return new Date(`${String(ymd)}T00:00:00`);
}

// ✅ Monday-start week range (Mon..Sun)
function getWeekRangeMonSun(ymd) {
  const d = parseYmdToDate(ymd);
  if (Number.isNaN(d.getTime())) return null;

  const day = d.getDay(); // Sun=0..Sat=6
  const mondayOffset = (day + 6) % 7; // Mon->0..Sun->6

  const start = new Date(d);
  start.setDate(d.getDate() - mondayOffset);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const toYMD = (x) => {
    const y = x.getFullYear();
    const m = String(x.getMonth() + 1).padStart(2, "0");
    const dd = String(x.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  return { weekStart: toYMD(start), weekEnd: toYMD(end) };
}

// ✅ IMPORTANT: robust reserved statuses (handles DB being uppercase)
const OCCUPYING_STATUSES = ["PENDING", "CONFIRMED", "APPROVED", "ACTIVE"];

// FACET operating hours
const FACET_OPEN_MIN = 8 * 60; // 08:00
const FACET_CLOSE_MIN = 17 * 60; // 17:00

function ensureWithinFacetHours(start, end) {
  const s = timeToMinutes(start);
  const e = timeToMinutes(end);

  if (s < FACET_OPEN_MIN || s > FACET_CLOSE_MIN)
    return `Start time must be within 08:00–17:00`;
  if (e < FACET_OPEN_MIN || e > FACET_CLOSE_MIN)
    return `End time must be within 08:00–17:00`;
  if (e <= s) return `end_time must be after start_time`;
  return null;
}

// ✅ FIX: strict id parser + allow both param names in routes
function parseId(param) {
  const id = parseInt(String(param ?? ""), 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ================================
// ✅ Driving Auto-duration Rules (as you want)
// - TDC: 2 days BOTH 08:00–17:00 (BOTH DAYS WITH SLOTS)
// - PDC AB: 2 days, 4 hours/day (auto end = start+4h)
// - PDC A/B: 1 day, 8 hours (auto end = start+8h)
// ================================
function getDrivingRule(courseName) {
  const name = String(courseName || "").trim();

  if (
    /(PDC\s*A\s*(&|AND)\s*B|PDC\s*A\s*B|PRACTICAL.*A\s*(&|AND)\s*B)/i.test(name)
  ) {
    return { kind: "PDC_AB", days: 2, perDayHours: [4, 4] };
  }
  if (/(PDC\s*A\b|PRACTICAL.*\bA\b)/i.test(name)) {
    return { kind: "PDC_A", days: 1, perDayHours: [8] };
  }
  if (/(PDC\s*B\b|PRACTICAL.*\bB\b)/i.test(name)) {
    return { kind: "PDC_B", days: 1, perDayHours: [8] };
  }
  if (/(TDC\b|THEORETICAL.*DRIVING.*COURSE)/i.test(name)) {
    return { kind: "TDC", days: 2, forceFullDay: true };
  }

  return null;
}

function buildSessionsFromRule({ schedule_date, start_time }, rule) {
  const baseDate = String(schedule_date);

  // ✅ TDC: always 2 days full day 08:00–17:00
  if (rule.kind === "TDC" && rule.forceFullDay) {
    return [
      { schedule_date: baseDate, start_time: "08:00", end_time: "17:00" },
      {
        schedule_date: addDaysYMD(baseDate, 1),
        start_time: "08:00",
        end_time: "17:00",
      },
    ];
  }

  // PDC_*: compute end by hours
  const baseStartMin = timeToMinutes(start_time);

  if (baseStartMin < FACET_OPEN_MIN || baseStartMin >= FACET_CLOSE_MIN) {
    throw new Error("Start time must be within 08:00–17:00");
  }

  const sessions = [];
  for (let i = 0; i < rule.days; i++) {
    const hours = rule.perDayHours[i];
    const endMin = baseStartMin + hours * 60;

    if (endMin > FACET_CLOSE_MIN) {
      throw new Error(
        `This course needs ${hours} hour(s) for day ${i + 1}. Starting at ${minutesToTime(
          baseStartMin,
        )} exceeds FACET hours (ends ${minutesToTime(
          endMin,
        )}). Use an earlier start time (e.g., 08:00).`,
      );
    }

    sessions.push({
      schedule_date: addDaysYMD(baseDate, i),
      start_time: minutesToTime(baseStartMin),
      end_time: minutesToTime(endMin),
    });
  }

  return sessions;
}

// ================================
// ✅ TDC WEEKLY CAP (48 slots/week)
// TDC has Day1 + Day2 both with slots, but we COUNT ONLY DAY-1.
// Day-2 detection: if there exists a matching previous-day schedule (same course+instructor+time, not closed)
// ================================
const TDC_WEEKLY_CAP = 48;

async function getTdcWeekUsedSlots(
  conn,
  { course_id, weekStart, weekEnd, excludeScheduleId = null },
) {
  const params = [Number(course_id), weekStart, weekEnd];
  let excludeSql = "";
  if (excludeScheduleId) {
    excludeSql = "AND s.schedule_id <> ?";
    params.push(Number(excludeScheduleId));
  }

  const [rows] = await conn.execute(
    `
    SELECT COALESCE(SUM(s.total_slots), 0) AS usedSlots
    FROM schedules s
    WHERE s.course_id = ?
      AND s.schedule_date BETWEEN ? AND ?
      AND s.total_slots > 0
      AND (s.status IS NULL OR LOWER(s.status) <> 'closed')
      ${excludeSql}
      -- ✅ count ONLY Day-1 (exclude Day-2 rows)
      AND NOT EXISTS (
        SELECT 1
        FROM schedules p
        WHERE p.course_id = s.course_id
          AND p.instructor_id = s.instructor_id
          AND p.schedule_date = DATE_SUB(s.schedule_date, INTERVAL 1 DAY)
          AND p.start_time = s.start_time
          AND p.end_time = s.end_time
          AND (p.status IS NULL OR LOWER(p.status) <> 'closed')
      )
    `,
    params,
  );

  return Number(rows[0]?.usedSlots || 0);
}

async function isTdcDay2Row(
  conn,
  { course_id, instructor_id, schedule_date, start_time, end_time },
) {
  const [rows] = await conn.execute(
    `
    SELECT schedule_id
    FROM schedules
    WHERE course_id = ?
      AND instructor_id = ?
      AND schedule_date = DATE_SUB(?, INTERVAL 1 DAY)
      AND start_time = ?
      AND end_time = ?
      AND (status IS NULL OR LOWER(status) <> 'closed')
    LIMIT 1
    `,
    [
      Number(course_id),
      Number(instructor_id),
      schedule_date,
      start_time,
      end_time,
    ],
  );
  return rows.length > 0;
}

async function upsertTdcDay2(
  conn,
  { course_id, instructor_id, day1_date, slots, status },
) {
  const day2 = addDaysYMD(day1_date, 1);
  const s =
    String(status || "open").toLowerCase() === "closed" ? "closed" : "open";

  // find existing day2 row for same course+instructor+day2 date
  const [rows] = await conn.execute(
    `
    SELECT schedule_id
    FROM schedules
    WHERE course_id = ?
      AND instructor_id = ?
      AND schedule_date = ?
    ORDER BY schedule_id DESC
    LIMIT 1
    `,
    [Number(course_id), Number(instructor_id), day2],
  );

  if (rows.length) {
    await conn.execute(
      `
      UPDATE schedules
      SET start_time = ?, end_time = ?, total_slots = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE schedule_id = ?
      `,
      ["08:00", "17:00", Number(slots), s, Number(rows[0].schedule_id)],
    );
    return;
  }

  await conn.execute(
    `
    INSERT INTO schedules (course_id, instructor_id, schedule_date, start_time, end_time, total_slots, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      Number(course_id),
      Number(instructor_id),
      day2,
      "08:00",
      "17:00",
      Number(slots),
      s,
    ],
  );
}

/**
 * GET /api/admin/schedules
 */
exports.getSchedules = async (req, res) => {
  try {
    const { course_id, date_from, date_to } = req.query;

    const where = [];
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
    const placeholders = OCCUPYING_STATUSES.map(() => "?").join(",");

    const [rows] = await pool.execute(
      `
      SELECT
        s.schedule_id AS id,
        s.course_id,
        c.course_name AS course,

        s.instructor_id,
        CONCAT(i.firstname, ' ', i.lastname) AS instructor,

        DATE_FORMAT(s.schedule_date, '%Y-%m-%d') AS date,
        DATE_FORMAT(s.schedule_date, '%a') AS day,

        TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
        TIME_FORMAT(s.end_time, '%H:%i') AS endTime,

        s.total_slots AS totalSlots,
        s.status AS scheduleStatus,

        COALESCE(r.reservedCount, 0) AS reservedCount,
        GREATEST(s.total_slots - COALESCE(r.reservedCount, 0), 0) AS availableSlots,

        CASE
          WHEN LOWER(s.status) = 'closed' THEN 'Closed'
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
        WHERE UPPER(reservation_status) IN (${placeholders})
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
 * body: { course_id, instructor_id, schedule_date, start_time, end_time?, total_slots, status? }
 *
 * ✅ TDC:
 * - auto creates Day1+Day2 both 08–17
 * - both days get SAME slots/status
 * - weekly cap 48 counts ONLY Day1
 */
exports.createSchedule = async (req, res) => {
  const conn = await pool.getConnection();
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
      total_slots === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "course_id, instructor_id, schedule_date, start_time, total_slots are required",
      });
    }

    let slots = Number(total_slots);
    if (!Number.isFinite(slots) || slots < 1) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "total_slots must be a number >= 1",
        });
    }

    await conn.beginTransaction();

    const [courseRows] = await conn.execute(
      `SELECT id, course_name FROM courses WHERE id = ? LIMIT 1`,
      [Number(course_id)],
    );
    if (!courseRows.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }
    const courseName = courseRows[0].course_name;

    const [instRows] = await conn.execute(
      `SELECT instructor_id FROM instructors WHERE instructor_id = ? LIMIT 1`,
      [Number(instructor_id)],
    );
    if (!instRows.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Instructor not found" });
    }

    const normalizedStatus =
      String(status).toLowerCase() === "closed" ? "closed" : "open";
    const rule = getDrivingRule(courseName);

    let sessions = null;

    if (rule) {
      sessions = buildSessionsFromRule({ schedule_date, start_time }, rule);
    } else {
      if (!end_time) {
        await conn.rollback();
        return res
          .status(400)
          .json({
            status: "error",
            message: "end_time is required for non-driving courses",
          });
      }
      const facetErr = ensureWithinFacetHours(start_time, end_time);
      if (facetErr) {
        await conn.rollback();
        return res.status(400).json({ status: "error", message: facetErr });
      }
      sessions = [{ schedule_date, start_time, end_time }];
    }

    // validate sessions
    for (const s of sessions) {
      const facetErr = ensureWithinFacetHours(s.start_time, s.end_time);
      if (facetErr) {
        await conn.rollback();
        return res.status(400).json({ status: "error", message: facetErr });
      }
    }

    // ✅ TDC weekly cap check (counts Day-1 only)
    if (rule && rule.kind === "TDC") {
      if (slots > TDC_WEEKLY_CAP) slots = TDC_WEEKLY_CAP;

      const range = getWeekRangeMonSun(schedule_date);
      if (!range) {
        await conn.rollback();
        return res
          .status(400)
          .json({ status: "error", message: "Invalid schedule_date" });
      }

      const used = await getTdcWeekUsedSlots(conn, {
        course_id,
        weekStart: range.weekStart,
        weekEnd: range.weekEnd,
      });

      const remaining = Math.max(TDC_WEEKLY_CAP - used, 0);
      if (slots > remaining) {
        await conn.rollback();
        return res.status(400).json({
          status: "error",
          message: `TDC weekly limit is ${TDC_WEEKLY_CAP} slots. Remaining this week: ${remaining}.`,
        });
      }
    }

    const createdIds = [];

    for (const sess of sessions) {
      const [result] = await conn.execute(
        `
        INSERT INTO schedules (course_id, instructor_id, schedule_date, start_time, end_time, total_slots, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          Number(course_id),
          Number(instructor_id),
          sess.schedule_date,
          sess.start_time,
          sess.end_time,
          slots, // ✅ BOTH DAYS SAME SLOTS
          normalizedStatus,
        ],
      );
      createdIds.push(result.insertId);
    }

    await conn.commit();

    return res.status(201).json({
      status: "success",
      message: rule
        ? `Schedule created (${rule.kind}) with ${sessions.length} session(s)`
        : "Schedule created",
      data: { schedule_ids: createdIds },
    });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    console.error("createSchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  } finally {
    conn.release();
  }
};

/**
 * PUT /api/admin/schedules/:id
 *
 * ✅ TDC:
 * - allow edit Day-1 only
 * - force time 08–17
 * - weekly cap counts Day-1 only
 * - auto upsert Day-2 next day with SAME slots/status/time
 */
exports.updateSchedule = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rawId = req.params.id ?? req.params.scheduleId;
    const id = parseId(rawId);
    if (!id)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule id" });

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
      total_slots === undefined
    ) {
      return res.status(400).json({
        status: "error",
        message:
          "course_id, instructor_id, schedule_date, start_time, total_slots are required",
      });
    }

    let slots = Number(total_slots);
    if (!Number.isFinite(slots) || slots < 0) {
      return res
        .status(400)
        .json({
          status: "error",
          message: "total_slots must be a number >= 0",
        });
    }

    await conn.beginTransaction();

    const [curRows] = await conn.execute(
      `SELECT schedule_id, course_id, instructor_id, schedule_date, start_time, end_time, total_slots, status
       FROM schedules WHERE schedule_id = ? LIMIT 1`,
      [id],
    );
    if (!curRows.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    }
    const cur = curRows[0];

    const [courseRows] = await conn.execute(
      `SELECT id, course_name FROM courses WHERE id = ? LIMIT 1`,
      [Number(course_id)],
    );
    if (!courseRows.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }
    const courseName = courseRows[0].course_name;

    const [instRows] = await conn.execute(
      `SELECT instructor_id FROM instructors WHERE instructor_id = ? LIMIT 1`,
      [Number(instructor_id)],
    );
    if (!instRows.length) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Instructor not found" });
    }

    // reservations: cannot reduce below reserved
    const placeholders = OCCUPYING_STATUSES.map(() => "?").join(",");
    const [cntRows] = await conn.execute(
      `
      SELECT COUNT(*) AS reservedCount
      FROM schedule_reservations
      WHERE schedule_id = ?
        AND UPPER(reservation_status) IN (${placeholders})
      `,
      [id, ...OCCUPYING_STATUSES],
    );
    const reservedCount = Number(cntRows[0]?.reservedCount || 0);
    if (slots < reservedCount) {
      await conn.rollback();
      return res.status(400).json({
        status: "error",
        message: `total_slots cannot be less than reserved (${reservedCount})`,
      });
    }

    let normalizedStatus =
      String(status || "open").toLowerCase() === "closed" ? "closed" : "open";
    const rule = getDrivingRule(courseName);

    let finalStart = String(start_time);
    let finalEnd = String(end_time || "");

    if (!rule) {
      if (!finalEnd) {
        await conn.rollback();
        return res
          .status(400)
          .json({
            status: "error",
            message: "end_time is required for non-driving courses",
          });
      }
      const facetErr = ensureWithinFacetHours(finalStart, finalEnd);
      if (facetErr) {
        await conn.rollback();
        return res.status(400).json({ status: "error", message: facetErr });
      }
    } else {
      const sessions = buildSessionsFromRule(
        { schedule_date, start_time },
        rule,
      );

      if (rule.kind === "TDC") {
        // block Day-2 edit
        const isDay2 = await isTdcDay2Row(conn, {
          course_id: Number(cur.course_id),
          instructor_id: Number(cur.instructor_id),
          schedule_date: String(cur.schedule_date),
          start_time: String(cur.start_time),
          end_time: String(cur.end_time),
        });

        if (isDay2) {
          await conn.rollback();
          return res.status(400).json({
            status: "error",
            message:
              "For TDC, please edit Day 1 schedule only (Day 2 is auto-managed).",
          });
        }

        // force full day time
        finalStart = "08:00";
        finalEnd = "17:00";

        // weekly cap check (Day-1 only)
        if (slots > TDC_WEEKLY_CAP) slots = TDC_WEEKLY_CAP;

        const range = getWeekRangeMonSun(schedule_date);
        if (!range) {
          await conn.rollback();
          return res
            .status(400)
            .json({ status: "error", message: "Invalid schedule_date" });
        }

        const used = await getTdcWeekUsedSlots(conn, {
          course_id,
          weekStart: range.weekStart,
          weekEnd: range.weekEnd,
          excludeScheduleId: id,
        });

        const remaining = Math.max(TDC_WEEKLY_CAP - used, 0);
        if (slots > remaining) {
          await conn.rollback();
          return res.status(400).json({
            status: "error",
            message: `TDC weekly limit is ${TDC_WEEKLY_CAP} slots. Remaining this week: ${remaining}.`,
          });
        }
      } else {
        // PDC_* uses generated session[0]
        finalStart = sessions[0].start_time;
        finalEnd = sessions[0].end_time;
      }

      const facetErr = ensureWithinFacetHours(finalStart, finalEnd);
      if (facetErr) {
        await conn.rollback();
        return res.status(400).json({ status: "error", message: facetErr });
      }
    }

    const [result] = await conn.execute(
      `
      UPDATE schedules
      SET course_id=?, instructor_id=?, schedule_date=?, start_time=?, end_time=?, total_slots=?, status=?, updated_at=CURRENT_TIMESTAMP
      WHERE schedule_id=?
      `,
      [
        Number(course_id),
        Number(instructor_id),
        schedule_date,
        finalStart,
        finalEnd,
        slots,
        normalizedStatus,
        id,
      ],
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Schedule not found" });
    }

    // ✅ If driving PDC_AB: upsert Day-2 same time + same slots/status (optional but consistent)
    if (rule && rule.kind === "PDC_AB") {
      const day2date = addDaysYMD(schedule_date, 1);
      const [d2Rows] = await conn.execute(
        `
        SELECT schedule_id
        FROM schedules
        WHERE course_id=? AND instructor_id=? AND schedule_date=?
        ORDER BY schedule_id DESC
        LIMIT 1
        `,
        [Number(course_id), Number(instructor_id), day2date],
      );

      if (d2Rows.length) {
        await conn.execute(
          `UPDATE schedules SET start_time=?, end_time=?, total_slots=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE schedule_id=?`,
          [
            finalStart,
            finalEnd,
            slots,
            normalizedStatus,
            Number(d2Rows[0].schedule_id),
          ],
        );
      } else {
        await conn.execute(
          `
          INSERT INTO schedules (course_id, instructor_id, schedule_date, start_time, end_time, total_slots, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          `,
          [
            Number(course_id),
            Number(instructor_id),
            day2date,
            finalStart,
            finalEnd,
            slots,
            normalizedStatus,
          ],
        );
      }
    }

    // ✅ If driving TDC: enforce Day-2 exists + SAME slots/status + forced 08–17
    if (rule && rule.kind === "TDC") {
      await upsertTdcDay2(conn, {
        course_id: Number(course_id),
        instructor_id: Number(instructor_id),
        day1_date: String(schedule_date),
        slots,
        status: normalizedStatus,
      });
    }

    await conn.commit();
    return res.json({ status: "success", message: "Schedule updated" });
  } catch (err) {
    try {
      await conn.rollback();
    } catch (_) {}
    console.error("updateSchedule error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  } finally {
    conn.release();
  }
};

/**
 * DELETE /api/admin/schedules/:id  (or :scheduleId)
 */
exports.deleteSchedule = async (req, res) => {
  try {
    const rawId = req.params.id ?? req.params.scheduleId;
    const id = parseId(rawId);
    if (!id)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid schedule id" });

    const placeholders = OCCUPYING_STATUSES.map(() => "?").join(",");

    const [cntRows] = await pool.execute(
      `
      SELECT COUNT(*) AS reservedCount
      FROM schedule_reservations
      WHERE schedule_id = ?
        AND UPPER(reservation_status) IN (${placeholders})
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
