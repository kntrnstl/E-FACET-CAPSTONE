// src/routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const { requireAuth } = require('../controllers/authController');

// All student routes require authentication
router.use(requireAuth);

// Student dashboard data
router.get('/dashboard', (req, res) => {
  // Check if user is a student
  if (req.session.role !== 'student') {
    return res.status(403).json({
      status: 'error',
      message: 'Access denied. Student role required.'
    });
  }

  // Return student dashboard data
  res.json({
    status: 'success',
    message: 'Student dashboard data',
    user: {
      id: req.session.user_id,
      username: req.session.username,
      fullname: req.session.fullname,
      role: req.session.role
    },
    dashboardData: {
      progressOverview: [
        { name: 'Traffic Rules', percentage: 80 },
        { name: 'Driving Simulation', percentage: 45 },
        { name: 'Safety Orientation', percentage: 20 }
      ],
      upcomingSessions: [
        { 
          id: 1, 
          title: 'Traffic Rules', 
          dateTime: '2025-10-25T14:00:00',
          action: 'View Details'
        }
      ],
      availableCourses: [
        { id: 1, name: 'First Aid Basics', enrolled: false },
        { id: 2, name: 'Traffic Law Review', enrolled: false }
      ]
    }
  });
});

// Enroll in course
router.post('/enroll/:courseId', (req, res) => {
  const { courseId } = req.params;
  
  // Here you would add enrollment logic to database
  res.json({
    status: 'success',
    message: `Enrolled in course ${courseId}`,
    courseId: courseId
  });
});

// Get student courses
router.get('/courses', (req, res) => {
  res.json({
    status: 'success',
    courses: [
      { id: 1, name: 'Traffic Rules', progress: 80 },
      { id: 2, name: 'Driving Simulation', progress: 45 }
    ]
  });
});

module.exports = router;