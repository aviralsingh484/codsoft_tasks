# EduManage - Student Management System (CODSOFT Task 1)

Full-stack platform to manage students, teachers, attendance, exams/results and fees, with role-based dashboards (Admin, Teacher, Student). It replaces manual, paper-based student records with one digital workflow.

## Features
- Login with JWT and role-based access (Admin / Teacher / Student)
- Admin: add, edit, delete students; add, delete teachers; manage fees (mark paid/unpaid)
- Admin + Teacher: take daily attendance, create exams, enter marks
- Student: view own attendance %, results and fees
- Dashboard with quick stats for each role

## Tech Stack
Next.js 14 (pages router) | Node.js + Express | PostgreSQL | Prisma | JWT + bcrypt

## Setup
1. Create the database in psql: `CREATE DATABASE edumanage;`
2. Server (Command Prompt):
   ```
   cd server
   copy .env.example .env
   ```
   Edit `.env` (if your password has `@`, write it as `%40`). Then:
   ```
   npm install
   npx prisma db push
   npm run seed
   npm run dev
   ```
   Server runs on http://localhost:5000 (run the seed only once).
3. Client (new terminal):
   ```
   cd client
   copy .env.example .env.local
   npm install
   npm run dev
   ```
   Open http://localhost:3000

## Demo Logins (password: password123)
| Role | Email |
|---|---|
| Admin | admin@edu.com |
| Teacher | teacher@edu.com |
| Student | student@edu.com |
