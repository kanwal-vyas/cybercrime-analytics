import React from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Technical Select Dropdown Control
 */
export const SelectControl = ({
  options = [],
  value,
  onChange,
  label,
  placeholder = 'Select option...',
  disabled = false,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        ...style,
      }}
    >
      {label && <span className="tech-label" style={{ fontSize: '0.6875rem' }}>{label}</span>}
      <div
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <select
          value={value}
          disabled={disabled}
          onChange={(e) => onChange && onChange(e.target.value)}
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            width: '100%',
            padding: 'var(--space-2) var(--space-8) var(--space-2) var(--space-3)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: value ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-sans)',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        >
          {placeholder && <option value="" disabled style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const lbl = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val} style={{ backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--text-primary)' }}>
                {lbl}
              </option>
            );
          })}
        </select>
        <ChevronDown
          size={14}
          style={{
            position: 'absolute',
            right: 'var(--space-2)',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
          }}
        />
      </div>
    </div>
  );
};

export default SelectControl;
