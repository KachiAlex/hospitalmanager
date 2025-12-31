// Error Message Component
// Reusable error display with retry functionality

import React from 'react';

const ErrorMessage = ({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  showRetry = true,
  className = '' 
}) => {
  return (
    <div className={`error-message ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      background: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '12px',
      margin: '1rem 0'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        background: '#fee2e2',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#dc2626" 
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      </div>
      
      <h3 style={{
        color: '#dc2626',
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: '0 0 0.5rem 0'
      }}>
        {title}
      </h3>
      
      <p style={{
        color: '#7f1d1d',
        fontSize: '0.9rem',
        margin: '0 0 1.5rem 0',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        {error || 'An unexpected error occurred. Please try again.'}
      </p>
      
      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#b91c1c';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#dc2626';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;