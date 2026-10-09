import React from 'react';
import { PROJECT_METADATA } from '../../lib/constants';
import NirikshaLogo from './NirikshaLogo';

/**
 * NIRIKSHA Branded Loading Experience
 * 
 * A restrained, premium analytical workstation loading experience.
 * Features:
 * - Official NIRIKSHA brand mark with 4-category coordinate network
 *   (Sage #85A289, Dusty Mauve #B296AE, Amber #D6A15D, Slate Blue #607D8B)
 * - Brand wordmark with Devanagari annotation (NIRIKSHA निरीक्षा)
 * - Restrained indeterminate activity line (no artificial percentage progress)
 * - Strict theme compatibility (Dark default #090C0A & Light #F5F3EF)
 * - Full `prefers-reduced-motion` accessibility support
 */
export const BrandedLoader = ({
  message = 'Preparing analytical workspace',
  fullscreen = true,
  className = '',
  style = {},
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${PROJECT_METADATA.name} — ${message}`}
      className={`niriksha-branded-loader ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: fullscreen ? '100vh' : '480px',
        width: '100%',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)',
        padding: 'var(--space-6)',
        boxSizing: 'border-box',
        position: fullscreen ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: fullscreen ? 9999 : 1,
        ...style,
      }}
    >
      {/* Central Workstation Loading Frame */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          gap: 'var(--space-4)',
        }}
      >
        {/* ========================================================= */}
        {/* 1. Official NIRIKSHA Icon & 4-Color Network Motif         */}
        {/* ========================================================= */}
        <div
          className="niriksha-loader-emblem-container"
          style={{
            position: 'relative',
            width: '112px',
            height: '112px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-2)',
          }}
        >
          <svg
            width="112"
            height="112"
            viewBox="0 0 112 112"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="niriksha-loader-svg"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            aria-hidden="true"
          >
            {/* Outer Coordinate Target Ring */}
            <circle
              cx="56"
              cy="56"
              r="50"
              stroke="var(--border-strong)"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="niriksha-outer-ring"
            />

            {/* Coordinate Axis Crosshairs */}
            <line x1="56" y1="2" x2="56" y2="14" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="56" y1="98" x2="56" y2="110" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="56" x2="14" y2="56" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="98" y1="56" x2="110" y2="56" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />

            {/* 4 Categorical Network Nodes (Sage, Dusty Mauve, Amber, Slate Blue) */}
            <circle cx="20" cy="20" r="3.5" fill="#85A289" className="niriksha-node-1" />
            <circle cx="92" cy="20" r="3.5" fill="#B296AE" className="niriksha-node-2" />
            <circle cx="92" cy="92" r="3.5" fill="#D6A15D" className="niriksha-node-3" />
            <circle cx="20" cy="92" r="3.5" fill="#607D8B" className="niriksha-node-4" />
          </svg>

          {/* Focal Official Brand Icon */}
          <NirikshaLogo size={58} rounded={true} style={{ position: 'relative', zIndex: 2 }} />
        </div>

        {/* ========================================================= */}
        {/* 2. Brand Wordmark & Descriptor                            */}
        {/* ========================================================= */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '1.375rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              {PROJECT_METADATA.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: 'var(--text-dim)',
                letterSpacing: '0.04em',
              }}
            >
              {PROJECT_METADATA.sanskrit}
            </span>
          </div>

          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.02em',
            }}
          >
            {PROJECT_METADATA.descriptor}
          </span>
        </div>

        {/* ========================================================= */}
        {/* 3. Concise Status Message & Indeterminate Activity Line   */}
        {/* ========================================================= */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
            width: '100%',
          }}
        >
          {/* Status Label with Active Pulsing Dot */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              letterSpacing: '0.04em',
            }}
          >
            <span
              className="niriksha-status-dot"
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'inline-block',
              }}
            />
            <span>{message}</span>
          </div>

          {/* Restrained Activity Progress Line (No Fake Percentage) */}
          <div
            style={{
              width: '200px',
              height: '3px',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            <div className="niriksha-activity-bar" />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 4. Workstation Sub-Footer                                 */}
        {/* ========================================================= */}
        <div
          style={{
            marginTop: 'var(--space-3)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.625rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          {PROJECT_METADATA.academicTitle}
        </div>
      </div>

      {/* Scoped CSS & Reduced Motion Handling */}
      <style>{`
        .niriksha-activity-bar {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 38%;
          background: linear-gradient(90deg, transparent 0%, var(--primary) 50%, var(--accent-mauve) 100%);
          border-radius: var(--radius-full);
          animation: niriksha-activity-sweep 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .niriksha-status-dot {
          animation: niriksha-pulse-soft 1.6s ease-in-out infinite;
        }

        .niriksha-core {
          animation: niriksha-pulse-core 2s ease-in-out infinite;
          transform-origin: center;
        }

        .niriksha-node-1 {
          animation: niriksha-node-fade 2.4s ease-in-out infinite;
        }
        .niriksha-node-2 {
          animation: niriksha-node-fade 2.4s ease-in-out infinite 0.6s;
        }
        .niriksha-node-3 {
          animation: niriksha-node-fade 2.4s ease-in-out infinite 1.2s;
        }
        .niriksha-node-4 {
          animation: niriksha-node-fade 2.4s ease-in-out infinite 1.8s;
        }

        @keyframes niriksha-activity-sweep {
          0% {
            left: -40%;
          }
          100% {
            left: 100%;
          }
        }

        @keyframes niriksha-pulse-soft {
          0%, 100% {
            opacity: 0.4;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes niriksha-pulse-core {
          0%, 100% {
            transform: scale(1);
            opacity: 0.85;
          }
          50% {
            transform: scale(1.25);
            opacity: 1;
          }
        }

        @keyframes niriksha-node-fade {
          0%, 100% {
            opacity: 0.5;
            transform: scale(0.9);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }

        /* Full Accessibility Support for Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .niriksha-activity-bar,
          .niriksha-status-dot,
          .niriksha-core,
          .niriksha-node-1,
          .niriksha-node-2,
          .niriksha-node-3,
          .niriksha-node-4 {
            animation: none !important;
            transition: none !important;
          }
          .niriksha-activity-bar {
            width: 100% !important;
            left: 0 !important;
            background: var(--primary) !important;
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default BrandedLoader;
