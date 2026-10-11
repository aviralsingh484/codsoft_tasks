import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import StatusBadge, { STATUSES } from '../../components/StatusBadge';
import { api, apiUrl, formatDate } from '../../lib/api';

export default function Pipeline() {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState('');
  const [apps, setApps] = useState([]);
  const [view, setView] = useState('board');
  const [dragId, setDragId] = useState(null);
  const [error, setError] = useState('');

  // load my jobs once
  useEffect(() => {
    api('/jobs/mine').then(setJobs).catch((err) => setError(err.message));
  }, []);

  // pick the job from the URL (?job=3) or the first one
  useEffect(() => {
    if (!router.isReady || jobs.length === 0) return;
    setJobId(String(router.query.job || jobs[0].id));
  }, [router.isReady, jobs]);

  // load the applicants of the selected job
  useEffect(() => {
    if (jobId) api(`/jobs/${jobId}/applicants`).then(setApps).catch((err) => setError(err.message));
  }, [jobId]);

  async function move(app, status) {
    if (app.status === status) return;
    const before = apps;
    setApps(apps.map((a) => (a.id === app.id ? { ...a, status } : a))); // update screen first
    try {
      await api(`/applications/${app.id}/status`, { method: 'PUT', body: { status } });
    } catch (err) {
      setApps(before);
      setError(err.message);
    }
  }

  function handleDrop(status) {
    const app = apps.find((a) => a.id === dragId);
    if (app) move(app, status);
    setDragId(null);
  }

  function StatusSelect({ app }) {
    return (
      <select className="input py-1" value={app.status} onChange={(e) => move(app, e.target.value)}>
        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    );
  }

  return (
    <Layout title="Hiring Pipeline">
      {error && <p className="mb-4 text-red-700">{error}</p>}

      {jobs.length === 0 ? (
        <p className="text-muted">Post a job first to see candidates here.</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <select className="input max-w-xs" value={jobId} onChange={(e) => setJobId(e.target.value)}>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
            </select>
            <div className="flex overflow-hidden rounded-md border border-sand-300">
              {['board', 'table'].map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-4 py-2 text-sm capitalize ${view === v ? 'bg-terra-600 text-white' : 'bg-white'}`}>
                  {v}
                </button>
              ))}
            </div>
            <span className="text-sm text-muted">{apps.length} candidate{apps.length === 1 ? '' : 's'}</span>
          </div>

          {view === 'board' ? (
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
              {STATUSES.map((status) => (
                <div key={status} className="min-h-[200px] rounded-lg bg-sand-100 p-3"
                  onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(status)}>
                  <div className="mb-3 flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-xs text-muted">{apps.filter((a) => a.status === status).length}</span>
                  </div>
                  <div className="space-y-3">
                    {apps.filter((a) => a.status === status).map((app) => (
                      <div key={app.id} draggable onDragStart={() => setDragId(app.id)}
                        className="cursor-grab rounded-md border border-sand-200 bg-white p-3 text-sm shadow-sm">
                        <p className="font-medium">{app.name}</p>
                        <p className="text-xs text-muted">{app.headline || app.email}</p>
                        {app.skills && <p className="mt-1 text-xs">{app.skills}</p>}
                        {app.resume_path && (
                          <a href={`${apiUrl}/uploads/${app.resume_path}`} target="_blank" rel="noreferrer"
                            className="mt-1 block text-xs text-terra-600 underline">Resume</a>
                        )}
                        <div className="mt-2"><StatusSelect app={app} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="th">Candidate</th>
                    <th className="th">Skills</th>
                    <th className="th">Applied</th>
                    <th className="th">Resume</th>
                    <th className="th">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => (
                    <tr key={app.id}>
                      <td className="td">
                        <div className="font-medium">{app.name}</div>
                        <div className="text-xs text-muted">{app.email}</div>
                      </td>
                      <td className="td">{app.skills || '-'}</td>
                      <td className="td">{formatDate(app.created_at)}</td>
                      <td className="td">
                        {app.resume_path ? (
                          <a href={`${apiUrl}/uploads/${app.resume_path}`} target="_blank" rel="noreferrer" className="text-terra-600 underline">View</a>
                        ) : '-'}
                      </td>
                      <td className="td w-40"><StatusSelect app={app} /></td>
                    </tr>
                  ))}
                  {apps.length === 0 && <tr><td className="td text-muted" colSpan="5">No applicants yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
