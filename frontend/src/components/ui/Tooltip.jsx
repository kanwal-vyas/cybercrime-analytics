import React, { useState } from 'react';

/**
 * Technical Tooltip Foundation
 */
export const Tooltip = ({ content, children, position = 'top', className = '' }) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={className}
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            bottom: position === 'top' ? 'calc(100% + 6px)' : 'auto',
            top: position === 'bottom' ? 'calc(100% + 6px)' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 100,
            padding: '4px 8px',
            backgroundColor: 'var(--bg-surface-overlay)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            backdropFilter: 'blur(8px)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
