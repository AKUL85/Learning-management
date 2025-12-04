const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.get('/:userId', profileController.getProfile);
router.put('/:userId', profileController.updateProfile);

module.exports = router;
