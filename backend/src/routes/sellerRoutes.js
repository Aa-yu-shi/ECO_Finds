const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { verifyToken } = require('../middleware/auth');

// Middleware to verify seller role
const verifySeller = (req, res, next) => {
  if (req.user.role !== 'seller') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Seller privileges required.'
    });
  }
  next();
};

// Protected seller routes
router.get('/home', verifyToken, verifySeller, sellerController.getSellerDashboard);

module.exports = router;
