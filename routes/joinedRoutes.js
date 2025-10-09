const express = require('express');
const router = express.Router();
const JoinedController = require('../controllers/JoinedController');

// GET Routes
router.get('/', JoinedController.getAllJoinRequests);
router.get('/booking/:booking_id', JoinedController.getJoinRequestsByBookingId);
router.get('/user', JoinedController.getJoinRequestsByUserId); // Query: ?user_id=123
router.get('/poster', JoinedController.getJoinRequestsForPoster); // Query: ?poster_user_id=123

// POST Routes
router.post('/', JoinedController.createJoinRequest);

// PUT Routes
router.put('/:id/status', JoinedController.updateJoinRequestStatus);

// DELETE Routes
router.delete('/:id', JoinedController.deleteJoinRequest);

module.exports = router;