import React from 'react';

/**
 * Standardized Page Container enforcing layout margins and responsive max width
 */
export const PageContainer = ({ 
  children, 
  maxWidth = 'var(--max-width-page)', 
  className = '', 
  style = {} 
}) => {
  return (
    <main
      className={className}
      style={{
        width: '100%',
        maxWidth,
        margin: '0 auto',
        padding: 'var(--space-8) var(--space-6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-8)',
        minHeight: 'calc(100vh - var(--header-height))',
        ...style,
      }}
    >
      {children}
    </main>
  );
};

export default PageContainer;
