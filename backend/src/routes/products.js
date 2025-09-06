// routes/products.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // promise pool

// GET /products  (supports ?category=&minPrice=&maxPrice=&condition=)
router.get('/', async (req, res) => {
  try {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (req.query.category) {
      sql += ' AND category = ?';
      params.push(req.query.category);
    }
    if (req.query.condition) {
      sql += ' AND condition = ?';
      params.push(req.query.condition);
    }
    if (req.query.minPrice) {
      sql += ' AND price >= ?';
      params.push(req.query.minPrice);
    }
    if (req.query.maxPrice) {
      sql += ' AND price <= ?';
      params.push(req.query.maxPrice);
    }

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

// GET /products/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;