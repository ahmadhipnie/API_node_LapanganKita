const express = require('express');
const PromosiController = require('../controllers/PromosiController');
const { uploadPromosiMiddleware } = require('../middleware/uploadPromosi');

const router = express.Router();

// Public routes - no authentication required
router.get('/', PromosiController.getAllPromosi);
router.get('/slider', PromosiController.getPromosiForSlider); // Optimized for Android app
router.get('/count', PromosiController.getPromosiCount);
router.get('/:id', PromosiController.getPromosiById);

// Admin routes (currently no auth, but intended for admin use)
router.post('/', uploadPromosiMiddleware, PromosiController.createPromosi);
router.put('/:id', uploadPromosiMiddleware, PromosiController.updatePromosi);
router.delete('/:id', PromosiController.deletePromosi);
router.post('/bulk', PromosiController.bulkUploadPromosi); // Future feature

module.exports = router;