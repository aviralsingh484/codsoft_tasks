const express = require('express');
const pool = require('../db');
const wrap = require('../middleware/wrap');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// public - full menu, the client groups it by category
router.get('/', wrap(async (req, res) => {
  const categories = await pool.query('SELECT * FROM categories ORDER BY sort_order, name');
  const items = await pool.query(
    `SELECT m.*, c.name AS category_name
     FROM menu_items m
     LEFT JOIN categories c ON c.id = m.category_id
     ORDER BY c.sort_order, m.name`
  );
  res.json({ categories: categories.rows, items: items.rows });
}));

function validateItem(body) {
  const { name, price, categoryId } = body;
  if (!name || !name.trim()) return 'Item name is required';
  if (!categoryId) return 'Please choose a category';
  if (!price || Number(price) <= 0) return 'Price must be more than 0';
  return null;
}

// admin only from here on
router.post('/', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const error = validateItem(req.body);
  if (error) return res.status(400).json({ message: error });

  const { name, description, price, categoryId, isVeg, isAvailable } = req.body;
  const result = await pool.query(
    `INSERT INTO menu_items (name, description, price, category_id, is_veg, is_available)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name.trim(), description || '', price, categoryId, !!isVeg, isAvailable !== false]
  );
  res.status(201).json({ item: result.rows[0] });
}));

router.put('/:id', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const error = validateItem(req.body);
  if (error) return res.status(400).json({ message: error });

  const { name, description, price, categoryId, isVeg, isAvailable } = req.body;
  const result = await pool.query(
    `UPDATE menu_items
     SET name = $1, description = $2, price = $3, category_id = $4, is_veg = $5, is_available = $6
     WHERE id = $7 RETURNING *`,
    [name.trim(), description || '', price, categoryId, !!isVeg, isAvailable !== false, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  res.json({ item: result.rows[0] });
}));

// quick toggle for "sold out" without opening the full edit form
router.patch('/:id/availability', requireAuth, requireRole('admin', 'kitchen'), wrap(async (req, res) => {
  const result = await pool.query(
    'UPDATE menu_items SET is_available = $1 WHERE id = $2 RETURNING *',
    [!!req.body.isAvailable, req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  res.json({ item: result.rows[0] });
}));

router.delete('/:id', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const result = await pool.query('DELETE FROM menu_items WHERE id = $1', [req.params.id]);
  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Menu item not found' });
  }
  res.json({ message: 'Item deleted' });
}));

module.exports = router;
