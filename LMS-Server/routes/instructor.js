const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const controller = require('../controllers/instructorController');

const { uploadCourseFiles } = require('../middleware/upload');


router.use(auth);

router.get('/dashboard', controller.getDashboard);


router.post(
  '/course',
  uploadCourseFiles,         
  controller.createCourse
);


router.get('/transactions/pending', controller.getPendingTransactions);
router.post('/transaction/:id/validate', controller.validateTransaction);

module.exports = router;
