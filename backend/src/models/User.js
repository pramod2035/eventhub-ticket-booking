const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  walletBalance: { type: Number, default: 0, min: 0 } // Amount stored in paise/cents
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);