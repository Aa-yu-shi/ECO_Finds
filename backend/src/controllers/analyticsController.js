const { pool } = require('../config/db');

// Get seller analytics
const getSellerAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    // Sales overview
    const [salesOverview] = await pool.execute(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_price) as total_revenue,
        SUM(quantity) as total_items_sold,
        AVG(total_price) as avg_order_value
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE pr.user_id = ? 
      AND p.status = 'completed'
      AND p.purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [userId, period]);

    // Sales by category
    const [salesByCategory] = await pool.execute(`
      SELECT 
        pr.category,
        COUNT(*) as orders,
        SUM(p.total_price) as revenue,
        SUM(p.quantity) as items_sold
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE pr.user_id = ? 
      AND p.status = 'completed'
      AND p.purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY pr.category
      ORDER BY revenue DESC
    `, [userId, period]);

    // Daily sales for chart
    const [dailySales] = await pool.execute(`
      SELECT 
        DATE(p.purchase_date) as date,
        COUNT(*) as orders,
        SUM(p.total_price) as revenue
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE pr.user_id = ? 
      AND p.status = 'completed'
      AND p.purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(p.purchase_date)
      ORDER BY date ASC
    `, [userId, period]);

    // Top selling products
    const [topProducts] = await pool.execute(`
      SELECT 
        pr.id,
        pr.title,
        pr.price,
        pr.image,
        COUNT(*) as orders,
        SUM(p.quantity) as total_sold,
        SUM(p.total_price) as revenue
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE pr.user_id = ? 
      AND p.status = 'completed'
      AND p.purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY pr.id
      ORDER BY revenue DESC
      LIMIT 10
    `, [userId, period]);

    // Inventory status
    const [inventoryStatus] = await pool.execute(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN is_available = true THEN 1 END) as available_products,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END) as out_of_stock,
        COUNT(CASE WHEN stock_quantity < 5 THEN 1 END) as low_stock,
        SUM(stock_quantity) as total_inventory
      FROM products
      WHERE user_id = ?
    `, [userId]);

    res.json({
      success: true,
      period: `${period} days`,
      analytics: {
        sales_overview: salesOverview[0] || {
          total_orders: 0,
          total_revenue: 0,
          total_items_sold: 0,
          avg_order_value: 0
        },
        sales_by_category: salesByCategory,
        daily_sales: dailySales,
        top_products: topProducts,
        inventory_status: inventoryStatus[0] || {
          total_products: 0,
          available_products: 0,
          out_of_stock: 0,
          low_stock: 0,
          total_inventory: 0
        }
      }
    });
  } catch (error) {
    console.error('Get seller analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching seller analytics'
    });
  }
};

// Get buyer analytics
const getBuyerAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    // Purchase overview
    const [purchaseOverview] = await pool.execute(`
      SELECT 
        COUNT(*) as total_purchases,
        SUM(total_price) as total_spent,
        SUM(quantity) as total_items_bought,
        AVG(total_price) as avg_purchase_value
      FROM purchases
      WHERE user_id = ? 
      AND status = 'completed'
      AND purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
    `, [userId, period]);

    // Purchases by category
    const [purchasesByCategory] = await pool.execute(`
      SELECT 
        pr.category,
        COUNT(*) as purchases,
        SUM(p.total_price) as total_spent,
        SUM(p.quantity) as items_bought
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = ? 
      AND p.status = 'completed'
      AND p.purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY pr.category
      ORDER BY total_spent DESC
    `, [userId, period]);

    // Recent purchases
    const [recentPurchases] = await pool.execute(`
      SELECT 
        p.id,
        p.total_price,
        p.quantity,
        p.status,
        p.purchase_date,
        pr.title,
        pr.image,
        pr.category
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.user_id = ?
      ORDER BY p.purchase_date DESC
      LIMIT 10
    `, [userId]);

    // Cart summary
    const [cartSummary] = await pool.execute(`
      SELECT 
        COUNT(*) as cart_items,
        SUM(pr.price * c.quantity) as cart_total
      FROM cart c
      JOIN products pr ON c.product_id = pr.id
      WHERE c.user_id = ?
    `, [userId]);

    res.json({
      success: true,
      period: `${period} days`,
      analytics: {
        purchase_overview: purchaseOverview[0] || {
          total_purchases: 0,
          total_spent: 0,
          total_items_bought: 0,
          avg_purchase_value: 0
        },
        purchases_by_category: purchasesByCategory,
        recent_purchases: recentPurchases,
        cart_summary: cartSummary[0] || {
          cart_items: 0,
          cart_total: 0
        }
      }
    });
  } catch (error) {
    console.error('Get buyer analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching buyer analytics'
    });
  }
};

// Get platform-wide analytics (admin only)
const getPlatformAnalytics = async (req, res) => {
  try {
    // Check if user is admin (you might want to add admin role)
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { period = '30' } = req.query;

    // Platform overview
    const [platformOverview] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'buyer') as total_buyers,
        (SELECT COUNT(*) FROM users WHERE role = 'seller') as total_sellers,
        (SELECT COUNT(*) FROM products WHERE is_available = true) as total_products,
        (SELECT COUNT(*) FROM purchases WHERE status = 'completed') as total_orders,
        (SELECT SUM(total_price) FROM purchases WHERE status = 'completed') as total_revenue
    `);

    // Sales by category
    const [platformSalesByCategory] = await pool.execute(`
      SELECT 
        pr.category,
        COUNT(*) as orders,
        SUM(p.total_price) as revenue,
        SUM(p.quantity) as items_sold
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE p.status = 'completed'
      AND p.purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY pr.category
      ORDER BY revenue DESC
    `, [period]);

    // Top sellers
    const [topSellers] = await pool.execute(`
      SELECT 
        u.id,
        u.username,
        u.email,
        COUNT(*) as orders,
        SUM(p.total_price) as revenue
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      JOIN users u ON pr.user_id = u.id
      WHERE p.status = 'completed'
      AND p.purchase_date >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY u.id
      ORDER BY revenue DESC
      LIMIT 10
    `, [period]);

    res.json({
      success: true,
      period: `${period} days`,
      analytics: {
        platform_overview: platformOverview[0],
        sales_by_category: platformSalesByCategory,
        top_sellers: topSellers
      }
    });
  } catch (error) {
    console.error('Get platform analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching platform analytics'
    });
  }
};

module.exports = {
  getSellerAnalytics,
  getBuyerAnalytics,
  getPlatformAnalytics
};
