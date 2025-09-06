const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Public routes
router.get('/', searchController.searchProducts);
router.get('/suggestions', searchController.getSearchSuggestions);
router.get('/popular', searchController.getPopularSearches);

module.exports = router;
