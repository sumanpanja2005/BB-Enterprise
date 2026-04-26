import { useEffect, useState } from 'react';
import SEO from '../../components/SEO';
import api from '../../api/client';
import { formatINR } from '../../utils/currency';
import './AdminPages.css';

const statuses = ['paid', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/api/orders/all').then((r) => setOrders(r.data)).catch(console.error);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setError('');
    try {
      await api.put(`/api/orders/${id}/status`, { status });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
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
      <SEO title="Admin — Orders" path="/admin/orders" />
      <div className="admin-page">
        <h1>Orders</h1>
        {error && <p className="form-error">{error}</p>}
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <span>#{o._id.slice(-8)}</span>
                  </td>
                  <td>{o.user?.email || o.user?.name}</td>
                  <td>{formatINR(o.totalPrice)}</td>
                  <td>{o.status}</td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className="admin-select"
                    >
                      {['pending_payment', ...statuses].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
