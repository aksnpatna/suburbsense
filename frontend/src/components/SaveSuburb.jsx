import React, { useState } from 'react';
import { useSavedSuburbs } from '../hooks/useSuburbLibrary';

/**
 * Heart toggle that saves a suburb to the visitor's own browser.
 * After saving, shows a gentle email capture for suburb alerts.
 */
export function SaveSuburbButton({ suburb }) {
  const { isSaved, toggleSaved } = useSavedSuburbs();
  const [pop, setPop] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [email, setEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const saved = isSaved(suburb.slug);

  const handleClick = (e) => {
    e.preventDefault();
    const nowSaved = toggleSaved(suburb);
    if (nowSaved) {
      setPop(true);
      setTimeout(() => setPop(false), 400);
      // Show email prompt after a short delay if not already submitted
      if (!emailMsg) {
        setTimeout(() => setShowEmailPrompt(true), 600);
      }
    } else {
      setShowEmailPrompt(false);
    }
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    setEmailLoading(true);
    try {
      const resp = await fetch('/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          vertical: 'watchlist',
          suburb_slug: suburb.slug,
        }),
      });
      if (!resp.ok) throw new Error('Failed');
      setEmailMsg('success');
      setShowEmailPrompt(false);
    } catch {
      setEmailMsg('error');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        className={`save-suburb-btn ${saved ? 'saved' : ''} ${pop ? 'pop' : ''}`}
        onClick={handleClick}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${suburb.name} from saved suburbs` : `Save ${suburb.name} to your suburbs`}
        title={saved ? 'Saved — stored only in your browser' : 'Save to your suburbs — stored only in your browser, no account needed'}
      >
        <span className="save-suburb-heart" aria-hidden="true">{saved ? '❤️' : '🤍'}</span>
        <span className="save-suburb-label">{saved ? 'Saved' : 'Save'}</span>
      </button>

      {/* Email capture popup — appears after saving */}
      {showEmailPrompt && emailMsg !== 'success' && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          zIndex: 100,
          background: 'var(--surface-color)',
          border: '1px solid var(--primary-color)',
          borderRadius: '12px',
          padding: '1rem',
          width: '260px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          animation: 'fadeInDown 0.2s ease',
        }}>
          <button
            onClick={() => setShowEmailPrompt(false)}
            style={{ position: 'absolute', top: '8px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text-secondary)' }}
            aria-label="Close"
          >×</button>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.25rem', paddingRight: '1rem' }}>
            🔔 Get updates for {suburb.name}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            We'll email you when suburb data, news, or scores change.
          </p>
          <form onSubmit={submitEmail} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.85rem',
                background: 'var(--surface-alt)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={emailLoading}
              style={{
                padding: '0.5rem',
                background: 'var(--primary-color)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              {emailLoading ? '...' : 'Notify me'}
            </button>
          </form>
          {emailMsg === 'error' && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>Something went wrong — try again.</p>}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '0.4rem' }}>
            No spam. Unsubscribe anytime.
          </p>
        </div>
      )}
      {emailMsg === 'success' && saved && (
        <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'block', marginTop: '4px' }}>✅ You're on the list!</span>
      )}
    </div>
  );
}

/**
 * Share bar for a suburb page.
 * Uses Web Share API on mobile, falls back to pre-filled links on desktop.
 */
export function SuburbShareBar({ suburb, score }) {
  const [copied, setCopied] = useState(false);
  const url = `https://suburbsense.com.au/suburb/${suburb.slug}`;
  const text = `I'm researching ${suburb.name} ${suburb.state} ${suburb.postcode} — Overall score ${score}/100. Check it out on SuburbSense 🏘️`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${suburb.name} — SuburbSense`, text, url });
      } catch { /* user cancelled */ }
    } else {
      // Copy to clipboard fallback
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch { }
    }
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.85rem',
    borderRadius: '20px',
    border: '1px solid var(--border-color)',
    background: 'var(--surface-alt)',
    color: 'var(--text-secondary)',
    fontSize: '0.82rem',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>Share:</span>
      <button onClick={handleNativeShare} style={btnStyle}
        onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--primary-color)'; e.currentTarget.style.color = 'var(--primary-color)'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        {copied ? '✅ Copied!' : '🔗 Copy link'}
      </button>
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}
        onMouseOver={e => { e.currentTarget.style.borderColor = '#25d366'; e.currentTarget.style.color = '#25d366'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        💬 WhatsApp
      </a>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}
        onMouseOver={e => { e.currentTarget.style.borderColor = '#1da1f2'; e.currentTarget.style.color = '#1da1f2'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        🐦 X / Twitter
      </a>
      <a href={facebookUrl} target="_blank" rel="noopener noreferrer" style={btnStyle}
        onMouseOver={e => { e.currentTarget.style.borderColor = '#1877f2'; e.currentTarget.style.color = '#1877f2'; }}
        onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        📘 Facebook
      </a>
    </div>
  );
}

/**
 * Optional email capture for score-change alerts on a specific suburb.
 */
export function SuburbAlertSignup({ suburb }) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMsg('');
    try {
      const resp = await fetch('/api/leads/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          email,
          vertical: 'energy',
          suburb_slug: suburb.slug,
        }),
      });
      if (!resp.ok) throw new Error('Failed');
      setMsg('success');
    } catch {
      setMsg('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alert-signup">
      {!open ? (
        <button type="button" className="btn btn-secondary" onClick={() => setOpen(true)}>
          🔔 Get alerts for {suburb.name}
        </button>
      ) : msg === 'success' ? (
        <p className="alert-signup-success">✅ Done! We'll email you when data for {suburb.name} changes.</p>
      ) : (
        <form className="alert-signup-form" onSubmit={submit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="alert-signup-input"
            aria-label="Email for suburb alerts"
          />
          <button type="submit" className="btn btn-primary btn-small" disabled={loading}>
            {loading ? '...' : 'Notify me'}
          </button>
          {msg === 'error' && <p className="alert-signup-error">Something went wrong — try again.</p>}
          <p className="alert-signup-privacy">Only used for {suburb.name} updates. Unsubscribe anytime.</p>
        </form>
      )}
    </div>
  );
}
