import { useState } from 'react';

const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export function FHBAChecker() {
  const [state, setState] = useState('VIC');
  const [price, setPrice] = useState(800000);
  const [isRegional, setIsRegional] = useState(true);
  const [isSingleParent, setIsSingleParent] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        state,
        property_price: price,
        is_regional_centre: isRegional,
        is_single_parent: isSingleParent,
      });
      const res = await fetch(`/api/fhbg/check?${params}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ success: false, message: 'Check failed' });
    }
    setLoading(false);
  };

  return (
    <div className="calculator-page">
      <div className="calc-header">
        <h1>First Home Guarantee Checker</h1>
        <p>Check if you qualify for the Australian Government 5% Deposit Scheme (no LMI, no income cap, unlimited places).</p>
      </div>

      <div className="calc-grid">
        <div className="calc-form card">
          <div className="form-group">
            <label>State</label>
            <select value={state} onChange={e => setState(e.target.value)}>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Property Price ($)</label>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
            <input type="range" min="200000" max="2000000" step="50000" value={price} onChange={e => setPrice(Number(e.target.value))} className="range-slider" />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={isRegional} onChange={e => setIsRegional(e.target.checked)} />
              Capital city or regional centre
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={isSingleParent} onChange={e => setIsSingleParent(e.target.checked)} />
              Single parent or guardian (Family Home Guarantee — 2% deposit)
            </label>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleCheck} disabled={loading}>
            {loading ? 'Checking...' : 'Check Eligibility'}
          </button>
        </div>

        {result && result.success && (
          <div className="calc-results card">
            <h2>Result</h2>
            <div className="result-highlight">
              <div className="big-number" style={{ color: result.eligible ? '#16a34a' : '#dc2626' }}>
                {result.eligible ? '✅ Eligible' : '❌ Not Eligible'}
              </div>
              <p>{result.scheme}</p>
            </div>
            <div className="result-breakdown">
              <div className="result-row">
                <span>State</span>
                <strong>{result.state}</strong>
              </div>
              <div className="result-row">
                <span>Property Price</span>
                <strong>${result.property_price?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Price Cap</span>
                <strong>${result.price_cap?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Min Deposit ({result.min_deposit_pct}%)</span>
                <strong>${result.min_deposit?.toLocaleString()}</strong>
              </div>
              {result.lmi_waived && (
                <div className="result-row highlight">
                  <span>LMI Waived</span>
                  <strong>Save $10K–$35K+</strong>
                </div>
              )}
            </div>
            {result.eligible && (
              <div style={{ marginTop: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Next Steps</h3>
                <ul style={{ paddingLeft: '1.25rem', lineHeight: '1.8', fontSize: '0.9rem' }}>
                  {result.next_steps.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
              </div>
            )}
            <div className="data-attribution">
              Source: {result.data_source}
            </div>
            {result.eligible && (
              <div className="cta-box" style={{ marginTop: '1rem', padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
                <p style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Ready to buy? Compare energy for your new home.</p>
                <a href="/energy/compare" className="btn btn-secondary btn-small">Compare Energy →</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
