import { Helmet } from 'react-helmet-async';
import { useState, useEffect } from 'react';

export function EnergyCompare() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus('');
    
    try {
      const resp = await fetch('/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, vertical: 'energy', suburb_slug: '' })
      });
      if (!resp.ok) throw new Error('Failed to subscribe');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="calculator-page">
      <Helmet>
        <title>Compare Energy Plans — Coming Soon | SuburbSense</title>
        <meta name="description" content="We are integrating with top Australian energy providers to bring you the best electricity and gas plan comparisons directly inside SuburbSense." />
        <link rel="canonical" href="https://suburbsense.com/energy/compare" />
      </Helmet>

      <div className="calc-header" style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡️</div>
        <h1>Energy Comparison</h1>
        <div style={{ display: 'inline-block', background: 'var(--primary-color)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>
          COMING SOON
        </div>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
          We're currently finalising our integration with our comparison partners to bring you live electricity and gas rates directly within SuburbSense.
        </p>
      </div>

      <div className="calc-grid" style={{ maxWidth: '800px', margin: '0 auto', gridTemplateColumns: '1fr' }}>
        <div className="calc-form card glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Want early access?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Drop your email below and we'll notify you the moment our new energy comparison tool goes live.
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px', margin: '0 auto', flexDirection: 'column' }}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.75rem' }}>
              {loading ? 'Submitting...' : 'Notify Me'}
            </button>
          </form>
          
          {status === 'success' && (
            <div style={{ marginTop: '1rem', color: 'var(--success-color)', fontWeight: 500 }}>
              Thanks! We'll let you know as soon as it's ready.
            </div>
          )}
          {status === 'error' && (
            <div style={{ marginTop: '1rem', color: 'var(--error-color)', fontWeight: 500 }}>
              Oops, something went wrong. Please try again.
            </div>
          )}
        </div>

        <div className="calc-results card glass-panel" style={{ marginTop: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>What to expect</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Live Market Rates</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Compare actual electricity and gas plans matched exactly to your suburb.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Transparent Comparison</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>No hidden fees. See exactly what you'll pay based on your usage.</p>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
              <h4 style={{ marginBottom: '0.25rem' }}>Instant Switching</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Sign up to a better deal in minutes without leaving the platform.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
