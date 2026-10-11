const router = require('express').Router();
const pool = require('../db');
const { auth, only, wrap } = require('../middleware/auth');

// All companies with the number of open jobs
router.get('/companies', auth, wrap(async (req, res) => {
  const result = await pool.query(
    `SELECT c.*, (SELECT COUNT(*) FROM jobs j WHERE j.company_id = c.id AND j.status = 'open')::int AS open_jobs
     FROM companies c ORDER BY c.name`
  );
  res.json(result.rows);
}));

// Recruiter: my own company (null if not created yet)
router.get('/companies/mine', auth, only('recruiter'), wrap(async (req, res) => {
  const result = await pool.query('SELECT * FROM companies WHERE owner_id = $1', [req.user.id]);
  res.json(result.rows[0] || null);
}));

// Recruiter: create or update my company
router.put('/companies/mine', auth, only('recruiter'), wrap(async (req, res) => {
  const { name, description = '', website = '', location = '', industry = '' } = req.body;
  if (!name) return res.status(400).json({ message: 'Company name is required' });

  const existing = await pool.query('SELECT id FROM companies WHERE owner_id = $1', [req.user.id]);
  let result;
  if (existing.rows.length > 0) {
    result = await pool.query(
      'UPDATE companies SET name=$1, description=$2, website=$3, location=$4, industry=$5 WHERE owner_id=$6 RETURNING *',
      [name, description, website, location, industry, req.user.id]
    );
  } else {
    result = await pool.query(
      'INSERT INTO companies(owner_id, name, description, website, location, industry) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user.id, name, description, website, location, industry]
    );
  }
  res.json(result.rows[0]);
}));

// Public company page with its open jobs
router.get('/companies/:id', auth, wrap(async (req, res) => {
  const company = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
  if (company.rows.length === 0) return res.status(404).json({ message: 'Company not found' });
  const jobs = await pool.query(
    "SELECT * FROM jobs WHERE company_id = $1 AND status = 'open' ORDER BY created_at DESC",
    [req.params.id]
  );
  res.json({ ...company.rows[0], jobs: jobs.rows });
}));

module.exports = router;
