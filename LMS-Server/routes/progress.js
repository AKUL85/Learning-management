const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');

router.get('/:userId/all', progressController.getAllProgress);
router.get('/:userId/:courseId', progressController.getProgress);
router.get('/:userId/:courseId/certificate', progressController.getCertificate);
router.post('/:userId/:courseId', progressController.updateProgress);

module.exports = router;
