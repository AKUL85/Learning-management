const express = require('express');
// Routes for handling payments, wallet recharges, and course purchases
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/recharge', transactionController.rechargeWallet);
router.post('/purchase', transactionController.purchaseCourse);

module.exports = router;
