import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { NAV_ITEMS, PROJECT_METADATA } from '../../lib/constants';
import StatusBadge from '../ui/StatusBadge';

export const TopNavigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 'var(--header-height)',
        backgroundColor: 'rgba(9, 12, 10, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-6)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 'var(--max-width-page)',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Brand Identity */}
        <NavLink
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <Shield size={18} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 'var(--text-sm)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--color-ivory)',
                lineHeight: 1.1,
              }}
            >
              {PROJECT_METADATA.title}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.625rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {PROJECT_METADATA.subtitle}
            </div>
          </div>
        </NavLink>

        {/* Desktop Nav Links */}
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
          }}
          className="desktop-nav"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              style={({ isActive }) => ({
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
                color: isActive ? 'var(--color-ivory)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                transition: 'all var(--transition-fast)',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Right: Dataset Badge & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div className="desktop-badge">
            <StatusBadge variant="success" size="sm" pulse>
              NCRB 2023 · 86,420 Cases · Frozen
            </StatusBadge>
          </div>

          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: 'var(--space-2)',
              color: 'var(--text-primary)',
              display: 'none',
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-app)',
            borderBottom: '1px solid var(--border-default)',
            padding: 'var(--space-4) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            zIndex: 99,
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                color: isActive ? 'var(--color-ivory)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : 'none',
              })}
            >
              {item.label}
            </NavLink>
          ))}
          <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
            <StatusBadge variant="success" size="sm">
              NCRB 2023 Verified Database
            </StatusBadge>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .desktop-nav, .desktop-badge {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNavigation;
