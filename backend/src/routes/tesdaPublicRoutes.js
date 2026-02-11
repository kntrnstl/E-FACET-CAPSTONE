const express = require("express");
const router = express.Router();

const tesdaPublicController = require("../controllers/tesdaPublicController");

// ✅ PUBLIC: courses list for students
router.get("/courses", tesdaPublicController.getActiveCourses);

module.exports = router;
