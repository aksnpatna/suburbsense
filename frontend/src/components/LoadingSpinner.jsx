import React from 'react';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const textClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className="loading-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      gap: '0.75rem'
    }}>
      <div className="spinner-container" style={{ position: 'relative' }}>
        <div 
          className="spinner" 
          style={{
            width: sizeClasses[size],
            height: sizeClasses[size],
            border: '3px solid var(--border-color)',
            borderTop: '3px solid var(--primary-color)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
      </div>
      {text && (
        <p className={`loading-text ${textClasses[size]}`} style={{ 
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

// Add spin animation to style
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default LoadingSpinner;