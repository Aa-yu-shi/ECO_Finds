// routes/cart.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /cart  -> body: { user_id, product_id, quantity? }
router.post('/', async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;
    if (!user_id || !product_id) return res.status(400).json({ error: 'user_id and product_id required' });

    // Optional: check if product exists
    const [prod] = await db.query('SELECT id FROM products WHERE id = ?', [product_id]);
    if (prod.length === 0) return res.status(404).json({ error: 'Product not found' });

    // If same product+user exists, update quantity
    const [existing] = await db.query('SELECT id, quantity FROM cart_items WHERE user_id = ? AND product_id = ?', [user_id, product_id]);
    if (existing.length > 0) {
      const newQty = existing[0].quantity + (quantity ? parseInt(quantity) : 1);
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existing[0].id]);
      return res.json({ message: 'Cart updated' });
    }

    // Otherwise insert new row
    await db.query('INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)', [user_id, product_id, quantity || 1]);
    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /cart/:userId
router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const sql = `
      SELECT ci.id as cart_id, ci.quantity, p.id as product_id, p.title, p.description, p.category, p.price, p.image_url
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      WHERE ci.user_id = ?
    `;
    const [rows] = await db.query(sql, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;