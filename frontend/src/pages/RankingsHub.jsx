import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const RANKING_LISTS = [
  {
    state: 'vic',
    stateLabel: 'VIC',
    emoji: '🏙️',
    color: '#3b82f6',
    lists: [
      { category: 'families', label: 'Best Suburbs for Families', desc: 'Top suburbs ranked by school quality, parks, and safety scores.' },
      { category: 'commuters', label: 'Best Suburbs for Commuters', desc: 'Ranked by transit score and CBD proximity — ideal for workers.' },
      { category: 'safest', label: 'Safest Suburbs', desc: 'Lowest crime rates and best safety scores across VIC.' },
    ],
  },
  {
    state: 'nsw',
    stateLabel: 'NSW',
    emoji: '🌉',
    color: '#8b5cf6',
    lists: [
      { category: 'families', label: 'Best Suburbs for Families', desc: 'Top suburbs ranked by school quality, parks, and safety scores.' },
      { category: 'commuters', label: 'Best Suburbs for Commuters', desc: 'Ranked by transit score and CBD proximity — ideal for Sydney workers.' },
      { category: 'safest', label: 'Safest Suburbs', desc: 'Lowest crime rates and best safety scores across NSW.' },
    ],
  },
  {
    state: 'qld',
    stateLabel: 'QLD',
    emoji: '☀️',
    color: '#f59e0b',
    lists: [
      { category: 'families', label: 'Best Suburbs for Families', desc: 'Top suburbs ranked by school quality, parks, and safety scores.' },
      { category: 'commuters', label: 'Best Suburbs for Commuters', desc: 'Ranked by transit score and CBD proximity — ideal for Brisbane workers.' },
      { category: 'safest', label: 'Safest Suburbs', desc: 'Lowest crime rates and best safety scores across QLD.' },
    ],
  },
  {
    state: 'sa',
    stateLabel: 'SA',
    emoji: '🌿',
    color: '#10b981',
    lists: [
      { category: 'families', label: 'Best Suburbs for Families', desc: 'Top suburbs for families in Adelaide and South Australia.' },
      { category: 'commuters', label: 'Best Suburbs for Commuters', desc: 'Ranked by transit access and CBD proximity in SA.' },
      { category: 'safest', label: 'Safest Suburbs', desc: 'Lowest crime rates and best safety scores in SA.' },
    ],
  },
];

const CATEGORY_META = {
  families: { icon: '👨‍👩‍👧‍👦', color: '#10b981' },
  commuters: { icon: '🚆', color: '#3b82f6' },
  safest: { icon: '🛡️', color: '#8b5cf6' },
};

export function RankingsHub() {
  return (
    <div className="fade-in">
      <Helmet>
        <title>Best Suburbs in Australia 2026 — Rankings & Guides | SuburbSense</title>
        <meta
          name="description"
          content="Ranked lists of the best Australian suburbs for families, commuters and safety. Data-driven suburb rankings across VIC, NSW, QLD, and SA."
        />
        <link rel="canonical" href="https://suburbsense.com.au/rankings" />
      </Helmet>

      {/* Hero */}
      <section className="hero" style={{ padding: '4rem 1rem 3rem', textAlign: 'center' }}>
        <div className="container">
          <div className="hero-badge" style={{ marginBottom: '1rem' }}>🏆 Data-Driven Rankings</div>
          <h1 className="hero-title" style={{ maxWidth: '700px', margin: '0 auto', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
            Best Australian Suburbs{' '}
            <span style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--info-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              2026 Rankings
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '1rem auto 0', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Ranked using real ABS Census data, ACARA school scores, transit stop density, and crime statistics.
            No sponsored placements — just data.
          </p>
        </div>
      </section>

      {/* Category explainer row */}
      <section style={{ padding: '2rem 0', background: 'var(--surface-alt)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { icon: '👨‍👩‍👧‍👦', label: 'Best for Families', desc: 'Schools + parks + safety' },
              { icon: '🚆', label: 'Best for Commuters', desc: 'Transit score + CBD distance' },
              { icon: '🛡️', label: 'Safest Suburbs', desc: 'Crime rate + safety score' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '2rem' }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rankings by State */}
      <section style={{ padding: '3rem 0 5rem' }}>
        <div className="container">
          {RANKING_LISTS.map(stateGroup => (
            <div key={stateGroup.state} style={{ marginBottom: '3.5rem' }}>
              {/* State heading */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '2px solid var(--border-color)' }}>
                <span style={{ fontSize: '2rem' }}>{stateGroup.emoji}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Best Suburbs in {stateGroup.stateLabel}</h2>
                  <Link to={`/state/${stateGroup.state}`} style={{ fontSize: '0.82rem', color: 'var(--primary-color)', textDecoration: 'none' }}>
                    Browse all {stateGroup.stateLabel} suburbs →
                  </Link>
                </div>
              </div>

              {/* List cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {stateGroup.lists.map(list => {
                  const meta = CATEGORY_META[list.category];
                  return (
                    <Link
                      key={list.category}
                      to={`/guides/${stateGroup.state}/${list.category}`}
                      style={{
                        display: 'block',
                        padding: '1.5rem',
                        background: 'var(--surface-color)',
                        borderRadius: '14px',
                        border: '1px solid var(--border-color)',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.borderColor = stateGroup.color;
                        e.currentTarget.style.boxShadow = `0 6px 20px ${stateGroup.color}20`;
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Top accent bar */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: stateGroup.color }} />
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <span style={{ fontSize: '2rem' }}>{meta.icon}</span>
                        <div>
                          <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>{list.label}</h3>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{list.desc}</p>
                        </div>
                      </div>
                      <div style={{ marginTop: '1rem', fontSize: '0.82rem', fontWeight: 700, color: stateGroup.color }}>
                        View ranking →
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* CTA to suburb search */}
          <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface-alt)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Looking for a specific suburb?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Search any suburb directly to see its scores, demographics, schools, and transit data.</p>
            <Link to="/" className="btn btn-primary" style={{ borderRadius: '30px', padding: '0.85rem 2rem' }}>
              🔍 Search Suburbs →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
