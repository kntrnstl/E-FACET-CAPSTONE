// src/controllers/studentDocumentsController.js
const pool = require("../config/database");
const fs = require("fs");
const path = require("path");

// POST /api/student/documents/upload
exports.uploadDocument = async (req, res) => {
  try {
    const studentId = req.session.user_id;
    const { document_type, course_id } = req.body;

    if (!document_type || !String(document_type).trim()) {
      return res
        .status(400)
        .json({ status: "error", message: "document_type is required" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ status: "error", message: "file is required" });
    }

    const filePath = `/uploads/documents/${req.file.filename}`;

    const [result] = await pool.execute(
      `INSERT INTO student_documents 
        (student_id, course_id, document_type, file_path, original_name, mime_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentId,
        course_id ? Number(course_id) : null,
        String(document_type).trim(),
        filePath,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
      ],
    );

    res.status(201).json({
      status: "success",
      message: "Document uploaded",
      data: {
        document_id: result.insertId,
        student_id: studentId,
        course_id: course_id ? Number(course_id) : null,
        document_type: String(document_type).trim(),
        file_path: filePath,
        original_name: req.file.originalname,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
      },
    });
  } catch (err) {
    console.error("uploadDocument error:", err);
    res.status(500).json({ status: "error", message: "Upload failed" });
  }
};

// GET /api/student/documents?course_id=#
exports.listMyDocuments = async (req, res) => {
  try {
    const studentId = req.session.user_id;
    const { course_id } = req.query;

    let sql = `
      SELECT document_id, student_id, course_id, document_type, file_path, original_name, mime_type, file_size, upload_date
      FROM student_documents
      WHERE student_id = ? AND is_active = 1
    `;
    const params = [studentId];

    if (course_id) {
      sql += ` AND course_id = ?`;
      params.push(Number(course_id));
    }

    sql += ` ORDER BY upload_date DESC`;

    const [rows] = await pool.execute(sql, params);

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listMyDocuments error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch documents" });
  }
};

// DELETE /api/student/documents/:documentId
exports.deleteMyDocument = async (req, res) => {
  try {
    const studentId = req.session.user_id;
    const { documentId } = req.params;

    // find doc (must belong to student)
    const [rows] = await pool.execute(
      `SELECT file_path FROM student_documents WHERE document_id = ? AND student_id = ?`,
      [documentId, studentId],
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Document not found" });
    }

    const filePath = rows[0].file_path;
    const absolute = path.join(
      process.cwd(),
      filePath.replace("/uploads", "uploads"),
    );

    // soft delete in DB
    await pool.execute(
      `UPDATE student_documents SET is_active = 0 WHERE document_id = ? AND student_id = ?`,
      [documentId, studentId],
    );

    // try deleting file (optional)
    fs.unlink(absolute, () => {});

    res.json({ status: "success", message: "Document deleted" });
  } catch (err) {
    console.error("deleteMyDocument error:", err);
    res.status(500).json({ status: "error", message: "Delete failed" });
  }
};
