const { pool } = require('../config/db');

// Create purchase from cart
const createPurchase = async (req, res) => {
  try {
    const user_id = req.user.id;

    // Get user's cart items
    const [cartItems] = await pool.execute(
      `SELECT c.*, p.title, p.price, p.stock_quantity, p.is_available, p.user_id as seller_id
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ?`,
      [user_id]
    );

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate cart items
    for (const item of cartItems) {
      if (!item.is_available) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.title}" is no longer available`
        });
      }

      if (item.stock_quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${item.title}". Available: ${item.stock_quantity}, Requested: ${item.quantity}`
        });
      }

      if (item.seller_id === user_id) {
        return res.status(400).json({
          success: false,
          message: `Cannot purchase your own product "${item.title}"`
        });
      }
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const purchaseIds = [];

      // Create purchases and update stock
      for (const item of cartItems) {
        const totalPrice = item.price * item.quantity;

        // Create purchase record
        const [purchaseResult] = await connection.execute(
          'INSERT INTO purchases (user_id, product_id, quantity, total_price, status) VALUES (?, ?, ?, ?, ?)',
          [user_id, item.product_id, item.quantity, totalPrice, 'completed']
        );

        purchaseIds.push(purchaseResult.insertId);

        // Update product stock
        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      // Clear cart
      await connection.execute(
        'DELETE FROM cart WHERE user_id = ?',
        [user_id]
      );

      // Commit transaction
      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Purchase completed successfully',
        purchaseIds,
        totalItems: cartItems.length
      });
    } catch (error) {
      // Rollback transaction
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing purchase'
    });
  }
};

// Get user's purchase history
const getPurchaseHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, pr.title, pr.description, pr.image, pr.price as unit_price,
             u.username as seller_name, u.email as seller_email
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      JOIN users u ON pr.user_id = u.id
      WHERE p.user_id = ?
    `;
    let params = [user_id];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.purchase_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [purchases] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM purchases WHERE user_id = ?';
    let countParams = [user_id];

    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      purchases,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalPurchases: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get purchase history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching purchase history'
    });
  }
};

// Get single purchase details
const getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [purchases] = await pool.execute(
      `SELECT p.*, pr.title, pr.description, pr.image, pr.price as unit_price,
              u.username as seller_name, u.email as seller_email
       FROM purchases p
       JOIN products pr ON p.product_id = pr.id
       JOIN users u ON pr.user_id = u.id
       WHERE p.id = ? AND p.user_id = ?`,
      [id, user_id]
    );

    if (purchases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    res.json({
      success: true,
      purchase: purchases[0]
    });
  } catch (error) {
    console.error('Get purchase by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching purchase details'
    });
  }
};

// Cancel purchase (only if status is pending)
const cancelPurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Check if purchase exists and belongs to user
    const [purchases] = await pool.execute(
      'SELECT * FROM purchases WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (purchases.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found'
      });
    }

    const purchase = purchases[0];

    if (purchase.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending purchases can be cancelled'
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update purchase status
      await connection.execute(
        'UPDATE purchases SET status = ? WHERE id = ?',
        ['cancelled', id]
      );

      // Restore product stock
      await connection.execute(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [purchase.quantity, purchase.product_id]
      );

      // Commit transaction
      await connection.commit();

      res.json({
        success: true,
        message: 'Purchase cancelled successfully'
      });
    } catch (error) {
      // Rollback transaction
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Cancel purchase error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling purchase'
    });
  }
};

// Get sales history (for sellers)
const getSalesHistory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, pr.title, pr.description, pr.image, pr.price as unit_price,
             u.username as buyer_name, u.email as buyer_email
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      JOIN users u ON p.user_id = u.id
      WHERE pr.user_id = ?
    `;
    let params = [user_id];

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    query += ' ORDER BY p.purchase_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [sales] = await pool.execute(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM purchases p
      JOIN products pr ON p.product_id = pr.id
      WHERE pr.user_id = ?
    `;
    let countParams = [user_id];

    if (status) {
      countQuery += ' AND p.status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      sales,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalSales: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get sales history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sales history'
    });
  }
};

module.exports = {
  createPurchase,
  getPurchaseHistory,
  getPurchaseById,
  cancelPurchase,
  getSalesHistory
};
