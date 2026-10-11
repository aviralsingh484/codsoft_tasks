import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Dashboard({ user }) {
  const [stats, setStats] = useState({});
  useEffect(() => { if (user) api('/stats').then(setStats); }, [user]);

  return (
    <Layout title="Dashboard" user={user}>
      <h2>Welcome, {user?.name}</h2>
      <div className="cards">
        {Object.entries(stats).map(([label, value]) => (
          <div className="stat" key={label}><span>{label}</span><b>{value}</b></div>
        ))}
      </div>
    </Layout>
  );
}
