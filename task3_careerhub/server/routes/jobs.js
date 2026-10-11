const router = require('express').Router();
const pool = require('../db');
const { auth, only, wrap } = require('../middleware/auth');

// Base query: job + company name + whether this user saved / applied
const JOB_SELECT = `
  SELECT j.*, c.name AS company_name, c.industry AS company_industry,
    EXISTS(SELECT 1 FROM saved_jobs s WHERE s.job_id = j.id AND s.user_id = $1) AS saved,
    EXISTS(SELECT 1 FROM applications a WHERE a.job_id = j.id AND a.candidate_id = $1) AS applied
  FROM jobs j JOIN companies c ON c.id = j.company_id`;

// Search open jobs
router.get('/jobs', auth, wrap(async (req, res) => {
  const { search = '', location = '', type = '' } = req.query;
  const result = await pool.query(
    JOB_SELECT + `
    WHERE j.status = 'open'
      AND (j.title ILIKE $2 OR c.name ILIKE $2)
      AND j.location ILIKE $3
      AND ($4::text = '' OR j.job_type = $4::text)
    ORDER BY j.created_at DESC`,
    [req.user.id, `%${search}%`, `%${location}%`, type]
  );
  res.json(result.rows);
}));

// Recruiter: jobs of my company with applicant counts
router.get('/jobs/mine', auth, only('recruiter'), wrap(async (req, res) => {
  const result = await pool.query(
    `SELECT j.*, (SELECT COUNT(*) FROM applications a WHERE a.job_id = j.id)::int AS applicants
     FROM jobs j JOIN companies c ON c.id = j.company_id
     WHERE c.owner_id = $1 ORDER BY j.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
}));

router.get('/jobs/:id', auth, wrap(async (req, res) => {
  const result = await pool.query(JOB_SELECT + ' WHERE j.id = $2', [req.user.id, req.params.id]);
  if (result.rows.length === 0) return res.status(404).json({ message: 'Job not found' });
  res.json(result.rows[0]);
}));

// Recruiter: post a job
router.post('/jobs', auth, only('recruiter'), wrap(async (req, res) => {
  const company = await pool.query('SELECT id FROM companies WHERE owner_id = $1', [req.user.id]);
  if (company.rows.length === 0) {
    return res.status(400).json({ message: 'Please create your company profile first' });
  }
  const { title, description, location, job_type = 'Full-time', salary = '' } = req.body;
  if (!title || !description || !location) {
    return res.status(400).json({ message: 'Title, description and location are required' });
  }
  const result = await pool.query(
    'INSERT INTO jobs(company_id, title, description, location, job_type, salary) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [company.rows[0].id, title, description, location, job_type, salary]
  );
  res.json(result.rows[0]);
}));

// Recruiter: open or close a job
router.put('/jobs/:id/status', auth, only('recruiter'), wrap(async (req, res) => {
  const { status } = req.body;
  if (!['open', 'closed'].includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const result = await pool.query(
    `UPDATE jobs SET status = $1 WHERE id = $2
     AND company_id IN (SELECT id FROM companies WHERE owner_id = $3) RETURNING *`,
    [status, req.params.id, req.user.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Job not found' });
  res.json(result.rows[0]);
}));

router.delete('/jobs/:id', auth, only('recruiter'), wrap(async (req, res) => {
  await pool.query(
    'DELETE FROM jobs WHERE id = $1 AND company_id IN (SELECT id FROM companies WHERE owner_id = $2)',
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Job deleted' });
}));

// Candidate: save / unsave a job
router.post('/jobs/:id/save', auth, only('candidate'), wrap(async (req, res) => {
  const removed = await pool.query('DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2', [req.user.id, req.params.id]);
  if (removed.rowCount === 0) {
    await pool.query('INSERT INTO saved_jobs(user_id, job_id) VALUES($1, $2)', [req.user.id, req.params.id]);
  }
  res.json({ saved: removed.rowCount === 0 });
}));

router.get('/saved', auth, only('candidate'), wrap(async (req, res) => {
  const result = await pool.query(
    JOB_SELECT + ' JOIN saved_jobs sj ON sj.job_id = j.id AND sj.user_id = $1 ORDER BY sj.created_at DESC',
    [req.user.id]
  );
  res.json(result.rows);
}));

module.exports = router;
