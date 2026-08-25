import React from 'react';
import { Link } from 'react-router-dom';
import { useSavedSuburbs, useRecentSuburbs } from '../hooks/useSuburbLibrary';

function SuburbChip({ suburb, onRemove, removeLabel }) {
  return (
    <div className="suburb-chip">
      <Link to={`/suburb/${suburb.slug}`} className="suburb-chip-link">
        <span className="suburb-chip-name">{suburb.name}</span>
        <span className="suburb-chip-meta">{suburb.state} {suburb.postcode}</span>
        {typeof suburb.score === 'number' && (
          <span className="suburb-chip-score">{suburb.score}/100</span>
        )}
      </Link>
      {onRemove && (
        <button
          type="button"
          className="suburb-chip-remove"
          onClick={() => onRemove(suburb.slug)}
          aria-label={removeLabel || `Remove ${suburb.name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}

/**
 * Retention rails for the homepage: visitor's saved suburbs + recently viewed.
 * Rendered only when the visitor has actually used the feature.
 */
export function SuburbLibraryRails() {
  const { saved, toggleSaved } = useSavedSuburbs();
  const { recent, removeRecent } = useRecentSuburbs();

  if (saved.length === 0 && recent.length === 0) return null;

  return (
    <section className="suburb-library section-reveal">
      {saved.length > 0 && (
        <div className="suburb-library-block">
          <div className="suburb-library-header">
            <h2>❤️ Your Suburbs</h2>
            <span className="suburb-library-hint">Saved in your browser — no account needed</span>
          </div>
          <div className="suburb-chip-row">
            {saved.map((s) => (
              <SuburbChip key={s.slug} suburb={s} onRemove={(slug) => toggleSaved(s)} removeLabel={`Unsave ${s.name}`} />
            ))}
          </div>
        </div>
      )}
      {recent.length > 0 && (
        <div className="suburb-library-block">
          <div className="suburb-library-header">
            <h2>🕘 Recently Viewed</h2>
          </div>
          <div className="suburb-chip-row">
            {recent.map((s) => (
              <SuburbChip key={s.slug} suburb={s} onRemove={removeRecent} removeLabel={`Remove ${s.name} from history`} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
