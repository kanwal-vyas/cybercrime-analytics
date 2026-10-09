import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { NAV_ITEMS, PROJECT_METADATA } from '../../lib/constants';
import { useTheme } from '../../context/useTheme';
import { NirikshaMark } from '../ui/NirikshaLogo';

/**
 * GitHub Icon SVG Component
 */
const GithubIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    style={{ display: 'block' }}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const TopNavigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 'var(--header-height)',
        backgroundColor: 'var(--header-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-6)',
        transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
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
          gap: 'var(--space-4)',
        }}
      >
        {/* ========================================================= */}
        {/* LEFT: NIRIKSHA PRODUCT IDENTITY                           */}
        {/* ========================================================= */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          <NavLink
            to="/"
            aria-label={`NIRIKSHA — ${PROJECT_METADATA.mnemonic}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            {/* Brand Mark Container */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <NirikshaMark size={32} />
            </div>

            {/* Brand Text Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-primary)',
                    lineHeight: 1.1,
                  }}
                >
                  NIRIKSHA
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.625rem',
                    fontWeight: 500,
                    color: 'var(--text-dim)',
                    letterSpacing: '0.04em',
                  }}
                >
                  निरीक्षा
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.625rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.01em',
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
                title={PROJECT_METADATA.mnemonic}
              >
                {PROJECT_METADATA.mnemonic}
              </span>
            </div>
          </NavLink>
        </div>

        {/* ========================================================= */}
        {/* CENTER: CAPSULE NAVIGATION (7 ROUTES)                     */}
        {/* ========================================================= */}
        <nav
          aria-label="Main Navigation"
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '3px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className="niriksha-nav-pill"
              style={({ isActive }) => ({
                padding: '5px 12px',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                fontWeight: isActive ? 600 : 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                transition: 'all var(--transition-fast)',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                display: 'inline-flex',
                alignItems: 'center',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ========================================================= */}
        {/* RIGHT: SYSTEM UTILITIES & CONTROLS                        */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {/* A. Data Status Indicator */}
          <div
            className="desktop-utility"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 9px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--status-success-bg)',
              border: '1px solid var(--status-success-border)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--status-success)',
              fontWeight: 600,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
            title="NCRB Crime in India (2023) Official Dataset — Audited & Frozen"
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-success)',
                display: 'inline-block',
              }}
            />
            <span>DATA VERIFIED</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>· NCRB 2023</span>
          </div>

          {/* B. Jurisdiction Indicator */}
          <div
            className="desktop-utility"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              color: 'var(--text-secondary)',
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}
            title="36 States and Union Territories of India (N = 36)"
          >
            36 JURISDICTIONS
          </div>

          {/* C. GitHub Repository Link Button */}
          <a
            href={PROJECT_METADATA.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open GitHub repository"
            title="Open GitHub repository"
            className="utility-icon-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <GithubIcon size={15} />
          </a>

          {/* D. Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="utility-icon-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all var(--transition-fast)',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
            style={{
              padding: '6px',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE NAVIGATION DRAWER                                  */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--header-height)',
            left: 0,
            right: 0,
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-default)',
            padding: 'var(--space-4) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            zIndex: 99,
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {/* Mobile Drawer Header Branding Card */}
          <div
            style={{
              padding: 'var(--space-3)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              marginBottom: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <NirikshaMark size={22} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
                NIRIKSHA
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-dim)' }}>निरीक्षा</span>
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {PROJECT_METADATA.mnemonic}
            </div>
          </div>

          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-sm)',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                textDecoration: 'none',
              })}
            >
              {item.label}
            </NavLink>
          ))}
          <div
            style={{
              paddingTop: 'var(--space-3)',
              marginTop: 'var(--space-2)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-2)',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6875rem',
                color: 'var(--status-success)',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-success)',
                  display: 'inline-block',
                }}
              />
              DATA VERIFIED · NCRB 2023
            </div>
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-dim)',
              }}
            >
              36 JURISDICTIONS
            </span>
          </div>
        </div>
      )}

      {/* Scoped CSS for Hover and Responsiveness */}
      <style>{`
        .niriksha-nav-pill:hover {
          color: var(--text-primary) !important;
          background-color: var(--bg-surface-hover) !important;
        }
        .niriksha-nav-pill:focus-visible,
        .utility-icon-btn:focus-visible,
        .mobile-menu-toggle:focus-visible,
        .mnemonic-info-btn:focus-visible {
          outline: 2px solid var(--primary) !important;
          outline-offset: 2px;
        }
        .utility-icon-btn:hover {
          color: var(--text-primary) !important;
          border-color: var(--border-strong) !important;
          background-color: var(--bg-surface-hover) !important;
        }
        @media (max-width: 1100px) {
          .desktop-utility {
            display: none !important;
          }
        }
        @media (max-width: 900px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default TopNavigation;
