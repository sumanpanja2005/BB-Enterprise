import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/client';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO title="Set new password" path="/reset-password" />
      <div className="auth-page section">
        <div className="auth-card card">
          <h1>New password</h1>
          {error && <p className="form-error">{error}</p>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Saving…' : 'Update password'}
            </button>
          </form>
          <p className="auth-footer">
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
