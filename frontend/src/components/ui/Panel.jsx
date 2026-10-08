import React from 'react';

/**
 * Analytical Panel / Card Container
 * @param {'default'|'elevated'|'subtle'|'interactive'} variant
 */
export const Panel = ({ 
  children, 
  title, 
  subtitle, 
  action, 
  footer,
  variant = 'default', 
  className = '', 
  style = {},
  onClick,
}) => {
  const backgrounds = {
    default: 'var(--bg-surface)',
    elevated: 'var(--bg-surface-elevated)',
    subtle: 'var(--bg-surface)',
    interactive: 'var(--bg-surface)',
  };

  const bg = backgrounds[variant] || backgrounds.default;
  const isInteractive = variant === 'interactive' || !!onClick;

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        backgroundColor: bg,
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color var(--transition-fast), background-color var(--transition-fast), transform var(--transition-fast)',
        cursor: isInteractive ? 'pointer' : 'default',
        ...(isInteractive ? {
          ':hover': {
            borderColor: 'var(--border-strong)',
            backgroundColor: 'var(--bg-surface-elevated)',
          }
        } : {}),
        ...style,
      }}
    >
      {/* Top Accent Bar for subtle analytical framing */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent, var(--border-strong), transparent)',
        }} 
      />

      {(title || subtitle || action) && (
        <div
          style={{
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
          }}
        >
          <div>
            {title && (
              <h4 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                {title}
              </h4>
            )}
            {subtitle && (
              <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      <div style={{ padding: 'var(--space-5)', flex: 1 }}>
        {children}
      </div>

      {footer && (
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export default Panel;
