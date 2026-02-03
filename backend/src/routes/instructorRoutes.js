// src/routes/instructorRoutes.js
const express = require("express");
const router = express.Router();

const {
  requireAuth,
  requireInstructor,
} = require("../middlewares/authMiddleware");

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

module.exports = router;
