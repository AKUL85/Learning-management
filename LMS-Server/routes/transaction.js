const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/recharge', transactionController.rechargeWallet);
router.post('/purchase', transactionController.purchaseCourse);

module.exports = router;
