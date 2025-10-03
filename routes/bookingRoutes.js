const express = require('express');
const BookingController = require('../controllers/BookingController');
const { formDataFields } = require('../middleware/formData');

const router = express.Router();

// Test routes without authentication for now
router.get('/', BookingController.getAllBooking);
router.get('/me/bookings', BookingController.getMyBookings);
router.get('/owner/bookings', BookingController.getFieldOwnerBookings);
router.get('/:id', BookingController.getBookingById);
router.post('/', formDataFields, BookingController.createBooking);
router.patch('/:id/status', formDataFields, BookingController.updateBookingStatus);
router.patch('/:id/complete', formDataFields, BookingController.completeBooking);

module.exports = router;