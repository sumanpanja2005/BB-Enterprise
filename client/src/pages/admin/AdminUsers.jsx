import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import api from '../../api/client';
import './AdminPages.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/api/admin/users').then((r) => setUsers(r.data)).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const setRole = async (id, role) => {
    setError('');
    try {
      await api.put(`/api/admin/users/${id}/role`, { role });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
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
      <SEO title="Admin — Users" path="/admin/users" />
      <div className="admin-page">
        <h1>Users</h1>
        {error && <p className="form-error">{error}</p>}
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      onChange={(e) => setRole(u._id, e.target.value)}
                      className="admin-select"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost" onClick={() => remove(u._id)}>
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
