import React from 'react';
import TopNavigation from './TopNavigation';

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
      }}
    >
      <TopNavigation />
      <div style={{ display: 'flex', flex: 1 }}>
        {children}
      </div>
      
      {/* Global Compact Analytical Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(9, 12, 10, 0.95)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-3) var(--space-6)',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>CYBER CRIME ANALYTICS</span>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span>NCRB CII 2023 & Historical Panel (2018–2022)</span>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span style={{ color: 'var(--text-dim)' }}>Read-Only Analytical Workstation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span>Stages 1–28 Integrated</span>
          <span style={{ color: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--color-sage-light)', display: 'inline-block' }}></span>
            VALIDATED
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
