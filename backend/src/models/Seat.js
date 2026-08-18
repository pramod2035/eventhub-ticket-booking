const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  seatNumber: { type: String, required: true },
  status: { type: String, enum: ['AVAILABLE', 'RESERVED', 'BOOKED'], default: 'AVAILABLE', index: true }, //
  lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  lockedUntil: { type: Date, default: null } // Handles the 5-minute lock
}, { timestamps: true });

seatSchema.index({ eventId: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);