const express = require('express');
const PlaceController = require('../controllers/PlaceController');
const { formDataFields } = require('../middleware/formData');

const router = express.Router();

// Routes untuk places
router.get('/', PlaceController.getAllPlaces);
router.get('/:id', PlaceController.getPlaceById);
router.post('/', formDataFields, PlaceController.createPlace);
router.put('/:id', formDataFields, PlaceController.updatePlace);
router.delete('/:id', PlaceController.deletePlace);

// Routes tambahan
router.get('/owner/:ownerId', PlaceController.getPlacesByOwnerId);
router.patch('/:id/balance', PlaceController.updateBalance);

module.exports = router;