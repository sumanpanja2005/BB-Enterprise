import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <header className="nav-header">
      <div className="nav-inner container">
        <Link to="/" className="nav-brand">
          <span className="nav-brand-mark">BB</span>
          <span className="nav-brand-text">Cosmetics Studio</span>
        </Link>

        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/shop">Shop</NavLink>
          {user && (
            <NavLink to="/wishlist">Wishlist</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin">Admin</NavLink>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="nav-user">
              <Link to="/dashboard" className="btn btn-ghost nav-dash">
                {user.name?.split(' ')[0]}
              </Link>
              <button type="button" className="btn btn-outline nav-logout" onClick={logout}>
                Log out
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
