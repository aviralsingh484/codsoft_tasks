import { useEffect } from 'react';
import { useRouter } from 'next/router';

// Send the visitor to the dashboard or the login page
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    router.replace(localStorage.getItem('token') ? '/dashboard' : '/login');
  }, []);
  return null;
}
