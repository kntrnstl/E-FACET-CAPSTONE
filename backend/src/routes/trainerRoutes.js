const express = require("express");
const router = express.Router();

const trainerController = require("../controllers/trainerController");
const { requireTrainer } = require("../middlewares/authMiddleware");

// ✅ add this controller
const trainerTesdaController = require("../controllers/trainerTesdaController");

// protect all trainer endpoints
router.use(requireTrainer);
router.get("/tesda/courses", trainerController.getMyTesdaCourses);


// existing CRUD trainers
router.post("/", trainerController.createTrainer);
router.put("/:id", trainerController.updateTrainer);
router.delete("/:id", trainerController.deleteTrainer);

// ✅ NEW: trainer panel - assigned TESDA courses
router.get("/tesda/courses", trainerTesdaController.getMyTesdaCourses);

module.exports = router;
