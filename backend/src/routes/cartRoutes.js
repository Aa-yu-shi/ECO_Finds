const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/auth');

// All cart routes require authentication
router.post('/add', verifyToken, cartController.addToCart);
router.get('/', verifyToken, cartController.getCart);
router.put('/:id', verifyToken, cartController.updateCartItem);
router.delete('/:id', verifyToken, cartController.removeFromCart);
router.delete('/', verifyToken, cartController.clearCart);

module.exports = router;
