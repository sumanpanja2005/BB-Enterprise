import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/client';
import { formatINR } from '../utils/currency';
import './OrderDetail.css';

const statusLabels = {
  pending_payment: 'Pending payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/api/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );
  }
  if (error || !order) {
    return (
      <div className="container section">
        <p>{error}</p>
        <Link to="/orders">Back to orders</Link>
      </div>
    );
  }

  return (
    <>
      <SEO title={`Order ${order._id}`} path={`/orders/${id}`} />
      <div className="section order-detail-page">
        <div className="container">
          <Link to="/orders" className="order-back">
            ← Orders
          </Link>
          <h1>Order #{order._id.slice(-8)}</h1>
          <p className="order-status">
            Status: <strong>{statusLabels[order.status] || order.status}</strong>
          </p>
          <p className="order-date">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>

          <div className="order-detail-grid">
            <div className="card order-box">
              <h2>Items</h2>
              <ul className="order-lines">
                {order.orderItems.map((item, idx) => (
                  <li key={idx}>
                    <span>{item.name} × {item.qty}</span>
                    <span>{formatINR(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="order-totals">
                <div>
                  <span>Subtotal</span>
                  <span>{formatINR(order.itemsPrice)}</span>
                </div>
                <div>
                  <span>Tax</span>
                  <span>{formatINR(order.taxPrice)}</span>
                </div>
                <div>
                  <span>Shipping</span>
                  <span>{formatINR(order.shippingPrice)}</span>
                </div>
                <div className="order-grand">
                  <span>Total</span>
                  <span>{formatINR(order.totalPrice)}</span>
                </div>
              </div>
            </div>
            <div className="card order-box">
              <h2>Shipping</h2>
              <p className="order-addr">
                {order.shippingAddress?.fullName}
                <br />
                {order.shippingAddress?.street}
                <br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
                {order.shippingAddress?.zip}
                <br />
                {order.shippingAddress?.country}
                <br />
                {order.shippingAddress?.phone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
