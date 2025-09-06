const { pool } = require('../config/db');

// Advanced search with filters
const searchProducts = async (req, res) => {
  try {
    const { 
      q, // search query
      category, 
      min_price, 
      max_price, 
      condition,
      location,
      sort = 'relevance',
      page = 1, 
      limit = 12 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.username as seller_name, u.email as seller_email
      FROM products p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.is_available = true
    `;
    let params = [];

    // Search query
    if (q) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ?)';
      const searchTerm = `%${q}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Category filter
    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    // Price range filter
    if (min_price) {
      query += ' AND p.price >= ?';
      params.push(min_price);
    }
    if (max_price) {
      query += ' AND p.price <= ?';
      params.push(max_price);
    }

    // Condition filter (if you add condition field to products table)
    if (condition) {
      query += ' AND p.condition = ?';
      params.push(condition);
    }

    // Sorting
    switch (sort) {
      case 'price_low':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price_high':
        query += ' ORDER BY p.price DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      case 'oldest':
        query += ' ORDER BY p.created_at ASC';
        break;
      case 'popular':
        // You can implement popularity based on views/purchases
        query += ' ORDER BY p.created_at DESC';
        break;
      default: // relevance
        if (q) {
          query += ' ORDER BY 
            CASE 
              WHEN p.title LIKE ? THEN 1 
              WHEN p.description LIKE ? THEN 2 
              ELSE 3 
            END, p.created_at DESC';
          const searchTerm = `%${q}%`;
          params.push(searchTerm, searchTerm);
        } else {
          query += ' ORDER BY p.created_at DESC';
        }
    }

    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.is_available = true';
    let countParams = [];

    if (q) {
      countQuery += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.category LIKE ?)';
      const searchTerm = `%${q}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    if (category) {
      countQuery += ' AND p.category = ?';
      countParams.push(category);
    }
    if (min_price) {
      countQuery += ' AND p.price >= ?';
      countParams.push(min_price);
    }
    if (max_price) {
      countQuery += ' AND p.price <= ?';
      countParams.push(max_price);
    }
    if (condition) {
      countQuery += ' AND p.condition = ?';
      countParams.push(condition);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    // Get search suggestions
    const [suggestions] = await pool.execute(`
      SELECT DISTINCT title, category 
      FROM products 
      WHERE is_available = true 
      AND (title LIKE ? OR category LIKE ?) 
      LIMIT 5
    `, [`%${q || ''}%`, `%${q || ''}%`]);

    res.json({
      success: true,
      query: q,
      filters: {
        category,
        min_price,
        max_price,
        condition,
        location
      },
      products,
      suggestions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalProducts: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching products'
    });
  }
};

// Get search suggestions
const getSearchSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const [suggestions] = await pool.execute(`
      SELECT DISTINCT title, category, price, image
      FROM products 
      WHERE is_available = true 
      AND (title LIKE ? OR category LIKE ?) 
      ORDER BY 
        CASE 
          WHEN title LIKE ? THEN 1 
          WHEN category LIKE ? THEN 2 
          ELSE 3 
        END
      LIMIT 10
    `, [`%${q}%`, `%${q}%`, `${q}%`, `${q}%`]);

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching search suggestions'
    });
  }
};

// Get popular searches
const getPopularSearches = async (req, res) => {
  try {
    // This would typically come from a search_logs table
    // For now, we'll return popular categories and product titles
    const [popularCategories] = await pool.execute(`
      SELECT category, COUNT(*) as search_count
      FROM products 
      WHERE is_available = true 
      GROUP BY category 
      ORDER BY search_count DESC 
      LIMIT 10
    `);

    const [popularProducts] = await pool.execute(`
      SELECT title, category, price, image
      FROM products 
      WHERE is_available = true 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    res.json({
      success: true,
      popular_categories: popularCategories,
      trending_products: popularProducts
    });
  } catch (error) {
    console.error('Get popular searches error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular searches'
    });
  }
};

module.exports = {
  searchProducts,
  getSearchSuggestions,
  getPopularSearches
};
