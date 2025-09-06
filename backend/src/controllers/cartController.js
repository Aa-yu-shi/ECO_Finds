const { pool } = require('../config/db');

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    // Check if product exists and is available
    const [products] = await pool.execute(
      'SELECT id, price, stock_quantity, is_available FROM products WHERE id = ?',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = products[0];

    if (!product.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    if (product.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Check if item already exists in cart
    const [existingItems] = await pool.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [user_id, product_id]
    );

    if (existingItems.length > 0) {
      // Update existing cart item
      const newQuantity = existingItems[0].quantity + quantity;
      
      if (product.stock_quantity < newQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock available for the requested quantity'
        });
      }

      await pool.execute(
        'UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?',
        [newQuantity, user_id, product_id]
      );

      res.json({
        success: true,
        message: 'Cart updated successfully',
        cartItem: {
          product_id,
          quantity: newQuantity
        }
      });
    } else {
      // Add new item to cart
      await pool.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [user_id, product_id, quantity]
      );

      res.status(201).json({
        success: true,
        message: 'Item added to cart successfully',
        cartItem: {
          product_id,
          quantity
        }
      });
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding item to cart'
    });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    const [cartItems] = await pool.execute(
      `SELECT c.id, c.product_id, c.quantity, p.title, p.description, p.price, p.image, p.stock_quantity, p.is_available,
              u.username as seller_name
       FROM cart c
       JOIN products p ON c.product_id = p.id
       JOIN users u ON p.user_id = u.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [user_id]
    );

    // Calculate total
    let total = 0;
    const items = cartItems.map(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      return {
        ...item,
        item_total: itemTotal
      };
    });

    res.json({
      success: true,
      cart: {
        items,
        total: total.toFixed(2),
        item_count: cartItems.length
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const user_id = req.user.id;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    // Check if cart item exists and belongs to user
    const [cartItems] = await pool.execute(
      `SELECT c.*, p.stock_quantity, p.is_available
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.id = ? AND c.user_id = ?`,
      [id, user_id]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const cartItem = cartItems[0];

    if (!cartItem.is_available) {
      return res.status(400).json({
        success: false,
        message: 'Product is no longer available'
      });
    }

    if (cartItem.stock_quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock available'
      });
    }

    // Update cart item
    await pool.execute(
      'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, id, user_id]
    );

    res.json({
      success: true,
      message: 'Cart item updated successfully'
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart item'
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const [result] = await pool.execute(
      'DELETE FROM cart WHERE id = ? AND user_id = ?',
      [id, user_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing item from cart'
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    await pool.execute(
      'DELETE FROM cart WHERE user_id = ?',
      [user_id]
    );

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
