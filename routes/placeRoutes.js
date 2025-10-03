const express = require('express');
const PlaceController = require('../controllers/PlaceController');
const { handleUploadPlacePhoto } = require('../middleware/uploadPlacePhoto');

const router = express.Router();

// Routes untuk places - urutan penting untuk mencegah konflik routing
router.get('/search', PlaceController.searchPlaces);
router.get('/owner/:id_users', PlaceController.getPlacesByOwner);
router.get('/:id', PlaceController.getPlaceById);
router.get('/', PlaceController.getAllPlaces);

// Routes dengan upload file - menggunakan folder uploads/places
router.post('/', handleUploadPlacePhoto, PlaceController.createPlace);
router.put('/:id', handleUploadPlacePhoto, PlaceController.updatePlace);

// Routes tanpa upload file
router.delete('/:id', PlaceController.deletePlace);

module.exports = router;