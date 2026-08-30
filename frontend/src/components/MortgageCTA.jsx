import React from 'react';
import { trackAffiliateClick } from '../config/affiliates';

export function MortgageCTA({ config }) {
  if (!config || !config.enabled) return null;

  return (
    <div className="mortgage-cta">
      <div className="mortgage-content">
        <h3>{config.ctaText}</h3>
        <p>{config.description}</p>
        <span className="powered-by">Powered by <strong>{config.partnerName}</strong></span>
      </div>
      <div className="mortgage-action">
        <a 
          href={config.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-primary cta-btn"
          onClick={() => trackAffiliateClick(config.partnerName, 'Mortgage')}
        >
          Check My Borrowing Power
        </a>
        <p className="micro-disclaimer">Estimate only. Not financial advice.</p>
      </div>

      <style>{`
        .mortgage-cta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
          border: 1px solid #bfdbfe;
          border-left: 4px solid var(--primary-color, #2563eb);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 2rem;
          gap: 2rem;
        }
        .mortgage-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          color: #1e293b;
        }
        .mortgage-content p {
          margin: 0 0 0.5rem 0;
          font-size: 0.9rem;
          color: #475569;
        }
        .powered-by {
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .cta-btn {
          white-space: nowrap;
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }
        .micro-disclaimer {
          font-size: 0.7rem;
          color: #94a3b8;
          margin-top: 0.5rem;
          text-align: center;
        }
        @media (max-width: 768px) {
          .mortgage-cta {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .mortgage-action, .cta-btn {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
