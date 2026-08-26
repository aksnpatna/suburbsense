import React from 'react';
import { Helmet } from 'react-helmet-async';

export function PartnersPage() {
  return (
    <div className="partners-page fade-in">
      <Helmet>
        <title>Partner with SuburbSense | Reach Australians Moving Home</title>
        <meta name="description" content="Reach first home buyers, relocating families, and investors when they're deciding where to live. Partner with SuburbSense." />
        <link rel="canonical" href="https://suburbsense.com.au/partners" />
      </Helmet>

      {/* Hero Section */}
      <section className="hero partners-hero" style={{ padding: '6rem 1rem', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
        <div className="container">
          <div className="hero-badge" style={{ marginBottom: '1rem' }}>For Businesses</div>
          <h1 className="hero-title" style={{ maxWidth: '800px', margin: '0 auto' }}>
            Reach Australians when they're <span style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>deciding where to live.</span>
          </h1>
          <p className="hero-subtitle" style={{ maxWidth: '700px', margin: '1.5rem auto 3rem auto', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
            SuburbSense is where first home buyers, renters and relocating families research suburbs before making the biggest financial decision of their lives.
          </p>
          <a href="mailto:partners@suburbsense.com.au" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '1rem 2.5rem', borderRadius: '30px' }}>
            Get in touch &rarr;
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section reveal-up" style={{ padding: '4rem 0', background: 'var(--surface-alt)' }}>
        <div className="container">
          <div className="stats-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            <div className="stat-card">
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>4.1k</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Monthly sessions</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>4.2k</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Indexed pages</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>5</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>States covered</div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>4.8k</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Suburb profiles</div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-tertiary)' }}>
            &uarr; Growing weekly
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="audience-section reveal-up" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--info-color)' }}>The Audience</span>
            <h2>People actively planning their next move.</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto' }}>
              Every visitor is mid-decision — comparing suburbs, checking schools, calculating commutes. They arrive with intent. They leave ready to act.
            </p>
          </div>

          <div className="audience-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            <div className="audience-card" style={{ padding: '2rem', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏠</div>
              <h3>First home buyers</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Comparing suburbs for their first purchase. Actively researching grants, stamp duty and loan eligibility.</p>
            </div>
            <div className="audience-card" style={{ padding: '2rem', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📦</div>
              <h3>Relocating families</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Moving interstate or across the city. Researching schools, transit scores and suburb safety.</p>
            </div>
            <div className="audience-card" style={{ padding: '2rem', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📶</div>
              <h3>New movers</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Just locked in a suburb. Actively comparing NBN providers, energy plans and local services.</p>
            </div>
            <div className="audience-card" style={{ padding: '2rem', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
              <h3>Property investors</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Tracking price growth, yield indicators and suburb trajectories across VIC, NSW, QLD and SA.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Placements / Partnership Options Section */}
      <section className="options-section reveal-up" style={{ padding: '5rem 0', background: 'var(--surface-alt)' }}>
        <div className="container">
          <div className="section-header" style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--info-color)' }}>Partnership options</span>
            <h2>Where your brand fits naturally.</h2>
            <p style={{ maxWidth: '700px', margin: '0 auto' }}>
              Every placement appears contextually — shown to visitors researching the exact life stage where your product is relevant.
            </p>
          </div>

          <div className="options-grid" style={{ display: 'grid', gap: '2rem' }}>
            {/* Home Loans */}
            <div className="option-card" style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '3rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--danger-color)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600 }}>Most popular</div>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏦</div>
                <h3>Home Loan Partner</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Featured on all suburb profile pages in the home loan section. Shown to visitors checking affordability and FHOG eligibility.</p>
                <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                    <li>Suburb pages (4,823 pages)</li>
                    <li>FHOG guide pages</li>
                    <li>Moving checklist pages</li>
                    <li>Click tracked via /go/ redirect</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem' }}>Suitable for:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Mortgage brokers</span>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Home loan lenders</span>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Finance aggregators</span>
                </div>
              </div>
            </div>

            {/* NBN */}
            <div className="option-card" style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '3rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📶</div>
                <h3>NBN & Internet Partner</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Featured on suburb pages in the NBN technology section. Every suburb profile shows NBN connection type — a natural decision point for providers.</p>
                <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                    <li>NBN section on all suburb pages</li>
                    <li>Moving checklist (all states)</li>
                    <li>Click tracked via /go/ redirect</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem' }}>Suitable for:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>ISPs</span>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>NBN retailers</span>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Internet comparison</span>
                </div>
              </div>
            </div>

            {/* Energy */}
            <div className="option-card" style={{ background: 'var(--surface-color)', borderRadius: '16px', padding: '3rem', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                <h3>Energy Partner</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Featured alongside the suburb profile and moving checklist. Moving home is the #1 trigger for energy plan switching in Australia.</p>
                <div style={{ background: 'var(--surface-alt)', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)' }}>
                    <li>Moving checklist pages (VIC/NSW/QLD/SA)</li>
                    <li>Suburb profile energy section</li>
                    <li>Click tracked via /go/ redirect</li>
                  </ul>
                </div>
              </div>
              <div>
                <h4 style={{ marginBottom: '1rem' }}>Suitable for:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Energy retailers</span>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Comparison services</span>
                  <span style={{ background: 'var(--brand-blue-light)', color: 'var(--brand-blue-dark)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>Solar providers</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Why SuburbSense */}
      <section className="why-section reveal-up" style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem', alignItems: 'center' }}>
            <div style={{ flex: '1 1 400px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--info-color)' }}>Why SuburbSense</span>
              <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Intent-driven traffic.<br/>Not passive browsing.</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                Every visitor to SuburbSense has expressed intent — they searched for a suburb, compared two areas, or looked up FHOG eligibility. This isn't entertainment traffic.
              </p>
            </div>
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ fontSize: '2rem' }}>🎯</div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>High intent</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Visitors are mid-decision. They've already chosen to research before buying, renting or moving.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ fontSize: '2rem' }}>📊</div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Real data backing</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>ABS Census 2021, GTFS transit data, ACARA school ratings. Visitors trust the data — and trust your brand alongside it.</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div style={{ fontSize: '2rem' }}>🇦🇺</div>
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Australian-built</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Built by Australians, for Australians. 100% Australian audience. No offshore traffic arbitrage.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section" style={{ padding: '6rem 1rem', background: '#0f172a', color: '#ffffff', textAlign: 'center' }}>
        <div className="container" style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '3rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#ffffff' }}>Ready to reach first home buyers?</h2>
          <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 2.5rem auto', color: '#e2e8f0', lineHeight: 1.6 }}>
            Send us a message with your company name, the audience you're trying to reach, and which placement type interests you. We'll respond within 1 business day.
          </p>
          <a href="mailto:partners@suburbsense.com.au" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: '#3b82f6',
            color: '#ffffff',
            padding: '1.2rem 2.5rem',
            borderRadius: '30px',
            fontSize: '1.2rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
            transition: 'transform 0.2s'
          }}>
            📧 partners@suburbsense.com.au
          </a>
          <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>No forms. No gatekeeping. Just email us directly.</p>
        </div>
      </section>
    </div>
  );
}
