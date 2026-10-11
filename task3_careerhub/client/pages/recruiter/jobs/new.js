import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { api } from '../../../lib/api';

export default function NewJob() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', location: '', job_type: 'Full-time', salary: '', description: '' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await api('/jobs', { method: 'POST', body: form });
      router.push('/recruiter/jobs');
    } catch (err) {
      setError(err.message);
    }
  }

  function field(key) {
    return { value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) };
  }

  return (
    <Layout title="Post a Job">
      <form onSubmit={handleSubmit} className="card max-w-2xl">
        {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

        <label className="label">Job title</label>
        <input className="input mb-4" required {...field('title')} />

        <div className="mb-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Location</label>
            <input className="input" required {...field('location')} />
          </div>
          <div>
            <label className="label">Job type</label>
            <select className="input" {...field('job_type')}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Internship</option>
              <option>Contract</option>
            </select>
          </div>
          <div>
            <label className="label">Salary</label>
            <input className="input" placeholder="e.g. ₹5-8 LPA" {...field('salary')} />
          </div>
        </div>

        <label className="label">Description</label>
        <textarea className="input mb-6" rows="8" required {...field('description')} />
        <button className="btn">Publish job</button>
      </form>
    </Layout>
  );
}
