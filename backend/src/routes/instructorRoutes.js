// src/routes/instructorRoutes.js
const express = require("express");
const router = express.Router();

const { requireAuth, requireInstructor } = require("../middlewares/authMiddleware");

// All instructor routes require login + instructor
router.use(requireAuth);
router.use(requireInstructor);

router.get("/dashboard", (req, res) => {
  res.json({
    status: "success",
    message: "Instructor dashboard",
    user: {
      user_id: req.session.user_id,
      username: req.session.username,
      fullname: req.session.fullname,
      role: req.session.role,
    },
    stats: {
      assignedCourses: 0,
      totalStudentsHandled: 0,
      pendingGrades: 0,
      upcomingClasses: 0,
    },
  });
});

// ✅ Instructor can only VIEW assigned classes (TESDA)
const { getTesdaClasses } = require("../controllers/tesdaClassesController");
const { getDrivingInstructorClasses } = require("../controllers/drivingInstructorClassesController");
const { getDrivingClasses } = require("../controllers/drivingClassesController");


router.get("/driving/classes", getDrivingClasses);
router.get("/tesda/classes", getTesdaClasses);
router.get("/driving/classes", getDrivingInstructorClasses);

module.exports = router;
