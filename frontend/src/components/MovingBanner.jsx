import React from 'react';
import { trackAffiliateClick } from '../config/affiliates';

export function MovingBanner({ config, suburbName }) {
  if (!config || !config.enabled) return null;

  return (
    <div className="moving-banner">
      <div className="moving-icon">📦</div>
      <div className="moving-content">
        <h3>Moving to {suburbName}?</h3>
        <p>{config.description}</p>
      </div>
      <div className="moving-action">
        <a 
          href={config.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary"
          style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
          onClick={() => trackAffiliateClick(config.partnerName, 'Moving')}
        >
          {config.ctaText}
        </a>
      </div>

      <style>{`
        .moving-banner {
          display: flex;
          align-items: center;
          background: #1e293b;
          color: white;
          border-radius: 12px;
          padding: 2rem;
          margin-top: 3rem;
          gap: 2rem;
        }
        .moving-icon {
          font-size: 3rem;
          background: rgba(255,255,255,0.1);
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .moving-content {
          flex: 1;
        }
        .moving-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.4rem;
          color: white;
        }
        .moving-content p {
          margin: 0;
          color: #cbd5e1;
          font-size: 0.95rem;
        }
        .moving-action .btn {
          padding: 0.75rem 2rem;
          font-weight: bold;
          font-size: 1rem;
          white-space: nowrap;
        }
        @media (max-width: 768px) {
          .moving-banner {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
            gap: 1rem;
          }
          .moving-icon {
            width: 60px;
            height: 60px;
            font-size: 2rem;
          }
          .moving-action {
            width: 100%;
          }
          .moving-action .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
