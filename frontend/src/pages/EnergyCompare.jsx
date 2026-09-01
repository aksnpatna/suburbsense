import { Helmet } from 'react-helmet-async';
import { AFFILIATE_CONFIG } from '../config/affiliates';

export function EnergyCompare() {
  const energyPartners = AFFILIATE_CONFIG.energy.topPicks;

  return (
    <div className="calculator-page fade-in">
      <Helmet>
        <title>Compare Energy Plans | SuburbSense</title>
        <meta name="description" content="Compare top electricity and gas providers in Australia. Find greener plans and cheaper rates." />
        <link rel="canonical" href="https://suburbsense.com/energy/compare" />
      </Helmet>

      <div className="calc-header" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡️</div>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Compare Energy Plans</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          Whether you're moving house or just looking for a better deal, compare electricity and gas providers to lower your bills.
        </p>
      </div>

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Top Energy Providers</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {energyPartners.map(partner => (
            <div key={partner.id} className="card" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--surface-color)' }}>
              <div style={{ fontSize: '2.5rem', background: 'var(--surface-alt)', padding: '1rem', borderRadius: '12px' }}>
                {partner.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0 }}>{partner.name}</h3>
                  <span style={{ fontSize: '0.75rem', background: 'var(--primary-color)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>
                    {partner.tag}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>{partner.description}</p>
              </div>
              <div>
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                  View Plans
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="card glass-panel" style={{ marginTop: '3rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Why compare energy?</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📉</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Lower Bills</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Default market offers change yearly. Shopping around ensures you get the best standing offer discount.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>☀️</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Solar Feed-in</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>If you have solar panels, comparing feed-in tariffs (FiT) can dramatically reduce your net costs.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🌱</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Green Energy</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Opt for providers that offer 100% GreenPower or carbon-neutral offsets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
