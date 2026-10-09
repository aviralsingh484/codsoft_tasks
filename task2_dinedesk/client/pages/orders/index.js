import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { rupees, formatDateTime } from '../../lib/format';
import RequireAuth from '../../components/RequireAuth';
import StatusBadge from '../../components/StatusBadge';

function MyOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/mine', { token })
      .then((data) => setOrders(data.orders))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-3xl">My orders</h1>

      {loading && <p>Loading...</p>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="panel text-center">
          <p className="mb-3">You have not placed any orders yet.</p>
          <Link href="/menu" className="btn-primary">Order something</Link>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`} className="panel block hover:border-mauve">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">Order #{order.id}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="mt-1 text-sm text-plum-light">
              {formatDateTime(order.created_at)}, {order.order_type === 'dine-in' ? `Table ${order.table_number}` : 'Takeaway'}
            </p>
            <p className="mt-1 text-sm">
              {order.items.map((i) => `${i.quantity} x ${i.name}`).join(', ')}
            </p>
            <p className="mt-2 font-semibold">{rupees(order.total)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <RequireAuth>
      <MyOrders />
    </RequireAuth>
  );
}
