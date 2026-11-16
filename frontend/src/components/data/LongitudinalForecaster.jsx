import React, { useState, useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

/**
 * Longitudinal Cybercrime Trajectory & Forecasting Simulator (2024–2026)
 * Generates bounded predictive envelopes based on historical panel growth and policy interventions.
 */

const HISTORICAL_SERIES = [
  { year: 2018, cases: 27248, isActual: true },
  { year: 2019, cases: 44735, isActual: true },
  { year: 2020, cases: 50035, isActual: true },
  { year: 2021, cases: 52974, isActual: true },
  { year: 2022, cases: 65893, isActual: true },
  { year: 2023, cases: 86420, isActual: true },
];

export default function LongitudinalForecaster({ className = '' }) {
  // Interactive Simulation Parameters
  const [modelType, setModelType] = useState('cagr'); // 'cagr' | 'linear' | 'damped'
  const [enforcementDamping, setEnforcementDamping] = useState(12); // 0% to 35% reduction via I4C/1930
  const [reportingAwarenessSurge, setReportingAwarenessSurge] = useState(15); // 0% to 40% increase in reporting
  const [confidenceLevel, setConfidenceLevel] = useState(0.95); // 0.80 or 0.95

  // Historical 5-year CAGR (2018 to 2023)
  const baseCagr = Math.pow(86420 / 27248, 1 / 5) - 1; // ~0.259 (25.9% p.a.)

  // Compute 2024–2026 Forecast Points
  const simulation = useMemo(() => {
    const netGrowthRate = Math.max(
      0.05,
      baseCagr * (1 + reportingAwarenessSurge / 100) * (1 - enforcementDamping / 100)
    );

    const projected = [];
    let prevVal = 86420;

    for (let yr = 2024; yr <= 2026; yr++) {
      let nextCases;
      if (modelType === 'cagr') {
        nextCases = prevVal * (1 + netGrowthRate);
      } else if (modelType === 'linear') {
        const annualAvgDelta = (86420 - 27248) / 5;
        nextCases = prevVal + annualAvgDelta * (1 + reportingAwarenessSurge / 100 - enforcementDamping / 100);
      } else {
        // Damped saturation model
        const dampingFactor = Math.pow(0.88, yr - 2023);
        nextCases = prevVal * (1 + netGrowthRate * dampingFactor);
      }

      nextCases = Math.round(nextCases);
      const ciMultiplier = confidenceLevel === 0.95 ? 0.16 : 0.09;
      const spread = nextCases * ciMultiplier * Math.sqrt(yr - 2023);

      projected.push({
        year: yr,
        cases: nextCases,
        upper: Math.round(nextCases + spread),
        lower: Math.round(Math.max(nextCases - spread, prevVal)),
        isActual: false,
      });

      prevVal = nextCases;
    }

    const fullSeries = [...HISTORICAL_SERIES, ...projected];
    const maxVal = Math.max(...projected.map((p) => p.upper)) * 1.08;

    return {
      fullSeries,
      projected,
      netGrowthRate,
      maxVal,
      unmitigated2026: Math.round(86420 * Math.pow(1 + baseCagr, 3)),
      projected2026: projected[2].cases,
    };
  }, [modelType, enforcementDamping, reportingAwarenessSurge, confidenceLevel, baseCagr]);

  // SVG dimensions
  const svgWidth = 860;
  const svgHeight = 320;
  const padLeft = 70;
  const padRight = 40;
  const padTop = 30;
  const padBottom = 40;

  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const getX = (idx, total) => padLeft + (idx / (total - 1)) * plotW;
  const getY = (val) => padTop + plotH - (val / simulation.maxVal) * plotH;

  // Build SVG Paths
  const actualCount = HISTORICAL_SERIES.length;
  const totalCount = simulation.fullSeries.length;

  const actualPath = HISTORICAL_SERIES.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i, totalCount)} ${getY(pt.cases)}`).join(' ');

  const forecastPath = [
    `M ${getX(actualCount - 1, totalCount)} ${getY(HISTORICAL_SERIES[actualCount - 1].cases)}`,
    ...simulation.projected.map((pt, i) => `L ${getX(actualCount + i, totalCount)} ${getY(pt.cases)}`),
  ].join(' ');

  // Confidence Band Area (2023 -> 2026)
  const confidenceArea = [
    `M ${getX(actualCount - 1, totalCount)} ${getY(86420)}`,
    ...simulation.projected.map((pt, i) => `L ${getX(actualCount + i, totalCount)} ${getY(pt.upper)}`),
    ...simulation.projected.slice().reverse().map((pt, i) => `L ${getX(totalCount - 1 - i, totalCount)} ${getY(pt.lower)}`),
    'Z',
  ].join(' ');

  const preventedCases = Math.max(0, simulation.unmitigated2026 - simulation.projected2026);

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#1E2F23',
              border: '1px solid #3E6347',
              color: 'var(--color-sage-light)',
            }}
          >
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="tech-label" style={{ fontSize: '0.6875rem' }}>PREDICTIVE LONGITUDINAL MODELING</div>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              National Cybercrime Trajectory Forecast (2024–2026)
            </h3>
          </div>
        </div>

        {/* Model Selector */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-base)', padding: '3px', borderRadius: '6px' }}>
          {[
            { id: 'cagr', label: 'Exponential Drift (CAGR)' },
            { id: 'damped', label: 'Damped Saturation' },
            { id: 'linear', label: 'Linear Trajectory' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setModelType(m.id)}
              style={{
                background: modelType === m.id ? 'var(--bg-surface-elevated)' : 'transparent',
                border: modelType === m.id ? '1px solid var(--border-strong)' : '1px solid transparent',
                color: modelType === m.id ? 'var(--text-primary)' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Simulation Sliders */}
      <div
        style={{
          padding: 'var(--space-4)',
          backgroundColor: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Slider 1: Enforcement Damping */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>I4C / 1930 Enforcement Interception:</span>
            <strong style={{ color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)' }}>-{enforcementDamping}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="35"
            step="1"
            value={enforcementDamping}
            onChange={(e) => setEnforcementDamping(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--color-sage-light)' }}
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Simulates mule account freezes, IMEI blocking & SIM suspensions.
          </div>
        </div>

        {/* Slider 2: Reporting Awareness Surge */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Citizen Reporting Awareness Surge:</span>
            <strong style={{ color: '#FBBF24', fontFamily: 'var(--font-mono)' }}>+{reportingAwarenessSurge}%</strong>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="1"
            value={reportingAwarenessSurge}
            onChange={(e) => setReportingAwarenessSurge(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#FBBF24' }}
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Simulates reduced 'dark figure' via easier online FIR / 1930 access.
          </div>
        </div>

        {/* Confidence Level Toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Statistical Confidence Interval:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { val: 0.80, label: '80% Envelope' },
              { val: 0.95, label: '95% Envelope' },
            ].map((ci) => (
              <button
                key={ci.val}
                onClick={() => setConfidenceLevel(ci.val)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: confidenceLevel === ci.val ? 'var(--bg-surface-elevated)' : 'transparent',
                  border: confidenceLevel === ci.val ? '1px solid var(--border-strong)' : '1px solid var(--border-subtle)',
                  color: confidenceLevel === ci.val ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {ci.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SVG Projection Canvas */}
      <div style={{ padding: 'var(--space-3)', backgroundColor: '#0F1612' }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((frac, i) => {
            const val = Math.round(simulation.maxVal * frac);
            const y = getY(val);
            return (
              <g key={`grid-${i}`}>
                <line x1={padLeft} y1={y} x2={svgWidth - padRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3,3" />
                <text x={padLeft - 10} y={y + 4} textAnchor="end" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)">
                  {val.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* Historical vs Forecast Divider line */}
          <line
            x1={getX(actualCount - 1, totalCount)}
            y1={padTop}
            x2={getX(actualCount - 1, totalCount)}
            y2={svgHeight - padBottom}
            stroke="rgba(255,255,255,0.2)"
            strokeDasharray="4,4"
          />
          <text
            x={getX(actualCount - 1, totalCount) - 8}
            y={padTop + 14}
            textAnchor="end"
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            HISTORICAL AUDIT
          </text>
          <text
            x={getX(actualCount - 1, totalCount) + 8}
            y={padTop + 14}
            textAnchor="start"
            fill="var(--color-sage-light)"
            fontSize="10"
            fontFamily="var(--font-mono)"
            fontWeight="600"
          >
            PREDICTIVE HORIZON
          </text>

          {/* Confidence Band Envelope */}
          <path d={confidenceArea} fill="rgba(133, 162, 137, 0.12)" />

          {/* Actual Historical Path (Solid) */}
          <path d={actualPath} fill="none" stroke="var(--text-primary)" strokeWidth="3" />

          {/* Projected Path (Dashed) */}
          <path
            d={forecastPath}
            fill="none"
            stroke="var(--color-sage-light)"
            strokeWidth="3"
            strokeDasharray="6,4"
          />

          {/* Upper & Lower Envelope Bounds */}
          {simulation.projected.map((pt, i) => {
            const x = getX(actualCount + i, totalCount);
            return (
              <g key={`bounds-${pt.year}`}>
                <line x1={x} y1={getY(pt.lower)} x2={x} y2={getY(pt.upper)} stroke="rgba(133, 162, 137, 0.4)" strokeWidth="1.5" />
                <circle cx={x} cy={getY(pt.upper)} r="3" fill="#85A289" />
                <circle cx={x} cy={getY(pt.lower)} r="3" fill="#85A289" />
              </g>
            );
          })}

          {/* Year X-axis points & labels */}
          {simulation.fullSeries.map((pt, i) => {
            const x = getX(i, totalCount);
            const y = getY(pt.cases);
            return (
              <g key={`pt-${pt.year}`}>
                {/* Year Label */}
                <text
                  x={x}
                  y={svgHeight - padBottom + 20}
                  textAnchor="middle"
                  fill={pt.isActual ? 'var(--text-secondary)' : 'var(--color-sage-light)'}
                  fontSize="11"
                  fontFamily="var(--font-mono)"
                  fontWeight={pt.year === 2023 || pt.year === 2026 ? 700 : 500}
                >
                  {pt.year}
                </text>

                {/* Point Marker */}
                <circle
                  cx={x}
                  cy={y}
                  r={pt.year === 2023 ? 6 : 4.5}
                  fill={pt.isActual ? '#E8E3DE' : '#85A289'}
                  stroke="#0F1612"
                  strokeWidth="2"
                />

                {/* Case label on key milestones */}
                {(pt.year === 2018 || pt.year === 2023 || pt.year === 2026) && (
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fill={pt.isActual ? 'var(--text-primary)' : '#85A289'}
                    fontSize="11"
                    fontFamily="var(--font-mono)"
                    fontWeight="700"
                  >
                    {pt.cases.toLocaleString()}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Projection Summary Metrics */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-3)',
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>PROJECTED 2026 VOLUME</div>
          <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-sage-light)' }}>
            {simulation.projected2026.toLocaleString()} <span style={{ fontSize: '0.75rem' }}>cases</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>EST. CASES MITIGATED (2026)</div>
          <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FBBF24' }}>
            ~{preventedCases.toLocaleString()} <span style={{ fontSize: '0.75rem' }}>prevented</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>EFFECTIVE CAGR DRIFT</div>
          <div className="font-mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            +{(simulation.netGrowthRate * 100).toFixed(1)}% <span style={{ fontSize: '0.75rem' }}>per annum</span>
          </div>
        </div>
      </div>
    </div>
  );
}
