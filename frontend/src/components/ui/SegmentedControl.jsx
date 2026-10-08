import React from 'react';

/**
 * Technical Segmented Control / Tabs
 */
export const SegmentedControl = ({
  options = [],
  value,
  onChange,
  size = 'md',
  className = '',
  style = {},
}) => {
  const isSm = size === 'sm';

  return (
    <div
      className={className}
      role="tablist"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        backgroundColor: 'var(--bg-app)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        gap: '2px',
        ...style,
      }}
    >
      {options.map((opt) => {
        const val = typeof opt === 'object' ? opt.value : opt;
        const lbl = typeof opt === 'object' ? opt.label : opt;
        const count = typeof opt === 'object' ? opt.count : null;
        const active = value === val;

        return (
          <button
            key={val}
            role="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(val)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: isSm ? '3px 8px' : '5px 12px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: active ? 'var(--bg-surface-elevated)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-muted)',
              border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
              boxShadow: active ? '0 1px 3px rgba(0, 0, 0, 0.4)' : 'none',
              fontFamily: 'var(--font-mono)',
              fontSize: isSm ? 'var(--text-xs)' : 'var(--text-sm)',
              fontWeight: active ? 600 : 400,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap',
            }}
          >
            <span>{lbl}</span>
            {count !== null && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  padding: '1px 5px',
                  borderRadius: '10px',
                  backgroundColor: active ? 'var(--primary-muted)' : 'rgba(255, 255, 255, 0.05)',
                  color: active ? 'var(--primary)' : 'var(--text-dim)',
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
