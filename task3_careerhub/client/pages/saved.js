import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../lib/api';

export default function Saved() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api('/saved').then(setJobs).catch(() => {});
  }, []);

  async function unsave(id) {
    await api(`/jobs/${id}/save`, { method: 'POST' });
    setJobs(jobs.filter((j) => j.id !== id));
  }

  return (
    <Layout title="Saved Jobs">
      <div className="table-wrap">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Job</th>
              <th className="th">Company</th>
              <th className="th">Location</th>
              <th className="th">Type</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td className="td">
                  <Link href={`/jobs/${j.id}`} className="font-medium text-terra-600 hover:underline">{j.title}</Link>
                </td>
                <td className="td">{j.company_name}</td>
                <td className="td">{j.location}</td>
                <td className="td">{j.job_type}</td>
                <td className="td text-right">
                  <button onClick={() => unsave(j.id)} className="btn-light">Remove</button>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr><td className="td text-muted" colSpan="5">No saved jobs yet. Use the Save button on any job.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
