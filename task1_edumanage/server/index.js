require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());

// wraps async routes so errors come back as JSON
const h = (fn) => (req, res) =>
  fn(req, res).catch((e) =>
    res.status(400).json({ error: e.code === 'P2002' ? 'Email / roll no already exists' : e.message })
  );

// checks the JWT token and (optionally) the role
const auth = (...roles) => (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || '').split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Please login again' });
  }
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ error: 'Not allowed' });
  next();
};
const staff = ['ADMIN', 'TEACHER'];
const hash = (p) => bcrypt.hash(p || 'password123', 10);

// ---------- login ----------
app.post('/api/login', h(async (req, res) => {
  const { email, password } = req.body;
  const u = await prisma.user.findUnique({ where: { email }, include: { student: true } });
  if (!u || !(await bcrypt.compare(password, u.password))) return res.status(400).json({ error: 'Wrong email or password' });
  const token = jwt.sign({ id: u.id, role: u.role, studentId: u.student?.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { name: u.name, role: u.role } });
}));

// ---------- dashboard stats ----------
app.get('/api/stats', auth(), h(async (req, res) => {
  if (req.user.role === 'STUDENT') {
    const sid = req.user.studentId;
    const [total, present, results, fees] = await Promise.all([
      prisma.attendance.count({ where: { studentId: sid } }),
      prisma.attendance.count({ where: { studentId: sid, status: 'PRESENT' } }),
      prisma.result.count({ where: { studentId: sid } }),
      prisma.fee.aggregate({ where: { studentId: sid, paid: false }, _sum: { amount: true } }),
    ]);
    return res.json({ 'Attendance %': total ? Math.round((present / total) * 100) : 0, 'Exams taken': results, 'Pending fees (Rs)': fees._sum.amount || 0 });
  }
  const [students, teachers, exams, fees] = await Promise.all([
    prisma.student.count(),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.exam.count(),
    prisma.fee.aggregate({ where: { paid: false }, _sum: { amount: true } }),
  ]);
  res.json({ Students: students, Teachers: teachers, Exams: exams, 'Pending fees (Rs)': fees._sum.amount || 0 });
}));

// ---------- students ----------
app.get('/api/students', auth(...staff), h(async (req, res) =>
  res.json(await prisma.student.findMany({ include: { user: true }, orderBy: { rollNo: 'asc' } }))
));

app.post('/api/students', auth('ADMIN'), h(async (req, res) => {
  const { name, email, password, rollNo, className, phone } = req.body;
  await prisma.user.create({
    data: { name, email, role: 'STUDENT', password: await hash(password), student: { create: { rollNo, className, phone } } },
  });
  res.json({ ok: true });
}));

app.put('/api/students/:id', auth('ADMIN'), h(async (req, res) => {
  const { name, email, rollNo, className, phone } = req.body;
  const s = await prisma.student.update({ where: { id: +req.params.id }, data: { rollNo, className, phone } });
  await prisma.user.update({ where: { id: s.userId }, data: { name, email } });
  res.json({ ok: true });
}));

app.delete('/api/students/:id', auth('ADMIN'), h(async (req, res) => {
  const s = await prisma.student.findUnique({ where: { id: +req.params.id } });
  await prisma.user.delete({ where: { id: s.userId } }); // student + records are deleted by cascade
  res.json({ ok: true });
}));

// ---------- teachers ----------
app.get('/api/teachers', auth('ADMIN'), h(async (req, res) =>
  res.json(await prisma.user.findMany({ where: { role: 'TEACHER' }, select: { id: true, name: true, email: true, subject: true } }))
));

app.post('/api/teachers', auth('ADMIN'), h(async (req, res) => {
  const { name, email, password, subject } = req.body;
  await prisma.user.create({ data: { name, email, subject, role: 'TEACHER', password: await hash(password) } });
  res.json({ ok: true });
}));

app.delete('/api/teachers/:id', auth('ADMIN'), h(async (req, res) => {
  await prisma.user.delete({ where: { id: +req.params.id } });
  res.json({ ok: true });
}));

// ---------- attendance ----------
app.get('/api/attendance', auth(), h(async (req, res) => {
  const where = req.user.role === 'STUDENT' ? { studentId: req.user.studentId } : { date: new Date(req.query.date) };
  res.json(await prisma.attendance.findMany({ where, orderBy: { date: 'desc' } }));
}));

app.post('/api/attendance', auth(...staff), h(async (req, res) => {
  const { date, records } = req.body; // records = [{ studentId, status }]
  const d = new Date(date);
  await prisma.attendance.deleteMany({ where: { date: d } }); // replace that day's attendance
  await prisma.attendance.createMany({ data: records.map((r) => ({ date: d, studentId: r.studentId, status: r.status })) });
  res.json({ ok: true });
}));

// ---------- exams & results ----------
app.get('/api/exams', auth(), h(async (req, res) =>
  res.json(await prisma.exam.findMany({ orderBy: { date: 'desc' } }))
));

app.post('/api/exams', auth(...staff), h(async (req, res) => {
  const { title, subject, date, maxMarks } = req.body;
  res.json(await prisma.exam.create({ data: { title, subject, date: new Date(date), maxMarks: +maxMarks } }));
}));

app.get('/api/results', auth(), h(async (req, res) => {
  const where = req.user.role === 'STUDENT' ? { studentId: req.user.studentId } : { examId: +req.query.examId };
  res.json(await prisma.result.findMany({ where, include: { exam: true } }));
}));

app.post('/api/results', auth(...staff), h(async (req, res) => {
  const key = { examId: +req.body.examId, studentId: +req.body.studentId };
  const marks = +req.body.marks;
  res.json(await prisma.result.upsert({ where: { examId_studentId: key }, update: { marks }, create: { ...key, marks } }));
}));

// ---------- fees ----------
app.get('/api/fees', auth('ADMIN', 'STUDENT'), h(async (req, res) => {
  const where = req.user.role === 'STUDENT' ? { studentId: req.user.studentId } : {};
  res.json(await prisma.fee.findMany({ where, include: { student: { include: { user: true } } }, orderBy: { dueDate: 'asc' } }));
}));

app.post('/api/fees', auth('ADMIN'), h(async (req, res) => {
  const { studentId, title, amount, dueDate } = req.body;
  res.json(await prisma.fee.create({ data: { studentId: +studentId, title, amount: +amount, dueDate: new Date(dueDate) } }));
}));

app.put('/api/fees/:id/pay', auth('ADMIN'), h(async (req, res) => {
  const f = await prisma.fee.findUnique({ where: { id: +req.params.id } });
  res.json(await prisma.fee.update({ where: { id: f.id }, data: { paid: !f.paid } }));
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('EduManage server running on port ' + PORT));
