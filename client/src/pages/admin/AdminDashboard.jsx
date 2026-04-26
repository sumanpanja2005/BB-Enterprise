import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import api from '../../api/client';
import { formatINR } from '../../utils/currency';
import './AdminPages.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );
  }

  const c = data?.counts || {};

  return (
    <>
      <SEO title="Admin dashboard" path="/admin" />
      <div className="admin-page">
        <h1>Dashboard</h1>
        <p className="admin-lead">Overview of your store performance.</p>
        <div className="admin-stats">
          <div className="card admin-stat">
            <span className="admin-stat-label">Users</span>
            <strong className="admin-stat-value">{c.users ?? 0}</strong>
          </div>
          <div className="card admin-stat">
            <span className="admin-stat-label">Orders</span>
            <strong className="admin-stat-value">{c.orders ?? 0}</strong>
          </div>
          <div className="card admin-stat">
            <span className="admin-stat-label">Products</span>
            <strong className="admin-stat-value">{c.products ?? 0}</strong>
          </div>
          <div className="card admin-stat">
            <span className="admin-stat-label">Revenue</span>
            <strong className="admin-stat-value">{formatINR(c.revenue ?? 0)}</strong>
          </div>
        </div>
        <h2 className="admin-h2">Recent orders</h2>
        <div className="card admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders || []).map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link to={`/admin/orders`}>#{o._id.slice(-8)}</Link>
                  </td>
                  <td>{o.user?.email || '—'}</td>
                  <td>{formatINR(o.totalPrice)}</td>
                  <td>{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
