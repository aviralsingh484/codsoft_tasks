-- Running this file wipes and recreates all tables
DROP TABLE IF EXISTS saved_jobs, applications, jobs, companies, users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,            -- 'candidate' or 'recruiter'
  headline VARCHAR(150) DEFAULT '',
  skills VARCHAR(300) DEFAULT '',
  bio TEXT DEFAULT '',
  resume_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  owner_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT DEFAULT '',
  website VARCHAR(200) DEFAULT '',
  location VARCHAR(120) DEFAULT '',
  industry VARCHAR(100) DEFAULT ''
);

CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(120) NOT NULL,
  job_type VARCHAR(30) DEFAULT 'Full-time',
  salary VARCHAR(60) DEFAULT '',
  status VARCHAR(10) DEFAULT 'open',    -- 'open' or 'closed'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  candidate_id INT REFERENCES users(id) ON DELETE CASCADE,
  cover_note TEXT DEFAULT '',
  resume_path VARCHAR(255),
  status VARCHAR(20) DEFAULT 'applied', -- applied, shortlisted, interview, hired, rejected
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (job_id, candidate_id)
);

CREATE TABLE saved_jobs (
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  job_id INT REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, job_id)
);
