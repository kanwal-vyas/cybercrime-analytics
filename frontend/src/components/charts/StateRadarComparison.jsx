import React, { useMemo } from 'react';

/**
 * Interactive 5-Dimensional State Cybercrime Profile Radar Chart
 * Compares selected state composition against National Statutory Baselines.
 */
const DIMENSIONS = [
  { key: 'it_act_share', label: 'IT Act %', max: 100 },
  { key: 'ipc_share', label: 'IPC %', max: 100 },
  { key: 'fraud_motive_share', label: 'Fraud Motive %', max: 100 },
  { key: 'women_share', label: 'Women Target %', max: 50 },
  { key: 'extortion_share', label: 'Extortion %', max: 20 },
];

const SIZE = 320;
const CENTER = SIZE / 2;
const RADIUS = 88;

const getCoordinates = (value, maxVal, index, total) => {
  const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
  const normalized = Math.min(Math.max((value || 0) / maxVal, 0), 1);
  const r = RADIUS * normalized;
  const x = CENTER + r * Math.cos(angle);
  const y = CENTER + r * Math.sin(angle);
  return { x, y };
};

/**
 * Interactive 5-Dimensional State Cybercrime Profile Radar Chart
 * Compares selected state composition against National Statutory Baselines.
 */
export const StateRadarComparison = ({
  stateData,
  nationalBaseline = {
    it_act_share: 51.19,
    ipc_share: 48.43,
    fraud_motive_share: 68.88,
    women_share: 22.58,
    extortion_share: 5.62,
  },
  height = '370px',
  className = '',
  style = {},
}) => {
  const size = SIZE;
  const center = CENTER;
  const radius = RADIUS;
  const dimensions = DIMENSIONS;

  const nationalPoints = useMemo(() => {
    return DIMENSIONS
      .map((dim, idx) => {
        const val = nationalBaseline[dim.key] || 0;
        const { x, y } = getCoordinates(val, dim.max, idx, DIMENSIONS.length);
        return `${x},${y}`;
      })
      .join(' ');
  }, [nationalBaseline]);

  const statePoints = useMemo(() => {
    if (!stateData) return null;
    return DIMENSIONS
      .map((dim, idx) => {
        const val = stateData[dim.key] ?? stateData[dim.key.replace('_share', '_pct')] ?? 0;
        const { x, y } = getCoordinates(val, dim.max, idx, DIMENSIONS.length);
        return `${x},${y}`;
      })
      .join(' ');
  }, [stateData]);

  // Web rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0];

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-panel)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        height,
        minHeight: 0,
        ...style,
      }}
    >
      <div
        style={{
          padding: '8px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div>
          <div className="tech-label" style={{ fontSize: '0.625rem' }}>MULTI-DIMENSIONAL PROFILE</div>
          <h4 style={{ margin: '2px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', fontWeight: 600 }}>
            {stateData ? `${stateData.state_name} Profile Signature` : 'National Baseline Signature'}
          </h4>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-sage-light)', borderRadius: '2px' }} />
            <span style={{ color: 'var(--text-secondary)' }}>National</span>
          </div>
          {stateData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--cat-amber)', borderRadius: '2px' }} />
              <span style={{ color: 'var(--cat-amber)', fontWeight: 600 }}>{stateData.state_name}</span>
            </div>
          )}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '6px',
          minHeight: 0,
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox={`0 0 ${size} ${size}`}
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            width: 'auto',
            height: '100%',
            aspectRatio: '1 / 1',
            display: 'block',
            margin: '0 auto',
          }}
        >
          {/* Background Concentric Radar Webs */}
          {rings.map((factor, rIdx) => {
            const pts = dimensions.map((_, idx) => {
              const angle = (Math.PI * 2 / dimensions.length) * idx - Math.PI / 2;
              const r = radius * factor;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(' ');
            return (
              <polygon
                key={rIdx}
                points={pts}
                fill="none"
                stroke="rgba(133, 162, 137, 0.16)"
                strokeWidth="1"
              />
            );
          })}

          {/* Dimension Axis Spokes */}
          {dimensions.map((dim, idx) => {
            const angle = (Math.PI * 2 / dimensions.length) * idx - Math.PI / 2;
            const x = center + radius * Math.cos(angle);
            const y = center + radius * Math.sin(angle);
            const labelX = center + (radius + 24) * Math.cos(angle);
            const labelY = center + (radius + 20) * Math.sin(angle);

            return (
              <g key={dim.key}>
                <line
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="rgba(133, 162, 137, 0.22)"
                  strokeWidth="1"
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="var(--text-primary)"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {dim.label}
                </text>
              </g>
            );
          })}

          {/* National Baseline Polygon */}
          <polygon
            points={nationalPoints}
            fill="rgba(133, 162, 137, 0.15)"
            stroke="var(--color-sage-light)"
            strokeWidth="1.8"
            strokeDasharray="4 3"
          />

          {/* State Specific Polygon */}
          {statePoints && (
            <polygon
              points={statePoints}
              fill="rgba(214, 161, 93, 0.25)"
              stroke="var(--cat-amber)"
              strokeWidth="2.2"
            />
          )}

          {/* State Points */}
          {stateData && dimensions.map((dim, idx) => {
            const val = stateData[dim.key] ?? stateData[dim.key.replace('_share', '_pct')] ?? 0;
            const { x, y } = getCoordinates(val, dim.max, idx, dimensions.length);
            return (
              <circle
                key={dim.key}
                cx={x}
                cy={y}
                r="3.5"
                fill="var(--cat-amber)"
                stroke="#fff"
                strokeWidth="1"
              />
            );
          })}
        </svg>
      </div>

      <div
        style={{
          padding: '6px 14px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.625rem',
          color: 'var(--text-muted)',
          flexShrink: 0,
        }}
      >
        <span>Normalized 5-Axis Analytical Envelope</span>
        <span>Dashed: National | Solid: Active State</span>
      </div>
    </div>
  );
};

export default StateRadarComparison;
