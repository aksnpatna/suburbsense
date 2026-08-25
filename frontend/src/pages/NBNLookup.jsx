import { useState } from 'react';

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
    <div className="calculator-page">
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
            <div className="cta-box" style={{ marginTop: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Moving here? Compare internet plans for this address.</p>
              <a href="/energy/compare" className="btn btn-secondary btn-small">Compare Plans →</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
