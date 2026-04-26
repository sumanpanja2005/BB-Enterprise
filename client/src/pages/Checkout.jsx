import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatINR } from '../utils/currency';
import './Checkout.css';

const emptyAddr = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States',
};

export default function Checkout() {
  const { items, subtotal } = useCart();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const cancelled = searchParams.get('cancelled');

  const shipping = subtotal >= 50 ? 0 : 7.99;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = subtotal + shipping + tax;

  const [addr, setAddr] = useState(emptyAddr);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="container section">
        <p>
          Please <Link to="/login?redirect=/checkout">sign in</Link> to checkout.
        </p>
      </div>
    );
  }

  const handleChange = (e) => {
    setAddr((a) => ({ ...a, [e.target.name]: e.target.value }));
  };

  const payStripe = async (e) => {
    e.preventDefault();
    setError('');
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }
    setLoading(true);
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
      }));
      const { data } = await api.post('/api/payments/create-checkout-session', {
        orderItems,
        shippingAddress: addr,
        taxPrice: tax,
        shippingPrice: shipping,
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not start payment.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Payment could not start. Configure Stripe keys on the server.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Checkout" path="/checkout" />
      <div className="section checkout-page">
        <div className="container checkout-grid">
          <div>
            <h1>Checkout</h1>
            {cancelled && (
              <p className="checkout-notice">Payment was cancelled. Try again when ready.</p>
            )}
            <form className="checkout-form card" onSubmit={payStripe}>
              <h2>Shipping</h2>
              {error && <p className="form-error">{error}</p>}
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  required
                  value={addr.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={addr.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="street">Address</label>
                <input
                  id="street"
                  name="street"
                  required
                  value={addr.street}
                  onChange={handleChange}
                />
              </div>
              <div className="checkout-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    required
                    value={addr.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    required
                    value={addr.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zip">ZIP</label>
                  <input
                    id="zip"
                    name="zip"
                    required
                    value={addr.zip}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  value={addr.country}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading || !items.length}>
                {loading ? 'Redirecting…' : 'Pay with Stripe'}
              </button>
              <p className="checkout-hint">
                Secure payment via Stripe. Test card: 4242 4242 4242 4242.
              </p>
            </form>
          </div>
          <aside className="checkout-summary card">
            <h2>Summary</h2>
            {items.length === 0 ? (
              <p className="empty-state">Cart is empty.</p>
            ) : (
              <ul className="checkout-lines">
                {items.map((i) => (
                  <li key={i.productId}>
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <span>{formatINR(i.price * i.qty)}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="cart-row">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="cart-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
            </div>
            <div className="cart-row">
              <span>Tax</span>
              <span>{formatINR(tax)}</span>
            </div>
            <div className="cart-row cart-total">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <Link to="/cart" className="btn btn-outline checkout-back">
              Back to bag
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
