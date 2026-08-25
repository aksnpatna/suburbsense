import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export function GuidePage() {
  const { state, category } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/guides/${state}/${category}`);
        if (!res.ok) throw new Error('Failed to fetch guide data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [state, category]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Loading Guide...</h2>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Oops! We couldn't load this guide.</h2>
        <p>{error}</p>
        <Link to={`/state/${state}`} className="btn btn-primary">Back to {state?.toUpperCase() || 'Home'}</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Helmet>
        <title>{data.meta.title} - SuburbSense</title>
        <meta name="description" content={data.meta.description} />
      </Helmet>

      <section className="hero-section glass-panel" style={{ textAlign: 'center', padding: '4rem 1rem', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{data.meta.title}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '800px', margin: '0 auto' }}>
          {data.meta.description}
        </p>
      </section>

      <div className="container" style={{ paddingBottom: '4rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {data.suburbs.map((suburb, index) => (
            <div key={suburb.id} className="card glass-panel" style={{ display: 'flex', padding: '2rem', gap: '2rem', alignItems: 'center' }}>
              <div style={{ flexShrink: 0, width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                #{index + 1}
              </div>
              
              <div style={{ flexGrow: 1 }}>
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.8rem' }}>
                  <Link to={`/suburb/${suburb.slug}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>
                    {suburb.name}, {suburb.state} {suburb.postcode}
                  </Link>
                </h2>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
                  <div>👥 Population: {(suburb.population || 0).toLocaleString()}</div>
                  {category === 'families' && (
                    <>
                      <div>🎓 Schools: {suburb.school_quality ? `${suburb.school_quality}/10` : 'N/A'}</div>
                      <div>🌳 Parks: {suburb.parks_count || 0}</div>
                      <div>🛡️ Safety: {suburb.safety_score ? `${suburb.safety_score}/100` : 'N/A'}</div>
                    </>
                  )}
                  {category === 'commuters' && (
                    <>
                      <div>🚆 Transit: {suburb.transit_accessibility ? `${suburb.transit_accessibility}/100` : 'N/A'}</div>
                      <div>🏢 CBD Dist: {suburb.cbd_distance_mins ? `${suburb.cbd_distance_mins} mins` : 'N/A'}</div>
                    </>
                  )}
                  {category === 'safest' && (
                    <>
                      <div>🛡️ Safety Score: {suburb.safety_score ? `${suburb.safety_score}/100` : 'N/A'}</div>
                      <div>🚨 Crime Rate: {suburb.crime_rate ? `${suburb.crime_rate}/100k` : 'N/A'}</div>
                    </>
                  )}
                </div>
              </div>
              
              <div style={{ flexShrink: 0 }}>
                <Link to={`/suburb/${suburb.slug}`} className="btn btn-outline">
                  Explore Suburb &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
