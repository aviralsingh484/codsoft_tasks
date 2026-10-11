import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUser, logout } from '../lib/auth';

const candidateLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/jobs', label: 'Find Jobs' },
  { href: '/applications', label: 'My Applications' },
  { href: '/saved', label: 'Saved Jobs' },
  { href: '/companies', label: 'Companies' },
  { href: '/profile', label: 'My Profile' }
];

const recruiterLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/recruiter/jobs', label: 'My Jobs' },
  { href: '/recruiter/jobs/new', label: 'Post a Job' },
  { href: '/recruiter/pipeline', label: 'Pipeline' },
  { href: '/companies', label: 'Companies' },
  { href: '/recruiter/company', label: 'Company Profile' }
];

// Sidebar + page title. Every logged-in page is wrapped in this.
export default function Layout({ title, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = getUser();
    if (!saved) router.replace('/login');
    else setUser(saved);
  }, []);

  if (!user) return null;

  const links = user.role === 'recruiter' ? recruiterLinks : candidateLinks;

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen">
      <Head>
        <title>{title} | CareerHub</title>
      </Head>

      <aside className="bg-ink p-5 text-sand-100 md:fixed md:inset-y-0 md:left-0 md:flex md:w-60 md:flex-col">
        <h2 className="font-serif text-2xl text-white">
          Career<span className="text-terra-500">Hub</span>
        </h2>
        <p className="mt-1 text-xs capitalize text-sand-300">{user.role} account</p>

        <nav className="mt-6 flex flex-wrap gap-1 md:flex-1 md:flex-col">
          {links.map((link) => {
            const active = router.pathname === link.href || router.pathname === link.href + '/[id]';
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm ${active ? 'bg-terra-600 text-white' : 'hover:bg-white/10'}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="truncate text-sm">{user.name}</p>
          <button onClick={handleLogout} className="mt-2 text-sm text-sand-300 hover:text-white">
            Log out
          </button>
        </div>
      </aside>

      <main className="p-6 md:ml-60 md:p-8">
        <h1 className="mb-6 font-serif text-3xl">{title}</h1>
        {children}
      </main>
    </div>
  );
}
