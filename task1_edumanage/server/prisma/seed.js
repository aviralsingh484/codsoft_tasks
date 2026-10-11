// Demo data. Run once: npm run seed
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash('password123', 10);
  await prisma.user.create({ data: { name: 'Admin', email: 'admin@edu.com', password: pw, role: 'ADMIN' } });
  await prisma.user.create({ data: { name: 'Mrs. Sharma', email: 'teacher@edu.com', password: pw, role: 'TEACHER', subject: 'Mathematics' } });

  const names = ['Aarav Singh', 'Diya Verma', 'Rohan Gupta', 'Meera Joshi'];
  for (let i = 0; i < names.length; i++) {
    await prisma.user.create({
      data: {
        name: names[i],
        email: i === 0 ? 'student@edu.com' : `student${i + 1}@edu.com`,
        password: pw,
        role: 'STUDENT',
        student: { create: { rollNo: `R10${i + 1}`, className: '10-A', phone: `98765432${i}0` } },
      },
    });
  }

  const exam = await prisma.exam.create({ data: { title: 'Mid Term', subject: 'Mathematics', date: new Date('2026-11-10'), maxMarks: 100 } });
  const today = new Date(new Date().toISOString().slice(0, 10));
  const students = await prisma.student.findMany();
  for (const s of students) {
    await prisma.result.create({ data: { examId: exam.id, studentId: s.id, marks: 55 + s.id * 8 } });
    await prisma.fee.create({ data: { studentId: s.id, title: 'Term 1 Fee', amount: 15000, dueDate: new Date('2026-11-30'), paid: s.id % 2 === 0 } });
    await prisma.attendance.create({ data: { studentId: s.id, date: today, status: 'PRESENT' } });
  }
  console.log('Seed done');
}

main().finally(() => prisma.$disconnect());
