const express = require('express');
const router = express.Router();
const RefundController = require('../controllers/RefundController');
const { uploadRefundPhoto, handleMulterError } = require('../middleware/uploadRefund');

// GET Routes
router.get('/', RefundController.getAllRefunds);
router.get('/:id', RefundController.getRefundById);
router.get('/booking/:booking_id', RefundController.getRefundsByBookingId);

// POST Routes (with file upload)
router.post('/', uploadRefundPhoto, handleMulterError, RefundController.createRefund);

// PUT Routes (with optional file upload)
router.put('/:id', uploadRefundPhoto, handleMulterError, RefundController.updateRefund);

// DELETE Routes
router.delete('/:id', RefundController.deleteRefund);

module.exports = router;