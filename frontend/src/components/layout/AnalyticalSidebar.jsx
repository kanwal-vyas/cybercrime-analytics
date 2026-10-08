import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

/**
 * Reusable Analytical Sidebar / Filter Rail Component
 * @param {Array} sections - [{ title, items: [{ id, label, icon, count, badge, active, onClick }] }]
 */
export const AnalyticalSidebar = ({
  sections = [],
  collapsible = true,
  className = '',
  style = {},
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={className}
      style={{
        width: collapsed ? '60px' : 'var(--sidebar-width)',
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width var(--transition-normal)',
        position: 'relative',
        flexShrink: 0,
        minHeight: 'calc(100vh - var(--header-height))',
        ...style,
      }}
    >
      {/* Collapse Toggle Button */}
      {collapsible && (
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: '-12px',
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-strong)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      {/* Sidebar Content */}
      <div
        style={{
          padding: collapsed ? 'var(--space-4) var(--space-2)' : 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-5)',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {sections.map((sec, sIdx) => (
          <div key={sIdx}>
            {!collapsed && sec.title && (
              <div
                className="tech-label"
                style={{
                  padding: '0 var(--space-2) var(--space-2) var(--space-2)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-dim)',
                }}
              >
                {sec.title}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const active = item.active;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      padding: collapsed ? 'var(--space-2)' : 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: active ? 'var(--bg-surface-elevated)' : 'transparent',
                      border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
                      color: active ? 'var(--color-ivory)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      textAlign: 'left',
                      transition: 'all var(--transition-fast)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      {Icon && <Icon size={14} style={{ color: active ? 'var(--primary)' : 'var(--text-muted)' }} />}
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {item.count !== undefined && (
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              color: 'var(--text-muted)',
                            }}
                          >
                            {item.count}
                          </span>
                        )}
                        {item.badge && (
                          <StatusBadge size="sm" variant={item.badgeVariant || 'neutral'}>
                            {item.badge}
                          </StatusBadge>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default AnalyticalSidebar;
