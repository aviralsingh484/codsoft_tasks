import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { api, formatDate } from '../../lib/api';
import { useUser } from '../../lib/auth';

export default function JobDetails() {
  const router = useRouter();
  const user = useUser();
  const { id } = router.query;

  const [job, setJob] = useState(null);
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) api('/jobs/' + id).then(setJob).catch((err) => setError(err.message));
  }, [id]);

  async function handleApply(e) {
    e.preventDefault();
    setError('');
    const form = new FormData();
    form.append('job_id', id);
    form.append('cover_note', note);
    if (file) form.append('resume', file);
    try {
      await api('/applications', { method: 'POST', form });
      setJob({ ...job, applied: true });
      setMessage('Your application has been sent!');
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleSave() {
    const data = await api(`/jobs/${id}/save`, { method: 'POST' });
    setJob({ ...job, saved: data.saved });
  }

  return (
    <Layout title="Job Details">
      {error && <p className="mb-4 rounded bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>}

      {job && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card lg:col-span-2">
            <h2 className="font-serif text-3xl">{job.title}</h2>
            <p className="mt-1 text-muted">
              <Link href={`/companies/${job.company_id}`} className="font-medium text-terra-600 hover:underline">
                {job.company_name}
              </Link>{' '}
              · {job.location} · {job.job_type}
            </p>
            <p className="mt-1 text-sm text-muted">
              {job.salary && <>Salary: {job.salary} · </>}Posted {formatDate(job.created_at)}
            </p>
            <h3 className="mb-2 mt-6 font-semibold">About the role</h3>
            <p className="whitespace-pre-line text-sm leading-relaxed">{job.description}</p>
          </div>

          {user && user.role === 'candidate' && (
            <div className="card h-fit">
              {job.applied ? (
                <p className="font-medium text-green-700">
                  {message || 'You have already applied for this job.'}
                  <Link href="/applications" className="mt-2 block text-sm text-terra-600">Track my applications →</Link>
                </p>
              ) : job.status === 'closed' ? (
                <p className="text-muted">This job is closed.</p>
              ) : (
                <form onSubmit={handleApply}>
                  <h3 className="mb-3 font-serif text-xl">Apply now</h3>
                  <label className="label">Cover note</label>
                  <textarea className="input mb-3" rows="4" value={note} onChange={(e) => setNote(e.target.value)}
                    placeholder="Tell them why you are a good fit" />
                  <label className="label">Resume (PDF, max 2 MB)</label>
                  <input type="file" accept="application/pdf" className="mb-1 block w-full text-sm"
                    onChange={(e) => setFile(e.target.files[0])} />
                  <p className="mb-4 text-xs text-muted">If you skip this, the resume saved in your profile is used.</p>
                  <button className="btn w-full">Submit application</button>
                </form>
              )}
              <button onClick={toggleSave} className="btn-light mt-3 w-full">
                {job.saved ? '★ Saved' : '☆ Save for later'}
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
