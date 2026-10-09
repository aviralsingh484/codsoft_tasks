import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // send staff to their dashboards unless they were heading somewhere specific
      const next = router.query.next;
      if (next) router.push(next);
      else if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'kitchen') router.push('/kitchen');
      else router.push('/menu');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-4 text-3xl">Log in</h1>
      <form onSubmit={handleSubmit} className="panel space-y-4">
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="error-box">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
        <p className="text-center text-sm">
          New here? <Link href="/register" className="font-semibold underline">Create an account</Link>
        </p>
      </form>

      <div className="mt-4 rounded border border-dashed border-mauve p-3 text-sm text-plum-light">
        <p className="mb-1 font-semibold text-plum">Demo accounts</p>
        <p>Customer: customer@dinedesk.com / customer123</p>
        <p>Kitchen: kitchen@dinedesk.com / kitchen123</p>
        <p>Admin: admin@dinedesk.com / admin123</p>
      </div>
    </div>
  );
}
