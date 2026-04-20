import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="Page not found" />
      <div className="section">
        <div className="container empty-state">
          <h1>404</h1>
          <p>We could not find that page.</p>
          <Link to="/" className="btn btn-primary">
            Go home
          </Link>
        </div>
      </div>
    </>
  );
}
