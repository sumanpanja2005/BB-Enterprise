import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">BB Enterprise</div>
          <p className="footer-tagline">
            A colorful product-and-reviews space for beauty lovers.
          </p>
        </div>
        <div>
          <h4 className="footer-heading">Products</h4>
          <ul className="footer-list">
            <li>
              <Link to="/shop">All products</Link>
            </li>
            <li>
              <Link to="/shop?featured=true">Featured picks</Link>
            </li>
            <li>
              <Link to="/shop?sort=rating&order=desc">Top rated</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="footer-heading">Visit Us</h4>
          <ul className="footer-list">
            <li>
              <Link to="/#">City Center Store</Link>
            </li>
            <li>
              <Link to="/#">Sunlight Mall Store</Link>
            </li>
            <li>
              <Link to="/#">Blossom Street Store</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-copy">
          © {new Date().getFullYear()} BB Enterprise. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
