import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// wraps a page so only logged in users (optionally with certain roles) can see it
export default function RequireAuth({ roles, children }) {
  const { user, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return <p className="py-10 text-center text-mauve-dark">Loading...</p>;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="panel mx-auto max-w-md text-center">
        <h1 className="mb-2 text-2xl">No access</h1>
        <p className="mb-4">This page is only for restaurant staff.</p>
        <Link href="/" className="btn-primary">Back to home</Link>
      </div>
    );
  }

  return children;
}
