const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { verifyToken } = require('../middleware/auth');

// Protected routes
router.get('/seller', verifyToken, analyticsController.getSellerAnalytics);
router.get('/buyer', verifyToken, analyticsController.getBuyerAnalytics);
router.get('/platform', verifyToken, analyticsController.getPlatformAnalytics);

module.exports = router;
