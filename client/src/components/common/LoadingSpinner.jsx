// Loading Spinner Component
// Reusable loading indicator with different sizes and styles

import React from 'react';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = '#4338ca', 
  text = 'Loading...', 
  showText = true,
  className = '' 
}) => {
  const sizeClasses = {
    small: { width: '20px', height: '20px', borderWidth: '2px' },
    medium: { width: '40px', height: '40px', borderWidth: '3px' },
    large: { width: '60px', height: '60px', borderWidth: '4px' }
  };

  const spinnerStyle = {
    ...sizeClasses[size],
    border: `${sizeClasses[size].borderWidth} solid #f3f4f6`,
    borderTop: `${sizeClasses[size].borderWidth} solid ${color}`,
    borderRadius: '50%',
    animation: 'loadingSpinnerRotate 1s linear infinite'
  };

  // Inject CSS animation if not already present
  React.useEffect(() => {
    const styleId = 'loading-spinner-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes loadingSpinnerRotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className={`loading-spinner ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem'
    }}>
      <div style={spinnerStyle}></div>
      {showText && (
        <p style={{
          color: '#6b7280',
          fontSize: '0.9rem',
          margin: 0,
          fontWeight: '500'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;