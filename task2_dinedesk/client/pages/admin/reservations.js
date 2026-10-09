import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatSlot } from '../../lib/format';
import RequireAuth from '../../components/RequireAuth';
import AdminNav from '../../components/AdminNav';
import StatusBadge from '../../components/StatusBadge';

function ReservationManager() {
  const { token } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');

  async function load() {
    try {
      const query = dateFilter ? `?date=${dateFilter}` : '';
      const data = await api(`/reservations${query}`, { token });
      setReservations(data.reservations);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, [dateFilter, token]);

  async function setStatus(id, status) {
    try {
      await api(`/reservations/${id}/status`, { method: 'PATCH', token, body: { status } });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  const shown = reservations.filter((r) => statusFilter === 'all' || r.status === statusFilter);

  return (
    <div>
      <h1 className="mb-4 text-3xl">Admin</h1>
      <AdminNav />

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label htmlFor="dateFilter">Date</label>
          <input id="dateFilter" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
        <div>
          <label htmlFor="statusFilter">Status</label>
          <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        {dateFilter && (
          <button onClick={() => setDateFilter('')} className="btn-outline mb-0.5">Clear date</button>
        )}
      </div>

      {error && <div className="error-box mb-4">{error}</div>}

      <div className="overflow-x-auto rounded-md border border-cream-dark bg-cream-light">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream-dark bg-cream-dark/50">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Guest</th>
              <th className="px-3 py-2">Party</th>
              <th className="px-3 py-2">Table</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {shown.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-plum-light">No reservations found.</td></tr>
            )}
            {shown.map((r) => (
              <tr key={r.id}>
                <td className="px-3 py-2">{formatSlot(r.date, r.time)}</td>
                <td className="px-3 py-2">
                  <p className="font-semibold">{r.guest_name}</p>
                  <p className="text-plum-light">{r.phone}</p>
                  {r.special_request && <p className="text-xs">Note: {r.special_request}</p>}
                </td>
                <td className="px-3 py-2">{r.party_size}</td>
                <td className="px-3 py-2">{r.table_number} ({r.seats} seats)</td>
                <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-2">
                  {r.status === 'confirmed' ? (
                    <div className="flex gap-3">
                      <button onClick={() => setStatus(r.id, 'completed')} className="font-semibold underline">Seated</button>
                      <button onClick={() => setStatus(r.id, 'cancelled')} className="text-red-800 underline">Cancel</button>
                    </div>
                  ) : (
                    <span className="text-plum-light">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminReservationsPage() {
  return (
    <RequireAuth roles={['admin']}>
      <ReservationManager />
    </RequireAuth>
  );
}
