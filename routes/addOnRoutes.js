const express = require('express');
const AddOnController = require('../controllers/AddOnController');

const router = express.Router();

// Routes untuk add-ons
router.get('/', AddOnController.getAllAddOn);
router.get('/:id', AddOnController.getAddOnById);
router.post('/', AddOnController.createAddOn);
router.put('/:id', AddOnController.updateAddOn);
router.delete('/:id', AddOnController.deleteAddOn);

// Routes tambahan
router.get('/place/:placeId', AddOnController.getAddOnsByPlaceId);
router.get('/available/:placeId', AddOnController.getAvailableAddOnsByPlaceId);
router.patch('/:id/stock', AddOnController.updateStock);

module.exports = router;