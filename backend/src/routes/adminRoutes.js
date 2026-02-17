// backend/src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

// controllers
const enrollmentAppController = require("../controllers/enrollmentApplicationController");
const classAssignmentController = require("../controllers/classAssignmentController");
const classController = require("../controllers/classController");
const scheduleController = require("../controllers/scheduleController");
const reservationController = require("../controllers/reservationController");
const paymentController = require("../controllers/paymentController");
const courseController = require("../controllers/courseController");
const courseRequirementsController = require("../controllers/courseRequirementsController");
const instructorController = require("../controllers/instructorController");

const adminStudentsController = require("../controllers/adminStudentsController");

// your QRPH controller (list/confirm/reject)
const adminQrphVerifyController = require("../controllers/adminQrphVerifyController");

// driving assign controller
const drivingAssignController = require("../controllers/drivingInstructorAssignController");

// NEW users controller
const adminUsersController = require("../controllers/adminUsersController");

// middlewares
const { requireAuth, requireAdmin } = require("../middlewares/authMiddleware");

// ---------- SAFE ROUTE REGISTER ----------
function safe(method, path, handler, label) {
  if (typeof handler !== "function") {
    console.warn(
      `⚠ Skipped route ${method.toUpperCase()} ${path} (handler missing): ${label}`,
    );
    return;
  }
  router[method](path, handler);
}

// ================= MIDDLEWARE =================
router.use(requireAuth);
router.use(requireAdmin);

// ================= DASHBOARD =================
safe(
  "get",
  "/dashboard",
  (req, res) => {
    res.json({
      status: "success",
      message: "Admin dashboard",
      user: {
        id: req.session.user_id,
        fullname: req.session.fullname,
        role: req.session.role,
      },
    });
  },
  "inline dashboard handler",
);

// ================= USER MANAGEMENT (NEW) =================
safe(
  "get",
  "/users",
  adminUsersController.listUsers,
  "adminUsersController.listUsers",
);
safe(
  "get",
  "/users/:id",
  adminUsersController.getUserById,
  "adminUsersController.getUserById",
);
safe(
  "post",
  "/users",
  adminUsersController.createUser,
  "adminUsersController.createUser",
);
safe(
  "put",
  "/users/:id",
  adminUsersController.updateUser,
  "adminUsersController.updateUser",
);

// Disable/Enable (soft block)
safe(
  "put",
  "/users/:id/disable",
  adminUsersController.disableUser,
  "adminUsersController.disableUser",
);
safe(
  "put",
  "/users/:id/enable",
  adminUsersController.enableUser,
  "adminUsersController.enableUser",
);

safe(
  "delete",
  "/users/:id",
  adminUsersController.deleteUser,
  "adminUsersController.deleteUser",
);

// ================= INSTRUCTORS =================
safe(
  "get",
  "/instructors",
  instructorController.getInstructors,
  "instructorController.getInstructors",
);
safe(
  "post",
  "/instructors",
  instructorController.createInstructor,
  "instructorController.createInstructor",
);
safe(
  "put",
  "/instructors/:id",
  instructorController.updateInstructor,
  "instructorController.updateInstructor",
);
safe(
  "delete",
  "/instructors/:id",
  instructorController.deleteInstructor,
  "instructorController.deleteInstructor",
);

// ================= COURSES =================
safe(
  "get",
  "/courses",
  courseController.listCourses,
  "courseController.listCourses",
);
safe(
  "post",
  "/courses",
  courseController.createCourse,
  "courseController.createCourse",
);
safe(
  "put",
  "/courses/:id",
  courseController.updateCourse,
  "courseController.updateCourse",
);
safe(
  "delete",
  "/courses/:id",
  courseController.deleteCourse,
  "courseController.deleteCourse",
);

// ================= COURSE REQUIREMENTS =================
safe(
  "get",
  "/courses/:courseId/requirements",
  courseRequirementsController.getRequirementsByCourseAdmin,
  "courseRequirementsController.getRequirementsByCourseAdmin",
);
safe(
  "post",
  "/courses/:courseId/requirements",
  courseRequirementsController.addRequirement,
  "courseRequirementsController.addRequirement",
);
safe(
  "put",
  "/requirements/:id",
  courseRequirementsController.updateRequirement,
  "courseRequirementsController.updateRequirement",
);
safe(
  "delete",
  "/requirements/:id",
  courseRequirementsController.deleteRequirement,
  "courseRequirementsController.deleteRequirement",
);

// ================= ENROLLMENT APPLICATIONS =================
safe(
  "get",
  "/applications",
  enrollmentAppController.listApplicationsAdmin,
  "enrollmentAppController.listApplicationsAdmin",
);
safe(
  "put",
  "/applications/:id/status",
  enrollmentAppController.updateApplicationStatusAdmin,
  "enrollmentAppController.updateApplicationStatusAdmin",
);

// ================= CLASS ASSIGNMENT =================
safe(
  "post",
  "/applications/:id/assign-class",
  classAssignmentController.assignClassToApplication,
  "classAssignmentController.assignClassToApplication",
);

// ================= CLASSES =================
safe(
  "get",
  "/classes",
  classController.getClasses,
  "classController.getClasses",
);
safe(
  "post",
  "/classes",
  classController.createClass,
  "classController.createClass",
);
safe(
  "put",
  "/classes/:id",
  classController.updateClass,
  "classController.updateClass",
);
safe(
  "delete",
  "/classes/:id",
  classController.deleteClass,
  "classController.deleteClass",
);

// ================= SCHEDULE =================
safe(
  "get",
  "/schedules",
  scheduleController.getSchedules,
  "scheduleController.getSchedules",
);
safe(
  "post",
  "/schedules",
  scheduleController.createSchedule,
  "scheduleController.createSchedule",
);
safe(
  "put",
  "/schedules/:id",
  scheduleController.updateSchedule,
  "scheduleController.updateSchedule",
);
safe(
  "delete",
  "/schedules/:id",
  scheduleController.deleteSchedule,
  "scheduleController.deleteSchedule",
);

// ================= RESERVATIONS =================
safe(
  "get",
  "/reservations",
  reservationController.listReservationsAdmin,
  "reservationController.listReservationsAdmin",
);
safe(
  "put",
  "/reservations/:id/status",
  reservationController.updateReservationStatusAdmin,
  "reservationController.updateReservationStatusAdmin",
);
safe(
  "post",
  "/reservations/walkin",
  reservationController.createWalkInReservation,
  "reservationController.createWalkInReservation",
);
safe(
  "get",
  "/reservations/:id/details",
  reservationController.getReservationDetailsAdmin,
  "reservationController.getReservationDetailsAdmin",
);

// ================= PAYMENTS (generic) =================
safe(
  "get",
  "/payments",
  paymentController.listPayments,
  "paymentController.listPayments",
);
safe(
  "put",
  "/payments/:id",
  paymentController.updatePayment,
  "paymentController.updatePayment",
);

// ================= QRPH PAYMENTS (your real endpoints) =================
safe(
  "get",
  "/payments/qrph",
  adminQrphVerifyController.listQrphPayments,
  "adminQrphVerifyController.listQrphPayments",
);

safe(
  "post",
  "/payments/qrph/:paymentRef/confirm",
  adminQrphVerifyController.confirmQrphPayment,
  "adminQrphVerifyController.confirmQrphPayment",
);

safe(
  "post",
  "/payments/qrph/:paymentRef/reject",
  adminQrphVerifyController.rejectQrphPayment,
  "adminQrphVerifyController.rejectQrphPayment",
);

// ================= ADMIN STUDENTS (Driving confirmed) =================
safe(
  "get",
  "/students/confirmed",
  adminStudentsController.listDrivingStudentsConfirmed,
  "adminStudentsController.listDrivingStudentsConfirmed",
);

// ================= DRIVING INSTRUCTOR ASSIGN =================
safe(
  "get",
  "/driving-instructors",
  drivingAssignController.getDrivingInstructors,
  "drivingAssignController.getDrivingInstructors",
);
safe(
  "get",
  "/driving-course-instructors",
  drivingAssignController.getDrivingCourseInstructors,
  "drivingAssignController.getDrivingCourseInstructors",
);
safe(
  "post",
  "/driving-course-instructors",
  drivingAssignController.upsertDrivingCourseInstructor,
  "drivingAssignController.upsertDrivingCourseInstructor",
);

module.exports = router;
