const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  responseStatus: { type: Number, required: true },
  responseData: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // Automatically deletes after 24 hours
});

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);