const express = require("express");
const router = express.Router();

const tesdaController = require("../controllers/tesdaController");

// OPTIONAL: protect this for admin only
// const { requireAdmin } = require("../middlewares/authMiddleware");
// router.use(requireAdmin);

// TESDA COURSES CRUD
router.get("/courses", tesdaController.getTesdaCourses);
router.post("/courses", tesdaController.createTesdaCourse);
router.put("/courses/:id", tesdaController.updateTesdaCourse);
router.delete("/courses/:id", tesdaController.deleteTesdaCourse);

// TRAINERS (for dropdown)
router.get("/trainers", tesdaController.getTrainersForTesda);

// ASSIGNMENTS
router.get("/course-trainers", tesdaController.getTesdaAssignments);
router.post("/course-trainers", tesdaController.upsertTesdaAssignment);

module.exports = router;
