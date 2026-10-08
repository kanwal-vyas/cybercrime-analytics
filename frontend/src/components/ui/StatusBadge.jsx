import React from 'react';
import StatusDot from './StatusDot';

/**
 * Technical Status Badge with subtle border & background
 * @param {'success'|'warning'|'danger'|'info'|'neutral'|'mauve'} variant
 * @param {boolean} withDot
 * @param {boolean} pulse
 */
export const StatusBadge = ({ 
  children, 
  variant = 'success', 
  withDot = true, 
  pulse = false, 
  size = 'md',
  className = '' 
}) => {
  const styles = {
    success: {
      bg: 'var(--status-success-bg)',
      border: 'var(--status-success-border)',
      color: 'var(--status-success)',
    },
    warning: {
      bg: 'var(--status-warning-bg)',
      border: 'var(--status-warning-border)',
      color: 'var(--status-warning)',
    },
    danger: {
      bg: 'var(--status-danger-bg)',
      border: 'var(--status-danger-border)',
      color: 'var(--status-danger)',
    },
    info: {
      bg: 'var(--status-info-bg)',
      border: 'var(--status-info-border)',
      color: 'var(--status-info)',
    },
    mauve: {
      bg: 'var(--accent-mauve-muted)',
      border: 'var(--border-accent)',
      color: 'var(--accent-mauve)',
    },
    neutral: {
      bg: 'rgba(122, 139, 126, 0.12)',
      border: 'var(--border-subtle)',
      color: 'var(--text-muted)',
    },
  };

  const current = styles[variant] || styles.neutral;
  const isSm = size === 'sm';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: isSm ? '4px' : '6px',
        padding: isSm ? '2px 6px' : '3px 8px',
        borderRadius: 'var(--radius-sm)',
        backgroundColor: current.bg,
        border: `1px solid ${current.border}`,
        color: current.color,
        fontFamily: 'var(--font-mono)',
        fontSize: isSm ? '0.6875rem' : 'var(--text-xs)',
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}
    >
      {withDot && <StatusDot variant={variant} pulse={pulse} />}
      {children}
    </span>
  );
};

export default StatusBadge;
