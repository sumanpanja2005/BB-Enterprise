import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, path = '' }) {
  const site = 'BB Enterprise';
  const fullTitle = title ? `${title} | ${site}` : `${site} — Cosmetics & Beauty`;
  const desc =
    description ||
    'Discover premium skincare, makeup, and fragrance at BB Enterprise.';
  const origin =
    typeof window !== 'undefined' ? window.location.origin : '';
  const url = path ? `${origin}${path}` : origin;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
