import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AFFILIATE_CONFIG } from '../config/affiliates';

const TECH_ICONS = {
  'FTTP': '🔵',
  'FTTN': '🟡',
  'FTTB': '🟡',
  'FTTC': '🟢',
  'HFC': '🟠',
  'Fixed Wireless': '📡',
  'Satellite': '🛰️',
  'Unknown': '⚪',
};

export function UtilitiesHub() {
  const { slug } = useParams();
  const [suburb, setSuburb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // NBN lookup state
  const [address, setAddress] = useState('');
  const [nbnResult, setNbnResult] = useState(null);
  const [nbnLoading, setNbnLoading] = useState(false);
  const [nbnError, setNbnError] = useState('');

  const broadbandPartners = AFFILIATE_CONFIG.broadband.topPicks;
  const energyPartners = AFFILIATE_CONFIG.energy.topPicks;

  useEffect(() => {
    const fetchSuburb = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/suburbs/${slug}`);
        if (!res.ok) throw new Error('Suburb not found');
        const data = await res.json();
        setSuburb(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSuburb();
  }, [slug]);

  const handleNbnLookup = async () => {
    if (!address.trim()) return;
    setNbnLoading(true);
    setNbnError('');
    setNbnResult(null);
    try {
      const res = await fetch(`/api/nbn/lookup?q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (!data.success) {
        setNbnError(data.message || 'No result found');
      } else {
        setNbnResult(data);
      }
    } catch (e) {
      setNbnError('Lookup failed. Please try again.');
    }
    setNbnLoading(false);
  };

  if (loading) return <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}><h2>Loading Utilities...</h2></div>;
  
  if (error || !suburb) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <h2>Oops! Suburb not found.</h2>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in">
      <Helmet>
        <title>Best Internet & Energy Plans in {suburb.name} {suburb.state} | SuburbSense</title>
        <meta name="description" content={`Compare the best NBN internet plans, electricity and gas providers for residents of ${suburb.name}, ${suburb.state} ${suburb.postcode}. Check your NBN connection type instantly.`} />
      </Helmet>

      {/* Hero Section */}
      <section className="hero-section glass-panel" style={{ textAlign: 'center', padding: '4rem 1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'inline-block', background: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', textTransform: 'uppercase' }}>
          Utilities & Internet Guide
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem' }}>
          Best NBN & Energy Plans in {suburb.name}
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto' }}>
          {suburb.name} is home to {suburb.population ? suburb.population.toLocaleString() : 'many'} residents in {suburb.state} {suburb.postcode}. Whether you are moving here or just looking for a better deal, compare the top local internet and energy providers below.
        </p>
      </section>

      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '4rem' }}>
        
        {/* NBN Section */}
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem' }}>🌐</span>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Internet & NBN Rollout</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            The NBN technology available depends on your specific street address in {suburb.name}. Enter your address below to see exactly what connection type (FTTP, FTTN, HFC, etc.) is wired to your home.
          </p>

          <div className="calc-grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            <div className="calc-form card">
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Check your {suburb.name} address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder={`e.g. 1 Main Street, ${suburb.name}`}
                  onKeyDown={e => e.key === 'Enter' && handleNbnLookup()}
                />
              </div>
              <button className="btn btn-primary" onClick={handleNbnLookup} disabled={nbnLoading || !address.trim()} style={{ width: '100%' }}>
                {nbnLoading ? 'Looking up...' : 'Check Connection Type'}
              </button>
              {nbnError && <p style={{ color: 'var(--error-color)', marginTop: '1rem', fontWeight: 600 }}>{nbnError}</p>}
            </div>

            {nbnResult && nbnResult.result && (
              <div className="calc-results card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '3rem' }}>{TECH_ICONS[nbnResult.result.tech_type] || '⚪'}</div>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0' }}>{nbnResult.result.tech_label}</h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Max estimated speed: {nbnResult.result.speed_estimate}</p>
                  </div>
                </div>
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-alt)', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <strong>Address:</strong> {nbnResult.result.formatted_address}<br/>
                  <strong>Status:</strong> {nbnResult.result.service_status}
                </div>
              </div>
            )}
          </div>

          <h3 style={{ marginTop: '3rem', marginBottom: '1rem', fontSize: '1.4rem' }}>Top Broadband Providers for {suburb.name}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {broadbandPartners.map(partner => (
              <div key={partner.id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--surface-color)' }}>
                <div style={{ fontSize: '2rem' }}>{partner.icon}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {partner.name}
                    <span style={{ fontSize: '0.7rem', background: 'var(--primary-color)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>{partner.tag}</span>
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{partner.description}</p>
                </div>
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                  View Plans
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Energy Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2rem' }}>⚡</span>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Electricity & Gas Providers</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Residents of {suburb.name} have access to a competitive energy market. Compare standard offers, solar feed-in tariffs, and green energy plans below.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {energyPartners.map(partner => (
              <div key={partner.id} className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', background: 'var(--surface-color)' }}>
                <div style={{ fontSize: '2rem' }}>{partner.icon}</div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {partner.name}
                    <span style={{ fontSize: '0.7rem', background: 'var(--primary-color)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>{partner.tag}</span>
                  </h4>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>{partner.description}</p>
                </div>
                <a href={partner.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ whiteSpace: 'nowrap' }}>
                  Compare Rates
                </a>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: '4rem', textAlign: 'center' }}>
          <Link to={`/suburb/${slug}`} className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
            &larr; Back to {suburb.name} Profile
          </Link>
        </div>

      </div>
    </div>
  );
}
