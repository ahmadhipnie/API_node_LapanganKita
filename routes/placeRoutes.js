const express = require('express');
const PlaceController = require('../controllers/PlaceController');

const router = express.Router();

// Routes untuk places
router.get('/', PlaceController.getAllPlaces);
router.get('/:id', PlaceController.getPlaceById);
router.post('/', PlaceController.createPlace);
router.put('/:id', PlaceController.updatePlace);
router.delete('/:id', PlaceController.deletePlace);

// Routes tambahan
router.get('/owner/:ownerId', PlaceController.getPlacesByOwnerId);
router.patch('/:id/balance', PlaceController.updateBalance);

module.exports = router;