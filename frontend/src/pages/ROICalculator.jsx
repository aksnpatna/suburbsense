import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';

const STATES = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];

const PRESETS = [
  { name: 'Melbourne Unit', price: 450000, rent: 450, state: 'VIC', strata: 80 },
  { name: 'Sydney Apartment', price: 750000, rent: 650, state: 'NSW', strata: 100 },
  { name: 'Brisbane House', price: 650000, rent: 550, state: 'QLD', strata: 0 },
  { name: 'Perth House', price: 550000, rent: 500, state: 'WA', strata: 0 },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a good rental yield in Australia?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Gross rental yields of 3–5% are typical for Australian capital cities. Net yield after costs, strata, rates and vacancy is usually 1–3% lower. Regional areas often yield higher but with lower capital growth."
      }
    },
    {
      "@type": "Question",
      "name": "What is cash-on-cash return?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cash-on-cash return measures annual pre-tax cashflow against the cash you invested (deposit + stamp duty + upfront costs). It shows how hard your actual dollars are working, unlike yield which is measured against the full purchase price."
      }
    },
    {
      "@type": "Question",
      "name": "Is negative gearing worth it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Negative gearing means rental costs exceed rental income, and the loss can be deducted against other income. Whether it's worth it depends on your tax rate and expected capital growth — a property losing $5,000/yr needs more than $5,000/yr in capital growth just to break even."
      }
    }
  ]
};

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
  const debounceRef = useRef(null);
  const isFirstRun = useRef(true);

  const calculate = async () => {
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

  // Auto-calculate on load with defaults
  useEffect(() => {
    calculate();
  }, []);

  // Live recalc with debounce
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => calculate(), 400);
    return () => clearTimeout(debounceRef.current);
  }, [purchasePrice, weeklyRent, state, depositPct, interestRate, strata, rates, water, insurance, pmFeePct, vacancyWeeks, maintenancePct, salary]);

  const applyPreset = (preset) => {
    setPurchasePrice(preset.price);
    setWeeklyRent(preset.rent);
    setState(preset.state);
    setStrata(preset.strata);
  };

  const yieldColor = (y) => y >= 4 ? 'var(--success-color)' : y >= 2.5 ? 'var(--warning-color)' : 'var(--error-color)';
  const cocColor = (c) => c >= 8 ? 'var(--success-color)' : c >= 4 ? 'var(--warning-color)' : 'var(--error-color)';

  return (
    <div className="calculator-page">
      <Helmet>
        <title>Investment Property Calculator — Net Yield, Cashflow & ROI | SuburbSense</title>
        <meta name="description" content="Calculate net yield, cash-on-cash return and weekly cashflow for investment properties. Includes stamp duty, land tax, negative gearing. Free calculator." />
        <meta property="og:title" content="Investment Property Calculator — SuburbSense" />
        <meta property="og:description" content="Calculate net yield, cash-on-cash return and weekly cashflow for investment properties. Free calculator." />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="calc-header">
        <h1>Investment Property Calculator</h1>
        <p>Calculate net yield, cashflow and ROI for investment properties.</p>
      </div>

      <div className="investment-warning-banner">
        <strong>General information only.</strong> SuburbSense is not a licensed financial adviser (AFSL) or credit licensee (ACL). Nothing on this site constitutes financial product advice. Property investment involves risk including potential loss of capital. These figures are estimates based on your inputs and do not constitute a guarantee of returns. Always consult a licensed financial adviser.
      </div>

      <div className="presets-row">
        <span className="presets-label">Quick presets:</span>
        {PRESETS.map(p => (
          <button key={p.name} className="preset-chip" onClick={() => applyPreset(p)}>
            {p.name}
          </button>
        ))}
      </div>

      <div className="calc-grid">
        <div className="calc-form card">
          <h3>Property</h3>
          <div className="form-group">
            <label htmlFor="roi-price">Purchase Price ($)</label>
            <input id="roi-price" type="number" value={purchasePrice} onChange={e => setPurchasePrice(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label htmlFor="roi-rent">Weekly Rent ($)</label>
            <input id="roi-rent" type="number" value={weeklyRent} onChange={e => setWeeklyRent(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label htmlFor="roi-state">State</label>
            <select id="roi-state" value={state} onChange={e => setState(e.target.value)}>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <h3>Financing</h3>
          <div className="form-group">
            <label htmlFor="roi-deposit">Deposit (%)</label>
            <input id="roi-deposit" type="number" min="1" max="100" step="1" value={depositPct} onChange={e => setDepositPct(Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label htmlFor="roi-rate">Interest Rate (%)</label>
            <input id="roi-rate" type="number" step="0.1" value={interestRate} onChange={e => setInterestRate(Number(e.target.value))} />
          </div>

          <details className="form-section-collapsible">
            <summary>Holding Costs (annual)</summary>
            <div className="form-group">
              <label htmlFor="roi-strata">Strata / Body Corporate ($/wk)</label>
              <input id="roi-strata" type="number" value={strata} onChange={e => setStrata(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="roi-rates">Council Rates ($/qtr)</label>
              <input id="roi-rates" type="number" value={rates} onChange={e => setRates(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="roi-water">Water Rates ($/qtr)</label>
              <input id="roi-water" type="number" value={water} onChange={e => setWater(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="roi-insurance">Insurance ($/yr)</label>
              <input id="roi-insurance" type="number" value={insurance} onChange={e => setInsurance(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="roi-pm">PM Fee (%)</label>
              <input id="roi-pm" type="number" step="0.5" value={pmFeePct} onChange={e => setPmFeePct(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="roi-vacancy">Vacancy (weeks/yr)</label>
              <input id="roi-vacancy" type="number" value={vacancyWeeks} onChange={e => setVacancyWeeks(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label htmlFor="roi-maintenance">Maintenance (%)</label>
              <input id="roi-maintenance" type="number" step="1" value={maintenancePct} onChange={e => setMaintenancePct(Number(e.target.value))} />
            </div>
          </details>

          <h3>Tax (optional)</h3>
          <div className="form-group">
            <label htmlFor="roi-salary">Salary ($/yr)</label>
            <input id="roi-salary" type="number" value={salary} onChange={e => setSalary(Number(e.target.value))} />
          </div>

          <button className="btn btn-primary btn-full" onClick={calculate} disabled={loading}>
            {loading ? 'Calculating...' : 'Recalculate'}
          </button>
        </div>

        {result && !result.error && (
          <div className="calc-results card calc-result-card calc-result-animate">
            <h2>Investment Analysis</h2>

            <div className="verdict-card" style={{
              padding: '1rem 1.25rem', borderRadius: '12px', marginBottom: '1rem',
              background: result.weeklyCashflow >= 0 ? 'var(--success-bg, #ecfdf5)' : 'var(--error-bg, #fef2f2)',
              border: `1px solid ${result.weeklyCashflow >= 0 ? 'var(--success-border, #a7f3d0)' : 'var(--error-border, #fecaca)'}`
            }}>
              <strong>{result.weeklyCashflow >= 0 ? '✅ Positively geared' : '⚠️ Negatively geared'}</strong>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
                This property {result.weeklyCashflow >= 0 ? 'pays you' : 'costs you'} roughly
                <strong> ${Math.abs(result.weeklyCashflow).toLocaleString()}/week</strong>
                out of pocket after all costs{result.taxSaving > 0 && `, or ~$${Math.abs(result.weeklyCashflow - result.taxSaving / 52).toFixed(0)}/week after tax benefits`}.
                {result.netYield >= 4 ? ' Yield is above the typical 3–5% range — verify why.' : result.netYield < 2 ? ' Yield is below the typical 3–5% range — common in capital-growth areas.' : ' Yield is in the typical Australian range (3–5%).'}
              </p>
            </div>

            <div className="result-highlight dual">
              <div className="metric-block">
                <div className="big-number" style={{ color: yieldColor(result.netYield) }}>{result.netYield}%</div>
                <p>Net Yield</p>
              </div>
              <div className="metric-block">
                <div className="big-number" style={{ color: cocColor(result.cashOnCashReturn) }}>{result.cashOnCashReturn}%</div>
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
              <div className="yield-context-box">
                <strong>Yield context:</strong> Australian residential gross yields typically range 3–5%. Net yield after all costs is usually 1–3% lower. Your gross yield is {((weeklyRent * 52) / purchasePrice * 100).toFixed(2)}%.
              </div>
            )}
          </div>
        )}
      </div>

      <section className="calc-faq">
        <h3>Frequently Asked Questions</h3>
        <div className="faq-item">
          <h4>What is a good rental yield in Australia?</h4>
          <p>Gross rental yields of 3–5% are typical for Australian capital cities. Net yield after costs, strata, rates and vacancy is usually 1–3% lower. Regional areas often yield higher but with lower capital growth.</p>
        </div>
        <div className="faq-item">
          <h4>What is cash-on-cash return?</h4>
          <p>Cash-on-cash return measures annual pre-tax cashflow against the cash you invested (deposit + stamp duty + upfront costs). It shows how hard your actual dollars are working, unlike yield which is measured against the full purchase price.</p>
        </div>
        <div className="faq-item">
          <h4>Is negative gearing worth it?</h4>
          <p>Negative gearing means rental costs exceed rental income, and the loss can be deducted against other income. Whether it's worth it depends on your tax rate and expected capital growth — a property losing $5,000/yr needs more than $5,000/yr in capital growth just to break even.</p>
        </div>
      </section>
    </div>
  );
}
