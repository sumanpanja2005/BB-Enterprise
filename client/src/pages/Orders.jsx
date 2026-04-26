import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/client';
import { formatINR } from '../utils/currency';
import './Orders.css';

const statusLabels = {
  pending_payment: 'Pending payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/api/orders/my')
      .then((r) => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <SEO title="Orders" path="/orders" />
      <div className="section orders-page">
        <div className="container">
          <h1>Order history</h1>
          {loading ? (
            <div className="loader-wrap">
              <div className="loader" />
            </div>
          ) : orders.length === 0 ? (
            <div className="empty-state card">
              <p>No orders yet.</p>
              <Link to="/shop" className="btn btn-primary">
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="orders-list">
              {orders.map((o) => (
                <li key={o._id} className="orders-item card">
                  <div>
                    <strong>Order #{o._id.slice(-8)}</strong>
                    <p className="orders-meta">
                      {new Date(o.createdAt).toLocaleString()} ·{' '}
                      {statusLabels[o.status] || o.status}
                    </p>
                  </div>
                  <div className="orders-right">
                    <span className="orders-total">{formatINR(o.totalPrice)}</span>
                    <Link to={`/orders/${o._id}`} className="btn btn-outline">
                      Details
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
