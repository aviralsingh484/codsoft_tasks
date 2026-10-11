const router = require('express').Router();
const pool = require('../db');
const upload = require('../middleware/upload');
const { auth, only, wrap } = require('../middleware/auth');

const STATUSES = ['applied', 'shortlisted', 'interview', 'hired', 'rejected'];

// Candidate: apply for a job (resume is optional if the profile already has one)
router.post('/applications', auth, only('candidate'), upload.single('resume'), wrap(async (req, res) => {
  const { job_id, cover_note = '' } = req.body;
  const job = await pool.query("SELECT id FROM jobs WHERE id = $1 AND status = 'open'", [job_id]);
  if (job.rows.length === 0) return res.status(400).json({ message: 'This job is closed' });

  const already = await pool.query('SELECT id FROM applications WHERE job_id = $1 AND candidate_id = $2', [job_id, req.user.id]);
  if (already.rows.length > 0) return res.status(400).json({ message: 'You already applied for this job' });

  let resume = req.file ? req.file.filename : null;
  if (!resume) {
    const me = await pool.query('SELECT resume_path FROM users WHERE id = $1', [req.user.id]);
    resume = me.rows[0].resume_path;
  }
  if (!resume) return res.status(400).json({ message: 'Please upload your resume (PDF)' });

  const result = await pool.query(
    'INSERT INTO applications(job_id, candidate_id, cover_note, resume_path) VALUES($1,$2,$3,$4) RETURNING *',
    [job_id, req.user.id, cover_note, resume]
  );
  res.json(result.rows[0]);
}));

// Candidate: my applications
router.get('/applications/mine', auth, only('candidate'), wrap(async (req, res) => {
  const result = await pool.query(
    `SELECT a.*, j.title, j.location, c.name AS company_name
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.id = j.company_id
     WHERE a.candidate_id = $1 ORDER BY a.created_at DESC`,
    [req.user.id]
  );
  res.json(result.rows);
}));

// Candidate: withdraw an application (only while it is still "applied")
router.delete('/applications/:id', auth, only('candidate'), wrap(async (req, res) => {
  await pool.query(
    "DELETE FROM applications WHERE id = $1 AND candidate_id = $2 AND status = 'applied'",
    [req.params.id, req.user.id]
  );
  res.json({ message: 'Application withdrawn' });
}));

// Recruiter: everyone who applied for one of my jobs
router.get('/jobs/:id/applicants', auth, only('recruiter'), wrap(async (req, res) => {
  const result = await pool.query(
    `SELECT a.id, a.status, a.cover_note, a.resume_path, a.created_at,
            u.name, u.email, u.headline, u.skills
     FROM applications a
     JOIN users u ON u.id = a.candidate_id
     JOIN jobs j ON j.id = a.job_id
     JOIN companies c ON c.id = j.company_id
     WHERE a.job_id = $1 AND c.owner_id = $2
     ORDER BY a.created_at`,
    [req.params.id, req.user.id]
  );
  res.json(result.rows);
}));

// Recruiter: move a candidate to another pipeline stage
router.put('/applications/:id/status', auth, only('recruiter'), wrap(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
  const result = await pool.query(
    `UPDATE applications SET status = $1 WHERE id = $2
     AND job_id IN (SELECT j.id FROM jobs j JOIN companies c ON c.id = j.company_id WHERE c.owner_id = $3)
     RETURNING *`,
    [status, req.params.id, req.user.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ message: 'Application not found' });
  res.json(result.rows[0]);
}));

module.exports = router;
