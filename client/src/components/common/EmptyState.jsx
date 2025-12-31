// Empty State Component
// Shows when no data is available

import React from 'react';

const EmptyState = ({ 
  title = 'No data available',
  description = 'There is no data to display at the moment.',
  icon = '📋',
  actionText,
  onAction,
  className = '' 
}) => {
  return (
    <div className={`empty-state ${className}`} style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      margin: '1rem 0'
    }}>
      <div style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        opacity: 0.7
      }}>
        {icon}
      </div>
      
      <h3 style={{
        color: '#374151',
        fontSize: '1.2rem',
        fontWeight: '600',
        margin: '0 0 0.5rem 0'
      }}>
        {title}
      </h3>
      
      <p style={{
        color: '#6b7280',
        fontSize: '0.9rem',
        margin: '0 0 1.5rem 0',
        maxWidth: '400px',
        lineHeight: '1.5'
      }}>
        {description}
      </p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'linear-gradient(135deg, #4338ca, #6366f1)',
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
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(67, 56, 202, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;