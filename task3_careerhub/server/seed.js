// Creates the tables and adds demo data. Run with: npm run seed
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./db');

// small helper that returns the first row
async function q(text, params) {
  const result = await pool.query(text, params);
  return result.rows[0];
}

async function seed() {
  await pool.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));
  const hash = await bcrypt.hash('password123', 10);

  // name, email, role, headline, skills, bio
  const people = [
    ['Riya Sharma', 'candidate@demo.com', 'candidate', 'Frontend Developer', 'React, JavaScript, Tailwind CSS', 'Final-year student who loves building clean user interfaces.'],
    ['Arjun Mehta', 'arjun@demo.com', 'candidate', 'Backend Developer', 'Node.js, PostgreSQL, Express', 'Enjoys designing APIs and databases.'],
    ['Sneha Iyer', 'sneha@demo.com', 'candidate', 'Data Analyst', 'SQL, Python, Excel', 'Turns messy data into simple stories.'],
    ['Karan Verma', 'karan@demo.com', 'candidate', 'UI/UX Designer', 'Figma, CSS, User Research', 'Designer who also writes a bit of code.'],
    ['Priya Nair', 'priya@demo.com', 'candidate', 'Full Stack Developer', 'Next.js, Node.js, MongoDB', 'Built a few full stack projects during college.'],
    ['Neha Kapoor', 'recruiter@demo.com', 'recruiter', '', '', ''],
    ['Rohit Das', 'recruiter2@demo.com', 'recruiter', '', '', ''],
    ['Meera Joshi', 'recruiter3@demo.com', 'recruiter', '', '', '']
  ];
  const ids = [];
  for (const p of people) {
    const u = await q(
      'INSERT INTO users(name,email,password,role,headline,skills,bio) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [p[0], p[1], hash, p[2], p[3], p[4], p[5]]
    );
    ids.push(u.id);
  }
  // ids[0..4] = candidates, ids[5..7] = recruiters

  // owner index, name, industry, location, website, description
  const companies = [
    [5, 'Terra Labs', 'Software', 'Bengaluru', 'https://terralabs.example.com', 'Terra Labs builds web tools for small businesses. We are a friendly team of 40 engineers who like shipping often.'],
    [6, 'Sandstone Studio', 'Design', 'Pune', 'https://sandstone.example.com', 'A design studio that creates brand identities and mobile apps for startups.'],
    [7, 'Clayworks Analytics', 'Data & Analytics', 'Noida', 'https://clayworks.example.com', 'We help retail companies understand their customers using data.']
  ];
  const companyIds = [];
  for (const c of companies) {
    const row = await q(
      'INSERT INTO companies(owner_id,name,industry,location,website,description) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      [ids[c[0]], c[1], c[2], c[3], c[4], c[5]]
    );
    companyIds.push(row.id);
  }

  // company index, title, location, type, salary
  const jobs = [
    [0, 'Frontend Developer (React)', 'Bengaluru', 'Full-time', '₹6-9 LPA'],
    [0, 'Backend Developer (Node.js)', 'Remote', 'Full-time', '₹7-10 LPA'],
    [0, 'Software Engineering Intern', 'Remote', 'Internship', '₹15,000/month'],
    [1, 'UI/UX Designer', 'Pune', 'Full-time', '₹5-8 LPA'],
    [1, 'Product Design Intern', 'Pune', 'Internship', '₹12,000/month'],
    [2, 'Data Analyst', 'Noida', 'Full-time', '₹4-7 LPA'],
    [2, 'Business Analyst', 'Delhi', 'Part-time', '₹3-5 LPA'],
    [2, 'Data Science Intern', 'Remote', 'Internship', '₹10,000/month']
  ];
  const jobIds = [];
  for (const j of jobs) {
    const desc = `We are looking for a ${j[1]} to join our team.\n\nWhat you will do:\n- Work with a friendly team on real products\n- Learn fast and take ownership of your tasks\n- Share ideas in weekly team meetings\n\nWhat we look for:\n- Good basics and a habit of learning\n- Clear communication`;
    const row = await q(
      'INSERT INTO jobs(company_id,title,description,location,job_type,salary) VALUES($1,$2,$3,$4,$5,$6) RETURNING id',
      [companyIds[j[0]], j[1], desc, j[2], j[3], j[4]]
    );
    jobIds.push(row.id);
  }

  // job index, candidate index, status
  const apps = [
    [0, 0, 'interview'], [3, 0, 'shortlisted'], [5, 0, 'applied'],
    [0, 4, 'applied'], [0, 1, 'shortlisted'], [0, 3, 'rejected'],
    [1, 1, 'applied'], [1, 4, 'hired'], [2, 4, 'applied'],
    [3, 3, 'interview'], [3, 4, 'applied'], [4, 3, 'applied'],
    [5, 2, 'hired'], [5, 1, 'applied'], [6, 2, 'shortlisted'], [7, 2, 'applied']
  ];
  for (const a of apps) {
    await pool.query(
      'INSERT INTO applications(job_id,candidate_id,cover_note,status) VALUES($1,$2,$3,$4)',
      [jobIds[a[0]], ids[a[1]], 'I would love to work with your team and learn from it.', a[2]]
    );
  }
  await pool.query('INSERT INTO saved_jobs(user_id,job_id) VALUES($1,$2),($1,$3)', [ids[0], jobIds[1], jobIds[4]]);

  console.log('Database ready. Demo logins (password: password123):');
  console.log('  candidate@demo.com  /  recruiter@demo.com');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
