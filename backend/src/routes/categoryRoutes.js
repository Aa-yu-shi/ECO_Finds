const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:category', categoryController.getProductsByCategory);
router.get('/stats/overview', categoryController.getCategoryStats);

module.exports = router;
