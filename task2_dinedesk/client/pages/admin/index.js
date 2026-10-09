import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { rupees, formatDateTime } from '../../lib/format';
import RequireAuth from '../../components/RequireAuth';
import AdminNav from '../../components/AdminNav';
import StatusBadge from '../../components/StatusBadge';

function Overview() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/admin/stats', { token })
      .then(setStats)
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div>
      <h1 className="mb-4 text-3xl">Admin</h1>
      <AdminNav />

      {error && <div className="error-box">{error}</div>}
      {!stats && !error && <p>Loading...</p>}

      {stats && (
        <>
          <div className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-cream-dark bg-cream-dark md:grid-cols-4">
            <div className="bg-cream-light p-4">
              <p className="text-3xl font-heading">{stats.ordersToday}</p>
              <p className="text-sm text-plum-light">Orders today</p>
            </div>
            <div className="bg-cream-light p-4">
              <p className="text-3xl font-heading">{rupees(stats.revenueToday)}</p>
              <p className="text-sm text-plum-light">Revenue today</p>
            </div>
            <div className="bg-cream-light p-4">
              <p className="text-3xl font-heading">{stats.activeOrders}</p>
              <p className="text-sm text-plum-light">Orders in the kitchen</p>
            </div>
            <div className="bg-cream-light p-4">
              <p className="text-3xl font-heading">{stats.bookingsToday}</p>
              <p className="text-sm text-plum-light">Bookings today</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="panel">
              <h2 className="mb-2 text-xl">Best sellers</h2>
              {stats.popularItems.length === 0 && <p className="text-sm text-plum-light">No orders yet.</p>}
              <ul className="divide-y divide-cream-dark">
                {stats.popularItems.map((item) => (
                  <li key={item.name} className="flex justify-between py-2">
                    <span>{item.name}</span>
                    <span className="text-plum-light">{item.sold} sold</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="panel">
              <h2 className="mb-2 text-xl">Recent orders</h2>
              {stats.recentOrders.length === 0 && <p className="text-sm text-plum-light">No orders yet.</p>}
              <ul className="divide-y divide-cream-dark">
                {stats.recentOrders.map((order) => (
                  <li key={order.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                    <div>
                      <p className="font-semibold">#{order.id}, {order.customer_name}</p>
                      <p className="text-plum-light">{formatDateTime(order.created_at)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{rupees(order.total)}</p>
                      <StatusBadge status={order.status} />
                    </div>
                  </li>
                ))}
              </ul>
              <Link href="/kitchen" className="mt-2 inline-block text-sm font-semibold underline">Open kitchen dashboard</Link>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth roles={['admin']}>
      <Overview />
    </RequireAuth>
  );
}
