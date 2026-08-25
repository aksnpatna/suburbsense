import React from 'react';

export function ScoreChips({ scores }) {
  if (!scores) return null;

  const scoreItems = [
    { key: 'accessibility', label: 'Accessibility', icon: '🚍' },
    { key: 'transit', label: 'Public Transport', icon: '🚏' },
    { key: 'roads', label: 'Road Access', icon: '🛣️' },
    { key: 'schools', label: 'Schools', icon: '🎒' },
    { key: 'parks', label: 'Parks', icon: '🌲' },
    { key: 'shopping', label: 'Shopping', icon: '🛒' },
    { key: 'health', label: 'Healthcare', icon: '🏥' },
    { key: 'safety', label: 'Safety (Crime)', icon: '🛡️' }
  ];

  const getColor = (score) => {
    if (score >= 80) return 'var(--success-color)';
    if (score >= 50) return 'var(--warning-color)';
    return 'var(--error-color)';
  };

  return (
    <div className="score-chips">
      {scoreItems.map((item) => {
        const rawScore = scores[item.key];
        if (rawScore === undefined || rawScore === null) return null;
        const score = Math.round(rawScore);
        const color = getColor(score);
        
        return (
          <div key={item.key} className="score-chip">
            <div className="score-icon">{item.icon}</div>
            <div className="score-content">
              <div className="score-label">{item.label}</div>
              <div className="score-bar">
                <div 
                  className="score-fill" 
                  style={{ width: `${score}%`, backgroundColor: color }}
                />
              </div>
              <div className="score-percentage" style={{ color }}>{score}/100</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
