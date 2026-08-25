import React from 'react';

/** Simple tab navigation component */
export function Tabs({ tabs, active, setActive }) {
  return (
    <nav className="tabs-nav" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`tab-btn ${active === t.id ? 'active' : ''}`}
          onClick={() => setActive(t.id)}
          role="tab"
          aria-selected={active === t.id}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
