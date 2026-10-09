import React from 'react';
import { PROJECT_METADATA } from '../../lib/constants';

/**
 * NIRIKSHA Branded Loading Experience
 * 
 * A restrained, premium analytical workstation loading experience.
 * Features:
 * - Geometric observation aperture with 4-category categorical coordinate network
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
        {/* 1. Observation Aperture & 4-Color Network SVG Motif       */}
        {/* ========================================================= */}
        <div
          className="niriksha-loader-emblem-container"
          style={{
            position: 'relative',
            width: '104px',
            height: '104px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-2)',
          }}
        >
          <svg
            width="104"
            height="104"
            viewBox="0 0 104 104"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="niriksha-loader-svg"
            aria-hidden="true"
          >
            {/* Outer Coordinate Target Ring */}
            <circle
              cx="52"
              cy="52"
              r="46"
              stroke="var(--border-strong)"
              strokeWidth="1"
              strokeDasharray="3 3"
              className="niriksha-outer-ring"
            />

            {/* Coordinate Axis Crosshairs */}
            <line x1="52" y1="2" x2="52" y2="16" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="52" y1="88" x2="52" y2="102" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="52" x2="16" y2="52" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="88" y1="52" x2="102" y2="52" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />

            {/* Diagonal Network Coordinate Rays (Connectors to Satellite Nodes) */}
            <line x1="24" y1="24" x2="52" y2="52" stroke="var(--border-default)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="80" y1="24" x2="52" y2="52" stroke="var(--border-default)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="80" y1="80" x2="52" y2="52" stroke="var(--border-default)" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="24" y1="80" x2="52" y2="52" stroke="var(--border-default)" strokeWidth="1" strokeDasharray="2 2" />

            {/* 4 Categorical Network Nodes (Sage, Dusty Mauve, Amber, Slate Blue) */}
            {/* Node 1: Sage (Top-Left) */}
            <circle cx="24" cy="24" r="4" fill="#85A289" className="niriksha-node-1" />
            <circle cx="24" cy="24" r="7" stroke="#85A289" strokeWidth="1" opacity="0.4" />

            {/* Node 2: Dusty Mauve (Top-Right) */}
            <circle cx="80" cy="24" r="4" fill="#B296AE" className="niriksha-node-2" />
            <circle cx="80" cy="24" r="7" stroke="#B296AE" strokeWidth="1" opacity="0.4" />

            {/* Node 3: Amber (Bottom-Right) */}
            <circle cx="80" cy="80" r="4" fill="#D6A15D" className="niriksha-node-3" />
            <circle cx="80" cy="80" r="7" stroke="#D6A15D" strokeWidth="1" opacity="0.4" />

            {/* Node 4: Slate Blue (Bottom-Left) */}
            <circle cx="24" cy="80" r="4" fill="#607D8B" className="niriksha-node-4" />
            <circle cx="24" cy="80" r="7" stroke="#607D8B" strokeWidth="1" opacity="0.4" />

            {/* Central Observation Aperture Eye Geometry */}
            <path
              d="M 22 52 C 34 32, 70 32, 82 52 C 70 72, 34 72, 22 52 Z"
              stroke="var(--primary)"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
              className="niriksha-eye-contour"
            />

            {/* Inner Analytical Iris */}
            <circle
              cx="52"
              cy="52"
              r="13"
              stroke="var(--accent-mauve)"
              strokeWidth="2"
              fill="var(--bg-surface-elevated)"
              className="niriksha-iris"
            />

            {/* Reticle Focus Core */}
            <circle
              cx="52"
              cy="52"
              r="4.5"
              fill="var(--primary)"
              className="niriksha-core"
            />
          </svg>
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
