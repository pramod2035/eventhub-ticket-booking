const express = require('express');
const { 
    createEvent, 
    getAdminEvents, 
    getAllBookings, 
    processRefund, 
    deleteEvent, 
    updateEvent 
} = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

// Event Routes
router.post('/events', authenticate, authorizeAdmin, createEvent);
router.get('/events', authenticate, authorizeAdmin, getAdminEvents);
router.delete('/events/:eventId', authenticate, authorizeAdmin, deleteEvent);
router.put('/events/:eventId', authenticate, authorizeAdmin, updateEvent);

// Booking & Refund Routes
router.get('/bookings', authenticate, authorizeAdmin, getAllBookings);
router.post('/refund/:bookingId', authenticate, authorizeAdmin, processRefund);

module.exports = router;