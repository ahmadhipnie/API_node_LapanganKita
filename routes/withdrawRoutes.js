const express = require('express');
const WithdrawController = require('../controllers/WithdrawController');
const { uploadWithdrawMiddleware } = require('../middleware/uploadWithdraw');

const router = express.Router();

// Test routes without authentication for now
router.get('/', WithdrawController.getAllWithdraws);
router.get('/user', WithdrawController.getWithdrawsByUserId); // ?user_id=
router.get('/balance', WithdrawController.getUserBalanceSummary); // ?user_id=
router.get('/:id', WithdrawController.getWithdrawById);
router.post('/', uploadWithdrawMiddleware, WithdrawController.createWithdraw);
router.put('/:id', uploadWithdrawMiddleware, WithdrawController.updateWithdraw);
router.delete('/:id', WithdrawController.deleteWithdraw);

module.exports = router;