import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * MetricCard component for high-impact analytical metrics
 */
export const MetricCard = ({
  label,
  value,
  unit,
  description,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral' | 'accent'
  statusBadge,
  badgeVariant = 'neutral',
  accentColor,
  icon: Icon,
  className = '',
  style = {},
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'var(--status-success)';
      case 'negative':
        return 'var(--status-danger)';
      case 'warning':
        return 'var(--status-warning)';
      case 'accent':
        return 'var(--color-mauve-dusty)';
      default:
        return 'var(--text-muted)';
    }
  };

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-5)',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
        ...style,
      }}
    >
      {/* Accent left indicator if specified */}
      {accentColor && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '3px',
            bottom: 0,
            backgroundColor: accentColor,
          }}
        />
      )}

      <div>
        {/* Header Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-2)',
          }}
        >
          <span className="tech-label" style={{ fontSize: '0.6875rem' }}>
            {label}
          </span>
          {statusBadge ? (
            <StatusBadge size="sm" variant={badgeVariant}>
              {statusBadge}
            </StatusBadge>
          ) : Icon ? (
            <Icon size={16} style={{ color: 'var(--text-muted)' }} />
          ) : null}
        </div>

        {/* Value Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-2)',
            margin: 'var(--space-1) 0 var(--space-2) 0',
          }}
        >
          <span
            className="tech-value"
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            {value}
          </span>
          {unit && (
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {/* Footer / Description / Trend */}
      {(description || change) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-2)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 'var(--text-xs)',
            marginTop: 'var(--space-2)',
          }}
        >
          {description && (
            <span style={{ color: 'var(--text-muted)' }}>{description}</span>
          )}
          {change && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                color: getChangeColor(),
                whiteSpace: 'nowrap',
              }}
            >
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
