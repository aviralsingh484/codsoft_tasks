import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

export default function CompanyProfile() {
  const [form, setForm] = useState({ name: '', industry: '', location: '', website: '', description: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/companies/mine').then((c) => {
      if (c) setForm({ name: c.name, industry: c.industry, location: c.location, website: c.website, description: c.description });
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await api('/companies/mine', { method: 'PUT', body: form });
      setMessage('Company profile saved');
    } catch (err) {
      setError(err.message);
    }
  }

  function field(key) {
    return { value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) };
  }

  return (
    <Layout title="Company Profile">
      <form onSubmit={handleSubmit} className="card max-w-2xl">
        {message && <p className="mb-4 rounded bg-green-100 px-3 py-2 text-sm text-green-800">{message}</p>}
        {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="label">Company name</label>
        <input className="input mb-4" required {...field('name')} />
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Industry</label>
            <input className="input" {...field('industry')} />
          </div>
          <div>
            <label className="label">Location</label>
            <input className="input" {...field('location')} />
          </div>
        </div>
        <label className="label">Website</label>
        <input className="input mb-4" placeholder="https://" {...field('website')} />
        <label className="label">About the company</label>
        <textarea className="input mb-6" rows="5" {...field('description')} />
        <button className="btn">Save company</button>
      </form>
    </Layout>
  );
}
