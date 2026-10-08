import React from 'react';
import TopNavigation from './TopNavigation';
import { PROJECT_METADATA } from '../../lib/constants';

/**
 * Global AppShell Component
 */
export const AppShell = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        transition: 'background-color var(--transition-normal), color var(--transition-normal)',
      }}
    >
      <TopNavigation />
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        {children}
      </div>
      
      {/* Global Compact Analytical Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--footer-bg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-6)',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          gap: 'var(--space-2)',
          transition: 'background-color var(--transition-normal), border-color var(--transition-normal)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.04em' }}>
            {PROJECT_METADATA.name}
          </span>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span>{PROJECT_METADATA.academicTitle}</span>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span>NCRB CII 2023 & Historical Panel (2018–2022)</span>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span style={{ color: 'var(--text-dim)' }}>Read-Only Analytical Workstation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span>Audited & Frozen Pipeline</span>
          <span style={{ color: 'var(--status-success)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--status-success)', display: 'inline-block' }}></span>
            VALIDATED
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
