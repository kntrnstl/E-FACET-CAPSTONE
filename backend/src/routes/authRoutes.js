const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Test route
router.get('/test', authController.test);

// Check authentication status
router.get('/check', authController.checkAuth);

// Check admin status
router.get('/check-admin', authController.checkAdmin);

// Login route
router.post('/login', authController.login);

// Signup route
router.post('/signup', authController.signup);

// Logout route
router.get('/logout', authController.logout);

// Check username availability
router.get('/check-username', authController.checkUsername);

module.exports = router;