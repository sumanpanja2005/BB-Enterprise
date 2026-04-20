import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import api from '../../api/client';
import './AdminPages.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    api.get('/api/categories').then((r) => setCategories(r.data)).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/categories', { name, description });
      setName('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create');
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
        <form className="card admin-form admin-inline-form" onSubmit={create}>
          <div className="form-group">
            <label>Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New category"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add
          </button>
        </form>
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>
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
