import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import StatusBadge from '../../../components/StatusBadge';
import { api, formatDate } from '../../../lib/api';

export default function MyJobs() {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/jobs/mine').then(setJobs).catch((err) => setError(err.message));
  }, []);

  async function toggleStatus(job) {
    const status = job.status === 'open' ? 'closed' : 'open';
    await api(`/jobs/${job.id}/status`, { method: 'PUT', body: { status } });
    setJobs(jobs.map((j) => (j.id === job.id ? { ...j, status } : j)));
  }

  async function remove(job) {
    if (!confirm('Delete this job and all its applications?')) return;
    await api('/jobs/' + job.id, { method: 'DELETE' });
    setJobs(jobs.filter((j) => j.id !== job.id));
  }

  return (
    <Layout title="My Jobs">
      {error && <p className="mb-4 text-red-700">{error}</p>}
      <div className="table-wrap">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Job</th>
              <th className="th">Status</th>
              <th className="th">Applicants</th>
              <th className="th">Posted</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="td">
                  <Link href={`/jobs/${j.id}`} className="font-medium text-terra-600 hover:underline">{j.title}</Link>
                  <div className="text-xs text-muted">{j.location} · {j.job_type}</div>
                </td>
                <td className="td"><StatusBadge status={j.status} /></td>
                <td className="td">{j.applicants}</td>
                <td className="td">{formatDate(j.created_at)}</td>
                <td className="td space-x-2 whitespace-nowrap text-right">
                  <Link href={`/recruiter/pipeline?job=${j.id}`} className="btn-light">Pipeline</Link>
                  <button onClick={() => toggleStatus(j)} className="btn-light">{j.status === 'open' ? 'Close' : 'Reopen'}</button>
                  <button onClick={() => remove(j)} className="btn-light">Delete</button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr><td className="td text-muted" colSpan="5">You have not posted any jobs yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
