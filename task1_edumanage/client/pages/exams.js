import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api, fmt } from '../lib/api';

const empty = { title: '', subject: '', date: '', maxMarks: 100 };

export default function Exams({ user }) {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState(empty);
  const [sel, setSel] = useState(null); // exam selected for entering marks
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({}); // studentId -> marks
  const [mine, setMine] = useState([]); // student's own results
  const isStaff = user && user.role !== 'STUDENT';

  const load = () => api('/exams').then(setExams);
  useEffect(() => {
    if (!user) return;
    load();
    if (!isStaff) api('/results').then(setMine);
  }, [user]);

  async function addExam(e) {
    e.preventDefault();
    await api('/exams', 'POST', form);
    setForm(empty); load();
  }

  async function openExam(ex) {
    const [sts, res] = await Promise.all([api('/students'), api('/results?examId=' + ex.id)]);
    const m = {};
    res.forEach((r) => (m[r.studentId] = r.marks));
    setSel(ex); setStudents(sts); setMarks(m);
  }

  async function saveMarks() {
    const filled = students.filter((s) => marks[s.id] !== undefined && marks[s.id] !== '');
    await Promise.all(filled.map((s) => api('/results', 'POST', { examId: sel.id, studentId: s.id, marks: marks[s.id] })));
    alert('Marks saved');
  }

  if (!isStaff) {
    return (
      <Layout title="My Results" user={user}>
        <table>
          <thead><tr><th>Exam</th><th>Subject</th><th>Date</th><th>Marks</th></tr></thead>
          <tbody>
            {mine.map((r) => (
              <tr key={r.id}><td>{r.exam.title}</td><td>{r.exam.subject}</td><td>{fmt(r.exam.date)}</td><td>{r.marks} / {r.exam.maxMarks}</td></tr>
            ))}
          </tbody>
        </table>
      </Layout>
    );
  }

  return (
    <Layout title="Exams & Results" user={user}>
      <form className="card" onSubmit={addExam}>
        <h3>Add exam</h3>
        <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <input type="number" placeholder="Max marks" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} required />
        <button>Add</button>
      </form>
      <table>
        <thead><tr><th>Title</th><th>Subject</th><th>Date</th><th>Max</th><th>Action</th></tr></thead>
        <tbody>
          {exams.map((ex) => (
            <tr key={ex.id}><td>{ex.title}</td><td>{ex.subject}</td><td>{fmt(ex.date)}</td><td>{ex.maxMarks}</td><td><button onClick={() => openExam(ex)}>Enter marks</button></td></tr>
          ))}
        </tbody>
      </table>
      {sel && (
        <div className="card" style={{ marginTop: 18 }}>
          <h3>Marks - {sel.title} ({sel.subject}, out of {sel.maxMarks})</h3>
          <table>
            <thead><tr><th>Roll No</th><th>Name</th><th>Marks</th></tr></thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>{s.rollNo}</td><td>{s.user.name}</td>
                  <td><input type="number" max={sel.maxMarks} value={marks[s.id] ?? ''} onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <br /><button onClick={saveMarks}>Save marks</button>
        </div>
      )}
    </Layout>
  );
}
