const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { auth, wrap } = require('../middleware/auth');

function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// Sign up as a candidate or a recruiter
router.post('/register', wrap(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }
  if (!['candidate', 'recruiter'].includes(role)) {
    return res.status(400).json({ message: 'Please choose a role' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (exists.rows.length > 0) {
    return res.status(400).json({ message: 'This email is already registered' });
  }
  const hash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users(name, email, password, role) VALUES($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email.toLowerCase(), hash, role]
  );
  const user = result.rows[0];
  res.json({ token: makeToken(user), user });
}));

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [(email || '').toLowerCase()]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    return res.status(400).json({ message: 'Wrong email or password' });
  }
  res.json({
    token: makeToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}));

router.get('/me', auth, wrap(async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
  res.json(result.rows[0]);
}));

module.exports = router;
