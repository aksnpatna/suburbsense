import { Helmet } from 'react-helmet-async';
import { AFFILIATE_CONFIG } from '../config/affiliates';

export function Removalists() {
  const movingPartner = AFFILIATE_CONFIG.moving;

  return (
    <div className="calculator-page fade-in">
      <Helmet>
        <title>Compare Removalists | SuburbSense</title>
        <meta name="description" content="Compare trusted local and interstate removalists to make your next move stress-free." />
        <link rel="canonical" href="https://suburbsense.com/removalists" />
      </Helmet>

      <div className="calc-header" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Find Trusted Removalists</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Whether you're moving down the street or across the country, connect with vetted movers to get your belongings safely to your new home.
        </p>
      </div>

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Top Rated Removalist Network</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <div className="card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--surface-color)' }}>
            <div style={{ fontSize: '2.5rem', background: 'var(--surface-alt)', padding: '1rem', borderRadius: '12px' }}>
              🚚
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>{movingPartner.partnerName}</h3>
                <span style={{ fontSize: '0.75rem', background: 'var(--primary-color)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
                  Recommended
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{movingPartner.description}</p>
            </div>
            <div>
              <a href={movingPartner.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                {movingPartner.ctaText}
              </a>
            </div>
          </div>

        </div>

        <div className="card glass-panel" style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Moving Tips</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📅</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Book Early</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Quality removalists book out weeks in advance, especially at the end of the month.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🛡️</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Check Insurance</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Ensure your chosen removalist offers transit insurance for peace of mind.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📝</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Detailed Inventory</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Provide an accurate list of large items so the movers bring the right sized truck.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
