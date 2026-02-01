// src/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const { requireAuth } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadDocs");

const studentDocumentsController = require("../controllers/studentDocumentsController");
const enrollmentAppController = require("../controllers/enrollmentApplicationController");

const studentScheduleController = require("../controllers/studentScheduleController");
const studentReservationController = require("../controllers/studentReservationController");

// ================= MIDDLEWARE =================
router.use(requireAuth);

// helper: allow ONLY role = "user"
const requireUserRole = (req, res) => {
  const role = String(req.session.role || "").toLowerCase();

  if (role !== "user") {
    return res.status(403).json({
      status: "error",
      message: "Access denied. User role required.",
    });
  }
  return true;
};

// ================= STUDENT DASHBOARD =================
router.get("/dashboard", async (req, res) => {
  try {
    if (!requireUserRole(req, res)) return;

    const userId = Number(req.session.user_id);
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const [courses] = await pool.execute(
      `SELECT 
        c.id AS id,
        c.course_name AS name,
        e.enrollment_status
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.student_id = ?`,
      [userId],
    );

    const sessions = [];

    return res.json({
      status: "success",
      user: {
        id: req.session.user_id,
        username: req.session.username,
        fullname: req.session.fullname,
        role: req.session.role,
      },
      dashboardData: {
        enrolledCourses: courses,
        upcomingSessions: sessions,
      },
    });
  } catch (err) {
    console.error("student dashboard error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to load dashboard",
    });
  }
});

// ================= AVAILABLE COURSES =================
router.get("/courses", async (req, res) => {
  try {
    if (!requireUserRole(req, res)) return;

    const [rows] = await pool.execute(
      `SELECT 
        id,
        course_code,
        course_name,
        duration,
        course_fee,
        description
      FROM courses
      WHERE status = 'active'
      ORDER BY course_name ASC`,
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("get student courses error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch courses",
    });
  }
});

// ================= COURSE REQUIREMENTS =================
router.get("/courses/:courseId/requirements", async (req, res) => {
  try {
    if (!requireUserRole(req, res)) return;

    const courseId = Number(req.params.courseId);
    if (!Number.isFinite(courseId) || courseId < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid course id" });
    }

    const [rows] = await pool.execute(
      `SELECT 
        requirement_id,
        requirement_text,
        is_required,
        sort_order
      FROM course_requirements
      WHERE course_id = ? AND is_active = 1
      ORDER BY sort_order ASC`,
      [courseId],
    );

    return res.json({ status: "success", data: rows });
  } catch (err) {
    console.error("student course requirements error:", err);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch requirements",
    });
  }
});

// ================= ENROLL IN COURSE =================
router.post("/enroll/:courseId", async (req, res) => {
  try {
    if (!requireUserRole(req, res)) return;

    const userId = Number(req.session.user_id);
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const course_id = Number(req.params.courseId);
    if (!Number.isFinite(course_id) || course_id < 1) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid course id" });
    }

    const [existing] = await pool.execute(
      `SELECT enrollment_id
       FROM enrollments
       WHERE student_id = ? AND course_id = ?`,
      [userId, course_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Already enrolled in this course",
      });
    }

    await pool.execute(
      `INSERT INTO enrollments (student_id, course_id, enrollment_status, created_at)
       VALUES (?, ?, 'active', NOW())`,
      [userId, course_id],
    );

    return res.status(201).json({
      status: "success",
      message: "Enrollment successful.",
    });
  } catch (err) {
    console.error("student enroll error:", err);
    return res.status(500).json({
      status: "error",
      message: "Enrollment failed",
    });
  }
});

// ================= SCHEDULES / AVAILABILITY =================
router.get("/schedules", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentScheduleController.getStudentSchedules(req, res);
});

router.get("/availability", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentReservationController.getAvailability(req, res);
});

// ================= RESERVATIONS =================
router.post("/reservations", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentReservationController.createReservation(req, res);
});

router.get("/reservations", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentReservationController.listMyReservations(req, res);
});

router.delete("/reservations/:reservationId", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentReservationController.cancelMyReservation(req, res);
});

// ================= STUDENT DOCUMENTS =================
router.post("/documents/upload", upload.single("file"), (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentDocumentsController.uploadDocument(req, res);
});

router.get("/documents", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentDocumentsController.listMyDocuments(req, res);
});

router.delete("/documents/:documentId", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentDocumentsController.deleteMyDocument(req, res);
});

// ================= APPLICATIONS =================
router.post("/applications", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return enrollmentAppController.submitApplication(req, res);
});

router.get("/applications", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return enrollmentAppController.getMyApplications(req, res);
});



module.exports = router;
