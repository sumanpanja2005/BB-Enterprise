import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { formatINR } from '../utils/currency';
import './ProductCard.css';

export default function ProductCard({ product, onWishlistToggle }) {
  const { user, refreshUser } = useAuth();
  const img = product.images?.[0];
  const inWishlist = user?.wishlist?.some(
    (w) => String(w._id || w) === String(product._id)
  );

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      window.location.href = '/login?redirect=/shop';
      return;
    }
    try {
      if (inWishlist) {
        await api.delete(`/api/users/wishlist/${product._id}`);
      } else {
        await api.post(`/api/users/wishlist/${product._id}`);
      }
      await refreshUser();
      onWishlistToggle?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <article className="product-card card">
      <Link to={`/product/${product.slug}`} className="product-card-link">
        <div className="product-card-image-wrap">
          {product.featured && <span className="product-card-badge badge">Featured</span>}
          {img ? (
            <img src={img} alt="" className="product-card-image" loading="lazy" />
          ) : (
            <div className="product-card-placeholder" />
          )}
        </div>
        <div className="product-card-body">
          <p className="product-card-cat">
            {product.category?.name || 'Beauty'}
          </p>
          <h3 className="product-card-title">{product.name}</h3>
          <div className="product-card-meta">
            <span className="product-card-price">{formatINR(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="product-card-compare">
                {formatINR(product.compareAtPrice)}
              </span>
            )}
            {product.rating > 0 && (
              <span className="product-card-rating" title="Average rating">
                ★ {product.rating.toFixed(1)}
              </span>
            )}
          </div>
          <p className={`product-card-stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>
          <p className="product-card-reviews">
            {product.numReviews > 0 ? `${product.numReviews} reviews` : 'No reviews yet'}
          </p>
        </div>
      </Link>
      <div className="product-card-actions">
        <Link to={`/product/${product.slug}`} className="btn btn-primary product-card-view">
          View Product
        </Link>
        <button
          type="button"
          className={`btn btn-outline product-card-heart ${inWishlist ? 'active' : ''}`}
          onClick={handleWishlist}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          ♥
        </button>
      </div>
    </article>
  );
}
