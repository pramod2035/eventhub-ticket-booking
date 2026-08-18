const Event = require('../models/Event');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

exports.createEvent = async (req, res) => {
  try {
    const { title, date, location, ticketPrice, totalSeats } = req.body;
    
    // Create the Event
    const event = await Event.create({
      title,
      date,
      location,
      ticketPrice
    });

    // Bulk Create Seats based on the form input
    const seatsCount = totalSeats || 60;
    const seatsToCreate = [];
    for (let i = 1; i <= seatsCount; i++) {
      seatsToCreate.push({
        eventId: event._id,
        seatNumber: `S${i}`,
        status: 'AVAILABLE'
      });
    }
    
    await Seat.insertMany(seatsToCreate);

    res.status(201).json({ message: 'Event and seats successfully launched!', event });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAdminEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('eventId', 'title')
      .populate('seatId', 'seatNumber')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.processRefund = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { bookingId } = req.params;
    
    const booking = await Booking.findById(bookingId).session(session);
    if (!booking || booking.status !== 'CONFIRMED') {
      throw new Error('Booking not found or already cancelled');
    }

    await User.findByIdAndUpdate(
      booking.userId, 
      { $inc: { walletBalance: booking.amountPaid } }, 
      { session, returnDocument: 'after' }
    );

    await Seat.findByIdAndUpdate(
      booking.seatId, 
      { status: 'AVAILABLE', lockedBy: null, lockedUntil: null }, 
      { session }
    );

    booking.status = 'CANCELLED';
    await booking.save({ session });

    await Transaction.create([{
      userId: booking.userId,
      amount: booking.amountPaid,
      type: 'CREDIT',
      referenceId: booking._id.toString(),
      description: 'Refund for cancelled booking'
    }], { session });

    await session.commitTransaction();
    res.json({ message: 'Refund processed successfully' });
  } catch (err) {
    await session.abortTransaction();
    res.status(400).json({ error: err.message });
  } finally {
    session.endSession();
  }
};