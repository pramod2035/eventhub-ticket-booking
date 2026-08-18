const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true },
  amountPaid: { type: Number, required: true },
  status: { type: String, enum: ['CONFIRMED', 'CANCELLED'], default: 'CONFIRMED' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);