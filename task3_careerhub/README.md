# CareerHub - Job Portal (CODSOFT Task 3)

A recruitment platform that connects job seekers and companies. Candidates search jobs, upload a resume, apply and track their applications. Recruiters publish jobs, manage candidates on a Kanban pipeline board and watch hiring stats on a dashboard.

## Features

**Candidates**
- Register / login (JWT)
- Search jobs by title, company, location and job type
- Job details page with apply form (cover note + PDF resume upload)
- Profile with headline, skills, bio and saved resume
- Track applications by status (Applied, Shortlisted, Interview, Hired, Rejected) and withdraw an application
- Save / bookmark jobs for later
- Company pages with open positions
- Dashboard with stats and a status chart

**Recruiters**
- Company profile (name, industry, location, website, about)
- Post jobs, close / reopen jobs, delete jobs
- Kanban pipeline board (drag a candidate card between stages) plus a table view
- View candidate details and download their PDF resume
- Dashboard with pipeline chart and applicants-per-job chart

## Tech stack

- Frontend: Next.js 14 (pages router), React, Tailwind CSS
- Backend: Node.js, Express
- Database: PostgreSQL
- Auth: JWT + bcrypt
- File storage: PDF resumes saved on the server in `server/uploads` (free, no cloud account needed)

## Setup (Windows, Command Prompt)

You need Node.js and PostgreSQL installed. In the VS Code terminal type `cmd` first, because PowerShell blocks npm scripts.

### 1. Create the database
Open SQL Shell (psql) and run:
```
CREATE DATABASE careerhub;
```

### 2. Start the server
```
cd server
copy .env.example .env
```
Open `server/.env` and set your PostgreSQL password in `DATABASE_URL`
(if the password contains `@`, write it as `%40`) and set `JWT_SECRET` to any long text. Then:
```
npm install
npm run seed
npm start
```
`npm run seed` creates all tables and adds demo data. Running it again resets the data.
The API runs on http://localhost:5000

### 3. Start the client
Open a second terminal (type `cmd`):
```
cd client
copy .env.example .env
npm install
npm run dev
```
Open http://localhost:3000

## Demo logins

Password for all demo users: `password123`

| Role | Email |
|------|-------|
| Candidate | candidate@demo.com |
| Recruiter | recruiter@demo.com |

(They are also shown on the login page.)

## Folder structure

```
task3_careerhub/
  client/   Next.js app (pages, components, lib)
  server/   Express API (routes, middleware, schema.sql, seed.js)
```

## Main API routes

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/jobs`, `GET /api/jobs/:id`, `POST /api/jobs`, `PUT /api/jobs/:id/status`, `DELETE /api/jobs/:id`
- `POST /api/jobs/:id/save`, `GET /api/saved`
- `POST /api/applications`, `GET /api/applications/mine`, `GET /api/jobs/:id/applicants`, `PUT /api/applications/:id/status`
- `GET /api/companies`, `GET /api/companies/:id`, `GET/PUT /api/companies/mine`
- `GET/PUT /api/profile`, `GET /api/stats`
