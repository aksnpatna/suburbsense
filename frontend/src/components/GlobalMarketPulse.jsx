import React, { useState, useEffect } from 'react';

export function GlobalMarketPulse() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/news/global')
      .then(r => r.json())
      .then(data => {
        setNews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch global news:", err);
        setLoading(false);
      });
  }, []);

  if (loading || news.length === 0) {
    return null; // hide entirely if no data
  }

  // Format mapping
  const formatMap = {
    'interest_rates': { title: 'RBA & Interest Rates', icon: '🏦' },
    'supply_demand': { title: 'Housing Supply & Demand', icon: '🏗️' },
    'infrastructure': { title: 'Major Infrastructure', icon: '🚆' },
    'clearance_rates': { title: 'Auction Clearance Rates', icon: '🔨' },
    'government_policies': { title: 'Govt Grants & Policies', icon: '📜' }
  };

  const getSentimentStyle = (label) => {
    const l = (label || '').toLowerCase();
    if (l.includes('positive') || l.includes('bullish')) return { bg: 'var(--success-bg, #dcfce7)', text: 'var(--success-color)', dot: '#22c55e' };
    if (l.includes('negative') || l.includes('bearish')) return { bg: 'var(--error-bg, #fee2e2)', text: 'var(--error-color)', dot: '#ef4444' };
    return { bg: 'var(--surface-alt)', text: 'var(--text-secondary)', dot: '#64748b' };
  };

  return (
    <section className="global-pulse-section reveal-up" style={{ padding: '4rem 0', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <h2>National Market Intelligence</h2>
          <p>AI-synthesized insights on the macroeconomic factors driving the Australian property market.</p>
        </div>

        <div className="market-pulse-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {news.map((item) => {
            const format = formatMap[item.topic] || { title: item.topic, icon: '📊' };
            const style = getSentimentStyle(item.sentiment_label);

            return (
              <div key={item.topic} className="market-pulse-card reveal-stagger" style={{
                background: 'var(--surface-color)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{format.icon}</span>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{format.title}</h3>
                  </div>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    backgroundColor: style.bg,
                    color: style.text
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: style.dot }}></span>
                    {item.sentiment_label || 'Neutral'}
                  </span>
                </div>
                
                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.summary}
                </p>
                
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Based on {item.articles_analyzed} sources • Updated {new Date(item.last_updated).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="ai-disclaimer" style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>
          🤖 This market intelligence is synthesized by AI using publicly available news and is for educational purposes only. It does not constitute financial advice.
        </div>
      </div>
    </section>
  );
}
