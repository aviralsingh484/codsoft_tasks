import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

const empty = { name: '', email: '', password: '', rollNo: '', className: '', phone: '' };
const labels = { name: 'Name', email: 'Email', password: 'Password (blank = password123)', rollNo: 'Roll No', className: 'Class', phone: 'Phone' };

export default function Students({ user }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState('');
  const isAdmin = user?.role === 'ADMIN';

  const load = () => api('/students').then(setList);
  useEffect(() => { if (user) load(); }, [user]);

  async function save(e) {
    e.preventDefault();
    try {
      if (editId) await api('/students/' + editId, 'PUT', form);
      else await api('/students', 'POST', form);
      setForm(empty); setEditId(null); setMsg(''); load();
    } catch (err) { setMsg(err.message); }
  }

  function edit(s) {
    setEditId(s.id);
    setForm({ name: s.user.name, email: s.user.email, password: '', rollNo: s.rollNo, className: s.className, phone: s.phone || '' });
  }

  async function remove(id) {
    if (confirm('Delete this student and all their records?')) { await api('/students/' + id, 'DELETE'); load(); }
  }

  return (
    <Layout title="Students" user={user}>
      {isAdmin && (
        <form className="card" onSubmit={save}>
          <h3>{editId ? 'Edit student' : 'Add student'}</h3>
          {Object.keys(labels).map((f) => (editId && f === 'password') ? null : (
            <input key={f} placeholder={labels[f]} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f !== 'phone' && f !== 'password'} />
          ))}
          <button>{editId ? 'Update' : 'Add'}</button>
          {editId && <button type="button" className="grey" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          {msg && <div className="error">{msg}</div>}
        </form>
      )}
      <table>
        <thead><tr><th>Roll No</th><th>Name</th><th>Email</th><th>Class</th><th>Phone</th>{isAdmin && <th>Action</th>}</tr></thead>
        <tbody>
          {list.map((s) => (
            <tr key={s.id}>
              <td>{s.rollNo}</td><td>{s.user.name}</td><td>{s.user.email}</td><td>{s.className}</td><td>{s.phone}</td>
              {isAdmin && <td><button onClick={() => edit(s)}>Edit</button> <button className="grey" onClick={() => remove(s.id)}>Delete</button></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
