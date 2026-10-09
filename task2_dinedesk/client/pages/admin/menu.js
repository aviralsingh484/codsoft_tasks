import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { rupees } from '../../lib/format';
import RequireAuth from '../../components/RequireAuth';
import AdminNav from '../../components/AdminNav';
import VegDot from '../../components/VegDot';

const emptyForm = { name: '', description: '', price: '', categoryId: '', isVeg: true, isAvailable: true };

function MenuManager() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadMenu() {
    try {
      const data = await api('/menu');
      setCategories(data.categories);
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);

  function update(field) {
    return (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setForm({ ...form, [field]: value });
    };
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description || '',
      price: item.price,
      categoryId: item.category_id || '',
      isVeg: item.is_veg,
      isAvailable: item.is_available,
    });
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const body = { ...form, price: Number(form.price), categoryId: Number(form.categoryId) };
      if (editingId) {
        await api(`/menu/${editingId}`, { method: 'PUT', token, body });
        setMessage('Dish updated');
      } else {
        await api('/menu', { method: 'POST', token, body });
        setMessage('Dish added to the menu');
      }
      resetForm();
      loadMenu();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleAvailability(item) {
    try {
      await api(`/menu/${item.id}/availability`, {
        method: 'PATCH',
        token,
        body: { isAvailable: !item.is_available },
      });
      loadMenu();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}" from the menu?`)) return;
    try {
      await api(`/menu/${item.id}`, { method: 'DELETE', token });
      loadMenu();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-3xl">Admin</h1>
      <AdminNav />

      <form onSubmit={handleSubmit} className="panel mb-8 grid gap-4 md:grid-cols-2">
        <h2 className="text-xl md:col-span-2">{editingId ? 'Edit dish' : 'Add a new dish'}</h2>

        <div>
          <label htmlFor="name">Dish name</label>
          <input id="name" required value={form.name} onChange={update('name')} />
        </div>
        <div>
          <label htmlFor="category">Category</label>
          <select id="category" required value={form.categoryId} onChange={update('categoryId')}>
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="price">Price (₹)</label>
          <input id="price" type="number" min="1" step="1" required value={form.price} onChange={update('price')} />
        </div>
        <div className="flex items-end gap-6 pb-2">
          <label className="mb-0 flex items-center gap-2 font-normal">
            <input type="checkbox" checked={form.isVeg} onChange={update('isVeg')} /> Vegetarian
          </label>
          <label className="mb-0 flex items-center gap-2 font-normal">
            <input type="checkbox" checked={form.isAvailable} onChange={update('isAvailable')} /> Available
          </label>
        </div>
        <div className="md:col-span-2">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={2} value={form.description} onChange={update('description')} />
        </div>

        {error && <div className="error-box md:col-span-2">{error}</div>}
        {message && <div className="success-box md:col-span-2">{message}</div>}

        <div className="flex gap-3 md:col-span-2">
          <button type="submit" className="btn-primary">{editingId ? 'Save changes' : 'Add dish'}</button>
          {editingId && <button type="button" onClick={resetForm} className="btn-outline">Cancel edit</button>}
        </div>
      </form>

      <div className="overflow-x-auto rounded-md border border-cream-dark bg-cream-light">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-cream-dark bg-cream-dark/50">
            <tr>
              <th className="px-3 py-2">Dish</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-dark">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2"><VegDot veg={item.is_veg} />{item.name}</span>
                </td>
                <td className="px-3 py-2">{item.category_name || 'None'}</td>
                <td className="px-3 py-2">{rupees(item.price)}</td>
                <td className="px-3 py-2">
                  <button onClick={() => toggleAvailability(item)} className={`underline ${item.is_available ? 'text-green-800' : 'text-red-800'}`}>
                    {item.is_available ? 'Available' : 'Sold out'}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <div className="flex gap-3">
                    <button onClick={() => startEdit(item)} className="font-semibold underline">Edit</button>
                    <button onClick={() => handleDelete(item)} className="text-red-800 underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminMenuPage() {
  return (
    <RequireAuth roles={['admin']}>
      <MenuManager />
    </RequireAuth>
  );
}
