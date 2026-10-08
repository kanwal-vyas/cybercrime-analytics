import React from 'react';
import { Database } from 'lucide-react';

/**
 * Technical Empty State Component
 */
export const EmptyState = ({
  icon: Icon = Database,
  title = 'No Data Available',
  description = 'No matching records or metrics found in the current query slice.',
  action,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        padding: 'var(--space-10) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(14, 19, 16, 0.4)',
        gap: 'var(--space-3)',
        ...style,
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface-elevated)',
          border: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <Icon size={18} />
      </div>

      <div>
        <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: '400px' }}>
          {description}
        </p>
      </div>

      {action && <div style={{ marginTop: 'var(--space-2)' }}>{action}</div>}
    </div>
  );
};

export default EmptyState;
