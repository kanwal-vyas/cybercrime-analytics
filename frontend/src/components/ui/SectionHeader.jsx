import React from 'react';

/**
 * Standardized Analytical Section Header
 */
export const SectionHeader = ({
  category,
  title,
  description,
  actions,
  badge,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-6)',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          {category && <span className="tech-label">{category}</span>}
          {badge && <div>{badge}</div>}
        </div>
        {actions && <div style={{ display: 'flex', gap: 'var(--space-2)' }}>{actions}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)', color: 'var(--text-primary)' }}>
          {title}
        </h2>
      </div>

      {description && (
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', maxWidth: '800px' }}>
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
