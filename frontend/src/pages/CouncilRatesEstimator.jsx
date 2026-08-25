import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const VALUATION_HINTS = {
  VIC: 'Capital Improved Value (CIV) — land + building value',
  NSW: 'Unimproved Land Value — land only',
  QLD: 'Unimproved Land Value — land only',
  WA: 'Gross Rental Value — annual rental potential',
  SA: 'Capital Value — land + building value',
  TAS: 'Assessed Annual Value — annual rental potential',
  ACT: 'Average Unimproved Value — land value averaged over 3 years',
  NT: 'Unimproved Capital Value — land value',
};

export function CouncilRatesEstimator() {
  const [state, setState] = useState('VIC');
  const [propertyValue, setPropertyValue] = useState(800000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        state,
        property_value: propertyValue,
      });
      const res = await fetch(`/api/council-rates/estimate?${params}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ success: false });
    }
    setLoading(false);
  };

  return (
    <div className="calculator-page">
      <Helmet>
        <title>Council Rates Estimator — All Australian States 2026 | SuburbSense</title>
        <meta name="description" content="Estimate annual council rates for any Australian property. State-wide average rate-in-the-dollar multipliers with waste charge estimates." />
      </Helmet>

      <div className="calc-header">
        <h1>Council Rates Estimator</h1>
        <p>Estimate annual council rates for any Australian property. Based on state-wide average rate-in-the-dollar multipliers.</p>
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
            <label>Property Value ($)</label>
            <input type="number" value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} />
            <input type="range" min="100000" max="3000000" step="50000" value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} className="range-slider" />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {VALUATION_HINTS[state]}
            </p>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Estimating...' : 'Estimate Council Rates'}
          </button>
        </div>

        {result && result.success && (
          <div className="calc-results card calc-result-card calc-result-animate">
            <h2>Council Rates Estimate</h2>
            <div className="result-highlight">
              <div className="big-number">${result.estimated_council_rates?.toLocaleString()}</div>
              <p>Estimated annual council rates</p>
            </div>
            <div className="result-breakdown">
              <div className="result-row">
                <span>State</span>
                <strong>{result.state}</strong>
              </div>
              <div className="result-row">
                <span>Property Value</span>
                <strong>${result.property_value?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Valuation Basis</span>
                <strong>{result.valuation_basis}</strong>
              </div>
              <div className="result-row">
                <span>Base Rates</span>
                <strong>${result.base_rates?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Waste Charge (est.)</span>
                <strong>${result.estimated_waste_charge?.toLocaleString()}</strong>
              </div>
              <div className="result-row total">
                <span>Monthly Equivalent</span>
                <strong>${result.monthly_council_rates?.toLocaleString()}</strong>
              </div>
            </div>
            <div className="data-attribution">
               Source: {result.data_source} · Estimate only — actual rates vary by council
            </div>
            <div className="energy-cta-box">
               <p>Moving to a new area? <strong>Check energy availability</strong> at the new address.</p>
               <a href="/energy/compare" className="btn btn-primary btn-small">Compare Energy Plans ⚡</a>
            </div>
            <div className="calc-next-steps">
              <span>Also try:</span>
              <a href="/calculators/roi">Investment Calculator</a>
              <span>&middot;</span>
              <a href="/calculators/land-tax">Land Tax</a>
              <span>&middot;</span>
              <a href="/calculators/stamp-duty">Stamp Duty</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
