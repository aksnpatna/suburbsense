import React, { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('suburbsense-theme');
    return saved || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('suburbsense-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === 'light' ? '🌙' : '☀️'}
      </span>
      <span className="theme-toggle-text">
        {theme === 'light' ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
