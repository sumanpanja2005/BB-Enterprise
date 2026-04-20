import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import ProductCard from '../components/ProductCard';
import SEO from '../components/SEO';
import './Shop.css';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ products: [], pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page')) || 1;
  const keyword = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'desc';
  const featured = searchParams.get('featured') === 'true';

  useEffect(() => {
    api.get('/api/categories').then((r) => setCategories(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '12');
        params.set('sort', sort);
        params.set('order', order);
        if (keyword) params.set('keyword', keyword);
        if (category) params.set('category', category);
        if (featured) params.set('featured', 'true');

        const prodRes = await api.get(`/api/products?${params.toString()}`);
        if (!cancelled) setData(prodRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, keyword, category, sort, order, featured]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === '' || value == null) next.delete(key);
    else next.set(key, value);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <>
      <SEO title="Products" path="/shop" />
      <div className="shop-page section">
        <div className="container">
          <h1 className="shop-title">Product showcase</h1>
          <p className="shop-sub">
            Search, filter, and explore product details, ratings, and stock availability.
          </p>

          <div className="shop-toolbar card">
            <div className="form-group shop-search">
              <label htmlFor="shop-q">Search</label>
              <input
                id="shop-q"
                type="search"
                placeholder="Serum, lipstick…"
                defaultValue={keyword}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateParam('q', e.target.value.trim());
                  }
                }}
              />
            </div>
            <div className="form-group">
              <label htmlFor="shop-cat">Category</label>
              <select
                id="shop-cat"
                value={category}
                onChange={(e) => updateParam('category', e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="shop-sort">Sort by</label>
              <select
                id="shop-sort"
                value={`${sort}-${order}`}
                onChange={(e) => {
                  const [s, o] = e.target.value.split('-');
                  const next = new URLSearchParams(searchParams);
                  next.set('sort', s);
                  next.set('order', o);
                  next.set('page', '1');
                  setSearchParams(next);
                }}
              >
                <option value="createdAt-desc">Newest</option>
                <option value="createdAt-asc">Oldest</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating-desc">Top rated</option>
                <option value="name-asc">Name A–Z</option>
              </select>
            </div>
            <div className="shop-featured">
              <label>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => updateParam('featured', e.target.checked ? 'true' : '')}
                />
                Featured only
              </label>
            </div>
          </div>

          {loading ? (
            <div className="loader-wrap">
              <div className="loader" />
            </div>
          ) : data.products.length === 0 ? (
            <div className="empty-state">No products match your filters.</div>
          ) : (
            <>
              <div className="grid-products">
                {data.products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <div className="shop-pagination">
                {page > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(page - 1));
                      setSearchParams(next);
                    }}
                  >
                    Previous
                  </button>
                )}
                <span className="shop-page-info">
                  Page {page} of {data.pages} ({data.total} items)
                </span>
                {page < data.pages && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      const next = new URLSearchParams(searchParams);
                      next.set('page', String(page + 1));
                      setSearchParams(next);
                    }}
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
