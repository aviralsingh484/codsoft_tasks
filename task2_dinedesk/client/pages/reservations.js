import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { formatSlot } from '../lib/format';
import StatusBadge from '../components/StatusBadge';

// 12:00 to 22:00 in half hour steps
const TIME_SLOTS = [];
for (let hour = 12; hour <= 22; hour++) {
  TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:00`);
  if (hour < 22) TIME_SLOTS.push(`${String(hour).padStart(2, '0')}:30`);
}

function toDisplayTime(time) {
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${suffix}`;
}

function todayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ReservationsPage() {
  const { user, token, ready } = useAuth();

  const [form, setForm] = useState({
    guestName: '',
    phone: '',
    date: '',
    time: '',
    partySize: 2,
    specialRequest: '',
  });
  const [availability, setAvailability] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [myBookings, setMyBookings] = useState([]);

  // prefill name and phone from the account
  useEffect(() => {
    if (user) {
      setForm((prev) => ({ ...prev, guestName: prev.guestName || user.name, phone: prev.phone || user.phone || '' }));
    }
  }, [user]);

  function loadBookings() {
    if (!token) return;
    api('/reservations/mine', { token })
      .then((data) => setMyBookings(data.reservations))
      .catch(() => {});
  }

  useEffect(loadBookings, [token]);

  // check how many tables are free whenever the slot changes
  useEffect(() => {
    setAvailability(null);
    if (!form.date || !form.time || !form.partySize) return;

    api(`/reservations/availability?date=${form.date}&time=${form.time}&guests=${form.partySize}`)
      .then((data) => setAvailability({ ok: true, count: data.available }))
      .catch((err) => setAvailability({ ok: false, message: err.message }));
  }, [form.date, form.time, form.partySize]);

  function update(field) {
    return (e) => {
      setForm({ ...form, [field]: e.target.value });
      setSuccess('');
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const data = await api('/reservations', {
        method: 'POST',
        token,
        body: { ...form, partySize: Number(form.partySize) },
      });
      setSuccess(`You're booked! Table ${data.tableNumber} is reserved for ${formatSlot(form.date, form.time)}.`);
      setForm({ ...form, date: '', time: '', specialRequest: '' });
      loadBookings();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelBooking(id) {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api(`/reservations/${id}/cancel`, { method: 'PATCH', token });
      loadBookings();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h1 className="mb-1 text-3xl">Reserve a table</h1>
        <p className="mb-4 text-plum-light">We take bookings from 12:00 pm to 10:00 pm. Tables are held for two hours.</p>

        <form onSubmit={handleSubmit} className="panel space-y-4">
          <div>
            <label htmlFor="guestName">Name</label>
            <input id="guestName" required value={form.guestName} onChange={update('guestName')} />
          </div>
          <div>
            <label htmlFor="phone">Phone number</label>
            <input id="phone" type="tel" required value={form.phone} onChange={update('phone')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="date">Date</label>
              <input id="date" type="date" required min={todayString()} value={form.date} onChange={update('date')} />
            </div>
            <div>
              <label htmlFor="time">Time</label>
              <select id="time" required value={form.time} onChange={update('time')}>
                <option value="">Select time</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{toDisplayTime(t)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="partySize">Number of guests</label>
            <select id="partySize" value={form.partySize} onChange={update('partySize')}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="specialRequest">Special request (optional)</label>
            <textarea id="specialRequest" rows={2} placeholder="Birthday, high chair, window seat..." value={form.specialRequest} onChange={update('specialRequest')} />
          </div>

          {availability && availability.ok && availability.count > 0 && (
            <p className="text-sm font-semibold text-green-800">
              {availability.count} {availability.count === 1 ? 'table is' : 'tables are'} free at this time.
            </p>
          )}
          {availability && availability.ok && availability.count === 0 && (
            <p className="text-sm font-semibold text-red-800">Fully booked at this time. Try another slot.</p>
          )}
          {availability && !availability.ok && (
            <p className="text-sm text-red-800">{availability.message}</p>
          )}

          {error && <div className="error-box">{error}</div>}
          {success && <div className="success-box">{success}</div>}

          {ready && !user ? (
            <p className="text-sm">
              Please <Link href="/login?next=/reservations" className="font-semibold underline">log in</Link> or{' '}
              <Link href="/register?next=/reservations" className="font-semibold underline">sign up</Link> to confirm a booking.
            </p>
          ) : (
            <button type="submit" disabled={submitting || (availability && availability.ok && availability.count === 0)} className="btn-primary w-full">
              {submitting ? 'Booking...' : 'Confirm reservation'}
            </button>
          )}
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-2xl">Your reservations</h2>
        {!user && <p className="text-plum-light">Log in to see your bookings here.</p>}
        {user && myBookings.length === 0 && <p className="text-plum-light">No reservations yet.</p>}

        <div className="space-y-3">
          {myBookings.map((b) => (
            <div key={b.id} className="panel">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{formatSlot(b.date, b.time)}</span>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-1 text-sm text-plum-light">
                {b.party_size} {b.party_size === 1 ? 'guest' : 'guests'}, table {b.table_number}, under {b.guest_name}
              </p>
              {b.special_request && <p className="mt-1 text-sm">Note: {b.special_request}</p>}
              {b.status === 'confirmed' && (
                <button onClick={() => cancelBooking(b.id)} className="btn-danger mt-3 px-3 py-1">Cancel</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
