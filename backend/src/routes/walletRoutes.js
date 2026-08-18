const express = require('express');
const { getWalletBalance, addFunds, getTransactionHistory } = require('../controllers/walletController');
const { authenticate } = require('../middleware/authMiddleware.js');
const router = express.Router();

router.use(authenticate); // Protect all wallet routes

router.get('/balance', getWalletBalance);
router.post('/topup', addFunds);
router.get('/history', getTransactionHistory);

module.exports = router;