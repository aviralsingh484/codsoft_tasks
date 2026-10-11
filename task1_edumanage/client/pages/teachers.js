import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

const empty = { name: '', email: '', password: '', subject: '' };
const labels = { name: 'Name', email: 'Email', password: 'Password (blank = password123)', subject: 'Subject' };

export default function Teachers({ user }) {
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState('');

  const load = () => api('/teachers').then(setList);
  useEffect(() => { if (user) load(); }, [user]);

  async function add(e) {
    e.preventDefault();
    try { await api('/teachers', 'POST', form); setForm(empty); setMsg(''); load(); }
    catch (err) { setMsg(err.message); }
  }

  async function remove(id) {
    if (confirm('Delete this teacher?')) { await api('/teachers/' + id, 'DELETE'); load(); }
  }

  return (
    <Layout title="Teachers" user={user}>
      <form className="card" onSubmit={add}>
        <h3>Add teacher</h3>
        {Object.keys(labels).map((f) => (
          <input key={f} placeholder={labels[f]} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} required={f !== 'password'} />
        ))}
        <button>Add</button>
        {msg && <div className="error">{msg}</div>}
      </form>
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Action</th></tr></thead>
        <tbody>
          {list.map((t) => (
            <tr key={t.id}><td>{t.name}</td><td>{t.email}</td><td>{t.subject}</td><td><button className="grey" onClick={() => remove(t.id)}>Delete</button></td></tr>
          ))}
        </tbody>
      </table>
    </Layout>
  );
}
