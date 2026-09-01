import { useState } from 'react';
import { AFFILIATE_CONFIG } from '../config/affiliates';
import { Helmet } from 'react-helmet-async';

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

export function NBNLookup() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const broadbandPartners = AFFILIATE_CONFIG.broadband.topPicks;

  const handleLookup = async () => {
    if (!address.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/nbn/lookup?q=${encodeURIComponent(address)}`);
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'No result found');
      } else {
        setResult(data);
      }
    } catch (e) {
      setError('Lookup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="calculator-page fade-in">
      <Helmet>
        <title>NBN Rollout Map & Connection Checker | SuburbSense</title>
        <meta name="description" content="Check NBN connection types and technology across Australia. Compare fast internet and broadband providers." />
        <link rel="canonical" href="https://suburbsense.com/nbn" />
      </Helmet>

      <div className="calc-header">
        <h1>NBN Connection Checker</h1>
        <p>Check what NBN technology is available at any Australian address. Includes estimated speed tier.</p>
      </div>

      <div className="calc-grid">
        <div className="calc-form card">
          <div className="form-group">
            <label>Enter Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 1 Flinders Street, Melbourne VIC"
              onKeyDown={e => e.key === 'Enter' && handleLookup()}
            />
          </div>
          <button className="btn btn-primary btn-full" onClick={handleLookup} disabled={loading || !address.trim()}>
            {loading ? 'Looking up...' : 'Check NBN Availability'}
          </button>

          {error && (
            <div className="error-card" style={{ marginTop: '1rem' }}>
              <p>{error}</p>
            </div>
          )}
        </div>

        {result && result.result && (
          <div className="calc-results card">
            <h2>NBN Result</h2>
            <div className="result-highlight">
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {TECH_ICONS[result.result.tech_type] || '⚪'}
              </div>
              <div className="big-number" style={{ fontSize: '1.5rem' }}>
                {result.result.tech_label}
              </div>
              <p>Estimated speed: {result.result.speed_estimate}</p>
            </div>
            <div className="result-breakdown">
              <div className="result-row">
                <span>Address</span>
                <strong>{result.result.formatted_address}</strong>
              </div>
              <div className="result-row">
                <span>Service Type</span>
                <strong>{result.result.service_type}</strong>
              </div>
              <div className="result-row">
                <span>Service Status</span>
                <strong>{result.result.service_status}</strong>
              </div>
              {result.result.description && (
                <div className="result-row">
                  <span>Details</span>
                  <strong>{result.result.description}</strong>
                </div>
              )}
            </div>
            <div className="data-attribution">
              Source: {result.data_source}
            </div>
          </div>
        )}
      </div>

      <div className="container" style={{ maxWidth: '800px', margin: '4rem auto 0', paddingBottom: '4rem' }}>
        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' }}>Top Broadband Providers</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {broadbandPartners.map(partner => (
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
      </div>
    </div>
  );
}
