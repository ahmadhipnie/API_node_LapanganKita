const express = require('express');
const { serveBase64AsFile } = require('../middleware/uploadPlacePhotoTmp');
const PlaceModel = require('../models/PlaceModel');

const router = express.Router();

// GET /uploads/places/:filename - Serve photo from base64
router.get('/places/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Extract place ID dari filename (assuming format: place-{id}-{timestamp}-{random}.ext)
    const placeIdMatch = filename.match(/place-(\d+)-/);
    
    if (!placeIdMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid filename format'
      });
    }
    
    const placeId = placeIdMatch[1];
    const place = await PlaceModel.getById(placeId);
    
    if (!place || !place.place_photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }
    
    // Serve base64 as file
    serveBase64AsFile(place.place_photo, filename, res);
    
  } catch (error) {
    console.error('Error serving photo:', error);
    res.status(500).json({
      success: false,
      message: 'Error serving photo',
      error: error.message
    });
  }
});

// GET /uploads/places/base64/:id - Get base64 data directly
router.get('/places/base64/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const place = await PlaceModel.getById(id);
    
    if (!place || !place.place_photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        id: place.id,
        place_name: place.place_name,
        photo_data: place.place_photo
      }
    });
    
  } catch (error) {
    console.error('Error getting photo data:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting photo data',
      error: error.message
    });
  }
});

module.exports = router;