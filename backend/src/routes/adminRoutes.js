// src/routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const enrollmentAppController = require("../controllers/enrollmentApplicationController");
const classAssignmentController = require("../controllers/classAssignmentController");
const classController = require("../controllers/classController");
const scheduleController = require("../controllers/scheduleController");
const reservationController = require("../controllers/reservationController");
const paymentController = require("../controllers/paymentController");
const courseController = require("../controllers/courseController");
const courseRequirementsController = require("../controllers/courseRequirementsController");
const instructorController = require("../controllers/instructorController");

const { requireAuth, requireAdmin } = require("../middlewares/authMiddleware");

const adminStudentsController = require("../controllers/adminStudentsController");

const adminQrphVerifyController = require("../controllers/adminQrphVerifyController");


function mustBeFn(label, fn) {
  if (typeof fn !== "function") {
    console.log("❌ NOT A FUNCTION:", label, "=>", fn);
    throw new Error(`[ROUTES] ${label} must be a function`);
  }
}

// check controllers you use in routes
mustBeFn("courseController.listCourses", courseController.listCourses);
mustBeFn("courseController.createCourse", courseController.createCourse);
mustBeFn("courseController.updateCourse", courseController.updateCourse);
mustBeFn("courseController.deleteCourse", courseController.deleteCourse);

mustBeFn(
  "courseRequirementsController.getRequirementsByCourseAdmin",
  courseRequirementsController.getRequirementsByCourseAdmin,
);
mustBeFn(
  "courseRequirementsController.addRequirement",
  courseRequirementsController.addRequirement,
);
mustBeFn(
  "courseRequirementsController.updateRequirement",
  courseRequirementsController.updateRequirement,
);
mustBeFn(
  "courseRequirementsController.deleteRequirement",
  courseRequirementsController.deleteRequirement,
);

mustBeFn(
  "enrollmentAppController.listApplicationsAdmin",
  enrollmentAppController.listApplicationsAdmin,
);
mustBeFn(
  "enrollmentAppController.updateApplicationStatusAdmin",
  enrollmentAppController.updateApplicationStatusAdmin,
);

mustBeFn(
  "classAssignmentController.assignClassToApplication",
  classAssignmentController.assignClassToApplication,
);

mustBeFn("classController.getClasses", classController.getClasses);
mustBeFn("classController.createClass", classController.createClass);
mustBeFn("classController.updateClass", classController.updateClass);
mustBeFn("classController.deleteClass", classController.deleteClass);

mustBeFn("scheduleController.getSchedules", scheduleController.getSchedules);
mustBeFn(
  "scheduleController.createSchedule",
  scheduleController.createSchedule,
);
mustBeFn(
  "scheduleController.updateSchedule",
  scheduleController.updateSchedule,
);
mustBeFn(
  "scheduleController.deleteSchedule",
  scheduleController.deleteSchedule,
);

mustBeFn(
  "reservationController.listReservationsAdmin",
  reservationController.listReservationsAdmin,
);
mustBeFn(
  "reservationController.updateReservationStatusAdmin",
  reservationController.updateReservationStatusAdmin,
);
mustBeFn(
  "reservationController.createWalkInReservation",
  reservationController.createWalkInReservation,
);

mustBeFn("paymentController.listPayments", paymentController.listPayments);
mustBeFn("paymentController.updatePayment", paymentController.updatePayment);

mustBeFn(
  "instructorController.getInstructors",
  instructorController.getInstructors,
);
mustBeFn(
  "instructorController.createInstructor",
  instructorController.createInstructor,
);
mustBeFn(
  "instructorController.updateInstructor",
  instructorController.updateInstructor,
);
mustBeFn(
  "instructorController.deleteInstructor",
  instructorController.deleteInstructor,
);

mustBeFn(
  "adminStudentsController.listDrivingStudentsConfirmed",
  adminStudentsController.listDrivingStudentsConfirmed,
);

// ================= MIDDLEWARE =================
router.use(requireAuth);
router.use(requireAdmin);

// ================= DASHBOARD =================
router.get("/dashboard", (req, res) => {
  res.json({
    status: "success",
    message: "Admin dashboard",
    user: {
      id: req.session.user_id,
      fullname: req.session.fullname,
      role: req.session.role,
    },
  });
});

// ================= INSTRUCTORS =================
router.get("/instructors", instructorController.getInstructors);
router.post("/instructors", instructorController.createInstructor);
router.put("/instructors/:id", instructorController.updateInstructor);
router.delete("/instructors/:id", instructorController.deleteInstructor);

// ================= COURSES =================
router.get("/courses", courseController.listCourses);
router.post("/courses", courseController.createCourse);
router.put("/courses/:id", courseController.updateCourse);
router.delete("/courses/:id", courseController.deleteCourse);

// ================= COURSE REQUIREMENTS =================
router.get(
  "/courses/:courseId/requirements",
  courseRequirementsController.getRequirementsByCourseAdmin,
);
router.post(
  "/courses/:courseId/requirements",
  courseRequirementsController.addRequirement,
);
router.put(
  "/requirements/:requirementId",
  courseRequirementsController.updateRequirement,
);
router.delete(
  "/requirements/:requirementId",
  courseRequirementsController.deleteRequirement,
);

// ================= ENROLLMENT APPLICATIONS =================
router.get("/applications", enrollmentAppController.listApplicationsAdmin);
router.put(
  "/applications/:applicationId",
  enrollmentAppController.updateApplicationStatusAdmin,
);
router.post(
  "/applications/:applicationId/assign-class",
  classAssignmentController.assignClassToApplication,
);

// ================= CLASSES =================
router.get("/classes", classController.getClasses);
router.post("/classes", classController.createClass);
router.put("/classes/:classId", classController.updateClass);
router.delete("/classes/:classId", classController.deleteClass);

// ================= SCHEDULES =================
router.get("/schedules", scheduleController.getSchedules);
router.post("/schedules", scheduleController.createSchedule);
router.put("/schedules/:id", scheduleController.updateSchedule);
router.delete("/schedules/:scheduleId", scheduleController.deleteSchedule);

// ================= RESERVATIONS =================
router.get("/reservations", reservationController.listReservationsAdmin);
router.put("/reservations/:reservationId", reservationController.updateReservationStatusAdmin);
// (optional) walk-in creation if you want it accessible from admin panel
router.post(
  "/reservations/walkin",
  reservationController.createWalkInReservation,
);

// ================= PAYMENTS =================
router.get("/payments", paymentController.listPayments);
router.put("/payments/:paymentId", paymentController.updatePayment);


// ================= students =================
router.get(
  "/students/driving",
  requireAuth,
  requireAdmin,
  adminStudentsController.listDrivingStudentsConfirmed,
);



//PAYMENT ROUTES

router.get("/payments", paymentController.listPayments);

router.get("/payments/qrph", adminQrphVerifyController.listQrphPayments);
router.post(
  "/payments/qrph/:paymentRef/confirm",
  adminQrphVerifyController.confirmQrphPayment,
);
router.post(
  "/payments/qrph/:paymentRef/reject",
  adminQrphVerifyController.rejectQrphPayment,
);


module.exports = router;
