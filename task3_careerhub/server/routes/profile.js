const router = require('express').Router();
const pool = require('../db');
const upload = require('../middleware/upload');
const { auth, wrap } = require('../middleware/auth');

const FIELDS = 'id, name, email, role, headline, skills, bio, resume_path';

router.get('/profile', auth, wrap(async (req, res) => {
  const result = await pool.query(`SELECT ${FIELDS} FROM users WHERE id = $1`, [req.user.id]);
  res.json(result.rows[0]);
}));

// Update profile text and (optionally) upload a new PDF resume
router.put('/profile', auth, upload.single('resume'), wrap(async (req, res) => {
  const { name, headline = '', skills = '', bio = '' } = req.body;
  if (!name) return res.status(400).json({ message: 'Name is required' });
  const resume = req.file ? req.file.filename : null;
  const result = await pool.query(
    `UPDATE users SET name = $1, headline = $2, skills = $3, bio = $4,
     resume_path = COALESCE($5, resume_path) WHERE id = $6 RETURNING ${FIELDS}`,
    [name, headline, skills, bio, resume, req.user.id]
  );
  res.json(result.rows[0]);
}));

module.exports = router;
