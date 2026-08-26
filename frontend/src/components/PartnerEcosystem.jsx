import React from 'react';

export function PartnerEcosystem() {
  return (
    <section className="partner-ecosystem-section reveal-up" style={{ padding: '4rem 0', background: 'var(--surface-color)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2>Trusted SuburbSense Partners</h2>
          <p>We are building an ecosystem of verified professionals to help you take the next step. <br/><strong>Coming Soon in Q4 2026</strong></p>
        </div>

        <div className="partners-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {/* Mortgage Brokers */}
          <div className="partner-card reveal-stagger" style={{
            background: 'var(--surface-alt)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            border: '1px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '3rem', opacity: 0.8 }}>🏦</div>
            <h3 style={{ margin: 0 }}>Mortgage Brokers</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Connect with top-rated brokers who understand the local market and can secure the best rates for this specific suburb.
            </p>
            <span style={{
              marginTop: 'auto',
              padding: '0.4rem 1rem',
              background: 'var(--surface-color)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)'
            }}>Coming Soon</span>
          </div>

          {/* Buyers Agents */}
          <div className="partner-card reveal-stagger" style={{
            background: 'var(--surface-alt)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            border: '1px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '3rem', opacity: 0.8 }}>🤝</div>
            <h3 style={{ margin: 0 }}>Buyers Agents</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Work with local experts who use SuburbSense data to negotiate the best price and find off-market gems.
            </p>
            <span style={{
              marginTop: 'auto',
              padding: '0.4rem 1rem',
              background: 'var(--surface-color)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)'
            }}>Coming Soon</span>
          </div>

          {/* Conveyancers */}
          <div className="partner-card reveal-stagger" style={{
            background: 'var(--surface-alt)',
            borderRadius: '16px',
            padding: '2rem',
            textAlign: 'center',
            border: '1px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{ fontSize: '3rem', opacity: 0.8 }}>📜</div>
            <h3 style={{ margin: 0 }}>Conveyancers</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              Streamline your settlement with trusted legal professionals who specialize in specific state property laws.
            </p>
            <span style={{
              marginTop: 'auto',
              padding: '0.4rem 1rem',
              background: 'var(--surface-color)',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)'
            }}>Coming Soon</span>
          </div>
        </div>

        <div className="partner-cta" style={{
          marginTop: '4rem',
          padding: '2rem',
          background: 'linear-gradient(135deg, var(--brand-blue-light) 0%, var(--surface-color) 100%)',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <h3 style={{ marginTop: 0 }}>Are you a property professional?</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 1.5rem auto' }}>
            We are actively vetting partners to join the SuburbSense ecosystem. Get early access to highly qualified leads driven by data.
          </p>
          <button className="btn btn-primary">Apply to Partner Network</button>
        </div>
      </div>
    </section>
  );
}
