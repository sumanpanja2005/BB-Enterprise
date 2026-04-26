import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import './Dashboard.css';

export default function Dashboard() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zip: user?.address?.zip || '',
    country: user?.address?.country || '',
  });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      street: user.address?.street || '',
      city: user.address?.city || '',
      state: user.address?.state || '',
      zip: user.address?.zip || '',
      country: user.address?.country || '',
    });
  }, [user]);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await api.put('/api/users/profile', {
        name: form.name,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: form.country,
        },
      });
      setMsg('Profile saved.');
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="My account" path="/dashboard" />
      <div className="section dash-page">
        <div className="container dash-grid">
          <aside className="dash-nav card">
            <h2>Account</h2>
            <nav>
              <Link to="/dashboard" className="active">
                Profile
              </Link>
              <Link to="/wishlist">Wishlist</Link>
            </nav>
          </aside>
          <div className="dash-main card">
            <h1>Profile</h1>
            {error && <p className="form-error">{error}</p>}
            {msg && <p className="dash-msg">{msg}</p>}
            <form onSubmit={submit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <h3 className="dash-sub">Address</h3>
              <div className="form-group">
                <label htmlFor="street">Street</label>
                <input
                  id="street"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                />
              </div>
              <div className="dash-row">
                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State</label>
                  <input
                    id="state"
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="zip">ZIP</label>
                  <input
                    id="zip"
                    name="zip"
                    value={form.zip}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="country">Country</label>
                <input
                  id="country"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
