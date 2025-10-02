const express = require('express');
const UserController = require('../controllers/UserController');
const { formDataFields } = require('../middleware/formData');

const router = express.Router();

// Routes untuk users
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', formDataFields, UserController.createUser);
router.put('/:id', formDataFields, UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Routes tambahan
router.get('/role/:role', UserController.getUsersByRole);
router.post('/login', formDataFields, UserController.loginUser);
router.patch('/:id/verify-email', UserController.verifyUser);
router.patch('/:id/change-password', formDataFields, UserController.changePassword);

// Routes untuk OTP verification
router.post('/verify-otp', formDataFields, UserController.verifyOTP);
router.post('/resend-otp', formDataFields, UserController.resendOTP);
router.get('/check-verification/:email', UserController.checkVerificationStatus);

module.exports = router;