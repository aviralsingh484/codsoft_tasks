import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import { saveLogin } from '../lib/auth';

const demos = [
  { role: 'Candidate', email: 'candidate@demo.com' },
  { role: 'Recruiter', email: 'recruiter@demo.com' }
];

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/login', { method: 'POST', body: form });
      saveLogin(data.token, data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen md:flex">
      <Head><title>Login | CareerHub</title></Head>

      <div className="bg-terra-600 p-8 text-white md:flex md:w-1/2 md:flex-col md:justify-center md:p-16">
        <h1 className="font-serif text-4xl">CareerHub</h1>
        <p className="mt-3 max-w-sm text-sand-100">
          Candidates find jobs and track applications. Recruiters publish jobs and manage hiring in one place.
        </p>

        <div className="mt-8 max-w-sm rounded-lg bg-white/10 p-4">
          <p className="mb-3 text-sm font-semibold">Demo logins (password: password123)</p>
          {demos.map((d) => (
            <button
              key={d.email}
              type="button"
              onClick={() => setForm({ email: d.email, password: 'password123' })}
              className="mb-2 block w-full rounded bg-white/15 px-3 py-2 text-left text-sm hover:bg-white/25"
            >
              <span className="font-medium">{d.role}:</span> {d.email}
            </button>
          ))}
          <p className="text-xs text-sand-200">Click a login to fill the form.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 md:w-1/2">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="mb-6 font-serif text-3xl">Welcome back</h2>
          {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

          <label className="label">Email</label>
          <input className="input mb-4" type="email" value={form.email} required
            onChange={(e) => setForm({ ...form, email: e.target.value })} />

          <label className="label">Password</label>
          <input className="input mb-6" type="password" value={form.password} required
            onChange={(e) => setForm({ ...form, password: e.target.value })} />

          <button className="btn w-full" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
          <p className="mt-4 text-sm text-muted">
            New here? <Link href="/register" className="font-medium text-terra-600">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
