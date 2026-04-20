import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const { user, refreshUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/api/products/${slug}`);
        if (!cancelled) {
          setProduct(data);
          const rev = await api.get(`/api/reviews/product/${data._id}`);
          if (!cancelled) setReviews(rev.data);
        }
      } catch (e) {
        if (!cancelled) setError('Product not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const inWishlist =
    user?.wishlist?.some((w) => String(w._id || w) === String(product?._id)) ||
    false;

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setReviewMsg('');
    try {
      await api.post('/api/reviews', {
        product: product._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewForm({ rating: 5, comment: '' });
      const rev = await api.get(`/api/reviews/product/${product._id}`);
      setReviews(rev.data);
      const { data } = await api.get(`/api/products/${slug}`);
      setProduct(data);
    } catch (err) {
      setReviewMsg(err.response?.data?.message || 'Could not submit review');
    }
  };

  const toggleWishlist = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    try {
      if (inWishlist) {
        await api.delete(`/api/users/wishlist/${product._id}`);
      } else {
        await api.post(`/api/users/wishlist/${product._id}`);
      }
      await refreshUser();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loader-wrap">
        <div className="loader" />
      </div>
    );
  }
  if (error || !product) {
    return (
      <div className="container section">
        <p>{error || 'Not found'}</p>
        <Link to="/shop">Back to shop</Link>
      </div>
    );
  }

  const img = product.images?.[0];

  return (
    <>
      <SEO
        title={product.name}
        description={product.shortDescription || product.description?.slice(0, 160)}
        path={`/product/${product.slug}`}
      />
      <div className="section product-detail">
        <div className="container product-detail-grid">
          <div className="product-detail-gallery card">
            {img ? (
              <img src={img} alt={product.name} className="product-detail-img" />
            ) : (
              <div className="product-detail-placeholder" />
            )}
          </div>
          <div>
            <p className="product-detail-cat">
              <Link to={`/shop?category=${product.category?._id}`}>
                {product.category?.name}
              </Link>
            </p>
            <h1>{product.name}</h1>
            <div className="product-detail-price-row">
              <span className="product-detail-price">${product.price.toFixed(2)}</span>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="product-detail-compare">
                  ${product.compareAtPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.rating > 0 && (
              <p className="product-detail-rating">
                ★ {product.rating.toFixed(1)} ({product.numReviews} reviews)
              </p>
            )}
            <div
              className="product-detail-desc"
              dangerouslySetInnerHTML={{
                __html: product.description.replace(/\n/g, '<br/>'),
              }}
            />
            <p className="product-detail-stock">
              {product.stock > 0 ? (
                <span className="badge">{product.stock} in stock</span>
              ) : (
                <span className="badge" style={{ background: '#fee', color: '#b42318' }}>
                  Out of stock
                </span>
              )}
            </p>
            <div className="product-detail-buy">
              <div className="qty-control">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() =>
                    setQty((q) => Math.min(product.stock || 1, q + 1))
                  }
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                disabled={product.stock <= 0}
                onClick={() => addItem(product, qty)}
              >
                Add to bag
              </button>
              <button
                type="button"
                className={`btn btn-outline ${inWishlist ? 'active' : ''}`}
                onClick={toggleWishlist}
              >
                {inWishlist ? '♥ Saved' : '♡ Wishlist'}
              </button>
            </div>
          </div>
        </div>

        <div className="container product-reviews">
          <h2>Reviews</h2>
          {user && (
            <form className="review-form card" onSubmit={submitReview}>
              <h3>Write a review</h3>
              {reviewMsg && <p className="form-error">{reviewMsg}</p>}
              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <select
                  id="rating"
                  value={reviewForm.rating}
                  onChange={(e) =>
                    setReviewForm((f) => ({
                      ...f,
                      rating: Number(e.target.value),
                    }))
                  }
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="comment">Comment</label>
                <textarea
                  id="comment"
                  rows={3}
                  required
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((f) => ({ ...f, comment: e.target.value }))
                  }
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Submit review
              </button>
            </form>
          )}
          {!user && (
            <p>
              <Link to="/login">Sign in</Link> to leave a review.
            </p>
          )}
          <ul className="review-list">
            {reviews.length === 0 && <li className="empty-state">No reviews yet.</li>}
            {reviews.map((r) => (
              <li key={r._id} className="review-item card">
                <div className="review-head">
                  <strong>{r.user?.name || 'Customer'}</strong>
                  <span className="review-stars">{'★'.repeat(r.rating)}</span>
                </div>
                <p className="review-comment">{r.comment}</p>
                <time className="review-date">
                  {new Date(r.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
