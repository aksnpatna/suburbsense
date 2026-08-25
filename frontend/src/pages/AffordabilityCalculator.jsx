import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export function AffordabilityCalculator() {
  const [deposit, setDeposit] = useState(100000);
  const [state, setState] = useState('VIC');
  const [lvr, setLvr] = useState(0.8);
  const [annualIncome, setAnnualIncome] = useState(150000);
  const [monthlyDebt, setMonthlyDebt] = useState(0);
  const [interestRate, setInterestRate] = useState(6.2);
  const [isFHB, setIsFHB] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculators/affordability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deposit, state, lvr, annualIncome, monthlyDebt, interestRate, isFHB }),
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
        <title>Affordability Calculator — How Much Can I Borrow? | SuburbSense</title>
        <meta name="description" content="Calculate your maximum borrowing capacity and purchase price based on income, deposit and APRA serviceability guidelines. Includes LMI and FHBG eligibility." />
      </Helmet>

      <div className="calc-header">
        <h1>Affordability Calculator</h1>
        <p>Find out how much you can afford to borrow. Based on APRA serviceability guidelines.</p>
      </div>

      <div className="calc-grid">
        <div className="calc-form card">
          <div className="form-group">
            <label>Deposit ($)</label>
            <input type="number" value={deposit} onChange={e => setDeposit(Number(e.target.value))} />
          </div>

          <div className="form-group">
            <label>Combined Annual Gross Income ($)</label>
            <input type="number" value={annualIncome} onChange={e => setAnnualIncome(Number(e.target.value))} />
          </div>

          <div className="form-group">
            <label>Monthly Debt Repayments ($)</label>
            <input type="number" value={monthlyDebt} onChange={e => setMonthlyDebt(Number(e.target.value))} />
          </div>

          <div className="form-group">
            <label>Interest Rate (%)</label>
            <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
          </div>

          <div className="form-group">
            <label>LVR (Loan-to-Value Ratio)</label>
            <select value={lvr} onChange={e => setLvr(Number(e.target.value))}>
              <option value="0.8">80% (No LMI)</option>
              <option value="0.85">85%</option>
              <option value="0.9">90%</option>
              <option value="0.95">95% (FHB with FHBG)</option>
            </select>
          </div>

          <div className="form-group">
            <label>State</label>
            <select value={state} onChange={e => setState(e.target.value)}>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={isFHB} onChange={e => setIsFHB(e.target.checked)} />
              First Home Buyer
            </label>
          </div>

          <button className="btn btn-primary btn-full" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate Affordability'}
          </button>
        </div>

        {result && !result.error && (
          <div className="calc-results card calc-result-card calc-result-animate">
            <h2>Your Affordability</h2>
            <div className="result-highlight">
              <div className="big-number">${result.maxPrice?.toLocaleString()}</div>
              <p>Maximum purchase price</p>
              <span className={`badge ${result.limitedBy === 'Serviceability' ? 'badge-warning' : 'badge-info'}`}>
                Limited by {result.limitedBy}
              </span>
            </div>
            {result.monthlyRepayment && (
              <div style={{ textAlign: 'center', margin: '1rem 0', padding: '1rem', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated Monthly Repayment</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#16a34a' }}>${Math.round(result.monthlyRepayment).toLocaleString()}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Principal + interest, 30yr term</div>
              </div>
            )}
            <div className="result-breakdown">
              <div className="result-row">
                <span>Max Borrowing</span>
                <strong>${result.maxBorrow?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Borrowing Capacity</span>
                <strong>${result.borrowingCapacity?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Stamp Duty</span>
                <strong>${result.stampDuty?.toLocaleString()}</strong>
              </div>
              {result.lmi > 0 && (
                <div className="result-row">
                  <span>LMI (Lender's Mortgage Insurance)</span>
                  <strong>${result.lmi?.toLocaleString()}</strong>
                </div>
              )}
              {result.fhbgEligible && (
                <div className="result-row highlight">
                  <span>FHBG Eligible</span>
                  <strong>LMI Waived</strong>
                </div>
              )}
            </div>
            <div className="data-attribution">
              Source: APRA serviceability guidelines &middot; State Revenue Office {state}
            </div>
            <div className="energy-cta-box">
              <p>Found your budget? <strong>Sort your energy</strong> before you move.</p>
              <a href="/energy/compare" className="btn btn-primary btn-small">Compare Energy Plans ⚡</a>
            </div>
            <div className="calc-next-steps">
              <span>Also try:</span>
              <a href="/calculators/stamp-duty">Stamp Duty</a>
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
                <a href="/calculators/stamp-duty" className="what-next-item">
                  <span>🏠</span> Stamp Duty
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
