const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const { verifyToken } = require('../middleware/auth');

// Middleware to verify buyer role
const verifyBuyer = (req, res, next) => {
  if (req.user.role !== 'buyer') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Buyer privileges required.'
    });
  }
  next();
};

// Protected buyer routes
router.get('/home', verifyToken, verifyBuyer, buyerController.getBuyerDashboard);

module.exports = router;
