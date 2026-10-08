import React from 'react';
import LoadingState from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';

/**
 * Technical Visualization & Chart Container
 */
export const ChartContainer = ({
  category,
  title,
  subtitle,
  controls,
  sourceNote,
  loading = false,
  empty = false,
  emptyMessage = 'No chart data available for selected filter slice.',
  height = '320px',
  children,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Chart Header */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--bg-surface-elevated)',
        }}
      >
        <div>
          {category && (
            <div className="tech-label" style={{ fontSize: '0.6875rem', marginBottom: '2px' }}>
              {category}
            </div>
          )}
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
        {controls && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {controls}
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div
        style={{
          minHeight: height,
          padding: 'var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {loading ? (
          <LoadingState message="Materializing analytical chart..." />
        ) : empty ? (
          <EmptyState description={emptyMessage} />
        ) : (
          children
        )}
      </div>

      {/* Source / Footer Metadata */}
      {sourceNote && (
        <div
          style={{
            padding: 'var(--space-2) var(--space-5)',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-elevated)',
            fontSize: '0.6875rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-dim)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{sourceNote}</span>
          <span style={{ color: 'var(--text-muted)' }}>STRICT NON-CAUSAL SCOPE</span>
        </div>
      )}
    </div>
  );
};

export default ChartContainer;
