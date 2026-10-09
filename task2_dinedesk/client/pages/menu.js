import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { rupees } from '../lib/format';
import MenuLine from '../components/MenuLine';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { items: cartItems, count, subtotal, addItem, changeQuantity } = useCart();

  useEffect(() => {
    api('/menu')
      .then((data) => {
        setCategories(data.categories);
        setItems(data.items);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const visibleItems = items.filter((item) => {
    if (activeCategory !== 'all' && item.category_id !== activeCategory) return false;
    if (vegOnly && !item.is_veg) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function quantityInCart(id) {
    const found = cartItems.find((i) => i.id === id);
    return found ? found.quantity : 0;
  }

  function renderAction(item) {
    if (!item.is_available) {
      return <span className="text-sm font-semibold text-red-800">Sold out today</span>;
    }
    const qty = quantityInCart(item.id);
    if (qty === 0) {
      return (
        <button onClick={() => addItem(item)} className="btn-secondary px-3 py-1">
          Add to cart
        </button>
      );
    }
    return (
      <div className="inline-flex items-center gap-3">
        <button onClick={() => changeQuantity(item.id, -1)} className="btn-outline h-8 w-8 p-0" aria-label={`Remove one ${item.name}`}>
          -
        </button>
        <span className="w-4 text-center font-semibold">{qty}</span>
        <button onClick={() => changeQuantity(item.id, 1)} className="btn-outline h-8 w-8 p-0" aria-label={`Add one ${item.name}`}>
          +
        </button>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <h1 className="mb-4 text-3xl">Our menu</h1>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search dishes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <label className="mb-0 flex items-center gap-2 font-normal">
          <input type="checkbox" checked={vegOnly} onChange={(e) => setVegOnly(e.target.checked)} />
          Vegetarian only
        </label>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={activeCategory === 'all' ? 'btn-primary' : 'btn-outline'}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={activeCategory === cat.id ? 'btn-primary' : 'btn-outline'}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p>Loading menu...</p>}
      {error && <div className="error-box">{error}</div>}

      {!loading && !error && visibleItems.length === 0 && (
        <p className="py-6 text-mauve-dark">No dishes match your filters. Try clearing the search.</p>
      )}

      <div className="max-w-3xl">
        {categories.map((cat) => {
          const dishes = visibleItems.filter((i) => i.category_id === cat.id);
          if (dishes.length === 0) return null;
          return (
            <section key={cat.id} className="panel mb-6">
              <h2 className="mb-1 text-2xl">{cat.name}</h2>
              <div className="divide-y divide-cream-dark">
                {dishes.map((item) => (
                  <MenuLine key={item.id} item={item}>
                    {renderAction(item)}
                  </MenuLine>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-10 border-t border-plum bg-plum text-cream-light">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <span className="text-sm font-semibold">
              {count} {count === 1 ? 'item' : 'items'} in cart, {rupees(subtotal)}
            </span>
            <Link href="/cart" className="btn-secondary">View cart</Link>
          </div>
        </div>
      )}
    </div>
  );
}
