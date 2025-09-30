const express = require('express');
const FieldController = require('../controllers/FieldController');

const router = express.Router();

// Routes untuk fields
router.get('/', FieldController.getAllFields);
router.get('/:id', FieldController.getFieldById);
router.post('/', FieldController.createField);
router.put('/:id', FieldController.updateField);
router.delete('/:id', FieldController.deleteField);

// Routes tambahan
router.get('/place/:placeId', FieldController.getFieldsByPlaceId);
router.get('/available/:placeId', FieldController.getAvailableFieldsByPlaceId);

module.exports = router;