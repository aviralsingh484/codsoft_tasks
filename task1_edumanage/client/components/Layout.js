import Link from 'next/link';
import { useRouter } from 'next/router';

const ALL = ['ADMIN', 'TEACHER', 'STUDENT'];
const menu = [
  { href: '/dashboard', label: 'Dashboard', roles: ALL },
  { href: '/students', label: 'Students', roles: ['ADMIN', 'TEACHER'] },
  { href: '/teachers', label: 'Teachers', roles: ['ADMIN'] },
  { href: '/attendance', label: 'Attendance', roles: ALL },
  { href: '/exams', label: 'Exams & Results', roles: ALL },
  { href: '/fees', label: 'Fees', roles: ['ADMIN', 'STUDENT'] },
];

export default function Layout({ title, user, children }) {
  const router = useRouter();
  if (!user) return null;

  function logout() {
    localStorage.clear();
    router.push('/');
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>EduManage</h2>
        {menu.filter((m) => m.roles.includes(user.role)).map((m) => (
          <Link key={m.href} href={m.href} className={router.pathname === m.href ? 'active' : ''}>{m.label}</Link>
        ))}
      </aside>
      <div className="main">
        <header className="topbar">
          <b>{title}</b>
          <span>{user.name} ({user.role}) &nbsp; <button onClick={logout}>Logout</button></span>
        </header>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}
