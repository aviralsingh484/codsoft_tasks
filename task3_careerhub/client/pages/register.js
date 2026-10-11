import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';
import { saveLogin } from '../lib/auth';

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate' });
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api('/auth/register', { method: 'POST', body: form });
      saveLogin(data.token, data.user);
      // recruiters need a company first
      router.push(data.user.role === 'recruiter' ? '/recruiter/company' : '/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Head><title>Sign up | CareerHub</title></Head>
      <form onSubmit={handleSubmit} className="card w-full max-w-md">
        <h1 className="mb-6 font-serif text-3xl">Create your account</h1>
        {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

        <p className="label">I am a</p>
        <div className="mb-4 grid grid-cols-2 gap-3">
          {['candidate', 'recruiter'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({ ...form, role: r })}
              className={`rounded-md border px-3 py-2 text-sm capitalize ${
                form.role === r ? 'border-terra-600 bg-terra-600 text-white' : 'border-sand-300 bg-white'
              }`}
            >
              {r === 'candidate' ? 'Job seeker' : 'Recruiter'}
            </button>
          ))}
        </div>

        <label className="label">Full name</label>
        <input className="input mb-4" value={form.name} required onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <label className="label">Email</label>
        <input className="input mb-4" type="email" value={form.email} required onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <label className="label">Password (min 6 characters)</label>
        <input className="input mb-6" type="password" value={form.password} required onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <button className="btn w-full">Sign up</button>
        <p className="mt-4 text-sm text-muted">
          Already have an account? <Link href="/login" className="font-medium text-terra-600">Log in</Link>
        </p>
      </form>
    </div>
  );
}
