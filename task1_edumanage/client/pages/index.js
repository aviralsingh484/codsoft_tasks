import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

const demos = [['Admin', 'admin@edu.com'], ['Teacher', 'teacher@edu.com'], ['Student', 'student@edu.com']];

export default function Login({ setUser }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function login(e) {
    e.preventDefault();
    try {
      const data = await api('/login', 'POST', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login">
      <form className="card" onSubmit={login}>
        <h1 style={{ color: '#C2623F', margin: 0 }}>EduManage</h1>
        <p>Student Management System</p>
        {error && <div className="error">{error}</div>}
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button>Login</button>
        <div className="demo">
          <b>Demo logins</b> (password: password123) - click to fill
          {demos.map(([role, mail]) => (
            <div key={role} onClick={() => { setEmail(mail); setPassword('password123'); }}>{role}: {mail}</div>
          ))}
        </div>
      </form>
    </div>
  );
}
