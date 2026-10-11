import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

export default function CompanyPage() {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = useState(null);

  useEffect(() => {
    if (id) api('/companies/' + id).then(setCompany).catch(() => {});
  }, [id]);

  return (
    <Layout title="Company">
      {company && (
        <>
          <div className="card mb-6">
            <h2 className="font-serif text-3xl">{company.name}</h2>
            <p className="mt-1 text-sm text-muted">{[company.industry, company.location].filter(Boolean).join(' · ')}</p>
            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer" className="mt-1 block text-sm text-terra-600 underline">
                {company.website}
              </a>
            )}
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{company.description || 'No description yet.'}</p>
          </div>

          <h3 className="mb-3 font-serif text-xl">Open positions</h3>
          <div className="table-wrap">
            <table className="w-full">
              <thead>
                <tr><th className="th">Job</th><th className="th">Location</th><th className="th">Type</th><th className="th">Salary</th></tr>
              </thead>
              <tbody>
                {company.jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="td"><Link href={`/jobs/${j.id}`} className="font-medium text-terra-600 hover:underline">{j.title}</Link></td>
                    <td className="td">{j.location}</td>
                    <td className="td">{j.job_type}</td>
                    <td className="td">{j.salary || '-'}</td>
                  </tr>
                ))}
                {company.jobs.length === 0 && <tr><td className="td text-muted" colSpan="4">No open positions right now.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}
