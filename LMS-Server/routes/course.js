const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/Auth');
const { uploadCourseFiles } = require('../middleware/upload');

router.get('/', courseController.getPublishedCourses);

router.post('/', auth, uploadCourseFiles, courseController.createCourse);

const optionalAuth = require('../middleware/OptionalAuth');

router.get('/:id', optionalAuth, courseController.getCourseById);

router.put('/:id', auth, uploadCourseFiles, courseController.updateCourse);

router.patch('/:id', auth, uploadCourseFiles, courseController.partialUpdateCourse);

router.delete('/:id', auth, courseController.deleteCourse);

router.post('/:id/reviews', auth, courseController.addReview);

router.post('/:id/qa', auth, courseController.addQuestion);

router.put('/:id/qa/:qaId', auth, courseController.answerQuestion);

module.exports = router;
