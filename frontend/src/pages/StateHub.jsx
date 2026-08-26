import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './StateHub.css';

export function StateHub() {
  const { stateId } = useParams();
  const [suburbs, setSuburbs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuburbs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/suburbs/search?q=&state=${stateId?.toUpperCase()}&limit=500`);
        const data = await res.json();
        if (data.success) {
          setSuburbs(data.results || []);
        }
      } catch (err) {
        console.error("Failed to fetch suburbs for state", err);
      }
      setLoading(false);
    };
    if (stateId) fetchSuburbs();
  }, [stateId]);

  const stateName = stateId ? stateId.toUpperCase() : '';

  return (
    <div className="state-hub">
      <Helmet>
        <title>Best Suburbs in {stateName} 2026 — Suburb Guide | SuburbSense</title>
        <meta name="description" content={`Explore demographics, school catchments, transit scores, crime rates and living costs for suburbs across ${stateName}. Free suburb intelligence — no login required.`} />
      </Helmet>

      <div className="hero">
        <div className="container">
          <h1>Best Suburbs in {stateName} — 2026 Guide</h1>
          <p>Discover school catchments, transit scores, demographics and liveability data for suburbs across {stateName}.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '3rem' }}>
          <h2>Discover Guides for {stateName}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <Link to={`/guides/${stateName.toLowerCase()}/families`} className="card glass-panel" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>👨‍👩‍👧‍👦 Best for Families</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Top suburbs ranked by school quality, safety, and parks.</p>
            </Link>
            <Link to={`/guides/${stateName.toLowerCase()}/commuters`} className="card glass-panel" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>🚆 Best for Commuters</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Top suburbs ranked by transit access and CBD proximity.</p>
            </Link>
            <Link to={`/guides/${stateName.toLowerCase()}/safest`} className="card glass-panel" style={{ padding: '1.5rem', textDecoration: 'none', color: 'inherit' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>🛡️ Safest Suburbs</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Top suburbs ranked by low crime rates and community safety.</p>
            </Link>
          </div>
        </div>

        {/* === Per-state region cards === */}
        {({
          NSW: [{ slug: 'greater-sydney', label: 'Greater Sydney', emoji: '🌉', sub: '400+ suburbs' }],
          VIC: [{ slug: 'greater-melbourne', label: 'Greater Melbourne', emoji: '🏙️', sub: '300+ suburbs' }],
          QLD: [
            { slug: 'greater-brisbane', label: 'Greater Brisbane', emoji: '☀️', sub: '200+ suburbs' },
            { slug: 'gold-coast', label: 'Gold Coast', emoji: '🏖️', sub: '80+ suburbs' },
            { slug: 'sunshine-coast', label: 'Sunshine Coast', emoji: '🌊', sub: '60+ suburbs' },
          ],
          SA: [{ slug: 'greater-adelaide', label: 'Greater Adelaide', emoji: '🌿', sub: '150+ suburbs' }],
          WA: [{ slug: 'greater-perth', label: 'Greater Perth', emoji: '🌊', sub: '200+ suburbs' }],
          NT: [{ slug: 'greater-darwin', label: 'Greater Darwin', emoji: '🌴', sub: '30+ suburbs' }],
          TAS: [{ slug: 'greater-hobart', label: 'Greater Hobart', emoji: '🏔️', sub: '50+ suburbs' }],
          ACT: [{ slug: 'canberra', label: 'Canberra & ACT', emoji: '🏛️', sub: '100+ suburbs' }],
        }[stateName] || []).length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h2>Browse by Region</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
              {({
                NSW: [{ slug: 'greater-sydney', label: 'Greater Sydney', emoji: '🌉', sub: '400+ suburbs' }],
                VIC: [{ slug: 'greater-melbourne', label: 'Greater Melbourne', emoji: '🏙️', sub: '300+ suburbs' }],
                QLD: [
                  { slug: 'greater-brisbane', label: 'Greater Brisbane', emoji: '☀️', sub: '200+ suburbs' },
                  { slug: 'gold-coast', label: 'Gold Coast', emoji: '🏖️', sub: '80+ suburbs' },
                  { slug: 'sunshine-coast', label: 'Sunshine Coast', emoji: '🌊', sub: '60+ suburbs' },
                ],
                SA: [{ slug: 'greater-adelaide', label: 'Greater Adelaide', emoji: '🌿', sub: '150+ suburbs' }],
                WA: [{ slug: 'greater-perth', label: 'Greater Perth', emoji: '🌊', sub: '200+ suburbs' }],
                NT: [{ slug: 'greater-darwin', label: 'Greater Darwin', emoji: '🌴', sub: '30+ suburbs' }],
                TAS: [{ slug: 'greater-hobart', label: 'Greater Hobart', emoji: '🏔️', sub: '50+ suburbs' }],
                ACT: [{ slug: 'canberra', label: 'Canberra & ACT', emoji: '🏛️', sub: '100+ suburbs' }],
              }[stateName] || []).map(r => (
                <Link
                  key={r.slug}
                  to={`/region/${r.slug}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '1.25rem 1.5rem',
                    background: 'var(--surface-color)',
                    borderRadius: '14px',
                    border: '1px solid var(--border-color)',
                    textDecoration: 'none',
                    color: 'var(--text-primary)',
                    transition: 'border-color 0.15s, transform 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'none'; }}
                >
                  <span style={{ fontSize: '2rem' }}>{r.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 700 }}>{r.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <h2>All Suburbs in {stateName}</h2>
          <div className="suburb-grid">
            {loading && <p style={{ gridColumn: '1/-1', color: 'var(--text-secondary)' }}>Loading suburbs...</p>}
            {!loading && suburbs.length === 0 && (
              <p style={{ gridColumn: '1/-1', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                No suburbs loaded yet for {stateName}. Try browsing a region above.
              </p>
            )}
            {suburbs.map(suburb => (
              <Link 
                key={suburb.id} 
                to={`/suburb/${suburb.name.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '').replace(/,/g, '')}-${suburb.state.toLowerCase()}-${suburb.postcode}`}
                className="suburb-card"
              >
                <h3>{suburb.name}, {suburb.state} {suburb.postcode}</h3>
                <div className="suburb-stats">
                  {suburb.population_2021 && <span>👥 {suburb.population_2021.toLocaleString()}</span>}
                  {suburb.school_count > 0 && <span>🏫 {suburb.school_count} Schools</span>}
                </div>
              </Link>
            ))}
          </div>
      </div>
    </div>
  );
}
