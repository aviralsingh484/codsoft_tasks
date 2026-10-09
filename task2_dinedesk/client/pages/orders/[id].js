import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { rupees, formatDateTime } from '../../lib/format';
import RequireAuth from '../../components/RequireAuth';
import StatusBadge from '../../components/StatusBadge';
import OrderTracker from '../../components/OrderTracker';

function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  async function loadOrder() {
    try {
      const data = await api(`/orders/${id}`, { token });
      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    }
  }

  // load once, then keep refreshing every 5 seconds so the status stays live
  useEffect(() => {
    if (!id) return;
    loadOrder();
    const timer = setInterval(() => {
      loadOrder();
    }, 5000);
    return () => clearInterval(timer);
  }, [id, token]);

  async function handleCancel() {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await api(`/orders/${id}/cancel`, { method: 'PATCH', token });
      loadOrder();
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !order) {
    return (
      <div className="panel mx-auto max-w-md text-center">
        <div className="error-box mb-3">{error}</div>
        <Link href="/orders" className="btn-primary">Back to my orders</Link>
      </div>
    );
  }

  if (!order) return <p>Loading order...</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/orders" className="text-sm underline">All orders</Link>

      <div className="mb-4 mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl">Order #{order.id}</h1>
        <StatusBadge status={order.status} />
      </div>

      <div className="panel mb-4">
        <OrderTracker status={order.status} />
      </div>

      {error && <div className="error-box mb-4">{error}</div>}

      <div className="panel mb-4">
        <p className="mb-3 text-sm text-plum-light">
          Placed {formatDateTime(order.created_at)}.{' '}
          {order.order_type === 'dine-in' ? `Dine-in at table ${order.table_number}.` : 'Takeaway order.'}
        </p>

        <ul className="divide-y divide-cream-dark">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between py-2">
              <span>{item.quantity} x {item.name}</span>
              <span>{rupees(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-1 border-t border-cream-dark pt-3 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{rupees(order.subtotal)}</span></div>
          <div className="flex justify-between"><span>GST (5%)</span><span>{rupees(order.tax)}</span></div>
          <div className="flex justify-between text-base font-bold"><span>Total</span><span>{rupees(order.total)}</span></div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <span>Payment by {order.payment_method === 'card' ? 'card' : 'cash at the counter'}:</span>
          <StatusBadge status={order.payment_status} />
        </div>

        {order.notes && <p className="mt-3 text-sm"><span className="font-semibold">Your note:</span> {order.notes}</p>}
      </div>

      {order.status === 'placed' && (
        <button onClick={handleCancel} className="btn-danger">Cancel order</button>
      )}
    </div>
  );
}

export default function OrderPage() {
  return (
    <RequireAuth>
      <OrderDetails />
    </RequireAuth>
  );
}
