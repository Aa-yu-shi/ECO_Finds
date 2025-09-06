const { pool } = require('../config/db');

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    // Get categories with product counts
    const [categories] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as product_count,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price
      FROM products 
      WHERE is_available = true 
      GROUP BY category 
      ORDER BY product_count DESC
    `);

    // Get featured products for each category
    const categoryData = await Promise.all(
      categories.map(async (category) => {
        const [featuredProducts] = await pool.execute(`
          SELECT id, title, price, image, created_at
          FROM products 
          WHERE category = ? AND is_available = true 
          ORDER BY created_at DESC 
          LIMIT 4
        `, [category.category]);

        return {
          ...category,
          featured_products: featuredProducts
        };
      })
    );

    res.json({
      success: true,
      categories: categoryData
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12, sort = 'newest', min_price, max_price } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.username as seller_name 
      FROM products p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.category = ? AND p.is_available = true
    `;
    let params = [category];

    // Price filtering
    if (min_price) {
      query += ' AND p.price >= ?';
      params.push(min_price);
    }
    if (max_price) {
      query += ' AND p.price <= ?';
      params.push(max_price);
    }

    // Sorting
    switch (sort) {
      case 'price_low':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_high':
        query += ' ORDER BY p.price DESC';
        break;
      case 'oldest':
        query += ' ORDER BY p.created_at ASC';
        break;
      default: // newest
        query += ' ORDER BY p.created_at DESC';
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.category = ? AND p.is_available = true';
    let countParams = [category];

    if (min_price) {
      countQuery += ' AND p.price >= ?';
      countParams.push(min_price);
    }
    if (max_price) {
      countQuery += ' AND p.price <= ?';
      countParams.push(max_price);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      category,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get products by category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products by category'
    });
  }
};

// Get category statistics
const getCategoryStats = async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        category,
        COUNT(*) as total_products,
        COUNT(CASE WHEN is_available = true THEN 1 END) as available_products,
        MIN(price) as min_price,
        MAX(price) as max_price,
        AVG(price) as avg_price,
        SUM(CASE WHEN is_available = true THEN stock_quantity ELSE 0 END) as total_stock
      FROM products 
      GROUP BY category 
      ORDER BY total_products DESC
    `);

    res.json({
      success: true,
      category_stats: stats
    });
  } catch (error) {
    console.error('Get category stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category statistics'
    });
  }
};

module.exports = {
  getAllCategories,
  getProductsByCategory,
  getCategoryStats
};
