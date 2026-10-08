import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Technical Error State Component
 */
export const ErrorState = ({
  title = 'Analytical Service Error',
  message = 'Failed to execute query against data warehouse. Verify backend connectivity.',
  onRetry,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        padding: 'var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        border: '1px solid var(--status-danger-border)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--status-danger-bg)',
        gap: 'var(--space-3)',
        ...style,
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'rgba(200, 104, 116, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--status-danger)',
        }}
      >
        <AlertTriangle size={18} />
      </div>

      <div>
        <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-base)', color: 'var(--status-danger)' }}>
          {title}
        </h4>
        <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', maxWidth: '440px' }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: 'var(--space-2)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
          }}
        >
          <RefreshCw size={12} />
          Retry Request
        </button>
      )}
    </div>
  );
};

export default ErrorState;
