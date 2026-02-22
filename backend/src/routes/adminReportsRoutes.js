const express = require("express");
const router = express.Router();

const { requireAuth, requireAdmin } = require("../middlewares/authMiddleware");
const c = require("../controllers/adminReportsController");

router.use(requireAuth, requireAdmin);

// JSON endpoints (UI uses these)
router.get("/detailed", c.getDetailed);
router.get("/summary", c.getSummary);
router.get("/trend", c.getTrend);
router.get("/top-courses", c.getTopCourses);
router.get("/gender-breakdown", c.getGenderBreakdown);
router.get("/course-monthly-preview", c.getCourseMonthlyPreview);
router.get("/revenue-preview", c.getRevenuePreview);

// ✅ EXPORT endpoints (ito yung missing)
router.get("/export/overview", c.exportOverview);
router.get("/export/top-courses", c.exportTopCourses);
router.get("/export/course-monthly", c.exportCourseMonthly);
router.get("/export/revenue", c.exportRevenue);
router.get("/export/detailed", c.exportDetailed);
router.get("/export/all", c.exportAll);

module.exports = router;
