const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

exports.getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance');
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addFunds = async (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0 || !Number.isInteger(amount)) {
    return res.status(400).json({ message: 'Amount must be a positive integer in paise' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $inc: { walletBalance: amount } },
      { new: true, session }
    );

    await Transaction.create([{
      userId: req.user.id,
      amount,
      type: 'CREDIT',
      description: 'Wallet top-up'
    }], { session });

    await session.commitTransaction();
    res.json({ message: 'Funds added', balance: user.walletBalance });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

exports.getTransactionHistory = async (req, res) => {
  try {
    const history = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};