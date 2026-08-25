import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export function StampDutyCalculator() {
  const [price, setPrice] = useState(800000);
  const [state, setState] = useState('VIC');
  const [isFHB, setIsFHB] = useState(false);
  const [propertyType, setPropertyType] = useState('established');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculators/stamp-duty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price, state, isFHB, propertyType }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: e.message });
    }
    setLoading(false);
  };

  return (
    <div className="calculator-page">
      <Helmet>
        <title>Stamp Duty Calculator {state} 2026 — Free | SuburbSense</title>
        <meta name="description" content={`Calculate stamp duty, transfer fees and mortgage registration for ${state}. First home buyer concessions and FHOG included. Free calculator.`} />
      </Helmet>

      <div className="calc-header">
        <h1>Stamp Duty Calculator</h1>
        <p>Calculate government fees for your property purchase. All rates sourced from State Revenue Offices.</p>
      </div>

      <div className="calc-grid">
        <div className="calc-form card">
          <div className="form-group">
            <label>Property Price ($)</label>
            <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} />
            <input type="range" min="100000" max="3000000" step="10000" value={price} onChange={e => setPrice(Number(e.target.value))} className="range-slider" />
          </div>

          <div className="form-group">
            <label>State</label>
            <select value={state} onChange={e => setState(e.target.value)}>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>Property Type</label>
            <select value={propertyType} onChange={e => setPropertyType(e.target.value)}>
              <option value="established">Established Home</option>
              <option value="new_home">New Home / Off-the-plan</option>
              <option value="vacant_land">Vacant Land</option>
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={isFHB} onChange={e => setIsFHB(e.target.checked)} />
              First Home Buyer
            </label>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Stamp Duty'}
          </button>
        </div>

        {result && !result.error && (
          <div className="calc-results card calc-result-card calc-result-animate">
            <h2>Results</h2>
            <div className="result-breakdown">
              <div className="result-row">
                <span>Stamp Duty</span>
                <strong>${result.duty?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Mortgage Registration</span>
                <strong>${result.mortgageRegFee?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Transfer Fee</span>
                <strong>${result.transferFee?.toLocaleString()}</strong>
              </div>
              <div className="result-row total">
                <span>Total Government Fees</span>
                <strong>${result.totalGovtFees?.toLocaleString()}</strong>
              </div>
              {result.fhog > 0 && (
                <div className="result-row highlight">
                  <span>FHOG (offset)</span>
                  <strong>-${result.fhog?.toLocaleString()}</strong>
                </div>
              )}
              <div className="result-row net">
                <span>Net Upfront Cost</span>
                <strong>${result.upfrontCosts?.toLocaleString()}</strong>
              </div>
            </div>
            <div className="data-attribution">
              Source: State Revenue Office {state} &middot; Rates verified August 2026
            </div>
            <div className="energy-cta-box">
              <p>Moving? <strong>Don't forget to compare energy</strong> at your new address.</p>
              <a href="/energy/compare" className="btn btn-primary btn-small">Compare Energy Plans ⚡</a>
            </div>
            <div className="calc-next-steps">
              <span>Also try:</span>
              <a href="/calculators/affordability">Affordability Calculator</a>
              <span>&middot;</span>
              <a href="/fhbg">FHBG Eligibility</a>
              <span>&middot;</span>
              <a href="/calculators/roi">Investment Calculator</a>
            </div>
            <div className="calc-what-next">
              <h4>What next?</h4>
              <div className="what-next-grid">
                <a href="/energy/compare" className="what-next-item">
                  <span>⚡</span> Compare Energy
                </a>
                <a href="/nbn" className="what-next-item">
                  <span>📶</span> Check NBN
                </a>
                <a href="/calculators/affordability" className="what-next-item">
                  <span>💰</span> Affordability
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
