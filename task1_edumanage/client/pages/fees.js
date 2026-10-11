import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api, fmt } from '../lib/api';

const empty = { studentId: '', title: '', amount: '', dueDate: '' };

export default function Fees({ user }) {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(empty);
  const isAdmin = user?.role === 'ADMIN';

  const load = () => api('/fees').then(setFees);
  useEffect(() => {
    if (!user) return;
    load();
    if (isAdmin) api('/students').then(setStudents);
  }, [user]);

  async function add(e) {
    e.preventDefault();
    await api('/fees', 'POST', form);
    setForm(empty); load();
  }

  async function toggle(id) {
    await api('/fees/' + id + '/pay', 'PUT');
    load();
  }

  return (
    <Layout title="Fees" user={user}>
      {isAdmin && (
        <form className="card" onSubmit={add}>
          <h3>Add fee</h3>
          <select value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.rollNo} - {s.user.name}</option>)}
          </select>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <button>Add</button>
        </form>
      )}
      <table>
        <thead><tr>{isAdmin && <th>Student</th>}<th>Title</th><th>Amount</th><th>Due date</th><th>Status</th>{isAdmin && <th>Action</th>}</tr></thead>
        <tbody>
          {fees.map((f) => (
            <tr key={f.id}>
              {isAdmin && <td>{f.student.user.name}</td>}
              <td>{f.title}</td><td>Rs {f.amount}</td><td>{fmt(f.dueDate)}</td>
              <td className={f.paid ? 'green' : 'red'}>{f.paid ? 'PAID' : 'PENDING'}</td>
              {isAdmin && <td><button onClick={() => toggle(f.id)}>{f.paid ? 'Mark unpaid' : 'Mark paid'}</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
