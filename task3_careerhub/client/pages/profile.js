import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api, apiUrl } from '../lib/api';
import { getUser, saveLogin } from '../lib/auth';

export default function Profile() {
  const [form, setForm] = useState({ name: '', headline: '', skills: '', bio: '' });
  const [resumePath, setResumePath] = useState(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/profile').then((p) => {
      setForm({ name: p.name, headline: p.headline || '', skills: p.skills || '', bio: p.bio || '' });
      setResumePath(p.resume_path);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    if (file) data.append('resume', file);
    try {
      const p = await api('/profile', { method: 'PUT', form: data });
      setResumePath(p.resume_path);
      setFile(null);
      // keep the name in the sidebar up to date
      saveLogin(localStorage.getItem('token'), { ...getUser(), name: p.name });
      setMessage('Profile saved');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout title="My Profile">
      <form onSubmit={handleSubmit} className="card max-w-2xl">
        {message && <p className="mb-4 rounded bg-green-100 px-3 py-2 text-sm text-green-800">{message}</p>}
        {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="label">Full name</label>
        <input className="input mb-4" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <label className="label">Headline</label>
        <input className="input mb-4" placeholder="e.g. Frontend Developer" value={form.headline}
          onChange={(e) => setForm({ ...form, headline: e.target.value })} />

        <label className="label">Skills (comma separated)</label>
        <input className="input mb-4" placeholder="React, Node.js, SQL" value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })} />

        <label className="label">About me</label>
        <textarea className="input mb-4" rows="4" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />

        <label className="label">Resume (PDF, max 2 MB)</label>
        {resumePath && (
          <a href={`${apiUrl}/uploads/${resumePath}`} target="_blank" rel="noreferrer"
            className="mb-2 block text-sm text-terra-600 underline">View current resume</a>
        )}
        <input type="file" accept="application/pdf" className="mb-6 block w-full text-sm"
          onChange={(e) => setFile(e.target.files[0])} />

        <button className="btn">Save profile</button>
      </form>
    </Layout>
  );
}
