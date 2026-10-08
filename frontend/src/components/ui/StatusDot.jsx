import React from 'react';

/**
 * Technical Status Dot indicator
 * @param {'success'|'warning'|'danger'|'info'|'neutral'} variant
 * @param {boolean} pulse
 */
export const StatusDot = ({ variant = 'success', pulse = false, className = '' }) => {
  const colors = {
    success: 'var(--status-success)',
    warning: 'var(--status-warning)',
    danger: 'var(--status-danger)',
    info: 'var(--status-info)',
    neutral: 'var(--text-muted)',
    mauve: 'var(--color-mauve-dusty)',
  };

  const bg = colors[variant] || colors.success;

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '8px',
        height: '8px',
      }}
      className={className}
    >
      {pulse && (
        <span
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: bg,
            opacity: 0.6,
            animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          }}
        />
      )}
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: bg,
          boxShadow: `0 0 6px ${bg}`,
        }}
      />
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }
      `}</style>
    </span>
  );
};

export default StatusDot;
