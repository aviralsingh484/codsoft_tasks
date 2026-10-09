import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { rupees, GST_RATE } from '../lib/format';
import RequireAuth from '../components/RequireAuth';

const TABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

function CheckoutForm() {
  const router = useRouter();
  const { token } = useAuth();
  const { items, subtotal, clearCart } = useCart();

  const [orderType, setOrderType] = useState('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tax = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="panel mx-auto max-w-md text-center">
        <h1 className="mb-2 text-2xl">Nothing to check out</h1>
        <Link href="/menu" className="btn-primary">Go to the menu</Link>
      </div>
    );
  }

  // basic checks on the fake card form
  function validateCard() {
    const digits = card.number.replace(/\s/g, '');
    if (!/^\d{16}$/.test(digits)) return 'Card number must be 16 digits';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.expiry)) return 'Expiry should look like 08/28';
    if (!/^\d{3}$/.test(card.cvv)) return 'CVV must be 3 digits';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (orderType === 'dine-in' && !tableNumber) {
      setError('Please choose your table number');
      return;
    }
    if (paymentMethod === 'card') {
      const cardError = validateCard();
      if (cardError) {
        setError(cardError);
        return;
      }
    }

    setSubmitting(true);
    try {
      const data = await api('/orders', {
        method: 'POST',
        token,
        body: {
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          orderType,
          tableNumber: orderType === 'dine-in' ? Number(tableNumber) : null,
          paymentMethod,
          notes,
        },
      });
      clearCart();
      router.push(`/orders/${data.orderId}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
      <form onSubmit={handleSubmit} className="space-y-5 md:col-span-2">
        <h1 className="text-3xl">Checkout</h1>

        <div className="panel">
          <h2 className="mb-3 text-xl">How do you want it?</h2>
          <div className="mb-3 flex gap-6">
            <label className="mb-0 flex items-center gap-2 font-normal">
              <input type="radio" name="orderType" checked={orderType === 'dine-in'} onChange={() => setOrderType('dine-in')} />
              Dine-in
            </label>
            <label className="mb-0 flex items-center gap-2 font-normal">
              <input type="radio" name="orderType" checked={orderType === 'takeaway'} onChange={() => setOrderType('takeaway')} />
              Takeaway
            </label>
          </div>

          {orderType === 'dine-in' && (
            <div className="max-w-xs">
              <label htmlFor="table">Table number</label>
              <select id="table" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)}>
                <option value="">Choose your table</option>
                {TABLE_NUMBERS.map((n) => (
                  <option key={n} value={n}>Table {n}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="panel">
          <h2 className="mb-3 text-xl">Payment</h2>
          <div className="mb-3 flex gap-6">
            <label className="mb-0 flex items-center gap-2 font-normal">
              <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
              Card
            </label>
            <label className="mb-0 flex items-center gap-2 font-normal">
              <input type="radio" name="payment" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
              Pay at the counter
            </label>
          </div>

          {paymentMethod === 'card' && (
            <div className="space-y-3">
              <p className="text-sm text-plum-light">
                This is a demo payment. Enter any 16 digit number, nothing is charged.
              </p>
              <div>
                <label htmlFor="cardNumber">Card number</label>
                <input
                  id="cardNumber"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="expiry">Expiry (MM/YY)</label>
                  <input id="expiry" placeholder="08/28" maxLength={5} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="cvv">CVV</label>
                  <input id="cvv" type="password" inputMode="numeric" placeholder="123" maxLength={3} value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <label htmlFor="notes">Anything the kitchen should know?</label>
          <textarea id="notes" rows={3} placeholder="Less spicy, no onions, allergies..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {error && <div className="error-box">{error}</div>}

        <button type="submit" disabled={submitting} className="btn-primary px-6 py-3">
          {submitting ? 'Placing order...' : `Place order, ${rupees(total)}`}
        </button>
      </form>

      <aside className="panel h-fit">
        <h2 className="mb-3 text-xl">Order summary</h2>
        <ul className="mb-3 space-y-1 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-2">
              <span>{item.quantity} x {item.name}</span>
              <span>{rupees(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="space-y-1 border-t border-cream-dark pt-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{rupees(subtotal)}</span></div>
          <div className="flex justify-between"><span>GST (5%)</span><span>{rupees(tax)}</span></div>
          <div className="flex justify-between text-base font-bold"><span>Total</span><span>{rupees(total)}</span></div>
        </div>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutForm />
    </RequireAuth>
  );
}
