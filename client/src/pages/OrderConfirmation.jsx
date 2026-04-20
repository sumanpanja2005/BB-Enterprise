import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/client';
import { useCart } from '../context/CartContext';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clear } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clear();
  }, [clear]);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/api/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <SEO title="Order confirmed" path={`/order-confirmation/${id}`} />
      <div className="section confirm-page">
        <div className="container confirm-inner card">
          {loading ? (
            <div className="loader-wrap">
              <div className="loader" />
            </div>
          ) : (
            <>
              <h1>Thank you!</h1>
              <p className="confirm-lead">
                Your order was received. You will get an email confirmation when payment is
                processed.
              </p>
              {sessionId && (
                <p className="confirm-meta">
                  Stripe session: <code>{sessionId.slice(0, 24)}…</code>
                </p>
              )}
              {order && (
                <p className="confirm-total">
                  Order total: <strong>${order.totalPrice?.toFixed(2)}</strong>
                </p>
              )}
              <div className="confirm-actions">
                <Link to="/shop" className="btn btn-primary">
                  Continue shopping
                </Link>
                <Link to="/orders" className="btn btn-outline">
                  View orders
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
