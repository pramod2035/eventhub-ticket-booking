const express = require('express');
const { getEventSeats, reserveSeat, confirmBooking, getUserBookings, getAllEvents } = require('../controllers/bookingController');
const { authenticate } = require('../middleware/authMiddleware');
const { verifyIdempotency } = require('../middleware/idempotencyMiddleware');
const router = express.Router();

// The missing route that was causing the 404!
router.get('/events', authenticate, getAllEvents);

router.get('/seats/:eventId', getEventSeats);
router.post('/reserve', authenticate, reserveSeat);
router.post('/confirm', authenticate, verifyIdempotency, confirmBooking);
router.get('/history', authenticate, getUserBookings);

module.exports = router;