const express = require('express');
const router = express.Router();
const instructorController = require('../controllers/courseController');

router.get('/', instructorController.getPublishedCourses);

module.exports = router;
