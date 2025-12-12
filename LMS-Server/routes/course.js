const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');

// GET all published courses
router.get('/', courseController.getPublishedCourses);

// ✅ GET course details by ID
router.get('/:id', courseController.getCourseById);

module.exports = router;
