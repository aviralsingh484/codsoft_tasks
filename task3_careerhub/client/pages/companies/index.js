import Link from 'next/link';
import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import { api } from '../../lib/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    api('/companies').then(setCompanies).catch(() => {});
  }, []);

  return (
    <Layout title="Companies">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {companies.map((c) => (
          <Link key={c.id} href={`/companies/${c.id}`} className="card block hover:border-terra-500">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-terra-600 font-serif text-xl text-white">
              {c.name[0]}
            </div>
            <h2 className="font-serif text-xl">{c.name}</h2>
            <p className="text-sm text-muted">{[c.industry, c.location].filter(Boolean).join(' · ')}</p>
            <p className="mt-3 text-sm font-medium text-terra-600">{c.open_jobs} open job{c.open_jobs === 1 ? '' : 's'}</p>
          </Link>
        ))}
        {companies.length === 0 && <p className="text-muted">No companies yet.</p>}
      </div>
    </Layout>
  );
}
