const path = require("path");
const fs = require("fs");
const pool = require("../config/database");

function getSessionUserId(req) {
  const v = req?.session?.user_id ?? req?.session?.userId ?? req?.session?.id;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// GET: my certificates (DONE reservations + issued certificates)
exports.listMyCertificates = async (req, res) => {
  try {
    const studentId = getSessionUserId(req);
    if (!studentId) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });
    }

    const [rows] = await pool.execute(
      `
      SELECT
        r.reservation_id,
        r.course_id,
        r.reservation_status,
        r.done_at,
        r.updated_at,

        c.course_name,

        cert.certificate_id,
        cert.certificate_code,
        cert.status AS certificate_status,
        cert.issued_at
      FROM schedule_reservations r
      JOIN courses c ON c.id = r.course_id
      LEFT JOIN certificates cert ON cert.reservation_id = r.reservation_id
      WHERE r.student_id = ?
        AND r.reservation_status = 'DONE'
      ORDER BY COALESCE(cert.issued_at, r.done_at, r.updated_at) DESC
      `,
      [studentId],
    );

    const data = rows.map((r) => {
      const hasIssued = !!r.certificate_id && r.certificate_status === "issued";
      return {
        id: r.certificate_id
          ? `cert-${r.certificate_id}`
          : `res-${r.reservation_id}`,
        reservation_id: r.reservation_id,

        course: r.course_name,
        type: "Certificate of Completion",

        issueDate: r.issued_at
          ? new Date(r.issued_at).toISOString().slice(0, 10)
          : null,

        // student UI statuses
        status: hasIssued ? "completed" : "pending",

        certificate_id: r.certificate_id || null,
        certificate_code: r.certificate_code || null,
      };
    });

    return res.json({ status: "success", data });
  } catch (err) {
    console.error("listMyCertificates error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load your certificates",
      debug: err.sqlMessage || err.message,
    });
  }
};

// GET: view my certificate PDF inline
exports.viewMyPdf = async (req, res) => {
  try {
    const studentId = getSessionUserId(req);
    if (!studentId) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });
    }

    const certId = req.params.id;

    const [rows] = await pool.execute(
      `
      SELECT cert.pdf_path, cert.certificate_code
      FROM certificates cert
      JOIN schedule_reservations r ON r.reservation_id = cert.reservation_id
      WHERE cert.certificate_id = ?
        AND r.student_id = ?
        AND cert.status = 'issued'
      LIMIT 1
      `,
      [certId, studentId],
    );

    if (!rows.length || !rows[0].pdf_path) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF not found" });
    }

    const abs = path.join(process.cwd(), rows[0].pdf_path);
    if (!fs.existsSync(abs)) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF file missing on server" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${rows[0].certificate_code}.pdf"`,
    );
    fs.createReadStream(abs).pipe(res);
  } catch (err) {
    console.error("viewMyPdf error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to open PDF" });
  }
};

// GET: download my certificate PDF
exports.downloadMyPdf = async (req, res) => {
  try {
    const studentId = getSessionUserId(req);
    if (!studentId) {
      return res
        .status(401)
        .json({ status: "error", message: "Not authenticated" });
    }

    const certId = req.params.id;

    const [rows] = await pool.execute(
      `
      SELECT cert.pdf_path, cert.certificate_code
      FROM certificates cert
      JOIN schedule_reservations r ON r.reservation_id = cert.reservation_id
      WHERE cert.certificate_id = ?
        AND r.student_id = ?
        AND cert.status = 'issued'
      LIMIT 1
      `,
      [certId, studentId],
    );

    if (!rows.length || !rows[0].pdf_path) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF not found" });
    }

    const abs = path.join(process.cwd(), rows[0].pdf_path);
    if (!fs.existsSync(abs)) {
      return res
        .status(404)
        .json({ status: "error", message: "PDF file missing on server" });
    }

    return res.download(abs, `${rows[0].certificate_code}.pdf`);
  } catch (err) {
    console.error("downloadMyPdf error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to download PDF" });
  }
};
