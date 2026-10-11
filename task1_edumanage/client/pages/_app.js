import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import '../styles/globals.css';

// keeps the logged-in user and sends it to every page
export default function App({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
    else if (router.pathname !== '/') router.push('/');
  }, [router.pathname]);

  return <Component {...pageProps} user={user} setUser={setUser} />;
}
