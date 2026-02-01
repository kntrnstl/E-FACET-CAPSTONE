// src/controllers/courseController.js
const pool = require("../config/database");

/**
 * Normalize requirements input into an array of strings
 * Accepts:
 *  - JSON string: '["Valid ID","2x2 Photo"]'
 *  - array of strings: ["Valid ID", "2x2 Photo"]
 *  - newline text: "Valid ID\n2x2 Photo"
 */
function normalizeRequirements(input) {
  if (input === undefined || input === null) return null; // means "not provided"

  if (Array.isArray(input)) {
    return input.map((x) => String(x ?? "").trim()).filter(Boolean);
  }

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return [];

    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x ?? "").trim()).filter(Boolean);
      }
      return [String(parsed).trim()].filter(Boolean);
    } catch {
      return s
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }

  return [];
}

/**
 * ==========================
 * ADMIN ENDPOINTS
 * ==========================
 */

// GET /api/admin/courses
exports.listCourses = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        c.id,
        c.course_code,
        c.course_name,
        c.description,
        c.duration,
        c.status,
        c.program_id,
        c.course_fee,
        c.created_at,
        COALESCE(
          CONCAT(
            '[',
            GROUP_CONCAT(
              JSON_QUOTE(cr.requirement_text)
              ORDER BY cr.sort_order ASC, cr.requirement_id ASC
              SEPARATOR ','
            ),
            ']'
          ),
          '[]'
        ) AS requirements
      FROM courses c
      LEFT JOIN course_requirements cr
        ON cr.course_id = c.id
       AND cr.is_active = 1
      GROUP BY c.id
      ORDER BY c.created_at DESC, c.id DESC
      `,
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listCourses error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch courses" });
  }
};

// POST /api/admin/courses
exports.createCourse = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const {
      course_code,
      course_name,
      description = null,
      duration = null,
      status = "active",
      program_id = null,
      course_fee = 0,
      requirements,
    } = req.body;

    if (!course_code || !course_name) {
      return res.status(400).json({
        status: "error",
        message: "course_code and course_name are required",
      });
    }

    const reqList = normalizeRequirements(requirements);

    await conn.beginTransaction();

    const [result] = await conn.execute(
      `
      INSERT INTO courses
        (course_code, course_name, description, duration, status, program_id, course_fee)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        String(course_code).trim(),
        String(course_name).trim(),
        description !== undefined ? description : null,
        duration !== undefined ? duration : null,
        String(status).toLowerCase(),
        program_id ?? null,
        Number(course_fee) || 0,
      ],
    );

    const newCourseId = result.insertId;

    if (reqList && reqList.length > 0) {
      const values = reqList.map((text, idx) => [
        newCourseId,
        text,
        1, // is_required default
        idx + 1, // sort_order
        1, // is_active
      ]);

      await conn.query(
        `
        INSERT INTO course_requirements
          (course_id, requirement_text, is_required, sort_order, is_active)
        VALUES ?
        `,
        [values],
      );
    }

    await conn.commit();

    res.status(201).json({
      status: "success",
      message: "Course created",
      data: { id: newCourseId },
    });
  } catch (err) {
    await conn.rollback();

    if (String(err.code) === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "error",
        message: "course_code already exists",
      });
    }

    console.error("createCourse error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to create course" });
  } finally {
    conn.release();
  }
};

// PUT /api/admin/courses/:id
exports.updateCourse = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;

    const {
      course_code,
      course_name,
      description,
      status,
      program_id,
      course_fee,
      duration,
      requirements,
    } = req.body;

    const reqList = normalizeRequirements(requirements);

    await conn.beginTransaction();

    const [result] = await conn.execute(
      `
      UPDATE courses
      SET
        course_code = COALESCE(?, course_code),
        course_name = COALESCE(?, course_name),
        description = COALESCE(?, description),
        duration    = COALESCE(?, duration),
        status      = COALESCE(?, status),
        program_id  = ?,
        course_fee  = COALESCE(?, course_fee)
      WHERE id = ?
      `,
      [
        course_code ?? null,
        course_name ?? null,
        description ?? null,
        duration ?? null,
        status ? String(status).toLowerCase() : null,
        program_id ?? null,
        course_fee ?? null,
        Number(id),
      ],
    );

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }

    // If requirements sent: replace requirements rows
    if (reqList !== null) {
      await conn.execute(
        `DELETE FROM course_requirements WHERE course_id = ?`,
        [Number(id)],
      );

      if (reqList.length > 0) {
        const values = reqList.map((text, idx) => [
          Number(id),
          text,
          1,
          idx + 1,
          1,
        ]);

        await conn.query(
          `
          INSERT INTO course_requirements
            (course_id, requirement_text, is_required, sort_order, is_active)
          VALUES ?
          `,
          [values],
        );
      }
    }

    await conn.commit();

    res.json({ status: "success", message: "Course updated" });
  } catch (err) {
    await conn.rollback();
    console.error("updateCourse error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to update course" });
  } finally {
    conn.release();
  }
};

// DELETE /api/admin/courses/:id
exports.deleteCourse = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;

    await conn.beginTransaction();

    await conn.execute(`DELETE FROM course_requirements WHERE course_id = ?`, [
      Number(id),
    ]);

    const [result] = await conn.execute(`DELETE FROM courses WHERE id = ?`, [
      Number(id),
    ]);

    if (result.affectedRows === 0) {
      await conn.rollback();
      return res
        .status(404)
        .json({ status: "error", message: "Course not found" });
    }

    await conn.commit();
    res.json({ status: "success", message: "Course deleted" });
  } catch (err) {
    await conn.rollback();
    console.error("deleteCourse error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to delete course" });
  } finally {
    conn.release();
  }
};

/**
 * ==========================
 * STUDENT ENDPOINTS
 * ==========================
 */

// GET /api/student/courses
// student sees only active courses
exports.listCoursesStudent = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `
      SELECT
        id,
        course_code,
        course_name,
        description,
        duration,
        course_fee,
        status
      FROM courses
      WHERE status = 'active'
      ORDER BY created_at DESC, id DESC
      `,
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("listCoursesStudent error:", err);
    res
      .status(500)
      .json({ status: "error", message: "Failed to fetch courses" });
  }
};
