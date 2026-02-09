// backend/src/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

const { requireAuth } = require("../middlewares/authMiddleware");

// multer upload middleware for REQUIREMENTS
const uploadRequirements = require("../middlewares/uploadRequirements");

// controllers
const studentRequirementsController = require("../controllers/studentRequirementsController");
const enrollmentAppController = require("../controllers/enrollmentApplicationController");
const studentScheduleController = require("../controllers/studentScheduleController");
const studentReservationController = require("../controllers/studentReservationController");
const studentMyScheduleController = require("../controllers/studentMyScheduleController");

// legacy gcash checkout (optional)
const studentPaymentsController = require("../controllers/studentPaymentsController");

// QRPH
const studentQrphPaymentsController = require("../controllers/studentQrphPaymentsController");
const uploadSingleProof = require("../middlewares/uploadPaymentProof");

// ================= MIDDLEWARE =================
router.use(requireAuth);

// helper: allow ONLY role = "user"
function requireUserRole(req, res) {
  const role = String(req.session.role || "").toLowerCase();
  if (role !== "user") {
    res.status(403).json({
      status: "error",
      message: "Access denied. User role required.",
    });
    return false;
  }
  return true;
}

// ================= STUDENT DASHBOARD =================
router.get("/dashboard", async (req, res) => {
  try {
    if (!requireUserRole(req, res)) return;

    const userId = Number(req.session.user_id);
    if (!userId)
      return res.status(401).json({ status: "error", message: "Unauthorized" });

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
        upcomingSessions: [],
      },
    });
  } catch (err) {
    console.error("student dashboard error:", err);
    return res
      .status(500)
      .json({ status: "error", message: "Failed to load dashboard" });
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
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch courses" });
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
    return res
      .status(500)
      .json({ status: "error", message: "Failed to fetch requirements" });
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

// ================= MY SCHEDULE =================
router.get("/my-schedule", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentMyScheduleController.getMySchedule(req, res);
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

router.get("/reservations/active", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentReservationController.getMyActiveReservation(req, res);
});

router.delete("/reservations/:reservationId", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentReservationController.cancelMyReservation(req, res);
});

// ================= REQUIREMENTS UPLOAD =================
router.post(
  "/reservations/:reservationId/requirements",
  (req, res, next) => {
    if (!requireUserRole(req, res)) return;
    next();
  },
  uploadRequirements.array("files", 20),
  (req, res) => studentRequirementsController.uploadRequirements(req, res),
);

router.get("/reservations/:reservationId/requirements", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentRequirementsController.listReservationRequirements(req, res);
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

// ================= PAYMENTS (legacy gcash checkout) OPTIONAL =================
router.post("/payments/gcash/checkout", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentPaymentsController.createGcashCheckout(req, res);
});

router.post("/payments/gcash/finalize", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentPaymentsController.finalizeGcashPayment(req, res);
});

// ================= PAYMENTS (QRPH / GCash QR) =================
router.post("/payments/qrph/create", (req, res) => {
  if (!requireUserRole(req, res)) return;
  return studentQrphPaymentsController.createQrphPayment(req, res);
});

router.post(
  "/payments/qrph/:paymentRef/proof",
  (req, res, next) => {
    if (!requireUserRole(req, res)) return;
    next();
  },
  uploadSingleProof.single("proof"),
  (req, res) => studentQrphPaymentsController.uploadQrphProof(req, res),
);

module.exports = router;
