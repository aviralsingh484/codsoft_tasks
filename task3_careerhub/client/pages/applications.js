import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import { api, formatDate } from '../lib/api';

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/applications/mine').then(setApps).catch((err) => setError(err.message));
  }, []);

  async function withdraw(id) {
    if (!confirm('Withdraw this application?')) return;
    await api('/applications/' + id, { method: 'DELETE' });
    setApps(apps.filter((a) => a.id !== id));
  }

  return (
    <Layout title="My Applications">
      {error && <p className="mb-4 text-red-700">{error}</p>}
      <div className="table-wrap">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Job</th>
              <th className="th">Company</th>
              <th className="th">Applied on</th>
              <th className="th">Status</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td className="td">
                  <Link href={`/jobs/${a.job_id}`} className="font-medium text-terra-600 hover:underline">{a.title}</Link>
                  <div className="text-xs text-muted">{a.location}</div>
                </td>
                <td className="td">{a.company_name}</td>
                <td className="td">{formatDate(a.created_at)}</td>
                <td className="td"><StatusBadge status={a.status} /></td>
                <td className="td text-right">
                  {a.status === 'applied' && (
                    <button onClick={() => withdraw(a.id)} className="btn-light">Withdraw</button>
                  )}
                </td>
              </tr>
            ))}
            {apps.length === 0 && (
              <tr><td className="td text-muted" colSpan="5">You have not applied for any job yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
