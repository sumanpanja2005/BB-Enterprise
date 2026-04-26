import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import ProductCard from "../components/ProductCard";
import SEO from "../components/SEO";
import "./Home.css";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [featRes, catRes] = await Promise.all([
          api.get("/api/products/featured"),
          api.get("/api/categories"),
        ]);
        if (!cancelled) {
          setFeatured(featRes.data);
          setCategories(catRes.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <SEO
        title="Home"
        description="BB Enterprise — discover products, check stock, and read trusted beauty reviews."
        path="/"
      />
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="hero-eyebrow">Colorful beauty showcase</p>
            <h1 className="hero-title">Find your next favorite cosmetic</h1>
            <p className="hero-desc">
              Explore our cosmetics collection with real customer reviews,
              product details, and up-to-date stock to help you choose
              confidently.
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary">
                Explore products
              </Link>
              <Link to="/shop?featured=true" className="btn btn-outline">
                Top picks
              </Link>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="hero-blob" />
          </div>
        </div>
      </section>

      <section className="section categories-strip">
        <div className="container">
          <h2 className="section-title">Browse by category</h2>
          <div className="categories-grid">
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c._id}
                to={`/shop?category=${c._id}`}
                className="category-card card"
              >
                <div className="category-card-inner">
                  <span className="category-name">{c.name}</span>
                  <span className="category-arrow">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Featured products and reviews</h2>
            <Link to="/shop" className="section-link">
              View all
            </Link>
          </div>
          {loading ? (
            <div className="loader-wrap">
              <div className="loader" />
            </div>
          ) : (
            <div className="grid-products">
              {featured.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section locations-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Our cosmetic shop locations</h2>
          </div>
          <p className="locations-sub">
            Visit us in-store for shade matching, skin care advice, and product
            testing.
          </p>
          <div className="locations-grid">
            <article className="location-card card">
              <h3>BB Downtown Beauty Lounge</h3>
              <p>21 Rose Avenue, Central Market, City Center</p>
              <span>Open: 10:00 AM - 8:00 PM</span>
            </article>
            <article className="location-card card">
              <h3>BB Glow Mall Studio</h3>
              <p>2nd Floor, Sunlight Mall, River Road</p>
              <span>Open: 9:30 AM - 9:00 PM</span>
            </article>
            <article className="location-card card">
              <h3>BB Skin & Color Hub</h3>
              <p>88 Blossom Street, Near Metro Station</p>
              <span>Open: 11:00 AM - 7:30 PM</span>
            </article>
          </div>
        </div>
      </section>

      <section className="offer-banner">
        <div className="container offer-inner">
          <div>
            <h2 className="offer-title">Fresh arrivals every week</h2>
            <p className="offer-text">
              Follow our latest drops, review highlights, and in-stock
              favorites.
            </p>
          </div>
          <Link to="/shop?sort=rating&order=desc" className="btn btn-primary">
            See top rated
          </Link>
        </div>
      </section>
    </>
  );
}
