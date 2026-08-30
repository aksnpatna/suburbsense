import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export function ROISnapshot({ state }) {
  const [purchasePrice, setPurchasePrice] = useState(600000);
  const [weeklyRent, setWeeklyRent] = useState(550);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Debounce API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateROI();
    }, 400);
    return () => clearTimeout(timer);
  }, [purchasePrice, weeklyRent, state]);

  const calculateROI = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/calculators/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePrice,
          weeklyRent,
          state: state || 'NSW',
          depositPct: 0.20,
          interestRate: 6.2,
          strata: 0,
          rates: 1200,
          water: 600,
          insurance: 1200,
          pmFeePct: 6,
          vacancyWeeks: 2,
          maintenancePct: 5,
          salary: 100000,
        }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
      setResult(null);
    }
    setLoading(false);
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(val);

  return (
    <section className="roi-snapshot" style={{ margin: '3rem 0', background: 'var(--surface-alt)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        
        {/* Left Side: Inputs */}
        <div style={{ flex: '1 1 300px' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📈 Investment Snapshot
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Adjust the purchase price and rent to see instant cashflow and yield estimates for this area.
          </p>

          <div style={{ marginBottom: '1.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Purchase Price</label>
              <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatCurrency(purchasePrice)}</span>
            </div>
            <input 
              type="range" 
              min="200000" 
              max="2000000" 
              step="10000" 
              value={purchasePrice} 
              onChange={(e) => setPurchasePrice(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Weekly Rent</label>
              <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>{formatCurrency(weeklyRent)}</span>
            </div>
            <input 
              type="range" 
              min="200" 
              max="1500" 
              step="10" 
              value={weeklyRent} 
              onChange={(e) => setWeeklyRent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
            />
          </div>
        </div>

        {/* Right Side: Results */}
        <div style={{ flex: '1 1 300px', background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative' }}>
          {loading && <div style={{ position: 'absolute', top: 10, right: 10, fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Calculating...</div>}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Yield</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{result?.gross_yield_pct != null ? result.gross_yield_pct.toFixed(2) : '--'}%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Yield</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--info-color)' }}>{result?.net_yield_pct != null ? result.net_yield_pct.toFixed(2) : '--'}%</div>
            </div>
          </div>

          <div style={{ padding: '1rem', background: result?.weekly_cashflow >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: `1px solid ${result?.weekly_cashflow >= 0 ? '#10b981' : '#ef4444'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: result?.weekly_cashflow >= 0 ? '#047857' : '#b91c1c' }}>ESTIMATED CASHFLOW</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: result?.weekly_cashflow >= 0 ? '#10b981' : '#ef4444' }}>
                {result ? formatCurrency(Math.abs(result.weekly_cashflow)) : '--'} / wk
              </div>
            </div>
            <div style={{ fontSize: '1.5rem' }}>{result?.weekly_cashflow >= 0 ? '📈' : '📉'}</div>
          </div>

          <Link to={`/calculators/roi?price=${purchasePrice}&rent=${weeklyRent}&state=${state}`} className="btn btn-outline" style={{ width: '100%', marginTop: '1rem', textAlign: 'center' }}>
            View Full Calculation →
          </Link>
          <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.75rem', textAlign: 'center' }}>
            Estimates only. Not financial advice.
          </p>
        </div>
      </div>
    </section>
  );
}
