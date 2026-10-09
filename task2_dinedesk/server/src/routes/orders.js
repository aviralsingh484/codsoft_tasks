const express = require('express');
const pool = require('../db');
const wrap = require('../middleware/wrap');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const GST_RATE = 0.05;
const STATUSES = ['placed', 'preparing', 'ready', 'completed', 'cancelled'];

// base query - returns each order with its items as a json array
const ORDER_SELECT = `
  SELECT o.*, u.name AS customer_name,
    COALESCE(
      json_agg(json_build_object(
        'id', oi.id, 'name', oi.name, 'price', oi.price, 'quantity', oi.quantity
      ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL),
      '[]'
    ) AS items
  FROM orders o
  JOIN users u ON u.id = o.user_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
`;

router.post('/', requireAuth, wrap(async (req, res) => {
  const { items, orderType, tableNumber, paymentMethod, notes } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Your cart is empty' });
  }
  if (!['dine-in', 'takeaway'].includes(orderType)) {
    return res.status(400).json({ message: 'Choose dine-in or takeaway' });
  }
  if (orderType === 'dine-in' && !tableNumber) {
    return res.status(400).json({ message: 'Please enter your table number' });
  }
  if (!['card', 'cash'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Choose a payment method' });
  }

  // prices come from the database, never from the client
  const ids = items.map((i) => i.id);
  const found = await pool.query(
    'SELECT id, name, price, is_available FROM menu_items WHERE id = ANY($1)',
    [ids]
  );
  const menuById = {};
  found.rows.forEach((row) => { menuById[row.id] = row; });

  let subtotal = 0;
  const lines = [];

  for (const item of items) {
    const dbItem = menuById[item.id];
    const qty = parseInt(item.quantity, 10);

    if (!dbItem || !qty || qty < 1) {
      return res.status(400).json({ message: 'Some items in your cart are no longer on the menu' });
    }
    if (!dbItem.is_available) {
      return res.status(400).json({ message: `${dbItem.name} is sold out right now` });
    }

    subtotal += dbItem.price * qty;
    lines.push({ id: dbItem.id, name: dbItem.name, price: dbItem.price, quantity: qty });
  }

  subtotal = Math.round(subtotal * 100) / 100;
  const tax = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  // card payments are simulated - treated as paid straight away
  const paymentStatus = paymentMethod === 'card' ? 'paid' : 'pending';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO orders
        (user_id, order_type, table_number, payment_method, payment_status, subtotal, tax, total, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [req.user.id, orderType, orderType === 'dine-in' ? tableNumber : null,
       paymentMethod, paymentStatus, subtotal, tax, total, notes || null]
    );
    const orderId = orderResult.rows[0].id;

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (order_id, menu_item_id, name, price, quantity)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, line.id, line.name, line.price, line.quantity]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({ orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

// logged in customer's own orders
router.get('/mine', requireAuth, wrap(async (req, res) => {
  const result = await pool.query(
    `${ORDER_SELECT} WHERE o.user_id = $1 GROUP BY o.id, u.name ORDER BY o.created_at DESC`,
    [req.user.id]
  );
  res.json({ orders: result.rows });
}));

// staff - kitchen board. ?active=1 hides finished orders
router.get('/', requireAuth, requireRole('kitchen', 'admin'), wrap(async (req, res) => {
  const where = req.query.active
    ? "WHERE o.status IN ('placed', 'preparing', 'ready')"
    : '';
  const result = await pool.query(
    `${ORDER_SELECT} ${where} GROUP BY o.id, u.name ORDER BY o.created_at ASC`
  );
  res.json({ orders: result.rows });
}));

router.get('/:id', requireAuth, wrap(async (req, res) => {
  const result = await pool.query(
    `${ORDER_SELECT} WHERE o.id = $1 GROUP BY o.id, u.name`,
    [req.params.id]
  );
  const order = result.rows[0];

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const isStaff = ['kitchen', 'admin'].includes(req.user.role);
  if (order.user_id !== req.user.id && !isStaff) {
    return res.status(403).json({ message: 'This order belongs to someone else' });
  }

  res.json({ order });
}));

// kitchen / admin moves the order along
router.patch('/:id/status', requireAuth, requireRole('kitchen', 'admin'), wrap(async (req, res) => {
  const { status } = req.body;

  if (!STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  // when an order is completed, cash orders are considered paid too
  const result = await pool.query(
    `UPDATE orders
     SET status = $1::varchar,
         payment_status = CASE WHEN $1::varchar = 'completed' THEN 'paid' ELSE payment_status END,
         updated_at = NOW()
     WHERE id = $2 RETURNING id, status`,
    [status, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Order not found' });
  }
  res.json({ order: result.rows[0] });
}));

// customers can only cancel before the kitchen starts cooking
router.patch('/:id/cancel', requireAuth, wrap(async (req, res) => {
  const result = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  const order = result.rows[0];

  if (!order || order.user_id !== req.user.id) {
    return res.status(404).json({ message: 'Order not found' });
  }
  if (order.status !== 'placed') {
    return res.status(400).json({ message: 'The kitchen has already started on this order' });
  }

  await pool.query("UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1", [order.id]);
  res.json({ message: 'Order cancelled' });
}));

module.exports = router;
