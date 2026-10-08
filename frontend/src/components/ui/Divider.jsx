import React from 'react';

/**
 * Technical Section / Horizontal Separator
 */
export const Divider = ({ label, className = '', style = {} }) => {
  if (!label) {
    return (
      <hr
        className={className}
        style={{
          border: 'none',
          height: '1px',
          backgroundColor: 'var(--border-subtle)',
          margin: 'var(--space-6) 0',
          ...style,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        margin: 'var(--space-6) 0',
        ...style,
      }}
    >
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
      <span
        className="tech-label"
        style={{
          color: 'var(--text-dim)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
    </div>
  );
};

export default Divider;
