const { pool } = require('../config/db');

// Get seller dashboard data
const getSellerDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get seller's products
    const [products] = await pool.execute(`
      SELECT 
        id,
        title,
        description,
        category,
        price,
        image,
        stock_quantity,
        is_available,
        created_at,
        updated_at
      FROM products
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);

    // Get sales data (purchases of seller's products)
    const [sales] = await pool.execute(`
      SELECT 
        p.id as purchase_id,
        p.quantity,
        p.total_price,
        p.status,
        p.purchase_date,
        pr.title as product_title,
        u.username as buyer_name,
        u.email as buyer_email
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      JOIN users u ON p.user_id = u.id
      WHERE pr.user_id = ?
      ORDER BY p.purchase_date DESC
      LIMIT 20
    `, [userId]);

    // Calculate total sales
    const [totalSalesResult] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_price) as total_revenue,
        SUM(quantity) as total_items_sold
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE pr.user_id = ? AND p.status = 'completed'
    `, [userId]);

    const totalSales = totalSalesResult[0] || { total_orders: 0, total_revenue: 0, total_items_sold: 0 };

    // Get pending orders
    const [pendingOrders] = await pool.execute(`
      SELECT 
        p.id as purchase_id,
        p.quantity,
        p.total_price,
        p.purchase_date,
        pr.title as product_title,
        u.username as buyer_name
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      JOIN users u ON p.user_id = u.id
      WHERE pr.user_id = ? AND p.status = 'pending'
      ORDER BY p.purchase_date DESC
    `, [userId]);

    res.json({
      success: true,
      message: 'Seller dashboard data retrieved successfully',
      data: {
        user: {
          id: req.user.id,
          name: req.user.username,
          email: req.user.email,
          role: req.user.role
        },
        products: products,
        recentSales: sales,
        pendingOrders: pendingOrders,
        stats: {
          totalProducts: products.length,
          totalOrders: totalSales.total_orders,
          totalRevenue: totalSales.total_revenue || 0,
          totalItemsSold: totalSales.total_items_sold || 0,
          pendingOrdersCount: pendingOrders.length
        }
      }
    });
  } catch (error) {
    console.error('Seller dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching seller dashboard data'
    });
  }
};

module.exports = {
  getSellerDashboard
};
