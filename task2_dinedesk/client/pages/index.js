import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import MenuLine from '../components/MenuLine';

export default function Home() {
  const [picks, setPicks] = useState([]);

  useEffect(() => {
    api('/menu')
      .then((data) => {
        // take the first available dish from each category for the preview
        const chosen = [];
        data.categories.forEach((cat) => {
          const dish = data.items.find((i) => i.category_id === cat.id && i.is_available);
          if (dish) chosen.push(dish);
        });
        setPicks(chosen);
      })
      .catch(() => setPicks([]));
  }, []);

  return (
    <div>
      <section className="grid items-start gap-10 py-6 md:grid-cols-2">
        <div>
          <h1 className="mb-4 text-4xl leading-tight sm:text-5xl">
            Order from your table, or book one for tonight
          </h1>
          <p className="mb-6 max-w-md text-lg text-plum-light">
            Look through the menu, send your order straight to the kitchen and
            watch it get made. No waiting around for the waiter.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/menu" className="btn-primary px-5 py-3">Order now</Link>
            <Link href="/reservations" className="btn-outline px-5 py-3">Reserve a table</Link>
          </div>
        </div>

        <div className="panel">
          <h2 className="mb-1 text-xl">A taste of the menu</h2>
          <div className="divide-y divide-cream-dark">
            {picks.length === 0 && (
              <p className="py-4 text-sm text-mauve-dark">Menu is loading. If this stays empty, check that the backend is running.</p>
            )}
            {picks.map((item) => (
              <MenuLine key={item.id} item={item} />
            ))}
          </div>
          <Link href="/menu" className="mt-2 inline-block text-sm font-semibold underline">
            See the full menu
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-8 border-t border-mauve-light pt-8 md:grid-cols-3">
        <div>
          <h3 className="mb-2 text-xl">Order online</h3>
          <p className="text-plum-light">
            Pick dine-in or takeaway, pay by card or at the counter, and your order lands on the kitchen screen right away.
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-xl">Follow your order</h3>
          <p className="text-plum-light">
            The status changes as the kitchen works on it, from placed to preparing to ready.
          </p>
        </div>
        <div>
          <h3 className="mb-2 text-xl">Book a table</h3>
          <p className="text-plum-light">
            Choose the date, time and number of guests. We show whether a table is free before you confirm.
          </p>
        </div>
      </section>
    </div>
  );
}
