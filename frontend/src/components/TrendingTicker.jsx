import React, { useState, useEffect } from 'react';

export function TrendingTicker() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/analytics/summary');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Silently fail — ticker is non-critical
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  const buildMessages = () => {
    const messages = [];
    if (stats?.visitors?.today) {
      messages.push({ icon: '👥', text: `${stats.visitors.today} researchers on SuburbSense today` });
    }
    if (stats?.top_pages?.length > 0) {
      const top = stats.top_pages[0];
      const label = top.path === '/' ? 'homepage' : top.path.replace(/^\//, '').replace(/\//g, ' ');
      messages.push({ icon: '🔥', text: `Most viewed: ${label}` });
    }
    if (messages.length === 0) {
      messages.push(
        { icon: '🏠', text: '11,599 Australian suburbs — free data, no login' },
        { icon: '📊', text: 'Real ABS census, ACARA schools, transit scores' },
        { icon: '⚡', text: 'Compare energy plans across 30+ retailers' }
      );
    }
    return messages;
  };

  const messages = buildMessages();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [messages.length]);

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
        <span style={{ color: '#60a5fa' }}>{messages[currentIdx].icon}</span>
        {messages[currentIdx].text}
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
