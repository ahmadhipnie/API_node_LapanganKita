const express = require('express');
const AddOnController = require('../controllers/AddOnController');
const { handleUploadAddOnPhoto } = require('../middleware/uploadAddOnPhoto');

const router = express.Router();

// Routes untuk add-ons dengan owner validation

// Get all add-ons
router.get('/', AddOnController.getAllAddOn);

// Get add-ons by place ID  
router.get('/place/:placeId', AddOnController.getAddOnsByPlaceId);

// Get available add-ons by place ID (stock > 0)
router.get('/available/:placeId', AddOnController.getAvailableAddOnsByPlaceId);

// Get add-on by ID (harus di bawah routes spesifik)
router.get('/:id', AddOnController.getAddOnById);

// Create new add-on (with photo upload and owner validation)
router.post('/', handleUploadAddOnPhoto, AddOnController.createAddOn);

// Update add-on (with photo upload and owner validation)
router.put('/:id', handleUploadAddOnPhoto, AddOnController.updateAddOn);

// Update stock add-on (with owner validation)
router.patch('/:id/stock', AddOnController.updateStock);

// Delete add-on (with owner validation)
router.delete('/:id', AddOnController.deleteAddOn);

module.exports = router;