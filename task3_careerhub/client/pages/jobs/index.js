import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { api, formatDate } from '../../lib/api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({ search: '', location: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  function load() {
    setLoading(true);
    const query = new URLSearchParams(filters).toString();
    api('/jobs?' + query)
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    load();
  }

  async function toggleSave(job) {
    const data = await api(`/jobs/${job.id}/save`, { method: 'POST' });
    setJobs(jobs.map((j) => (j.id === job.id ? { ...j, saved: data.saved } : j)));
  }

  return (
    <Layout title="Find Jobs">
      <form onSubmit={handleSearch} className="card mb-6 grid gap-3 md:grid-cols-4">
        <input className="input" placeholder="Job title or company" value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        <input className="input" placeholder="Location" value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })} />
        <select className="input" value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All job types</option>
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Internship</option>
          <option>Contract</option>
        </select>
        <button className="btn">Search</button>
      </form>

      {error && <p className="mb-4 text-red-700">{error}</p>}

      <div className="table-wrap">
        <table className="w-full">
          <thead>
            <tr>
              <th className="th">Job</th>
              <th className="th">Location</th>
              <th className="th">Type</th>
              <th className="th">Salary</th>
              <th className="th">Posted</th>
              <th className="th"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td className="td">
                  <Link href={`/jobs/${job.id}`} className="font-medium text-terra-600 hover:underline">{job.title}</Link>
                  <div className="text-xs text-muted">{job.company_name}</div>
                </td>
                <td className="td">{job.location}</td>
                <td className="td">{job.job_type}</td>
                <td className="td">{job.salary || '-'}</td>
                <td className="td">{formatDate(job.created_at)}</td>
                <td className="td whitespace-nowrap text-right">
                  {job.applied && <span className="mr-3 text-xs font-medium text-green-700">Applied</span>}
                  <button onClick={() => toggleSave(job)} className="btn-light">
                    {job.saved ? '★ Saved' : '☆ Save'}
                  </button>
                </td>
              </tr>
            ))}
            {!loading && jobs.length === 0 && (
              <tr><td className="td text-muted" colSpan="6">No jobs found. Try a different search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}
