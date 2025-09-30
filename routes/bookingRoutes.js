const express = require('express');
const BookingController = require('../controllers/BookingController');
const { formDataFields } = require('../middleware/formData');

const router = express.Router();

// Routes untuk bookings
router.get('/', BookingController.getAllBooking);
router.get('/:id', BookingController.getBookingById);
router.post('/', formDataFields, BookingController.createBooking);
router.put('/:id', formDataFields, BookingController.updateBooking);
router.delete('/:id', BookingController.deleteBooking);

// Routes tambahan
router.patch('/:id/status', BookingController.updateBookingStatus);
router.post('/check-availability', formDataFields, BookingController.checkAvailability);
router.get('/user/:userId', BookingController.getBookingsByUserId);
router.get('/field/:fieldId', BookingController.getBookingsByFieldId);
router.get('/status/:status', BookingController.getBookingsByStatus);
router.get('/order/:orderId', BookingController.getBookingByOrderId);
router.patch('/:id/snap-token', BookingController.updateSnapToken);

module.exports = router;