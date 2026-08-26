import React, { useState, useEffect } from 'react';

export function TrendingTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);

  const activities = [
    { type: 'view', text: 'Someone in Sydney just analyzed Surry Hills' },
    { type: 'search', text: 'Brisbane is currently the most searched city' },
    { type: 'view', text: 'Someone in Melbourne just checked Richmond ROI' },
    { type: 'search', text: 'Waitlist signups for Partners increased by 15% today' },
    { type: 'view', text: 'Someone just downloaded a report for Gold Coast' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activities.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      background: 'var(--brand-blue-dark)',
      color: 'white',
      padding: '0.5rem 0',
      textAlign: 'center',
      fontSize: '0.85rem',
      fontWeight: 500,
      position: 'relative',
      overflow: 'hidden',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        animation: 'fadeIn 0.5s ease-in-out'
      }} key={currentIdx}>
        <span style={{ color: '#60a5fa' }}>{activities[currentIdx].type === 'search' ? '🔍' : '⚡'}</span>
        {activities[currentIdx].text}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
