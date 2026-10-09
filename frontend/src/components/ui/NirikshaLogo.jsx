import React from 'react';

/**
 * NIRIKSHA Official Brand Logo & Mark
 * 
 * Uses the official NIRIKSHA icon asset (/icon.png).
 * Supports configurable dimensions, rounded squircle corners, and accessible markup.
 */
export const NirikshaLogo = ({
  size = 28,
  className = '',
  style = {},
  ariaHidden = true,
  ariaLabel = 'NIRIKSHA Official Brand Logo',
  rounded = true,
  ...props
}) => {
  // Resolve size
  const sizeMap = {
    xs: 16,
    sm: 20,
    md: 28,
    lg: 40,
    xl: 64,
    '2xl': 96,
  };

  const numericSize = typeof size === 'number' ? size : (sizeMap[size] || 28);

  return (
    <img
      src="/icon.png"
      alt={!ariaHidden ? ariaLabel : ''}
      aria-hidden={ariaHidden}
      width={numericSize}
      height={numericSize}
      className={`niriksha-brand-logo ${className}`}
      style={{
        width: `${numericSize}px`,
        height: `${numericSize}px`,
        objectFit: 'contain',
        borderRadius: rounded ? `${Math.max(4, Math.round(numericSize * 0.18))}px` : '0px',
        display: 'inline-block',
        verticalAlign: 'middle',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
        ...style,
      }}
      loading="eager"
      decoding="async"
      {...props}
    />
  );
};

// NirikshaMark alias for compatibility
export const NirikshaMark = NirikshaLogo;

export default NirikshaLogo;
