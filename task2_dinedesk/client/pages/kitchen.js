import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { minutesAgo } from '../lib/format';
import RequireAuth from '../components/RequireAuth';
import StatusBadge from '../components/StatusBadge';

const columns = [
  { status: 'placed', title: 'New orders', nextStatus: 'preparing', buttonText: 'Start preparing' },
  { status: 'preparing', title: 'Preparing', nextStatus: 'ready', buttonText: 'Mark as ready' },
  { status: 'ready', title: 'Ready to serve', nextStatus: 'completed', buttonText: 'Mark as completed' },
];

function KitchenBoard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadOrders() {
    try {
      const data = await api('/orders?active=1', { token });
      setOrders(data.orders);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  // refresh every 8 seconds so new orders show up on their own
  useEffect(() => {
    loadOrders();
    const timer = setInterval(loadOrders, 8000);
    return () => clearInterval(timer);
  }, [token]);

  async function updateStatus(orderId, status) {
    try {
      await api(`/orders/${orderId}/status`, { method: 'PATCH', token, body: { status } });
      loadOrders();
    } catch (err) {
      setError(err.message);
    }
  }

  async function cancelOrder(orderId) {
    if (!window.confirm(`Cancel order #${orderId}?`)) return;
    updateStatus(orderId, 'cancelled');
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <h1 className="text-3xl">Kitchen dashboard</h1>
        <p className="text-sm text-plum-light">
          {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString('en-IN')}, refreshes automatically` : 'Loading...'}
        </p>
      </div>

      {error && <div className="error-box mb-4">{error}</div>}

      <div className="grid gap-5 md:grid-cols-3">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => o.status === col.status);
          return (
            <section key={col.status}>
              <h2 className="mb-3 flex items-center justify-between border-b-2 border-plum pb-1 text-xl">
                {col.title}
                <span className="text-base">{colOrders.length}</span>
              </h2>

              {colOrders.length === 0 && <p className="text-sm text-mauve-dark">Nothing here right now.</p>}

              <div className="space-y-3">
                {colOrders.map((order) => (
                  <div key={order.id} className="panel">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-lg font-bold">#{order.id}</span>
                      <span className="text-xs text-plum-light">{minutesAgo(order.created_at)}</span>
                    </div>
                    <p className="mb-2 text-sm font-semibold">
                      {order.order_type === 'dine-in' ? `Table ${order.table_number}` : 'Takeaway'}, {order.customer_name}
                    </p>

                    <ul className="mb-2 space-y-0.5 text-sm">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          <span className="font-bold">{item.quantity} x</span> {item.name}
                        </li>
                      ))}
                    </ul>

                    {order.notes && (
                      <p className="mb-2 rounded bg-amber-100 px-2 py-1 text-sm text-amber-900">Note: {order.notes}</p>
                    )}

                    <div className="mb-3 flex items-center gap-2 text-xs">
                      <span>Payment:</span>
                      <StatusBadge status={order.payment_status} />
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(order.id, col.nextStatus)} className="btn-primary flex-1">
                        {col.buttonText}
                      </button>
                      {col.status !== 'ready' && (
                        <button onClick={() => cancelOrder(order.id)} className="btn-danger px-3" title="Cancel order">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

export default function KitchenPage() {
  return (
    <RequireAuth roles={['kitchen', 'admin']}>
      <KitchenBoard />
    </RequireAuth>
  );
}
