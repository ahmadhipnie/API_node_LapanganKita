const express = require('express');
const PlaceController = require('../controllers/PlaceController');
const { handleUploadPlacePhotoSimple } = require('../middleware/uploadPlacePhotoSimple');

const router = express.Router();

// Routes untuk places - urutan penting untuk mencegah konflik routing
router.get('/search', PlaceController.searchPlaces);
router.get('/owner/:ownerId', PlaceController.getPlacesByOwnerId);
router.get('/user/:userId/ownership', PlaceController.checkOwnership);
router.get('/:id', PlaceController.getPlaceById);
router.get('/', PlaceController.getAllPlaces);

// Routes dengan upload file - menggunakan middleware simple untuk TEXT field
router.post('/', handleUploadPlacePhotoSimple, PlaceController.createPlace);
router.put('/:id', handleUploadPlacePhotoSimple, PlaceController.updatePlace);

// Routes tanpa upload file
router.delete('/:id', PlaceController.deletePlace);
router.patch('/:id/balance', PlaceController.updateBalance);

module.exports = router;