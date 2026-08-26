import React, { useState, useEffect } from 'react';

const CONSENT_KEY = 'suburbsense_analytics_consent';

export function useAnalyticsConsent() {
  const [consent, setConsent] = useState(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    return stored === 'true';
  });
  const [showBanner, setShowBanner] = useState(() => {
    return localStorage.getItem(CONSENT_KEY) === null;
  });

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setConsent(true);
    setShowBanner(false);
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, 'false');
    setConsent(false);
    setShowBanner(false);
  };

  return { consent, showBanner, accept, decline };
}

export function CookieBanner({ onAccept, onDecline, visible }) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'var(--surface)',
      borderTop: '1px solid var(--border-color)',
      padding: '1rem 1.5rem',
      zIndex: 9999,
      boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        maxWidth: 900,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <p style={{ flex: 1, margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', minWidth: 250 }}>
          We use basic analytics to understand how visitors use this site. This includes your IP address, browser type, and pages visited — used only for aggregated traffic measurement, never for advertising. See our{' '}
          <a href="/privacy" style={{ color: 'var(--primary-color)' }}>Privacy Policy</a>.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button onClick={onDecline} style={{
            padding: '0.5rem 1rem',
            border: '1px solid var(--border-color)',
            background: 'transparent',
            color: 'var(--text-secondary)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}>
            Decline
          </button>
          <button onClick={onAccept} style={{
            padding: '0.5rem 1rem',
            border: 'none',
            background: 'var(--primary-color)',
            color: '#fff',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
