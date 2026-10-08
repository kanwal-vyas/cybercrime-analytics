import React from 'react';
import { Search, X } from 'lucide-react';

/**
 * Technical Filter / Search Input Control
 */
export const FilterControl = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search / Filter...',
  icon = true,
  disabled = false,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        minWidth: '220px',
        backgroundColor: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-sm)',
        transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
        opacity: disabled ? 0.6 : 1,
        ...style,
      }}
    >
      {icon && (
        <Search
          size={14}
          style={{
            marginLeft: 'var(--space-3)',
            color: 'var(--text-muted)',
            flexShrink: 0,
          }}
        />
      )}
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: 'var(--space-2) var(--space-3)',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-xs)',
          fontFamily: 'var(--font-sans)',
        }}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          style={{
            padding: 'var(--space-2)',
            marginRight: 'var(--space-1)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default FilterControl;
