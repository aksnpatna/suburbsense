import React, { useState } from 'react';

export function ComparePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Parse query parameters from URL
  const vertical = new URLSearchParams(window.location.search).get('vertical');
  const suburb = new URLSearchParams(window.location.search).get('suburb');

  const verticalNames = {
    energy: 'Energy Plans',
    internet: 'Internet Plans',
    health: 'Health Cover'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/leads/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          vertical: vertical || 'energy',
          suburb_slug: suburb || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || 'Failed to save lead');
      }

      setMessage('Thank you! We will notify you when comparison links are available.');
      setEmail('');
    } catch (err) {
      console.error('Lead submission error:', err);
      setMessage(err.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="compare-page">
        <div className="page-header">
          <h1>
            🔄 Compare {verticalNames[vertical] || 'Plans'} <span className="beta-tag">(Coming Soon)</span>
          </h1>
          <p>We're currently setting up our partner comparison links. Enter your email below to get notified when we launch!</p>
        </div>

        <div className="coming-soon-card">
          <div className="card-content">
            <h2>What's Coming?</h2>
            <ul>
              <li>Compare plans from multiple providers</li>
              <li>Personalized recommendations based on your suburb</li>
              <li>Exclusive deals and promotions</li>
              <li>Transparent pricing with no hidden fees</li>
              <li>Easy switching process</li>
            </ul>

            <div className="waitlist-form">
              <h3>Get Notified</h3>
              <p>Enter your email to receive updates about our comparison service</p>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="email-input"
                  required
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Subscribing...' : 'Subscribe'}
                </button>
              </form>
              {message && (
                <div className={`form-message ${message.startsWith('Thank') ? 'success' : 'error'}`}>
                  {message}
                </div>
              )}
            </div>

            <div className="contact-info">
              <h3>Questions?</h3>
              <p>Contact us at <a href="mailto:support@example.com">support@example.com</a></p>
            </div>
          </div>
        </div>

        <div className="partners-section">
          <h2>Our Future Partners</h2>
          <div className="partners-grid">
            <div className="partner-card">
              <div className="partner-logo">⚡</div>
              <div className="partner-name">Energy Australia</div>
              <div className="partner-description">Australia's leading energy provider</div>
            </div>
            <div className="partner-card">
              <div className="partner-logo">📶</div>
              <div className="partner-name">Optus</div>
              <div className="partner-description">Fast and reliable internet plans</div>
            </div>
            <div className="partner-card">
              <div className="partner-logo">🏥</div>
              <div className="partner-name">Bupa</div>
              <div className="partner-description">Comprehensive health insurance</div>
            </div>
            <div className="partner-card">
              <div className="partner-logo">🌐</div>
              <div className="partner-name">TPG</div>
              <div className="partner-description">Value-packed internet deals</div>
            </div>
          </div>
          <p className="partners-disclaimer">
            Partnerships are currently being finalised. All logos are for illustrative purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
