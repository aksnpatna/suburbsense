import React from 'react';
import { trackAffiliateClick } from '../config/affiliates';

export function TopPicksCard({ title, categoryConfig }) {
  if (!categoryConfig || !categoryConfig.enabled || !categoryConfig.topPicks?.length) {
    return null;
  }

  return (
    <div className="affiliate-card">
      <h3 className="affiliate-title">{title}</h3>
      <div className="affiliate-picks">
        {categoryConfig.topPicks.map((pick) => (
          <div key={pick.id} className="affiliate-pick-item">
            <div className="pick-icon">{pick.icon}</div>
            <div className="pick-content">
              <div className="pick-header">
                <strong>{pick.name}</strong>
                {pick.tag && <span className="pick-tag">{pick.tag}</span>}
              </div>
              <p className="pick-description">{pick.description}</p>
            </div>
            <a 
              href={pick.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-primary pick-btn"
              onClick={() => trackAffiliateClick(pick.id, title)}
            >
              View Plan
            </a>
          </div>
        ))}
      </div>

      <style>{`
        .affiliate-card {
          background: var(--surface-color, #fff);
          border: 1px solid var(--border-color, #e2e8f0);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 1.5rem;
        }
        .affiliate-title {
          font-size: 1.1rem;
          margin-top: 0;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .affiliate-picks {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .affiliate-pick-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--surface-alt, #f8fafc);
          border-radius: 8px;
          border: 1px solid var(--border-color, #e2e8f0);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .affiliate-pick-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .pick-icon {
          font-size: 1.5rem;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fff;
          border-radius: 50%;
          border: 1px solid var(--border-color, #e2e8f0);
          flex-shrink: 0;
        }
        .pick-content {
          flex: 1;
        }
        .pick-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .pick-tag {
          font-size: 0.7rem;
          padding: 2px 6px;
          background: var(--primary-color, #2563eb);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .pick-description {
          font-size: 0.85rem;
          color: var(--text-secondary, #64748b);
          margin: 0;
        }
        .pick-btn {
          white-space: nowrap;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }
        @media (max-width: 640px) {
          .affiliate-pick-item {
            flex-direction: column;
            align-items: flex-start;
          }
          .pick-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
