import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingState from '../ui/LoadingState';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';

/**
 * Technical Data Table Component
 * @param {Array} columns - [{ key, label, align: 'left'|'right'|'center', sortable: boolean, render: fn }]
 * @param {Array} data - Array of row objects
 */
export const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  onRetry = null,
  emptyMessage = 'No analytical records found.',
  className = '',
  style = {},
}) => {
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;
      
      const comparison = typeof valA === 'number' && typeof valB === 'number' 
        ? valA - valB 
        : String(valA).localeCompare(String(valB));
      
      return sortDir === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDir]);

  if (loading) {
    return <LoadingState lines={5} message="Loading dataset records..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState description={emptyMessage} />;
  }

  return (
    <div
      className={className}
      style={{
        width: '100%',
        overflowX: 'auto',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        boxShadow: 'var(--shadow-panel)',
        ...style,
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: 'var(--text-xs)',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            {columns.map((col) => {
              const align = col.align || 'left';
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.6875rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: isSorted ? 'var(--text-primary)' : 'var(--text-muted)',
                    textAlign: align,
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      justifyContent: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
                    }}
                  >
                    <span>{col.label}</span>
                    {col.sortable !== false && (
                      <span style={{ opacity: isSorted ? 1 : 0.3 }}>
                        {isSorted ? (
                          sortDir === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rIdx) => (
            <tr
              key={row.id || rIdx}
              style={{
                borderBottom: rIdx === sortedData.length - 1 ? 'none' : '1px solid var(--border-subtle)',
                transition: 'background-color var(--transition-fast)',
                backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = rIdx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)')}
            >
              {columns.map((col) => {
                const align = col.align || 'left';
                const cellValue = row[col.key];
                const isNumeric = typeof cellValue === 'number' || col.numeric;

                return (
                  <td
                    key={col.key}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      color: 'var(--text-secondary)',
                      textAlign: align,
                      fontFamily: isNumeric ? 'var(--font-mono)' : 'inherit',
                      whiteSpace: col.nowrap ? 'nowrap' : 'normal',
                    }}
                  >
                    {col.render ? col.render(cellValue, row) : (cellValue !== null && cellValue !== undefined ? String(cellValue) : '—')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
