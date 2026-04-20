import { useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/client';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await api.post('/api/auth/forgot-password', { email });
      setMsg('If an account exists, check your email for reset instructions.');
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Forgot password" path="/forgot-password" />
      <div className="auth-page section">
        <div className="auth-card card">
          <h1>Reset password</h1>
          <p className="auth-lead">Enter your email and we will send a reset link.</p>
          {error && <p className="form-error">{error}</p>}
          {msg && <p className="auth-success">{msg}</p>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send link'}
            </button>
          </form>
          <p className="auth-footer">
            <Link to="/login">Back to sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
