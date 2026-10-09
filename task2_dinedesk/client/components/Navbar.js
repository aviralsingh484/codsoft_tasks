import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/menu', label: 'Menu' },
    { href: '/reservations', label: 'Reserve a table' },
  ];
  if (user) links.push({ href: '/orders', label: 'My orders' });
  if (user && (user.role === 'kitchen' || user.role === 'admin')) {
    links.push({ href: '/kitchen', label: 'Kitchen' });
  }
  if (user && user.role === 'admin') {
    links.push({ href: '/admin', label: 'Admin' });
  }

  function isActive(href) {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  }

  function handleLogout() {
    logout();
    setOpen(false);
    router.push('/');
  }

  return (
    <header className="bg-plum text-cream-light">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-heading text-2xl">
          DineDesk
        </Link>

        <button
          className="rounded border border-mauve px-2 py-1 text-lg md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          ☰
        </button>

        <nav className={`${open ? 'flex' : 'hidden'} absolute left-0 right-0 top-14 z-10 flex-col gap-3 bg-plum px-4 pb-4 md:static md:flex md:flex-row md:items-center md:gap-5 md:bg-transparent md:p-0`}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`text-sm ${isActive(link.href) ? 'border-b border-mauve-light font-bold' : 'hover:text-mauve-light'}`}
            >
              {link.label}
            </Link>
          ))}

          <Link href="/cart" onClick={() => setOpen(false)} className="text-sm hover:text-mauve-light">
            Cart ({count})
          </Link>

          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-mauve-light">Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="rounded border border-mauve px-3 py-1 hover:bg-mauve">
                Log out
              </button>
            </div>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)} className="rounded bg-mauve px-3 py-1 text-sm font-semibold text-white hover:bg-mauve-dark">
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
