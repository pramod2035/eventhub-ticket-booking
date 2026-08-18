const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Event = require('../models/Event');
const User = require('../models/User');
const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getEventSeats = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid Event ID format' });
    }

    const now = new Date();
    const seats = await Seat.find({ eventId });
    
    const formatted = seats.map(seat => {
      const isExpired = seat.status === 'RESERVED' && seat.lockedUntil && seat.lockedUntil < now;
      return {
        _id: seat._id,
        seatNumber: seat.seatNumber,
        status: isExpired ? 'AVAILABLE' : seat.status,
        lockedBy: isExpired ? null : seat.lockedBy,
        lockedUntil: isExpired ? null : seat.lockedUntil
      };
    });
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reserveSeat = async (req, res) => {
  const { seatId } = req.body;
  const userId = req.user.id;
  const lockExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  try {
    const seat = await Seat.findOneAndUpdate(
      {
        _id: seatId,
        $or: [
          { status: 'AVAILABLE' },
          { status: 'RESERVED', lockedUntil: { $lt: new Date() } }
        ]
      },
      { $set: { status: 'RESERVED', lockedBy: userId, lockedUntil: lockExpiry } },
      { returnDocument: 'after' } 
    );

    if (!seat) return res.status(409).json({ message: 'Seat unavailable' });
    res.json({ message: 'Seat reserved', seat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.confirmBooking = async (req, res) => {
  const { seatId } = req.body;
  const userId = req.user.id;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const seat = await Seat.findOne({
      _id: seatId, status: 'RESERVED', lockedBy: userId, lockedUntil: { $gt: new Date() }
    }).session(session);

    if (!seat) throw new Error('Reservation expired');

    const event = await Event.findById(seat.eventId).session(session);
    const price = event.ticketPrice;

    const user = await User.findOneAndUpdate(
      { _id: userId, walletBalance: { $gte: price } },
      { $inc: { walletBalance: -price } },
      { returnDocument: 'after', session } // 3. FIX: Clears Mongoose Warning
    );

    if (!user) throw new Error('Insufficient funds');

    seat.status = 'BOOKED';
    seat.lockedUntil = null;
    await seat.save({ session });

    const [booking] = await Booking.create([{
      userId, eventId: event._id, seatId: seat._id, amountPaid: price, status: 'CONFIRMED'
    }], { session });

    await Transaction.create([{
      userId, amount: price, type: 'DEBIT', referenceId: booking._id.toString(), description: `Booking for ${event.title}`
    }], { session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Success', booking });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('eventId', 'title date location')
      .populate('seatId', 'seatNumber')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};