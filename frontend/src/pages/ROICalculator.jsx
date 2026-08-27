import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

export function ROICalculator() {
  const [searchParams] = useSearchParams();
  const [purchasePrice, setPurchasePrice] = useState(Number(searchParams.get('price')) || 600000);
  const [weeklyRent, setWeeklyRent] = useState(Number(searchParams.get('rent')) || 550);
  const [state, setState] = useState(searchParams.get('state') || 'VIC');
  const [depositPct, setDepositPct] = useState(20);
  const [interestRate, setInterestRate] = useState(6.2);
  const [strata, setStrata] = useState(0);
  const [rates, setRates] = useState(1200);
  const [water, setWater] = useState(600);
  const [insurance, setInsurance] = useState(1200);
  const [pmFeePct, setPmFeePct] = useState(6);
  const [vacancyWeeks, setVacancyWeeks] = useState(2);
  const [maintenancePct, setMaintenancePct] = useState(5);
  const [salary, setSalary] = useState(100000);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('price')) {
      handleCalculate();
    }
  }, []);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculators/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePrice, weeklyRent, state, depositPct: depositPct / 100, interestRate,
          strata, rates, water, insurance, pmFeePct, vacancyWeeks,
          maintenancePct, salary,
        }),
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
        <title>Investment Property Calculator — Net Yield, Cashflow & ROI | SuburbSense</title>
        <meta name="description" content="Calculate net yield, cash-on-cash return and weekly cashflow for investment properties. Includes stamp duty, land tax, negative gearing. Free calculator." />
      </Helmet>

      <Helmet>
        <title>Investment Property Calculator — Net Yield, Cashflow & ROI | SuburbSense</title>
        <meta name="description" content="Calculate net yield, cash-on-cash return and weekly cashflow for investment properties. Includes stamp duty, land tax, negative gearing. Free calculator." />
      </Helmet>

      <div className="calc-header">
        <h1>Investment Property Calculator</h1>
        <p>Calculate net yield, cashflow and ROI for investment properties.</p>
      </div>

      <div className="investment-warning-banner">
        <strong>General information only.</strong> SuburbSense is not a licensed financial adviser (AFSL) or credit licensee (ACL). Nothing on this site constitutes financial product advice. Property investment involves risk including potential loss of capital. These figures are estimates based on your inputs and do not constitute a guarantee of returns. Always consult a licensed financial adviser.
      </div>

      <div className="calc-grid">
        <div className="calc-form card">
          <h3>Property</h3>
          <div className="form-group">
            <label>Purchase Price ($)</label>
            <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Weekly Rent ($)</label>
            <input type="number" value={weeklyRent} onChange={e => setWeeklyRent(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>State</label>
            <select value={state} onChange={e => setState(e.target.value)}>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <h3>Financing</h3>
          <div className="form-group">
            <label>Deposit (%)</label>
            <input type="number" min="1" max="100" step="1" value={depositPct} onChange={e => setDepositPct(Number(e.target.value))} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>% of purchase price</span>
          </div>
          <div className="form-group">
            <label>Interest Rate (%)</label>
            <input type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
          </div>

          <h3>Holding Costs (annual)</h3>
          <div className="form-group">
            <label>Strata / Body Corporate ($/wk)</label>
            <input type="number" value={strata} onChange={e => setStrata(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Council Rates ($/qtr)</label>
            <input type="number" value={rates} onChange={e => setRates(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Water Rates ($/qtr)</label>
            <input type="number" value={water} onChange={e => setWater(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Insurance ($/yr)</label>
            <input type="number" value={insurance} onChange={e => setInsurance(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>PM Fee (%)</label>
            <input type="number" step="0.5" value={pmFeePct} onChange={e => setPmFeePct(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Vacancy (weeks/yr)</label>
            <input type="number" value={vacancyWeeks} onChange={e => setVacancyWeeks(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label>Maintenance (%)</label>
            <input type="number" step="1" value={maintenancePct} onChange={e => setMaintenancePct(Number(e.target.value))} />
          </div>

          <h3>Tax (optional)</h3>
          <div className="form-group">
            <label>Salary ($/yr)</label>
            <input type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} />
          </div>

          <button className="btn btn-primary btn-full" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Calculate ROI'}
          </button>
        </div>

        {result && !result.error && (
          <div className="calc-results card calc-result-card calc-result-animate">
            <h2>Investment Analysis</h2>
            <div className="result-highlight dual">
              <div className="metric-block">
                <div className="big-number">{result.netYield}%</div>
                <p>Net Yield</p>
              </div>
              <div className="metric-block">
                <div className="big-number">{result.cashOnCashReturn}%</div>
                <p>Cash-on-Cash</p>
              </div>
            </div>
            <div className={`gearing-badge ${result.gearing.toLowerCase()}`}>
              {result.gearing} Gearing
            </div>
            <div className="result-breakdown">
              <div className="result-row">
                <span>Weekly Cashflow</span>
                <strong className={result.weeklyCashflow >= 0 ? 'positive' : 'negative'}>
                  ${result.weeklyCashflow?.toLocaleString()}
                </strong>
              </div>
              <div className="result-row">
                <span>Annual Net Income</span>
                <strong className={result.annualNetIncome >= 0 ? 'positive' : 'negative'}>
                  ${result.annualNetIncome?.toLocaleString()}
                </strong>
              </div>
              <div className="result-row">
                <span>Total Upfront</span>
                <strong>${result.totalUpfrontCosts?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Stamp Duty</span>
                <strong>${result.stampDuty?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Annual Interest</span>
                <strong>${result.annualInterest?.toLocaleString()}</strong>
              </div>
              <div className="result-row">
                <span>Total Annual Expenses</span>
                <strong>${result.totalAnnualExpenses?.toLocaleString()}</strong>
              </div>
              {result.taxSaving > 0 && (
                <div className="result-row highlight">
                  <span>Tax Benefit (negative gearing)</span>
                  <strong>${result.taxSaving?.toLocaleString()}</strong>
                </div>
              )}
            </div>
            <div className="data-attribution">
              Source: ATO marginal rates &middot; State Revenue Office {state}
            </div>
            <div className="energy-cta-box">
              <p>Investing? <strong>Compare energy</strong> for the investment property.</p>
              <a href="/energy/compare" className="btn btn-primary btn-small">Compare Energy Plans ⚡</a>
            </div>
            <div className="calc-next-steps">
              <span>Also try:</span>
              <a href="/calculators/land-tax">Land Tax</a>
              <span>&middot;</span>
              <a href="/council-rates">Council Rates</a>
              <span>&middot;</span>
              <a href="/calculators/stamp-duty">Stamp Duty</a>
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
                <a href="/calculators/land-tax" className="what-next-item">
                  <span>📋</span> Land Tax
                </a>
              </div>
            </div>
            {result.netYield && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#fffbeb', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong>Yield context:</strong> Australian residential gross yields typically range 3&ndash;5%. Net yield after all costs is usually 1&ndash;3% lower. Your gross yield is {((weeklyRent * 52) / purchasePrice * 100).toFixed(2)}%.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
