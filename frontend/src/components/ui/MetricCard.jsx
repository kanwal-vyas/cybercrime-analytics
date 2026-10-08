import React from 'react';
import StatusBadge from './StatusBadge';

/**
 * MetricCard component for high-impact analytical metrics
 */
export const MetricCard = ({
  title,
  label,
  value,
  unit,
  subtitle,
  description,
  change,
  changeType = 'neutral', // 'positive' | 'negative' | 'neutral' | 'accent' | 'warning'
  statusBadge,
  status,
  badgeVariant,
  accentColor,
  icon,
  className = '',
  style = {},
}) => {
  const displayLabel = label || title;
  const displayDescription = description || subtitle;
  const displayBadgeVariant = badgeVariant || status || 'neutral';
  const displayStatusBadge = statusBadge;

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

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
      const IconComponent = icon;
      return <IconComponent size={16} style={{ color: 'var(--text-muted)' }} />;
    }
    return null;
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
            {displayLabel}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {displayStatusBadge && (
              <StatusBadge size="sm" variant={displayBadgeVariant}>
                {displayStatusBadge}
              </StatusBadge>
            )}
            {renderIcon()}
          </div>
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
      {(displayDescription || change) && (
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
          {displayDescription && (
            <span style={{ color: 'var(--text-muted)' }}>{displayDescription}</span>
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
