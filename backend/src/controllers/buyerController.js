const { pool } = require('../config/db');

// Get buyer dashboard data
const getBuyerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get buyer's recent purchases
    const [purchases] = await pool.execute(`
      SELECT 
        p.id,
        p.quantity,
        p.total_price,
        p.status,
        p.purchase_date,
        pr.title as product_title,
        pr.price as product_price,
        pr.image as product_image
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = ?
      ORDER BY p.purchase_date DESC
      LIMIT 10
    `, [userId]);

    // Get buyer's cart items
    const [cartItems] = await pool.execute(`
      SELECT 
        c.id,
        c.quantity,
        p.title,
        p.price,
        p.image,
        p.stock_quantity
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.created_at DESC
    `, [userId]);

    // Get available products (for browsing)
    const [availableProducts] = await pool.execute(`
      SELECT 
        id,
        title,
        description,
        price,
        image,
        stock_quantity,
        created_at
      FROM products
      WHERE is_available = true AND stock_quantity > 0
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      message: 'Buyer dashboard data retrieved successfully',
      data: {
        user: {
          id: req.user.id,
          name: req.user.username,
          email: req.user.email,
          role: req.user.role
        },
        recentPurchases: purchases,
        cartItems: cartItems,
        availableProducts: availableProducts,
        stats: {
          totalPurchases: purchases.length,
          cartItemsCount: cartItems.length,
          availableProductsCount: availableProducts.length
        }
      }
    });
  } catch (error) {
    console.error('Buyer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching buyer dashboard data'
    });
  }
};

module.exports = {
  getBuyerDashboard
};
