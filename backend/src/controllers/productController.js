// const db = require('../config/db');

// // Create new product
// exports.createProduct = (req, res) => {
//   const { title, description, category, price, image } = req.body;
//   const user_id = req.user.id; // from JWT auth middleware

//   const query = "INSERT INTO products (user_id, title, description, category, price, image) VALUES (?, ?, ?, ?, ?, ?)";
//   db.query(query, [user_id, title, description, category, price, image], (err, result) => {
//     if (err) return res.status(500).json({ message: err.message });
//     res.status(201).json({ message: "Product created", productId: result.insertId });
//   });
// };

// // Get all products of logged-in user
// exports.getUserProducts = (req, res) => {
//   const user_id = req.user.id;
//   const query = "SELECT * FROM products WHERE user_id = ?";
//   db.query(query, [user_id], (err, results) => {
//     if (err) return res.status(500).json({ message: err.message });
//     res.status(200).json(results);
//   });
// };

// // Get single product by ID
// exports.getProductById = (req, res) => {
//   const { id } = req.params;
//   const user_id = req.user.id;
//   const query = "SELECT * FROM products WHERE id = ? AND user_id = ?";
//   db.query(query, [id, user_id], (err, results) => {
//     if (err) return res.status(500).json({ message: err.message });
//     if (results.length === 0) return res.status(404).json({ message: "Product not found" });
//     res.status(200).json(results[0]);
//   });
// };

// // Update product
// exports.updateProduct = (req, res) => {
//   const { id } = req.params;
//   const { title, description, category, price, image } = req.body;
//   const user_id = req.user.id;

//   const query = "UPDATE products SET title=?, description=?, category=?, price=?, image=? WHERE id=? AND user_id=?";
//   db.query(query, [title, description, category, price, image, id, user_id], (err, result) => {
//     if (err) return res.status(500).json({ message: err.message });
//     if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found or unauthorized" });
//     res.status(200).json({ message: "Product updated" });
//   });
// };

// // Delete product
// exports.deleteProduct = (req, res) => {
//   const { id } = req.params;
//   const user_id = req.user.id;

//   const query = "DELETE FROM products WHERE id=? AND user_id=?";
//   db.query(query, [id, user_id], (err, result) => {
//     if (err) return res.status(500).json({ message: err.message });
//     if (result.affectedRows === 0) return res.status(404).json({ message: "Product not found or unauthorized" });
//     res.status(200).json({ message: "Product deleted" });
//   });
// };
const { pool } = require('../config/db');

// Create new product
const createProduct = async (req, res) => {
  try {
    const { title, description, category, price, image, stock_quantity } = req.body;
    const user_id = req.user.id;

    // Validate required fields
    if (!title || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title and price are required'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO products (user_id, title, description, category, price, image, stock_quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, title, description, category, price, image, stock_quantity || 0]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
};

// Get all products (public endpoint)
const getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, u.username as seller_name 
      FROM products p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.is_available = true
    `;
    let params = [];

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [products] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products p WHERE p.is_available = true';
    let countParams = [];

    if (category) {
      countQuery += ' AND p.category = ?';
      countParams.push(category);
    }

    if (search) {
      countQuery += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
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
    console.error('Get all products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
};

// Get single product by ID (public endpoint)
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await pool.execute(
      `SELECT p.*, u.username as seller_name, u.email as seller_email 
       FROM products p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ? AND p.is_available = true`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: products[0]
    });
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
};

// Get all products of logged-in user
const getUserProducts = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [products] = await pool.execute(
      'SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC',
      [user_id]
    );

    res.json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Get user products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user products'
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, price, image, stock_quantity, is_available } = req.body;
    const user_id = req.user.id;

    // Check if product exists and belongs to user
    const [existingProducts] = await pool.execute(
      'SELECT id FROM products WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (existingProducts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized'
      });
    }

    const [result] = await pool.execute(
      'UPDATE products SET title=?, description=?, category=?, price=?, image=?, stock_quantity=?, is_available=? WHERE id=? AND user_id=?',
      [title, description, category, price, image, stock_quantity, is_available, id, user_id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM products WHERE id=? AND user_id=?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or unauthorized'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  getUserProducts,
  updateProduct,
  deleteProduct
};
