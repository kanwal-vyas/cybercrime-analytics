import React from 'react';

/**
 * Technical Loading State / Skeleton Placeholder
 */
export const LoadingState = ({
  lines = 3,
  height = '14px',
  message = 'Loading analytical records...',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-3)',
        ...style,
      }}
    >
      {message && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              animation: 'pulse 1.5s infinite',
            }}
          />
          <span className="tech-label" style={{ fontSize: '0.6875rem' }}>
            {message}
          </span>
        </div>
      )}

      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height,
            width: i === lines - 1 && lines > 1 ? '60%' : '100%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            animation: 'shimmer 1.8s ease-in-out infinite',
            background: 'linear-gradient(90deg, rgba(20, 26, 22, 0.6) 25%, rgba(30, 39, 33, 0.8) 50%, rgba(20, 26, 22, 0.6) 75%)',
            backgroundSize: '200% 100%',
          }}
        />
      ))}

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingState;
