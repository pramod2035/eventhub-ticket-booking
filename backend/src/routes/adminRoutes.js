const express = require('express');
const { createEvent, getAdminEvents, getAllBookings, processRefund } = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/events', authenticate, authorizeAdmin, createEvent);
router.get('/events', authenticate, authorizeAdmin, getAdminEvents);

// New Routes for Refunds
router.get('/bookings', authenticate, authorizeAdmin, getAllBookings);
router.post('/refund/:bookingId', authenticate, authorizeAdmin, processRefund);

module.exports = router;