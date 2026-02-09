const express = require("express");
const router = express.Router();

const { requireAdmin } = require("../middlewares/authMiddleware");

const tesdaCoursesController = require("../controllers/adminTesdaCoursesController");
const tesdaTrainersController = require("../controllers/adminTesdaTrainersController");
const tesdaAssignmentController = require("../controllers/adminTesdaAssignmentController");
const tesdaSched = require("../controllers/adminTesdaScheduleController");

router.use(requireAdmin);

// TESDA COURSES
router.get("/courses", tesdaCoursesController.getTesdaCourses);
router.post("/courses", tesdaCoursesController.createTesdaCourse);
router.put("/courses/:id", tesdaCoursesController.updateTesdaCourse);
router.delete("/courses/:id", tesdaCoursesController.deleteTesdaCourse);

// TESDA TRAINERS ✅
router.get("/trainers", tesdaTrainersController.getTrainers);
router.post("/trainers", tesdaTrainersController.createTrainer);
router.put("/trainers/:id", tesdaTrainersController.updateTrainer);
router.delete("/trainers/:id", tesdaTrainersController.deleteTrainer);

// COURSE ⇄ TRAINER ASSIGNMENT
router.get("/course-trainers", tesdaAssignmentController.getCourseTrainers);
router.post("/course-trainers", tesdaAssignmentController.assignTrainerToCourse);
router.delete("/course-trainers/:courseId", tesdaAssignmentController.removeTrainerFromCourse);

// TESDA schedules CRUD
router.get("/schedules", tesdaSched.getTesdaSchedules);
router.post("/schedules", tesdaSched.createTesdaSchedule);
router.put("/schedules/:id", tesdaSched.updateTesdaSchedule);
router.delete("/schedules/:id", tesdaSched.deleteTesdaSchedule);

module.exports = router;
