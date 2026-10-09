const express = require('express');
const pool = require('../db');
const wrap = require('../middleware/wrap');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

const OPEN_TIME = '12:00';
const LAST_SLOT = '22:00';
const MAX_PARTY = 10;

// tables that fit the party and have no confirmed booking within 2 hours of the slot
async function findFreeTables(date, time, partySize) {
  const result = await pool.query(
    `SELECT * FROM restaurant_tables t
     WHERE t.seats >= $3
       AND t.id NOT IN (
         SELECT table_id FROM reservations
         WHERE reservation_date = $1
           AND status = 'confirmed'
           AND ABS(EXTRACT(EPOCH FROM (reservation_time - $2::time))) < 7200
       )
     ORDER BY t.seats, t.table_number`,
    [date, time, partySize]
  );
  return result.rows;
}

function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function validateSlot(date, time, partySize) {
  if (!date || !time || !partySize) return 'Pick a date, time and number of guests';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return 'Invalid date';
  if (date < todayString()) return 'You cannot book a date in the past';
  if (time < OPEN_TIME || time > LAST_SLOT) return 'We take bookings between 12:00 and 22:00';
  if (partySize < 1 || partySize > MAX_PARTY) return `We can seat up to ${MAX_PARTY} guests online`;

  if (date === todayString()) {
    const now = new Date();
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (time <= nowTime) return 'That time has already passed today';
  }
  return null;
}

// public - used by the booking form to show how many tables are free
router.get('/availability', wrap(async (req, res) => {
  const { date, time } = req.query;
  const guests = parseInt(req.query.guests, 10);

  const error = validateSlot(date, time, guests);
  if (error) return res.status(400).json({ message: error });

  const tables = await findFreeTables(date, time, guests);
  res.json({ available: tables.length });
}));

router.post('/', requireAuth, wrap(async (req, res) => {
  const { guestName, phone, date, time, specialRequest } = req.body;
  const partySize = parseInt(req.body.partySize, 10);

  if (!guestName || !phone) {
    return res.status(400).json({ message: 'Name and phone number are required' });
  }
  const error = validateSlot(date, time, partySize);
  if (error) return res.status(400).json({ message: error });

  const tables = await findFreeTables(date, time, partySize);
  if (tables.length === 0) {
    return res.status(409).json({ message: 'No table is free at that time. Try another slot.' });
  }

  // smallest table that fits goes first (query is ordered by seats)
  const table = tables[0];
  const result = await pool.query(
    `INSERT INTO reservations
      (user_id, table_id, guest_name, phone, party_size, reservation_date, reservation_time, special_request)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
    [req.user.id, table.id, guestName.trim(), phone.trim(), partySize, date, time, specialRequest || null]
  );

  res.status(201).json({ reservationId: result.rows[0].id, tableNumber: table.table_number });
}));

const RESERVATION_SELECT = `
  SELECT r.id, r.guest_name, r.phone, r.party_size, r.status, r.special_request,
         r.reservation_date AS date, to_char(r.reservation_time, 'HH24:MI') AS time,
         t.table_number, t.seats
  FROM reservations r
  JOIN restaurant_tables t ON t.id = r.table_id
`;

router.get('/mine', requireAuth, wrap(async (req, res) => {
  const result = await pool.query(
    `${RESERVATION_SELECT} WHERE r.user_id = $1
     ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
    [req.user.id]
  );
  res.json({ reservations: result.rows });
}));

router.patch('/:id/cancel', requireAuth, wrap(async (req, res) => {
  const result = await pool.query(
    `UPDATE reservations SET status = 'cancelled'
     WHERE id = $1 AND user_id = $2 AND status = 'confirmed' RETURNING id`,
    [req.params.id, req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Reservation not found or already closed' });
  }
  res.json({ message: 'Reservation cancelled' });
}));

// admin - all bookings, optional ?date=YYYY-MM-DD
router.get('/', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const params = [];
  let where = '';
  if (req.query.date) {
    params.push(req.query.date);
    where = 'WHERE r.reservation_date = $1';
  }
  const result = await pool.query(
    `${RESERVATION_SELECT} ${where} ORDER BY r.reservation_date, r.reservation_time`,
    params
  );
  res.json({ reservations: result.rows });
}));

router.patch('/:id/status', requireAuth, requireRole('admin'), wrap(async (req, res) => {
  const { status } = req.body;
  if (!['confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const result = await pool.query(
    'UPDATE reservations SET status = $1 WHERE id = $2 RETURNING id',
    [status, req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ message: 'Reservation not found' });
  }
  res.json({ message: 'Reservation updated' });
}));

module.exports = router;
