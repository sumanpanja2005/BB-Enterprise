import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import api from '../../api/client';
import { formatINR } from '../../utils/currency';
import './AdminPages.css';

const emptyForm = {
  name: '',
  description: '',
  shortDescription: '',
  price: '',
  compareAtPrice: '',
  category: '',
  stock: '',
  sku: '',
  featured: false,
  isActive: true,
  images: '',
  categoryInput: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      api.get('/api/admin/products'),
      api.get('/api/categories'),
    ])
      .then(([p, c]) => {
        setProducts(p.data);
        setCategories(c.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing('new');
    setForm(emptyForm);
    setError('');
  };

  const openEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name,
      description: p.description,
      shortDescription: p.shortDescription || '',
      price: String(p.price),
      compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : '',
      category: p.category?._id || p.category,
      categoryInput: p.category?.name || '',
      stock: String(p.stock),
      sku: p.sku || '',
      featured: !!p.featured,
      isActive: p.isActive !== false,
      images: (p.images || []).join(', '),
    });
    setError('');
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const categoryRaw = form.categoryInput.trim();
      let categoryId = form.category;

      if (!categoryRaw) {
        throw new Error('Category is required');
      }

      const exactCategory = categories.find(
        (c) =>
          c._id === categoryRaw ||
          c.name.toLowerCase() === categoryRaw.toLowerCase() ||
          c.slug.toLowerCase() === categoryRaw.toLowerCase()
      );

      if (exactCategory) {
        categoryId = exactCategory._id;
      } else {
        const { data: createdCategory } = await api.post('/api/categories', { name: categoryRaw });
        categoryId = createdCategory._id;
      }

      const payload = {
        name: form.name,
        description: form.description,
        shortDescription: form.shortDescription,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        category: categoryId,
        stock: Number(form.stock),
        sku: form.sku,
        featured: form.featured,
        isActive: form.isActive,
        images: form.images
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      if (editing === 'new') {
        await api.post('/api/products', payload);
      } else {
        await api.put(`/api/products/${editing}`, payload);
      }
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/api/products/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Admin — Products" path="/admin/products" />
      <div className="admin-page">
        <div className="admin-page-head">
          <h1>Products</h1>
          <button type="button" className="btn btn-primary" onClick={openNew}>
            Add product
          </button>
        </div>

        {editing && (
          <form className="card admin-form" onSubmit={save}>
            <h2>{editing === 'new' ? 'New product' : 'Edit product'}</h2>
            {error && <p className="form-error">{error}</p>}
            <div className="form-group">
              <label>Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Short description</label>
              <input
                value={form.shortDescription}
                onChange={(e) =>
                  setForm((f) => ({ ...f, shortDescription: e.target.value }))
                }
              />
            </div>
            <div className="admin-form-row">
              <div className="form-group">
                <label>Price</label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Compare at</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, compareAtPrice: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="admin-form-row">
              <div className="form-group">
                <label>Category</label>
                <input
                  required
                  list="category-options"
                  value={form.categoryInput}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categoryInput: e.target.value, category: '' }))
                  }
                  placeholder="Choose or type category name"
                />
                <datalist id="category-options">
                  {categories.map((c) => (
                    <option key={c._id} value={c.name} />
                  ))}
                </datalist>
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  required
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Image URLs (comma-separated links)</label>
              <input
                value={form.images}
                onChange={(e) => setForm((f) => ({ ...f, images: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
              />
              Featured
            </label>
            <label className="admin-check">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
              />
              Active
            </label>
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{formatINR(p.price)}</td>
                  <td>{p.stock}</td>
                  <td>{p.isActive ? 'Active' : 'Hidden'}</td>
                  <td className="admin-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => openEdit(p)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => remove(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
