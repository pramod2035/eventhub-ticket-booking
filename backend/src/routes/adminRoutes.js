const express = require('express');
const { createEvent, getAdminEvents, getAllBookings, processRefund } = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/events', authenticate, authorizeAdmin, createEvent);
router.get('/events', authenticate, authorizeAdmin, getAdminEvents);

// New Routes for Refunds
router.get('/bookings', authenticate, authorizeAdmin, getAllBookings);
router.post('/refund/:bookingId', authenticate, authorizeAdmin, processRefund);

const { createEvent, processRefund, deleteEvent, updateEvent } = require('../controllers/adminController');

// Add these two lines below your existing routes
router.delete('/events/:eventId', authenticate, isAdmin, deleteEvent);
router.put('/events/:eventId', authenticate, isAdmin, updateEvent);

module.exports = router;