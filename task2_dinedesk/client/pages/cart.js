import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { rupees, GST_RATE } from '../lib/format';

export default function CartPage() {
  const { items, subtotal, changeQuantity, removeItem, clearCart } = useCart();

  const tax = Math.round(subtotal * GST_RATE * 100) / 100;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="panel mx-auto max-w-md text-center">
        <h1 className="mb-2 text-2xl">Your cart is empty</h1>
        <p className="mb-4 text-plum-light">Add a few dishes from the menu and they will show up here.</p>
        <Link href="/menu" className="btn-primary">Browse the menu</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-3xl">Your cart</h1>

      <div className="panel mb-4">
        <ul className="divide-y divide-cream-dark">
          {items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-plum-light">{rupees(item.price)} each</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-3">
                  <button onClick={() => changeQuantity(item.id, -1)} className="btn-outline h-8 w-8 p-0" aria-label="Decrease quantity">-</button>
                  <span className="w-4 text-center font-semibold">{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.id, 1)} className="btn-outline h-8 w-8 p-0" aria-label="Increase quantity">+</button>
                </div>
                <span className="w-20 text-right font-semibold">{rupees(item.price * item.quantity)}</span>
                <button onClick={() => removeItem(item.id)} className="text-sm underline text-red-800">Remove</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="panel mb-4 space-y-1">
        <div className="flex justify-between"><span>Subtotal</span><span>{rupees(subtotal)}</span></div>
        <div className="flex justify-between"><span>GST (5%)</span><span>{rupees(tax)}</span></div>
        <div className="flex justify-between border-t border-cream-dark pt-2 text-lg font-bold">
          <span>Total</span><span>{rupees(total)}</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-between gap-3">
        <button onClick={clearCart} className="btn-outline">Empty cart</button>
        <div className="flex gap-3">
          <Link href="/menu" className="btn-outline">Add more</Link>
          <Link href="/checkout" className="btn-primary">Go to checkout</Link>
        </div>
      </div>
    </div>
  );
}
