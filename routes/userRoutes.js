const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

// Routes untuk users
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Routes tambahan
router.get('/role/:role', UserController.getUsersByRole);
router.post('/login', UserController.loginUser);
router.patch('/:id/verify-email', UserController.verifyUser);
router.patch('/:id/change-password', UserController.changePassword);

module.exports = router;