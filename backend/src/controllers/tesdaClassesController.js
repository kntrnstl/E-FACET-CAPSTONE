const pool = require("../config/database");

const normStatus = (s) => (["active", "upcoming", "completed"].includes(s) ? s : "upcoming");

exports.getTesdaClasses = async (req, res) => {
  try {
    const instructorId = req.session.user_id;

    const [rows] = await pool.execute(
      `SELECT class_id, course_name, section, room, class_date, start_time, end_time,
              status, student_count
       FROM tesda_classes
       WHERE instructor_id = ?
       ORDER BY class_date ASC, start_time ASC`,
      [instructorId]
    );

    res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("getTesdaClasses:", err);
    res.status(500).json({ status: "error", message: "Failed to fetch classes" });
  }
};

exports.createTesdaClass = async (req, res) => {
  try {
    const instructorId = req.session.user_id;
    const {
      course_name,
      section,
      room,
      class_date,
      start_time,
      end_time,
      status = "upcoming",
      student_count = 0,
    } = req.body;

    if (!course_name || !section || !room || !class_date || !start_time || !end_time) {
      return res.status(400).json({ status: "error", message: "Missing required fields" });
    }

    if (String(start_time) >= String(end_time)) {
      return res.status(400).json({ status: "error", message: "End time must be after start time" });
    }

    const [result] = await pool.execute(
      `INSERT INTO tesda_classes
       (course_name, section, room, class_date, start_time, end_time, status, student_count, instructor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(course_name).trim(),
        String(section).trim(),
        String(room).trim(),
        class_date,
        start_time,
        end_time,
        normStatus(status),
        Number(student_count) || 0,
        instructorId,
      ]
    );

    res.status(201).json({ status: "success", class_id: result.insertId });
  } catch (err) {
    console.error("createTesdaClass:", err);
    res.status(500).json({ status: "error", message: "Failed to create class" });
  }
};

exports.updateTesdaClass = async (req, res) => {
  try {
    const instructorId = req.session.user_id;
    const id = Number(req.params.id);

    const {
      course_name,
      section,
      room,
      class_date,
      start_time,
      end_time,
      status,
      student_count,
    } = req.body;

    if (!id) return res.status(400).json({ status: "error", message: "Invalid class id" });
    if (String(start_time) >= String(end_time)) {
      return res.status(400).json({ status: "error", message: "End time must be after start time" });
    }

    const [result] = await pool.execute(
      `UPDATE tesda_classes
       SET course_name=?, section=?, room=?, class_date=?, start_time=?, end_time=?, status=?, student_count=?
       WHERE class_id=? AND instructor_id=?`,
      [
        String(course_name).trim(),
        String(section).trim(),
        String(room).trim(),
        class_date,
        start_time,
        end_time,
        normStatus(status),
        Number(student_count) || 0,
        id,
        instructorId,
      ]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ status: "error", message: "Class not found" });
    }

    res.json({ status: "success" });
  } catch (err) {
    console.error("updateTesdaClass:", err);
    res.status(500).json({ status: "error", message: "Failed to update class" });
  }
};

exports.deleteTesdaClass = async (req, res) => {
  try {
    const instructorId = req.session.user_id;
    const id = Number(req.params.id);

    const [result] = await pool.execute(
      `DELETE FROM tesda_classes WHERE class_id=? AND instructor_id=?`,
      [id, instructorId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ status: "error", message: "Class not found" });
    }

    res.json({ status: "success" });
  } catch (err) {
    console.error("deleteTesdaClass:", err);
    res.status(500).json({ status: "error", message: "Failed to delete class" });
  }
};
