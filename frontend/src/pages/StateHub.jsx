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
        <title>Best Suburbs in {stateName} | SuburbSense</title>
        <meta name="description" content={`Explore demographics, school catchments, crime rates, and living costs for suburbs across ${stateName}. Find your perfect place to live.`} />
      </Helmet>

      <div className="hero">
        <div className="container">
          <h1>Suburbs in {stateName}</h1>
          <p>Discover real estate data, liveability scores, and demographics for {stateName}.</p>
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

        <h2>All Suburbs in {stateName}</h2>
        {loading ? (
          <p>Loading suburbs...</p>
        ) : (
          <div className="suburb-grid">
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
        )}
      </div>
    </div>
  );
}
