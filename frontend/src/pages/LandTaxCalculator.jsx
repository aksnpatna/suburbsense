import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export function LandTaxCalculator() {
  const [state, setState] = useState('VIC');
  const [landValue, setLandValue] = useState(500000);
  const [isPPR, setIsPPR] = useState(false);
  const [isForeign, setIsForeign] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        state,
        land_value: landValue,
        is_ppr: isPPR,
        is_foreign_owner: isForeign,
      });
      const res = await fetch(`/api/land-tax/calculate?${params}`);
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
        <title>Land Tax Calculator — Investment Property 2026 | SuburbSense</title>
        <meta name="description" content="Estimate annual land tax for investment properties across all Australian states. Includes foreign owner surcharge. Principal residence exempt." />
      </Helmet>

      <div className="calc-header">
        <h1>Land Tax Calculator</h1>
        <p>Estimate annual land tax for investment properties. All states and territories. Principal residence exempt.</p>
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
            <label>Land Value ($)</label>
            <input type="number" value={landValue} onChange={e => setLandValue(Number(e.target.value))} />
            <input type="range" min="100000" max="5000000" step="50000" value={landValue} onChange={e => setLandValue(Number(e.target.value))} className="range-slider" />
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Combined value of ALL investment land in the state
            </p>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={isPPR} onChange={e => setIsPPR(e.target.checked)} />
              This is my Principal Place of Residence (PPR) — exempt
            </label>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={isForeign} onChange={e => setIsForeign(e.target.checked)} />
              Foreign property owner (surcharge applies)
            </label>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Land Tax'}
          </button>
        </div>

        {result && result.success && (
          <div className="calc-results card calc-result-card calc-result-animate">
            <h2>Land Tax Result</h2>
            {result.exemption ? (
              <div className="result-highlight">
                <div className="big-number" style={{ color: '#16a34a', fontSize: '2rem' }}>Exempt</div>
                <p>{result.reason}</p>
              </div>
            ) : (
              <>
                <div className="result-highlight">
                  <div className="big-number">${result.total_annual?.toLocaleString()}</div>
                  <p>Annual land tax</p>
                </div>
                <div className="result-breakdown">
                  <div className="result-row">
                    <span>State</span>
                    <strong>{result.state}</strong>
                  </div>
                  <div className="result-row">
                    <span>Land Value</span>
                    <strong>${result.land_value?.toLocaleString()}</strong>
                  </div>
                  <div className="result-row">
                    <span>Base Land Tax</span>
                    <strong>${result.annual_land_tax?.toLocaleString()}</strong>
                  </div>
                  {result.foreign_surcharge > 0 && (
                    <div className="result-row">
                      <span>Foreign Owner Surcharge</span>
                      <strong>${result.foreign_surcharge?.toLocaleString()}</strong>
                    </div>
                  )}
                  <div className="result-row total">
                    <span>Monthly Land Tax</span>
                    <strong>${result.monthly_land_tax?.toLocaleString()}</strong>
                  </div>
                </div>
              </>
            )}
            <div className="data-attribution">
              Source: {result.data_source} · Rates verified August 2026
            </div>
            {result.ppr_exempt && (
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: '#f0fdf4', borderRadius: '6px', fontSize: '0.85rem', color: '#166534' }}>
                <strong>PPR exempt:</strong> {result.ppr_exempt}
              </div>
            )}
            <div className="energy-cta-box">
              <p>Owning an investment? <strong>Compare energy plans</strong> for the property.</p>
              <a href="/energy/compare" className="btn btn-primary btn-small">Compare Energy Plans ⚡</a>
            </div>
            <div className="calc-next-steps">
              <span>Also try:</span>
              <a href="/calculators/roi">Investment Calculator</a>
              <span>&middot;</span>
              <a href="/council-rates">Council Rates</a>
              <span>&middot;</span>
              <a href="/calculators/stamp-duty">Stamp Duty</a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
