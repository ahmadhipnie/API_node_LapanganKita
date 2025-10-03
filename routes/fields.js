const express = require('express');
const router = express.Router();
const FieldController = require('../controllers/FieldController');
const { handleUploadFieldPhoto } = require('../middleware/uploadFieldPhoto');

// Routes for Fields CRUD with owner validation

// Search fields (harus di atas :id route)
router.get('/search', FieldController.searchFields);

// Get all fields
router.get('/', FieldController.getAllFields);

// Get fields by place ID
router.get('/place/:id_place', FieldController.getFieldsByPlace);

// Get field by ID (harus di bawah routes dengan path spesifik)
router.get('/:id', FieldController.getFieldById);

// Create new field (with photo upload and owner validation)
router.post('/', handleUploadFieldPhoto, FieldController.createField);

// Update field (with photo upload and owner validation)
router.put('/:id', handleUploadFieldPhoto, FieldController.updateField);

// Delete field (with owner validation)
router.delete('/:id', FieldController.deleteField);

module.exports = router;