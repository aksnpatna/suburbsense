import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const calculators = [
  {
    path: '/calculators/stamp-duty',
    icon: '🏠',
    title: 'Stamp Duty Calculator',
    description: 'Calculate stamp duty, transfer fees, mortgage registration and LMI for any Australian state.',
    audience: 'Home buyers',
    tag: 'Popular',
  },
  {
    path: '/calculators/affordability',
    icon: '💰',
    title: 'Affordability Calculator',
    description: 'How much can you borrow? What will it cost each month? Includes LMI and FHBG eligibility.',
    audience: 'First home buyers',
    tag: 'Essential',
  },
  {
    path: '/calculators/roi',
    icon: '📈',
    title: 'Investment Property ROI',
    description: 'Net yield, cash-on-cash return, weekly cashflow. After ALL costs — rates, strata, land tax, maintenance.',
    audience: 'Investors',
    tag: 'Detailed',
  },
  {
    path: '/fhbg',
    icon: '🏡',
    title: 'First Home Guarantee',
    description: 'Can you use the 5% deposit scheme? No LMI, no income cap, unlimited places.',
    audience: 'First home buyers',
    tag: '2026',
  },
  {
    path: '/land-tax',
    icon: '📋',
    title: 'Land Tax Calculator',
    description: 'Estimate annual land tax for investment properties. Includes foreign owner surcharge.',
    audience: 'Investors',
    tag: '',
  },
  {
    path: '/council-rates',
    icon: '🏛️',
    title: 'Council Rates Estimator',
    description: 'Estimate annual council rates for any property. Varies significantly by council area.',
    audience: 'All buyers',
    tag: '',
  },
  {
    path: '/energy/compare',
    icon: '⚡',
    title: 'Compare Energy Plans',
    description: 'Moving? Compare electricity and gas plans from 30+ retailers matched to your postcode.',
    audience: 'Everyone moving',
    tag: 'via CIMET ↗',
  },
  {
    path: '/nbn',
    icon: '📶',
    title: 'NBN Technology Check',
    description: 'FTTP, HFC, FTTN? Check what\'s available at any address before you buy.',
    audience: 'All buyers',
    tag: '',
  },
];

export function CalculatorsHub() {
  return (
    <div className="container">
      <Helmet>
        <title>Calculators Hub — Stamp Duty, Affordability, ROI & More | SuburbSense</title>
        <meta name="description" content="Free Australian property calculators: stamp duty, borrowing power, ROI, land tax, council rates, FHBG eligibility. All run in your browser — your data stays on device." />
        <link rel="canonical" href="https://suburbsense.com.au/calculators" />
      </Helmet>

      <div className="calculators-hub-page">
        <div className="calc-header">
          <h1>Calculators & Tools</h1>
          <p>Free property and utility calculators. All run in your browser — your data stays on device, no login required.</p>
        </div>

        <div className="calculator-hub-grid">
          {calculators.map((calc) => (
            <Link key={calc.path} to={calc.path} className="calculator-hub-card">
              <div className="hub-card-icon">{calc.icon}</div>
              <div className="hub-card-content">
                <div className="hub-card-header">
                  <h3>{calc.title}</h3>
                  {calc.tag && <span className="hub-card-tag">{calc.tag}</span>}
                </div>
                <p>{calc.description}</p>
                <span className="hub-card-audience">{calc.audience}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="calculators-hub-disclaimer">
          <p><strong>General information only.</strong> All calculators provide estimates based on published government rates. Actual amounts depend on your individual circumstances. SuburbSense is not a licensed financial adviser. Always verify with the relevant authority before making financial decisions.</p>
        </div>
      </div>
    </div>
  );
}
