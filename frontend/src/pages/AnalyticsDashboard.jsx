import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/summary')
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch analytics');
        return r.json();
      })
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'var(--error-color)' }}>
        <h3>Error loading analytics</h3>
        <p>{error}</p>
      </div>
    );
  }

  const maxViews = Math.max(...(data.daily_traffic.map(d => d.views) || [0]), 1);

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1000px' }}>
      <Helmet>
        <title>Analytics Dashboard | SuburbSense</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Site Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Internal traffic and usage dashboard</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Unique Visitors (24h)</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.visitors.today.toLocaleString()}</div>
        </div>
        <div className="card glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--info-color)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Unique Visitors (7d)</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.visitors.week.toLocaleString()}</div>
        </div>
        <div className="card glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success-color)' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Unique Visitors (30d)</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{data.visitors.month.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Daily Traffic Chart (Pure CSS) */}
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Traffic Last 7 Days (Page Views)</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '200px', gap: '0.5rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)', position: 'relative' }}>
            {data.daily_traffic.map((day, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <div style={{
                  width: '100%',
                  backgroundColor: 'var(--primary-color)',
                  height: `${(day.views / maxViews) * 100}%`,
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.8,
                  transition: 'height 1s ease',
                  minHeight: '4px',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '-25px', width: '100%', textAlign: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                    {day.views}
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: '-2rem', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'top left', marginTop: '0.5rem' }}>
                  {new Date(day.date).toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages Table */}
        <div className="card glass-panel" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Top Pages (Last 24h)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)' }}>Path</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Views</th>
                  <th style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', textAlign: 'right' }}>Unique</th>
                </tr>
              </thead>
              <tbody>
                {data.top_pages.map((page, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={page.path}>
                      {page.path}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 500 }}>{page.views}</td>
                    <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', color: 'var(--text-secondary)' }}>{page.unique}</td>
                  </tr>
                ))}
                {data.top_pages.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No traffic recorded yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Mobile override for the 2-col grid */}
      <style>{`
        @media (max-width: 768px) {
          .container > div:nth-child(4) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
