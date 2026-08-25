import React, { useState } from 'react';
import { useSavedSuburbs } from '../hooks/useSuburbLibrary';

/**
 * Heart toggle that saves a suburb to the visitor's own browser
 * (localStorage only — no account, no cookies, nothing sent to us).
 */
export function SaveSuburbButton({ suburb }) {
  const { isSaved, toggleSaved } = useSavedSuburbs();
  const [pop, setPop] = useState(false);
  const saved = isSaved(suburb.slug);

  const handleClick = (e) => {
    e.preventDefault();
    const nowSaved = toggleSaved(suburb);
    if (nowSaved) {
      setPop(true);
      setTimeout(() => setPop(false), 400);
    }
  };

  return (
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
  );
}

/**
 * Optional email capture for score-change alerts on a specific suburb.
 * Uses the existing /api/leads endpoint.
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
