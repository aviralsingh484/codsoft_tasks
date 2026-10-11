import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import BarChart from '../components/BarChart';
import { STATUSES } from '../components/StatusBadge';
import { api } from '../lib/api';
import { useUser } from '../lib/auth';

function StatCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-serif text-4xl text-terra-600">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const user = useUser();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/stats').then(setStats).catch((err) => setError(err.message));
  }, []);

  const byStatus = stats ? stats.byStatus : {};
  const stageItems = STATUSES.map((s) => ({ label: s, value: byStatus[s] || 0 }));
  const total = stageItems.reduce((sum, i) => sum + i.value, 0);

  return (
    <Layout title="Dashboard">
      {error && <p className="mb-4 text-red-700">{error}</p>}

      {stats && user && user.role === 'candidate' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Applications sent" value={total} />
            <StatCard label="Shortlisted" value={byStatus.shortlisted || 0} />
            <StatCard label="Interviews" value={byStatus.interview || 0} />
            <StatCard label="Saved jobs" value={stats.saved} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h2 className="mb-4 font-serif text-xl">My applications by status</h2>
              <BarChart items={stageItems} />
            </div>
            <div className="card">
              <h2 className="mb-2 font-serif text-xl">Keep going</h2>
              <p className="mb-4 text-sm text-muted">Browse new openings or check how your applications are moving.</p>
              <Link href="/jobs" className="btn mr-2">Find jobs</Link>
              <Link href="/applications" className="btn-light">My applications</Link>
            </div>
          </div>
        </>
      )}

      {stats && user && user.role === 'recruiter' && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Jobs posted" value={stats.jobs.length} />
            <StatCard label="Open jobs" value={stats.jobs.filter((j) => j.status === 'open').length} />
            <StatCard label="Total applicants" value={total} />
            <StatCard label="Hired" value={byStatus.hired || 0} />
          </div>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="card">
              <h2 className="mb-4 font-serif text-xl">Pipeline by stage</h2>
              <BarChart items={stageItems} />
            </div>
            <div className="card">
              <h2 className="mb-4 font-serif text-xl">Applicants per job</h2>
              <BarChart color="bg-amber-600" items={stats.jobs.map((j) => ({ label: j.title, value: j.applicants }))} />
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
