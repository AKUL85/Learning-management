const express = require('express');
const router = express.Router();
const auth = require('../middleware/Auth');
const controller = require('../controllers/instructorController');

// NEW multer import
const { uploadFiles } = require('../middleware/upload');

router.use(auth);

router.get('/dashboard', controller.getDashboard);

// UPDATED COURSE ROUTE
router.post(
  '/course',
  uploadFiles,          // <-- this replaces uploadImage + uploadVideo
  controller.createCourse
);

router.get('/transactions/pending', controller.getPendingTransactions);
router.post('/transaction/:id/validate', controller.validateTransaction);

module.exports = router;
