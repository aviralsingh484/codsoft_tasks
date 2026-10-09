const express = require('express');
const pool = require('../db');
const wrap = require('../middleware/wrap');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const today = await pool.query(
    `SELECT COUNT(*) AS orders,
            COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0) AS revenue
     FROM orders WHERE created_at::date = CURRENT_DATE`
  );

  const active = await pool.query(
    "SELECT COUNT(*) AS count FROM orders WHERE status IN ('placed', 'preparing', 'ready')"
  );

  const bookings = await pool.query(
    `SELECT COUNT(*) AS count FROM reservations
     WHERE reservation_date = CURRENT_DATE AND status = 'confirmed'`
  );

  const popular = await pool.query(
    `SELECT oi.name, SUM(oi.quantity) AS sold
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status <> 'cancelled'
     GROUP BY oi.name ORDER BY sold DESC LIMIT 5`
  );

  const recent = await pool.query(
    `SELECT o.id, o.total, o.status, o.created_at, u.name AS customer_name
     FROM orders o JOIN users u ON u.id = o.user_id
     ORDER BY o.created_at DESC LIMIT 6`
  );

  res.json({
    ordersToday: parseInt(today.rows[0].orders, 10),
    revenueToday: today.rows[0].revenue,
    activeOrders: parseInt(active.rows[0].count, 10),
    bookingsToday: parseInt(bookings.rows[0].count, 10),
    popularItems: popular.rows.map((r) => ({ name: r.name, sold: parseInt(r.sold, 10) })),
    recentOrders: recent.rows,
  });
}));

module.exports = router;
