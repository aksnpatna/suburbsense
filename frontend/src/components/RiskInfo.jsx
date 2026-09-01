import React from 'react';

// Risk level configurations
const RISK_CONFIG = {
  bushfire: {
    title: 'Bushfire Risk',
    icon: '🔥',
    levels: {
      low: { 
        label: 'Low Risk', 
        color: '#f59e0b', 
        bg: '#fef3c7',
        description: 'Area has low bushfire risk. Standard building regulations apply.'
      },
      medium: { 
        label: 'Medium Risk', 
        color: '#f97316', 
        bg: '#fed7aa',
        description: 'Area is designated as Bushfire Prone Area. Construction must meet BAL requirements.'
      },
      high: { 
        label: 'High Risk', 
        color: '#ef4444', 
        bg: '#fecaca',
        description: 'Area is in a Bushfire Management Overlay (BMO). Strict building requirements apply.'
      },
      extreme: { 
        label: 'Extreme Risk', 
        color: '#dc2626', 
        bg: '#fca5a5',
        description: 'Extreme bushfire risk area. BAL-40 or BAL-FZ construction may be required.'
      }
    }
  },
  flood: {
    title: 'Flood Risk',
    icon: '🌊',
    levels: {
      low: { 
        label: 'Low Risk (1% AEP)', 
        color: '#3b82f6', 
        bg: '#dbeafe',
        description: 'Area has low flood risk (1% Annual Exceedance Probability).'
      },
      medium: { 
        label: 'Medium Risk (0.5% AEP)', 
        color: '#2563eb', 
        bg: '#bfdbfe',
        description: 'Area has moderate flood risk. Floor height requirements may apply.'
      },
      high: { 
        label: 'High Risk (0.2% AEP)', 
        color: '#1d4ed8', 
        bg: '#93c5fd',
        description: 'Area is in a flood-prone zone. Building and development restrictions apply.'
      },
      extreme: { 
        label: 'Extreme Risk', 
        color: '#1e40af', 
        bg: '#60a5fa',
        description: 'High flood risk area. Significant building restrictions and flood-proofing required.'
      }
    }
  }
};

export function RiskInfo({ bushfireRisk, floodRisk, state }) {
  // Default risk levels if no data provided
  const bushfireLevel = bushfireRisk?.level || 'medium';
  const floodLevel = floodRisk?.level || 'low';
  
  const bushfireConfig = RISK_CONFIG.bushfire.levels[bushfireLevel] || RISK_CONFIG.bushfire.levels.medium;
  const floodConfig = RISK_CONFIG.flood.levels[floodLevel] || RISK_CONFIG.flood.levels.low;

  return (
    <section id="risks" className="risk-section">
      <h2 className="section-title">⚠️ Natural Hazard Risks</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Understanding bushfire and flood risks is essential for property decisions. 
        Data sourced from state government planning schemes.
      </p>
      
      <div className="risk-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {/* Bushfire Risk Card */}
        <div className="risk-card" style={{
          background: 'var(--surface)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🔥</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Bushfire Risk</h3>
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {state} Planning Scheme
              </span>
            </div>
          </div>
          
          <div style={{
            background: bushfireConfig.bg,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            border: `1px solid ${bushfireConfig.color}20`
          }}>
            <div style={{ 
              fontWeight: 700, 
              color: bushfireConfig.color,
              fontSize: '1.1rem',
              marginBottom: '0.5rem'
            }}>
              {bushfireConfig.label}
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
              {bushfireConfig.description}
            </p>
          </div>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Source:</strong> {bushfireRisk?.source || 'State Fire Authority / Planning Dept'}
          </div>
        </div>

        {/* Flood Risk Card */}
        <div className="risk-card" style={{
          background: 'var(--surface)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>🌊</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Flood Risk</h3>
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {state} Flood Data
              </span>
            </div>
          </div>
          
          <div style={{
            background: floodConfig.bg,
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem',
            border: `1px solid ${floodConfig.color}20`
          }}>
            <div style={{ 
              fontWeight: 700, 
              color: floodConfig.color,
              fontSize: '1.1rem',
              marginBottom: '0.5rem'
            }}>
              {floodConfig.label}
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
              {floodConfig.description}
            </p>
          </div>
          
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Source:</strong> {floodRisk?.source || 'Local Council / Water Authority'}
          </div>
        </div>
      </div>
      
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'var(--surface-alt)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.6
      }}>
        <strong>📋 Important:</strong> Risk zones affect insurance premiums, building costs, and development potential. 
        Always verify with local council and obtain professional advice before purchasing property. 
        Toggle the risk zones on the map above to see affected areas.
      </div>
    </section>
  );
}

export { RISK_CONFIG };