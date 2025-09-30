const express = require('express');
const BookingController = require('../controllers/BookingController');

const router = express.Router();

// Routes untuk bookings
router.get('/', BookingController.getAllBooking);
router.get('/:id', BookingController.getBookingById);
router.post('/', BookingController.createBooking);
router.put('/:id', BookingController.updateBooking);
router.delete('/:id', BookingController.deleteBooking);

// Routes tambahan
router.patch('/:id/status', BookingController.updateBookingStatus);
router.post('/check-availability', BookingController.checkAvailability);
router.get('/user/:userId', BookingController.getBookingsByUserId);
router.get('/field/:fieldId', BookingController.getBookingsByFieldId);
router.get('/status/:status', BookingController.getBookingsByStatus);
router.get('/order/:orderId', BookingController.getBookingByOrderId);
router.patch('/:id/snap-token', BookingController.updateSnapToken);

module.exports = router;