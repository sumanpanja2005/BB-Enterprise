import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import './Wishlist.css';

export default function Wishlist() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    api
      .get('/api/users/wishlist')
      .then((r) => setItems(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) reload();
    else setLoading(false);
  }, [user]);

  if (!user) {
    return (
      <div className="container section">
        <p>
          <Link to="/login?redirect=/wishlist">Sign in</Link> to view your wishlist.
        </p>
      </div>
    );
  }

  return (
    <>
      <SEO title="Wishlist" path="/wishlist" />
      <div className="section wishlist-page">
        <div className="container">
          <h1>Wishlist</h1>
          {loading ? (
            <div className="loader-wrap">
              <div className="loader" />
            </div>
          ) : items.length === 0 ? (
            <div className="empty-state card">
              <p>Your wishlist is empty.</p>
              <Link to="/shop" className="btn btn-primary">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid-products">
              {items.map((p) => (
                <ProductCard key={p._id} product={p} onWishlistToggle={reload} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
