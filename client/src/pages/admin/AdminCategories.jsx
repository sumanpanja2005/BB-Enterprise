import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import api from '../../api/client';
import './AdminPages.css';

const emptyCategoryForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyCategoryForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () =>
    api.get('/api/categories').then((r) => setCategories(r.data)).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/api/categories', {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description,
        image: form.image,
      });
      setForm(emptyCategoryForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setError('');
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image: category.image || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyCategoryForm);
    setError('');
  };

  const update = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setError('');
    setSaving(true);
    try {
      await api.put(`/api/categories/${editingId}`, {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description,
        image: form.image,
      });
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete category? Products may need reassignment.')) return;
    try {
      await api.delete(`/api/categories/${id}`);
      await load();
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
      <SEO title="Admin — Categories" path="/admin/categories" />
      <div className="admin-page">
        <h1>Categories</h1>
        {error && <p className="form-error">{error}</p>}
        <form className="card admin-form admin-categories-form" onSubmit={editingId ? update : create}>
          <h2>{editingId ? 'Edit category' : 'New category'}</h2>
          <div className="form-group">
            <label>Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="New category"
            />
          </div>
          <div className="form-group">
            <label>Slug (free write)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="leave empty to auto-generate"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Image link</label>
            <input
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://..."
            />
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
            {editingId && (
              <button type="button" className="btn btn-outline" onClick={cancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.description || '—'}</td>
                  <td className="admin-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => startEdit(c)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => remove(c._id)}>
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
