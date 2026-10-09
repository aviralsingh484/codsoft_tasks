import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push(router.query.next || '/menu');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-3xl">Create an account</h1>
      <form onSubmit={handleSubmit} className="panel space-y-4">
        <div>
          <label htmlFor="name">Full name</label>
          <input id="name" required value={form.name} onChange={update('name')} />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={update('email')} />
        </div>
        <div>
          <label htmlFor="phone">Phone (optional)</label>
          <input id="phone" type="tel" value={form.phone} onChange={update('phone')} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} value={form.password} onChange={update('password')} />
          <p className="mt-1 text-xs text-plum-light">At least 6 characters</p>
        </div>
        {error && <div className="error-box">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
        <p className="text-center text-sm">
          Already have an account? <Link href="/login" className="font-semibold underline">Log in</Link>
        </p>
      </form>
    </div>
  );
}
