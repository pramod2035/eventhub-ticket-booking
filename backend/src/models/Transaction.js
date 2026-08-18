const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true }, 
  type: { type: String, enum: ['CREDIT', 'DEBIT', 'REFUND'], required: true }, //[cite: 1]
  referenceId: { type: String }, 
  description: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);