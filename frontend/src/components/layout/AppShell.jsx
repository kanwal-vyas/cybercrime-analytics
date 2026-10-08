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
      
      {/* Global Compact Footer */}
      <footer
        style={{
          height: '40px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'rgba(9, 12, 10, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-6)',
          fontSize: '0.6875rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-dim)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span>CYBER CRIME ANALYTICS FOR NATIONAL SECURITY</span>
          <span style={{ color: 'var(--border-default)' }}>|</span>
          <span>STAGES 1–18 FROZEN & AUDITED</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <span>STAGE 19 UI FOUNDATION</span>
          <span style={{ color: 'var(--primary)' }}>● ONLINE</span>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
