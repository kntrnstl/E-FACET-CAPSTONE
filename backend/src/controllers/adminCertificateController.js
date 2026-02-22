const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const pool = require("../config/database");

function makeCertCode() {
  const y = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `CERT-${y}-${rand}`;
}

async function generatePdf({
  certificate_code,
  student_name,
  course_name,
  issued_at,
}) {
  const dir = path.join(process.cwd(), "uploads", "certificates");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const filename = `${certificate_code}.pdf`;
  const filepath = path.join(dir, filename);

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const stream = fs.createWriteStream(filepath);
  doc.pipe(stream);

  doc.fontSize(22).text("CERTIFICATE OF COMPLETION", { align: "center" });
  doc.moveDown(1.5);

  doc.fontSize(12).text("This certifies that", { align: "center" });
  doc.moveDown(0.8);

  doc.fontSize(26).text(student_name, { align: "center", underline: true });
  doc.moveDown(0.8);

  doc
    .fontSize(12)
    .text("has successfully completed the course", { align: "center" });
  doc.moveDown(0.6);

  doc.fontSize(18).text(course_name, { align: "center" });
  doc.moveDown(1.2);

  doc
    .fontSize(12)
    .text(`Certificate ID: ${certificate_code}`, { align: "center" });
  doc
    .fontSize(12)
    .text(`Issued: ${new Date(issued_at).toLocaleDateString("en-US")}`, {
      align: "center",
    });

  doc.moveDown(3);
  doc.fontSize(10).text("E-FACET Enrollment Portal", { align: "center" });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return path.join("uploads", "certificates", filename);
}

// ✅ GET: list DONE schedule_reservations + certificate info
exports.listCompletions = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        r.reservation_id,
        r.schedule_id,
        r.student_id,
        r.course_id,
        r.reservation_status,
        r.done_at,
        r.updated_at,

        u.fullname AS student_name,
        u.email AS student_email,

        c.course_name,

        cert.certificate_id,
        cert.certificate_code,
        cert.status AS certificate_status,
        cert.issued_at
      FROM schedule_reservations r
      JOIN users u ON u.id = r.student_id
      JOIN courses c ON c.id = r.course_id
      LEFT JOIN certificates cert ON cert.reservation_id = r.reservation_id
      WHERE r.reservation_status = 'DONE'
        AND u.role = 'user'
      ORDER BY COALESCE(r.done_at, r.updated_at) DESC
    `);

    const mapped = rows.map((r) => {
      let ui_status = "ready";
      if (r.certificate_id && r.certificate_status === "issued")
        ui_status = "issued";
      if (r.certificate_id && r.certificate_status === "revoked")
        ui_status = "revoked";
      return { ...r, ui_status };
    });

    return res.json({ status: "success", data: mapped });
  } catch (err) {
    console.error("listCompletions error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load completed students",
      debug: err.sqlMessage || err.message,
    });
  }
};

// ✅ POST: generate certificate (only if reservation_status = DONE)
exports.generate = async (req, res) => {
  try {
    const { reservation_id } = req.body;
    if (!reservation_id) {
      return res
        .status(400)
        .json({ status: "error", message: "reservation_id is required" });
    }

    const [rRows] = await pool.execute(
      `
      SELECT
        r.reservation_id,
        r.reservation_status,
        r.done_at,
        u.fullname AS student_name,
        u.email AS student_email,
        c.course_name
      FROM schedule_reservations r
      JOIN users u ON u.id = r.student_id
      JOIN courses c ON c.id = r.course_id
      WHERE r.reservation_id = ?
      LIMIT 1
      `,
      [reservation_id],
    );

    if (!rRows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Reservation not found" });
    }

    const r = rRows[0];

    if (r.reservation_status !== "DONE") {
      return res
        .status(400)
        .json({ status: "error", message: "Student is not DONE yet." });
    }

    const [existing] = await pool.execute(
      `SELECT certificate_id FROM certificates WHERE reservation_id = ? LIMIT 1`,
      [reservation_id],
    );
    if (existing.length) {
      return res.status(409).json({
        status: "error",
        message: "Certificate already exists for this reservation.",
      });
    }

    const certificate_code = makeCertCode();
    const issued_at = new Date();

    const [ins] = await pool.execute(
      `INSERT INTO certificates (reservation_id, certificate_code, issued_at, status)
       VALUES (?, ?, ?, 'issued')`,
      [reservation_id, certificate_code, issued_at],
    );

    const certificate_id = ins.insertId;

    const pdf_path = await generatePdf({
      certificate_code,
      student_name: r.student_name,
      course_name: r.course_name || "Course",
      issued_at,
    });

    await pool.execute(
      `UPDATE certificates SET pdf_path = ? WHERE certificate_id = ?`,
      [pdf_path, certificate_id],
    );

    return res.json({
      status: "success",
      message: "Certificate generated",
      data: { certificate_id, certificate_code, pdf_path },
    });
  } catch (err) {
    console.error("generate error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to generate certificate",
      debug: err.sqlMessage || err.message,
    });
  }
};

exports.viewPdf = async (req, res) => {
  try {
    const certId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT pdf_path, certificate_code FROM certificates WHERE certificate_id = ? LIMIT 1`,
      [certId],
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
    console.error("viewPdf error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to open PDF" });
  }
};

exports.downloadPdf = async (req, res) => {
  try {
    const certId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT pdf_path, certificate_code FROM certificates WHERE certificate_id = ? LIMIT 1`,
      [certId],
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
    console.error("downloadPdf error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to download PDF" });
  }
};

exports.revoke = async (req, res) => {
  try {
    const certId = req.params.id;

    const [rows] = await pool.execute(
      `SELECT certificate_id, status FROM certificates WHERE certificate_id = ? LIMIT 1`,
      [certId],
    );

    if (!rows.length) {
      return res
        .status(404)
        .json({ status: "error", message: "Certificate not found" });
    }

    if (rows[0].status === "revoked") {
      return res.json({ status: "success", message: "Already revoked" });
    }

    await pool.execute(
      `UPDATE certificates SET status='revoked' WHERE certificate_id = ?`,
      [certId],
    );

    return res.json({ status: "success", message: "Certificate revoked" });
  } catch (err) {
    console.error("revoke error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to revoke certificate" });
  }
};
