const express = require('express');
const RatingController = require('../controllers/RatingController');
const { formDataFields } = require('../middleware/formData');

const router = express.Router();

// Test routes without authentication for now
router.get('/', RatingController.getAllRatings);
router.get('/user', RatingController.getRatingsByUserId); // ?user_id=
router.get('/owner', RatingController.getRatingsByFieldOwnerId); // ?owner_id=
router.get('/stats/:place_id', RatingController.getRatingStatsByPlace);
router.get('/booking/:booking_id', RatingController.getRatingByBookingId);
router.get('/:id', RatingController.getRatingById);
router.post('/', formDataFields, RatingController.createRating);
router.put('/:id', formDataFields, RatingController.updateRating);
router.delete('/:id', RatingController.deleteRating);

module.exports = router;