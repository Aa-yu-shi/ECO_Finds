const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');

// Public routes (no authentication required)
router.get('/', productController.getAllProducts); // Get all products with search/filter
router.get('/:id', productController.getProductById); // Get single product by ID

// Protected routes (authentication required)
router.post('/', verifyToken, productController.createProduct); // Create new product
router.get('/user/my-products', verifyToken, productController.getUserProducts); // Get user's products
router.put('/:id', verifyToken, productController.updateProduct); // Update product
router.delete('/:id', verifyToken, productController.deleteProduct); // Delete product

module.exports = router;
