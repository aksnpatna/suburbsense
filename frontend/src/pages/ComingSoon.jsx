import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';

export function ComingSoon() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const service = searchParams.get('service') || 'this service';

  return (
    <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Helmet>
        <title>Coming Soon | SuburbSense</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      
      <div className="card" style={{ maxWidth: '600px', textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚀</div>
        <h1 style={{ marginBottom: '1rem' }}>Coming Soon</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          We are currently integrating with trusted partners to bring you the best deals for {service}. 
          Our comparison tools are undergoing final testing and will be available very soon.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">Back to Search</Link>
          <button className="btn btn-secondary" onClick={() => window.history.back()}>Go Back</button>
        </div>
      </div>
    </div>
  );
}
