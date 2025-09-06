const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { verifyToken } = require('../middleware/auth');

// All purchase routes require authentication
router.post('/checkout', verifyToken, purchaseController.createPurchase);
router.get('/history', verifyToken, purchaseController.getPurchaseHistory);
router.get('/sales', verifyToken, purchaseController.getSalesHistory);
router.get('/:id', verifyToken, purchaseController.getPurchaseById);
router.put('/:id/cancel', verifyToken, purchaseController.cancelPurchase);

module.exports = router;
