// backend/src/controllers/adminReportsController.js
const pool = require("../config/database.js");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

// ------------------------
// helpers
// ------------------------
function toISODate(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toISOString().slice(0, 10);
}

function getDateRange(req) {
  const from = toISODate(req.query.from);
  const to = toISODate(req.query.to);

  // fallback: this month
  if (!from || !to) {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth();
    const a = new Date(y, m, 1);
    const b = new Date(y, m + 1, 1);
    return { from: toISODate(a), to: toISODate(b) };
  }

  // make "to" exclusive (+1 day)
  const toPlus = new Date(to);
  toPlus.setDate(toPlus.getDate() + 1);
  return { from, to: toISODate(toPlus) };
}

function safeInt(v, fallback = 0) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

function safeStr(v) {
  return String(v ?? "").trim();
}

function safeLike(v) {
  return String(v ?? "")
    .trim()
    .replace(/[%_]/g, (m) => "\\" + m);
}

function clampLimitOffset(page, limit) {
  const p = Math.max(1, safeInt(page, 1));
  const l = Math.min(200, Math.max(1, safeInt(limit, 20)));
  const offset = (p - 1) * l;
  return { page: p, limit: l, offset };
}

// DONE logic from schedule_reservations (source of truth)
function isDoneConditionSql() {
  return `(sr.done_at IS NOT NULL OR UPPER(sr.reservation_status) IN ('DONE','COMPLETED','FINISHED'))`;
}

/**
 * Join latest payment submission per tuple (schedule_id, student_id, course_id)
 * to avoid duplicate rows.
 */
function latestSubmissionJoinSql() {
  return `
    LEFT JOIN (
      SELECT schedule_id, student_id, course_id, MAX(id) AS last_id
      FROM student_payment_submissions
      GROUP BY schedule_id, student_id, course_id
    ) sps_last
      ON sps_last.schedule_id = sr.schedule_id
     AND sps_last.student_id = sr.student_id
     AND sps_last.course_id = sr.course_id
    LEFT JOIN student_payment_submissions sps
      ON sps.id = sps_last.last_id
  `;
}

// ------------------------
// EXPORT helpers
// ------------------------
function getExportFormat(req) {
  const f = safeStr(req.query.format).toLowerCase();
  if (f === "xlsx" || f === "csv" || f === "pdf") return f;
  return "xlsx";
}

function makeFileName(base, format) {
  const ts = new Date().toISOString().slice(0, 10);
  return `${base}-${ts}.${format}`;
}

function setDownloadHeaders(res, contentType, filename) {
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
}

async function exportAsXlsx(res, sheetName, columns, rows, baseName) {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);

  ws.columns = columns; // [{ header, key, width }]
  ws.addRows(rows);

  ws.getRow(1).font = { bold: true };
  ws.views = [{ state: "frozen", ySplit: 1 }];

  setDownloadHeaders(
    res,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    makeFileName(baseName, "xlsx"),
  );

  await wb.xlsx.write(res);
  res.end();
}

function exportAsCsv(res, columns, rows, baseName) {
  const headers = columns.map((c) => c.header);
  const keys = columns.map((c) => c.key);

  const esc = (val) => {
    const s = String(val ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [];
  lines.push(headers.map(esc).join(","));
  for (const r of rows) {
    lines.push(keys.map((k) => esc(r[k])).join(","));
  }

  setDownloadHeaders(
    res,
    "text/csv; charset=utf-8",
    makeFileName(baseName, "csv"),
  );
  res.send(lines.join("\n"));
}

function exportAsPdfSimple(res, title, columns, rows, baseName) {
  setDownloadHeaders(res, "application/pdf", makeFileName(baseName, "pdf"));

  const doc = new PDFDocument({ size: "A4", margin: 36 });
  doc.pipe(res);

  doc.fontSize(14).text(title);
  doc.moveDown(0.75);

  // Header line
  doc.fontSize(9).text(columns.map((c) => c.header).join(" | "));
  doc.moveDown(0.25);
  doc.text("-".repeat(110));
  doc.moveDown(0.25);

  const keys = columns.map((c) => c.key);
  doc.fontSize(9);

  for (const r of rows) {
    const line = keys.map((k) => String(r[k] ?? "")).join(" | ");
    doc.text(line);
  }

  doc.end();
}

// ------------------------
// CONTROLLERS (existing)
// ------------------------

// GET /api/admin/reports/detailed?from&to&course_id&gender&payment_method&status&page&limit&q
exports.getDetailed = async (req, res) => {
  try {
    const { from, to } = getDateRange(req);

    const courseId = safeStr(req.query.course_id);
    const gender = safeStr(req.query.gender).toLowerCase();
    const paymentMethod = safeStr(req.query.payment_method).toUpperCase(); // CASH / GCASH
    const status = safeStr(req.query.status).toLowerCase(); // done / pending
    const q = safeStr(req.query.q);

    const { page, limit, offset } = clampLimitOffset(
      req.query.page,
      req.query.limit,
    );

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }

    if (gender === "male" || gender === "female") {
      where += ` AND LOWER(u.gender) = ?`;
      params.push(gender);
    }

    if (paymentMethod === "CASH" || paymentMethod === "GCASH") {
      where += ` AND UPPER(sr.payment_method) = ?`;
      params.push(paymentMethod);
    }

    if (status === "done") where += ` AND ${isDoneConditionSql()}`;
    else if (status === "pending") where += ` AND NOT ${isDoneConditionSql()}`;

    if (q) {
      const like = `%${safeLike(q)}%`;
      where += `
        AND (
          u.fullname LIKE ? OR
          CAST(sr.student_id AS CHAR) LIKE ? OR
          c.course_name LIKE ? OR
          sps.payment_ref LIKE ?
        )
      `;
      params.push(like, like, like, like);
    }

    const [countRows] = await pool.execute(
      `
      SELECT COUNT(*) AS total
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      LEFT JOIN schedules s ON s.schedule_id = sr.schedule_id
      LEFT JOIN instructors i ON i.instructor_id = s.instructor_id
      ${latestSubmissionJoinSql()}
      ${where}
      `,
      params,
    );

    const total = safeInt(countRows?.[0]?.total, 0);

    const sql = `
      SELECT
        sr.reservation_id,
        sr.schedule_id,
        sr.student_id,
        sr.course_id,
        sr.reservation_source,
        sr.reservation_status,

        sr.payment_method,
        sr.fee_option_code,
        sr.notes,

        sr.created_by,
        sr.created_at,
        sr.updated_at,
        sr.requirements_mode,
        sr.expires_at,
        sr.done_at,

        u.id AS client_id,
        u.fullname,
        u.gender,
        u.birthday,

        c.course_name,
        c.course_fee,

        s.schedule_date,
        s.start_time,
        s.end_time,
        s.instructor_id,
        i.fullname AS instructor_name,

        sps.payment_ref,
        sps.status AS submission_status,
        sps.verified_at,
        sps.amount_centavos,
        sps.currency,

        COALESCE(s.schedule_date, DATE(sr.created_at)) AS course_start,
        COALESCE(s.schedule_date, DATE(sr.created_at)) AS course_end,

        CASE WHEN ${isDoneConditionSql()} THEN 'DONE' ELSE 'PENDING' END AS derived_status

      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      LEFT JOIN schedules s ON s.schedule_id = sr.schedule_id
      LEFT JOIN instructors i ON i.instructor_id = s.instructor_id
      ${latestSubmissionJoinSql()}
      ${where}
      ORDER BY sr.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await pool.execute(sql, params);

    return res.json({
      status: "success",
      data: rows,
      meta: {
        from,
        to,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error("getDetailed error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load detailed report",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/summary?from&to&course_id&gender
exports.getSummary = async (req, res) => {
  try {
    const { from, to } = getDateRange(req);

    const courseId = safeStr(req.query.course_id);
    const gender = safeStr(req.query.gender).toLowerCase();

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }
    if (gender === "male" || gender === "female") {
      where += ` AND LOWER(u.gender) = ?`;
      params.push(gender);
    }

    const [[{ totalEnrolled }]] = await pool.execute(
      `
      SELECT COUNT(*) AS totalEnrolled
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      ${where}
      `,
      params,
    );

    const [popularRows] = await pool.execute(
      `
      SELECT c.course_name AS name, COUNT(*) AS cnt
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      LEFT JOIN users u ON u.id = sr.student_id
      ${where}
      GROUP BY sr.course_id
      ORDER BY cnt DESC
      LIMIT 1
      `,
      params,
    );

    const mostPopularCourse = popularRows.length ? popularRows[0].name : "";

    // Revenue in summary: DONE only
    let doneWhere = `WHERE sr.created_at >= ? AND sr.created_at < ? AND ${isDoneConditionSql()}`;
    const doneParams = [from, to];

    if (courseId) {
      doneWhere += ` AND sr.course_id = ?`;
      doneParams.push(courseId);
    }
    if (gender === "male" || gender === "female") {
      doneWhere += ` AND LOWER(u.gender) = ?`;
      doneParams.push(gender);
    }

    const [revRows] = await pool.execute(
      `
      SELECT
        COUNT(*) AS doneCount,
        COALESCE(SUM(
          CASE
            WHEN sps.amount_centavos IS NOT NULL THEN ROUND(sps.amount_centavos / 100, 2)
            ELSE COALESCE(c.course_fee, 0)
          END
        ), 0) AS totalRevenuePeso
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      ${latestSubmissionJoinSql()}
      ${doneWhere}
      `,
      doneParams,
    );

    return res.json({
      status: "success",
      data: {
        from,
        to,
        totalEnrolled: safeInt(totalEnrolled, 0),
        mostPopularCourse,
        completionRate: 0,
        certIssued: 0,
        totalRevenuePeso: Number(revRows?.[0]?.totalRevenuePeso || 0),
        doneCount: safeInt(revRows?.[0]?.doneCount || 0),
      },
    });
  } catch (err) {
    console.error("getSummary error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load summary report",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/trend?from&to&period=day|week|month&course_id&gender
exports.getTrend = async (req, res) => {
  try {
    const { from, to } = getDateRange(req);

    const period = safeStr(req.query.period || "month").toLowerCase();
    const courseId = safeStr(req.query.course_id);
    const gender = safeStr(req.query.gender).toLowerCase();

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }
    if (gender === "male" || gender === "female") {
      where += ` AND LOWER(u.gender) = ?`;
      params.push(gender);
    }

    let labelExpr = `DATE_FORMAT(sr.created_at, '%Y-%m')`;
    if (period === "day") labelExpr = `DATE_FORMAT(sr.created_at, '%Y-%m-%d')`;
    if (period === "week") {
      labelExpr = `CONCAT(YEAR(sr.created_at), '-W', LPAD(WEEK(sr.created_at, 1), 2, '0'))`;
    }

    const [rows] = await pool.execute(
      `
      SELECT ${labelExpr} AS label, COUNT(*) AS cnt
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      ${where}
      GROUP BY label
      ORDER BY label ASC
      `,
      params,
    );

    return res.json({
      status: "success",
      data: {
        from,
        to,
        period,
        labels: rows.map((r) => String(r.label)),
        values: rows.map((r) => safeInt(r.cnt, 0)),
      },
    });
  } catch (err) {
    console.error("getTrend error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load trend report",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/top-courses?from&to&course_id&gender
exports.getTopCourses = async (req, res) => {
  try {
    const { from, to } = getDateRange(req);

    const courseId = safeStr(req.query.course_id);
    const gender = safeStr(req.query.gender).toLowerCase();

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }
    if (gender === "male" || gender === "female") {
      where += ` AND LOWER(u.gender) = ?`;
      params.push(gender);
    }

    const [rows] = await pool.execute(
      `
      SELECT c.course_name AS name, COUNT(*) AS students
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      LEFT JOIN users u ON u.id = sr.student_id
      ${where}
      GROUP BY sr.course_id
      ORDER BY students DESC
      LIMIT 10
      `,
      params,
    );

    return res.json({
      status: "success",
      data: {
        labels: rows.map((r) => r.name),
        values: rows.map((r) => safeInt(r.students, 0)),
      },
    });
  } catch (err) {
    console.error("getTopCourses error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load top courses chart",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/gender-breakdown?from&to&course_id
exports.getGenderBreakdown = async (req, res) => {
  try {
    const { from, to } = getDateRange(req);
    const courseId = safeStr(req.query.course_id);

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        SUM(CASE WHEN LOWER(u.gender) = 'male' THEN 1 ELSE 0 END) AS maleCount,
        SUM(CASE WHEN LOWER(u.gender) = 'female' THEN 1 ELSE 0 END) AS femaleCount
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      ${where}
      `,
      params,
    );

    const male = safeInt(rows?.[0]?.maleCount, 0);
    const female = safeInt(rows?.[0]?.femaleCount, 0);

    return res.json({
      status: "success",
      data: { labels: ["Male", "Female"], values: [male, female] },
    });
  } catch (err) {
    console.error("getGenderBreakdown error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load gender breakdown",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/course-monthly-preview?from&to&course_id
exports.getCourseMonthlyPreview = async (req, res) => {
  try {
    const { from, to } = getDateRange(req);
    const courseId = safeStr(req.query.course_id);

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        DATE_FORMAT(sr.created_at, '%Y-%m') AS month_label,
        c.course_name,
        COUNT(*) AS count
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      ${where}
      GROUP BY month_label, sr.course_id
      ORDER BY month_label DESC, count DESC
      LIMIT 50
      `,
      params,
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getCourseMonthlyPreview error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load course monthly preview",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/revenue-preview?from&to&course_id&payment_method
exports.getRevenuePreview = async (req, res) => {
  try {
    const { from, to } = getDateRange(req);

    const courseId = safeStr(req.query.course_id);
    const paymentMethod = safeStr(req.query.payment_method).toUpperCase(); // GCASH / CASH

    const dateExpr = `COALESCE(sr.done_at, sr.updated_at, sr.created_at)`;

    let where = `WHERE ${dateExpr} >= ? AND ${dateExpr} < ? AND ${isDoneConditionSql()}`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }

    if (paymentMethod === "GCASH" || paymentMethod === "CASH") {
      where += ` AND UPPER(sr.payment_method) = ?`;
      params.push(paymentMethod);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        sr.reservation_id,
        sr.payment_method AS reservation_payment_method,
        sr.reservation_status,
        sr.done_at,
        ${dateExpr} AS sort_date,

        u.fullname,
        c.course_name,

        sps.id AS submission_id,
        sps.payment_ref,
        sps.verified_at AS submission_verified_at,
        sps.created_at AS submission_created_at,

        CASE
          WHEN sps.amount_centavos IS NOT NULL THEN ROUND(sps.amount_centavos / 100, 2)
          ELSE COALESCE(c.course_fee, 0)
        END AS amount_peso

      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      ${latestSubmissionJoinSql()}
      ${where}
      ORDER BY sort_date DESC
      LIMIT 500
      `,
      params,
    );

    const doneCount = rows.length;
    const totalRevenuePeso = rows.reduce(
      (acc, r) => acc + Number(r.amount_peso || 0),
      0,
    );
    const avgFeePeso = doneCount ? Math.round(totalRevenuePeso / doneCount) : 0;

    return res.json({
      status: "success",
      data: {
        verifiedCount: doneCount,
        verifiedRevenuePeso: totalRevenuePeso,
        doneCount,
        totalRevenuePeso,
        avgFeePeso,
        forecastRevenuePeso: 0,
        payments: rows.map((p) => ({
          reservation_id: p.reservation_id,
          payment_ref: p.payment_ref || null,
          fullname: p.fullname || null,
          course_name: p.course_name || null,
          payment_method: p.reservation_payment_method || null,
          amount_peso: Number(p.amount_peso || 0),
          status: "DONE",
          verified_at: p.submission_verified_at || null,
          created_at: p.submission_created_at || p.sort_date || null,
        })),
      },
    });
  } catch (err) {
    console.error("getRevenuePreview error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load revenue preview",
      debug: err.sqlMessage || err.message,
    });
  }
};

// ------------------------
// ✅ EXPORT CONTROLLERS
// ------------------------

// GET /api/admin/reports/export/overview?from&to&course_id&format
exports.exportOverview = async (req, res) => {
  try {
    const format = getExportFormat(req);
    const { from, to } = getDateRange(req);

    const courseId = safeStr(req.query.course_id);
    const gender = safeStr(req.query.gender).toLowerCase();

    // reuse summary logic (same filters)
    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }
    if (gender === "male" || gender === "female") {
      where += ` AND LOWER(u.gender) = ?`;
      params.push(gender);
    }

    const [[{ totalEnrolled }]] = await pool.execute(
      `
      SELECT COUNT(*) AS totalEnrolled
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      ${where}
      `,
      params,
    );

    const [popularRows] = await pool.execute(
      `
      SELECT c.course_name AS name, COUNT(*) AS cnt
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      LEFT JOIN users u ON u.id = sr.student_id
      ${where}
      GROUP BY sr.course_id
      ORDER BY cnt DESC
      LIMIT 1
      `,
      params,
    );

    const mostPopularCourse = popularRows.length ? popularRows[0].name : "";

    // revenue summary (DONE only)
    let doneWhere = `WHERE sr.created_at >= ? AND sr.created_at < ? AND ${isDoneConditionSql()}`;
    const doneParams = [from, to];

    if (courseId) {
      doneWhere += ` AND sr.course_id = ?`;
      doneParams.push(courseId);
    }
    if (gender === "male" || gender === "female") {
      doneWhere += ` AND LOWER(u.gender) = ?`;
      doneParams.push(gender);
    }

    const [revRows] = await pool.execute(
      `
      SELECT
        COUNT(*) AS doneCount,
        COALESCE(SUM(
          CASE
            WHEN sps.amount_centavos IS NOT NULL THEN ROUND(sps.amount_centavos / 100, 2)
            ELSE COALESCE(c.course_fee, 0)
          END
        ), 0) AS totalRevenuePeso
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      ${latestSubmissionJoinSql()}
      ${doneWhere}
      `,
      doneParams,
    );

    const columns = [
      { header: "Metric", key: "metric", width: 28 },
      { header: "Value", key: "value", width: 40 },
    ];

    const rows = [
      { metric: "From", value: from },
      { metric: "To (exclusive)", value: to },
      { metric: "Course ID", value: courseId || "All" },
      { metric: "Gender", value: gender || "All" },

      { metric: "Total Enrolled", value: safeInt(totalEnrolled, 0) },
      { metric: "Most Popular Course", value: mostPopularCourse || "-" },
      { metric: "Done Count", value: safeInt(revRows?.[0]?.doneCount || 0, 0) },
      {
        metric: "Total Revenue (Peso)",
        value: Number(revRows?.[0]?.totalRevenuePeso || 0),
      },

      { metric: "Completion Rate", value: "0" },
      { metric: "Certificates Issued", value: "0" },
    ];

    if (format === "csv") return exportAsCsv(res, columns, rows, "overview");
    if (format === "pdf")
      return exportAsPdfSimple(
        res,
        "Overview Export",
        columns,
        rows,
        "overview",
      );
    return await exportAsXlsx(res, "Overview", columns, rows, "overview");
  } catch (err) {
    console.error("exportOverview error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to export overview",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/export/top-courses?from&to&course_id&gender&format
exports.exportTopCourses = async (req, res) => {
  try {
    const format = getExportFormat(req);
    const { from, to } = getDateRange(req);

    const courseId = safeStr(req.query.course_id);
    const gender = safeStr(req.query.gender).toLowerCase();

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }
    if (gender === "male" || gender === "female") {
      where += ` AND LOWER(u.gender) = ?`;
      params.push(gender);
    }

    const [rows] = await pool.execute(
      `
      SELECT c.course_name AS course_name, COUNT(*) AS students
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      LEFT JOIN users u ON u.id = sr.student_id
      ${where}
      GROUP BY sr.course_id
      ORDER BY students DESC
      LIMIT 50
      `,
      params,
    );

    const columns = [
      { header: "Course", key: "course_name", width: 35 },
      { header: "Enrollments", key: "students", width: 14 },
    ];

    const out = rows.map((r) => ({
      course_name: r.course_name,
      students: safeInt(r.students, 0),
    }));

    if (format === "csv") return exportAsCsv(res, columns, out, "top-courses");
    if (format === "pdf")
      return exportAsPdfSimple(
        res,
        "Top Courses Export",
        columns,
        out,
        "top-courses",
      );
    return await exportAsXlsx(res, "TopCourses", columns, out, "top-courses");
  } catch (err) {
    console.error("exportTopCourses error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to export top courses",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/export/course-monthly?from&to&course_id&format
exports.exportCourseMonthly = async (req, res) => {
  try {
    const format = getExportFormat(req);
    const { from, to } = getDateRange(req);
    const courseId = safeStr(req.query.course_id);

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        DATE_FORMAT(sr.created_at, '%Y-%m') AS month_label,
        c.course_name,
        COUNT(*) AS count
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      ${where}
      GROUP BY month_label, sr.course_id
      ORDER BY month_label DESC, count DESC
      `,
      params,
    );

    const columns = [
      { header: "Month", key: "month_label", width: 14 },
      { header: "Course", key: "course_name", width: 36 },
      { header: "Enrollments", key: "count", width: 14 },
    ];

    const out = rows.map((r) => ({
      month_label: r.month_label,
      course_name: r.course_name,
      count: safeInt(r.count, 0),
    }));

    if (format === "csv")
      return exportAsCsv(res, columns, out, "course-monthly");
    if (format === "pdf")
      return exportAsPdfSimple(
        res,
        "Course Monthly Export",
        columns,
        out,
        "course-monthly",
      );
    return await exportAsXlsx(
      res,
      "CourseMonthly",
      columns,
      out,
      "course-monthly",
    );
  } catch (err) {
    console.error("exportCourseMonthly error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to export course monthly",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/export/revenue?from&to&course_id&payment_method&format
exports.exportRevenue = async (req, res) => {
  try {
    const format = getExportFormat(req);
    const { from, to } = getDateRange(req);

    const courseId = safeStr(req.query.course_id);
    const paymentMethod = safeStr(req.query.payment_method).toUpperCase();

    const dateExpr = `COALESCE(sr.done_at, sr.updated_at, sr.created_at)`;

    let where = `WHERE ${dateExpr} >= ? AND ${dateExpr} < ? AND ${isDoneConditionSql()}`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }
    if (paymentMethod === "GCASH" || paymentMethod === "CASH") {
      where += ` AND UPPER(sr.payment_method) = ?`;
      params.push(paymentMethod);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        sr.reservation_id,
        ${dateExpr} AS sort_date,
        u.fullname,
        c.course_name,
        sr.payment_method,
        sps.payment_ref,
        sps.verified_at,
        sps.created_at AS submission_created_at,
        CASE
          WHEN sps.amount_centavos IS NOT NULL THEN ROUND(sps.amount_centavos / 100, 2)
          ELSE COALESCE(c.course_fee, 0)
        END AS amount_peso
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      ${latestSubmissionJoinSql()}
      ${where}
      ORDER BY sort_date DESC
      LIMIT 5000
      `,
      params,
    );

    const columns = [
      { header: "Reservation ID", key: "reservation_id", width: 14 },
      { header: "Student", key: "fullname", width: 28 },
      { header: "Course", key: "course_name", width: 26 },
      { header: "Method", key: "payment_method", width: 10 },
      { header: "Amount (₱)", key: "amount_peso", width: 12 },
      { header: "Payment Ref", key: "payment_ref", width: 18 },
      { header: "Verified At", key: "verified_at", width: 18 },
      { header: "Date", key: "sort_date", width: 16 },
    ];

    const out = rows.map((r) => ({
      reservation_id: r.reservation_id,
      fullname: r.fullname || "",
      course_name: r.course_name || "",
      payment_method: r.payment_method || "",
      amount_peso: Number(r.amount_peso || 0),
      payment_ref: r.payment_ref || "",
      verified_at: r.verified_at ? toISODate(r.verified_at) : "",
      sort_date: r.sort_date ? toISODate(r.sort_date) : "",
    }));

    if (format === "csv") return exportAsCsv(res, columns, out, "revenue");
    if (format === "pdf")
      return exportAsPdfSimple(
        res,
        "Revenue Export (DONE)",
        columns,
        out,
        "revenue",
      );
    return await exportAsXlsx(res, "Revenue", columns, out, "revenue");
  } catch (err) {
    console.error("exportRevenue error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to export revenue",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/export/detailed?from&to&course_id&gender&payment_method&status&format
exports.exportDetailed = async (req, res) => {
  try {
    const format = getExportFormat(req);
    const { from, to } = getDateRange(req);

    const courseId = safeStr(req.query.course_id);
    const gender = safeStr(req.query.gender).toLowerCase();
    const paymentMethod = safeStr(req.query.payment_method).toUpperCase();
    const status = safeStr(req.query.status).toLowerCase();
    const q = safeStr(req.query.q);

    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];

    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }
    if (gender === "male" || gender === "female") {
      where += ` AND LOWER(u.gender) = ?`;
      params.push(gender);
    }
    if (paymentMethod === "CASH" || paymentMethod === "GCASH") {
      where += ` AND UPPER(sr.payment_method) = ?`;
      params.push(paymentMethod);
    }
    if (status === "done") where += ` AND ${isDoneConditionSql()}`;
    else if (status === "pending") where += ` AND NOT ${isDoneConditionSql()}`;

    if (q) {
      const like = `%${safeLike(q)}%`;
      where += `
        AND (
          u.fullname LIKE ? OR
          CAST(sr.student_id AS CHAR) LIKE ? OR
          c.course_name LIKE ? OR
          sps.payment_ref LIKE ?
        )
      `;
      params.push(like, like, like, like);
    }

    const [rows] = await pool.execute(
      `
      SELECT
        sr.reservation_id,
        sr.schedule_id,
        sr.student_id,
        u.fullname,
        u.gender,
        u.birthday,
        c.course_name,
        i.fullname AS instructor_name,
        sr.reservation_source,
        sr.reservation_status,
        CASE WHEN ${isDoneConditionSql()} THEN 'DONE' ELSE 'PENDING' END AS derived_status,
        sr.payment_method,
        sps.payment_ref,
        sps.status AS submission_status,
        sps.verified_at,
        CASE
          WHEN sps.amount_centavos IS NOT NULL THEN ROUND(sps.amount_centavos / 100, 2)
          ELSE COALESCE(c.course_fee, 0)
        END AS amount_peso,
        sr.created_at,
        sr.done_at
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      LEFT JOIN schedules s ON s.schedule_id = sr.schedule_id
      LEFT JOIN instructors i ON i.instructor_id = s.instructor_id
      ${latestSubmissionJoinSql()}
      ${where}
      ORDER BY sr.created_at DESC
      LIMIT 10000
      `,
      params,
    );

    const columns = [
      { header: "Reservation ID", key: "reservation_id", width: 14 },
      { header: "Schedule ID", key: "schedule_id", width: 12 },
      { header: "Student ID", key: "student_id", width: 10 },
      { header: "Full Name", key: "fullname", width: 26 },
      { header: "Gender", key: "gender", width: 8 },
      { header: "Birthdate", key: "birthday", width: 12 },
      { header: "Course", key: "course_name", width: 22 },
      { header: "Instructor", key: "instructor_name", width: 22 },
      { header: "Source", key: "reservation_source", width: 10 },
      { header: "Status", key: "reservation_status", width: 12 },
      { header: "Derived", key: "derived_status", width: 10 },
      { header: "Payment Method", key: "payment_method", width: 12 },
      { header: "Payment Ref", key: "payment_ref", width: 18 },
      { header: "Submission Status", key: "submission_status", width: 16 },
      { header: "Verified At", key: "verified_at", width: 14 },
      { header: "Amount (₱)", key: "amount_peso", width: 12 },
      { header: "Created At", key: "created_at", width: 16 },
      { header: "Done At", key: "done_at", width: 16 },
    ];

    const out = rows.map((r) => ({
      reservation_id: r.reservation_id,
      schedule_id: r.schedule_id,
      student_id: r.student_id,
      fullname: r.fullname || "",
      gender: r.gender || "",
      birthday: r.birthday ? toISODate(r.birthday) : "",
      course_name: r.course_name || "",
      instructor_name: r.instructor_name || "",
      reservation_source: r.reservation_source || "",
      reservation_status: r.reservation_status || "",
      derived_status: r.derived_status || "",
      payment_method: r.payment_method || "",
      payment_ref: r.payment_ref || "",
      submission_status: r.submission_status || "",
      verified_at: r.verified_at ? toISODate(r.verified_at) : "",
      amount_peso: Number(r.amount_peso || 0),
      created_at: r.created_at ? toISODate(r.created_at) : "",
      done_at: r.done_at ? toISODate(r.done_at) : "",
    }));

    if (format === "csv") return exportAsCsv(res, columns, out, "detailed");
    if (format === "pdf")
      return exportAsPdfSimple(
        res,
        "Detailed Export",
        columns,
        out,
        "detailed",
      );
    return await exportAsXlsx(res, "Detailed", columns, out, "detailed");
  } catch (err) {
    console.error("exportDetailed error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to export detailed",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET /api/admin/reports/export/all?from&to&course_id&format=xlsx
exports.exportAll = async (req, res) => {
  try {
    const format = getExportFormat(req);
    if (format !== "xlsx") {
      // easiest behavior: if not xlsx, export overview only
      return exports.exportOverview(req, res);
    }

    const { from, to } = getDateRange(req);
    const courseId = safeStr(req.query.course_id);

    // build data by calling the same queries used above
    // (fast enough for admin; if heavy later, optimize)
    // Overview = summary metrics
    const fakeReq = { query: { ...req.query, from, to, course_id: courseId } };

    // Use DB queries directly (avoid calling res.json)
    // Overview sheet
    let where = `WHERE sr.created_at >= ? AND sr.created_at < ?`;
    const params = [from, to];
    if (courseId) {
      where += ` AND sr.course_id = ?`;
      params.push(courseId);
    }

    const [[{ totalEnrolled }]] = await pool.execute(
      `
      SELECT COUNT(*) AS totalEnrolled
      FROM schedule_reservations sr
      ${where}
      `,
      params,
    );

    const [popularRows] = await pool.execute(
      `
      SELECT c.course_name AS name, COUNT(*) AS cnt
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      ${where}
      GROUP BY sr.course_id
      ORDER BY cnt DESC
      LIMIT 1
      `,
      params,
    );
    const mostPopularCourse = popularRows.length ? popularRows[0].name : "";

    // Revenue total (DONE)
    let doneWhere = `WHERE sr.created_at >= ? AND sr.created_at < ? AND ${isDoneConditionSql()}`;
    const doneParams = [from, to];
    if (courseId) {
      doneWhere += ` AND sr.course_id = ?`;
      doneParams.push(courseId);
    }
    const [revRows] = await pool.execute(
      `
      SELECT
        COUNT(*) AS doneCount,
        COALESCE(SUM(
          CASE
            WHEN sps.amount_centavos IS NOT NULL THEN ROUND(sps.amount_centavos / 100, 2)
            ELSE COALESCE(c.course_fee, 0)
          END
        ), 0) AS totalRevenuePeso
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      ${latestSubmissionJoinSql()}
      ${doneWhere}
      `,
      doneParams,
    );

    // Top courses
    const [topRows] = await pool.execute(
      `
      SELECT c.course_name AS course_name, COUNT(*) AS students
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      ${where}
      GROUP BY sr.course_id
      ORDER BY students DESC
      LIMIT 50
      `,
      params,
    );

    // Course monthly
    const [monthlyRows] = await pool.execute(
      `
      SELECT
        DATE_FORMAT(sr.created_at, '%Y-%m') AS month_label,
        c.course_name,
        COUNT(*) AS count
      FROM schedule_reservations sr
      LEFT JOIN courses c ON c.id = sr.course_id
      ${where}
      GROUP BY month_label, sr.course_id
      ORDER BY month_label DESC, count DESC
      `,
      params,
    );

    // Revenue list (DONE)
    const dateExpr = `COALESCE(sr.done_at, sr.updated_at, sr.created_at)`;
    let revWhere = `WHERE ${dateExpr} >= ? AND ${dateExpr} < ? AND ${isDoneConditionSql()}`;
    const revParams = [from, to];
    if (courseId) {
      revWhere += ` AND sr.course_id = ?`;
      revParams.push(courseId);
    }
    const [revenueList] = await pool.execute(
      `
      SELECT
        sr.reservation_id,
        ${dateExpr} AS sort_date,
        u.fullname,
        c.course_name,
        sr.payment_method,
        sps.payment_ref,
        sps.verified_at,
        CASE
          WHEN sps.amount_centavos IS NOT NULL THEN ROUND(sps.amount_centavos / 100, 2)
          ELSE COALESCE(c.course_fee, 0)
        END AS amount_peso
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      ${latestSubmissionJoinSql()}
      ${revWhere}
      ORDER BY sort_date DESC
      LIMIT 5000
      `,
      revParams,
    );

    // Detailed (cap)
    const [detailedRows] = await pool.execute(
      `
      SELECT
        sr.reservation_id,
        sr.schedule_id,
        sr.student_id,
        u.fullname,
        u.gender,
        u.birthday,
        c.course_name,
        sr.reservation_status,
        CASE WHEN ${isDoneConditionSql()} THEN 'DONE' ELSE 'PENDING' END AS derived_status,
        sr.payment_method,
        sps.payment_ref,
        sps.status AS submission_status,
        sps.verified_at,
        sr.created_at,
        sr.done_at
      FROM schedule_reservations sr
      LEFT JOIN users u ON u.id = sr.student_id
      LEFT JOIN courses c ON c.id = sr.course_id
      ${latestSubmissionJoinSql()}
      ${where}
      ORDER BY sr.created_at DESC
      LIMIT 10000
      `,
      params,
    );

    // Create multi-sheet workbook
    const wb = new ExcelJS.Workbook();

    // Overview sheet
    const s1 = wb.addWorksheet("Overview");
    s1.columns = [
      { header: "Metric", key: "metric", width: 28 },
      { header: "Value", key: "value", width: 40 },
    ];
    s1.addRows([
      { metric: "From", value: from },
      { metric: "To (exclusive)", value: to },
      { metric: "Course ID", value: courseId || "All" },
      { metric: "Total Enrolled", value: safeInt(totalEnrolled, 0) },
      { metric: "Most Popular Course", value: mostPopularCourse || "-" },
      { metric: "Done Count", value: safeInt(revRows?.[0]?.doneCount || 0, 0) },
      {
        metric: "Total Revenue (Peso)",
        value: Number(revRows?.[0]?.totalRevenuePeso || 0),
      },
    ]);
    s1.getRow(1).font = { bold: true };
    s1.views = [{ state: "frozen", ySplit: 1 }];

    // Top courses
    const s2 = wb.addWorksheet("TopCourses");
    s2.columns = [
      { header: "Course", key: "course_name", width: 35 },
      { header: "Enrollments", key: "students", width: 14 },
    ];
    s2.addRows(
      topRows.map((r) => ({
        course_name: r.course_name,
        students: safeInt(r.students, 0),
      })),
    );
    s2.getRow(1).font = { bold: true };
    s2.views = [{ state: "frozen", ySplit: 1 }];

    // Monthly
    const s3 = wb.addWorksheet("CourseMonthly");
    s3.columns = [
      { header: "Month", key: "month_label", width: 14 },
      { header: "Course", key: "course_name", width: 36 },
      { header: "Enrollments", key: "count", width: 14 },
    ];
    s3.addRows(
      monthlyRows.map((r) => ({
        month_label: r.month_label,
        course_name: r.course_name,
        count: safeInt(r.count, 0),
      })),
    );
    s3.getRow(1).font = { bold: true };
    s3.views = [{ state: "frozen", ySplit: 1 }];

    // Revenue
    const s4 = wb.addWorksheet("Revenue");
    s4.columns = [
      { header: "Reservation ID", key: "reservation_id", width: 14 },
      { header: "Student", key: "fullname", width: 28 },
      { header: "Course", key: "course_name", width: 26 },
      { header: "Method", key: "payment_method", width: 10 },
      { header: "Amount (₱)", key: "amount_peso", width: 12 },
      { header: "Payment Ref", key: "payment_ref", width: 18 },
      { header: "Verified At", key: "verified_at", width: 18 },
      { header: "Date", key: "sort_date", width: 16 },
    ];
    s4.addRows(
      revenueList.map((r) => ({
        reservation_id: r.reservation_id,
        fullname: r.fullname || "",
        course_name: r.course_name || "",
        payment_method: r.payment_method || "",
        amount_peso: Number(r.amount_peso || 0),
        payment_ref: r.payment_ref || "",
        verified_at: r.verified_at ? toISODate(r.verified_at) : "",
        sort_date: r.sort_date ? toISODate(r.sort_date) : "",
      })),
    );
    s4.getRow(1).font = { bold: true };
    s4.views = [{ state: "frozen", ySplit: 1 }];

    // Detailed
    const s5 = wb.addWorksheet("Detailed");
    s5.columns = [
      { header: "Reservation ID", key: "reservation_id", width: 14 },
      { header: "Schedule ID", key: "schedule_id", width: 12 },
      { header: "Student ID", key: "student_id", width: 10 },
      { header: "Full Name", key: "fullname", width: 26 },
      { header: "Gender", key: "gender", width: 8 },
      { header: "Birthdate", key: "birthday", width: 12 },
      { header: "Course", key: "course_name", width: 22 },
      { header: "Status", key: "reservation_status", width: 12 },
      { header: "Derived", key: "derived_status", width: 10 },
      { header: "Payment Method", key: "payment_method", width: 12 },
      { header: "Payment Ref", key: "payment_ref", width: 18 },
      { header: "Submission Status", key: "submission_status", width: 16 },
      { header: "Verified At", key: "verified_at", width: 14 },
      { header: "Created At", key: "created_at", width: 16 },
      { header: "Done At", key: "done_at", width: 16 },
    ];
    s5.addRows(
      detailedRows.map((r) => ({
        reservation_id: r.reservation_id,
        schedule_id: r.schedule_id,
        student_id: r.student_id,
        fullname: r.fullname || "",
        gender: r.gender || "",
        birthday: r.birthday ? toISODate(r.birthday) : "",
        course_name: r.course_name || "",
        reservation_status: r.reservation_status || "",
        derived_status: r.derived_status || "",
        payment_method: r.payment_method || "",
        payment_ref: r.payment_ref || "",
        submission_status: r.submission_status || "",
        verified_at: r.verified_at ? toISODate(r.verified_at) : "",
        created_at: r.created_at ? toISODate(r.created_at) : "",
        done_at: r.done_at ? toISODate(r.done_at) : "",
      })),
    );
    s5.getRow(1).font = { bold: true };
    s5.views = [{ state: "frozen", ySplit: 1 }];

    setDownloadHeaders(
      res,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      makeFileName("reports-all", "xlsx"),
    );

    await wb.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("exportAll error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to export all",
      debug: err.sqlMessage || err.message,
    });
  }
};
