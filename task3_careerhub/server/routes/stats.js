const router = require('express').Router();
const pool = require('../db');
const { auth, wrap } = require('../middleware/auth');

// turns [{status:'applied', count:3}] into {applied:3}
function toMap(rows) {
  const map = {};
  rows.forEach((r) => { map[r.status] = r.count; });
  return map;
}

// Numbers for the dashboard (different for candidates and recruiters)
router.get('/stats', auth, wrap(async (req, res) => {
  if (req.user.role === 'candidate') {
    const byStatus = await pool.query(
      'SELECT status, COUNT(*)::int AS count FROM applications WHERE candidate_id = $1 GROUP BY status',
      [req.user.id]
    );
    const saved = await pool.query('SELECT COUNT(*)::int AS count FROM saved_jobs WHERE user_id = $1', [req.user.id]);
    return res.json({ byStatus: toMap(byStatus.rows), saved: saved.rows[0].count });
  }

  const jobs = await pool.query(
    `SELECT j.id, j.title, j.status, COUNT(a.id)::int AS applicants
     FROM jobs j JOIN companies c ON c.id = j.company_id
     LEFT JOIN applications a ON a.job_id = j.id
     WHERE c.owner_id = $1 GROUP BY j.id ORDER BY j.created_at DESC`,
    [req.user.id]
  );
  const byStatus = await pool.query(
    `SELECT a.status, COUNT(*)::int AS count FROM applications a
     JOIN jobs j ON j.id = a.job_id JOIN companies c ON c.id = j.company_id
     WHERE c.owner_id = $1 GROUP BY a.status`,
    [req.user.id]
  );
  res.json({ jobs: jobs.rows, byStatus: toMap(byStatus.rows) });
}));

module.exports = router;
