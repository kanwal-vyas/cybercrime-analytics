import React, { useState, useMemo } from 'react';

/**
 * Interactive Longitudinal Trend Chart (2018–2022)
 * Renders verified annual trajectory series with YoY growth highlights,
 * state-specific series switching, and explicit missingness notes.
 */
export const InteractiveTrendChart = ({
  trendData,
  selectedState = null,
  height = '340px',
  className = '',
  style = {},
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Extract national series or state-specific series
  const series = useMemo(() => {
    if (!trendData) return [];

    if (selectedState && selectedState !== 'ALL' && trendData.state_trends) {
      const stateItem = trendData.state_trends.find(
        (s) => s.state_name.toLowerCase() === selectedState.toLowerCase()
      );
      if (stateItem && stateItem.annual_records) {
        return stateItem.annual_records.map((r) => ({
          year: r.year,
          cases: r.cases,
          yoy_growth_pct: r.yoy_growth_pct,
          isMissing: r.cases === null || isNaN(r.cases),
        }));
      }
    }

    // Default National Trends
    return (trendData.national_trends || []).map((r) => ({
      year: r.year,
      cases: r.national_total_cases,
      yoy_growth_pct: r.yoy_growth_pct,
      isMissing: false,
    }));
  }, [trendData, selectedState]);

  // Dimensions for SVG canvas
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 60;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 35;

  const width = svgWidth - padLeft - padRight;
  const heightPlot = svgHeight - padTop - padBottom;

  const validCases = series.filter((s) => !s.isMissing).map((s) => s.cases);
  const maxVal = validCases.length ? Math.max(...validCases) * 1.15 : 70000;

  const points = useMemo(() => {
    if (!series.length) return [];
    return series.map((item, idx) => {
      const x = padLeft + (idx / (series.length - 1)) * width;
      if (item.isMissing) {
        return { ...item, x, y: null };
      }
      const y = padTop + heightPlot - (item.cases / maxVal) * heightPlot;
      return { ...item, x, y };
    });
  }, [series, width, heightPlot, maxVal]);

  // Construct SVG path for area and line
  const { linePath, areaPath } = useMemo(() => {
    const validPts = points.filter((p) => p.y !== null);
    if (!validPts.length) return { linePath: '', areaPath: '' };

    let lD = `M ${validPts[0].x} ${validPts[0].y}`;
    for (let i = 1; i < validPts.length; i++) {
      lD += ` L ${validPts[i].x} ${validPts[i].y}`;
    }

    const baselineY = padTop + heightPlot;
    const aD = `${lD} L ${validPts[validPts.length - 1].x} ${baselineY} L ${validPts[0].x} ${baselineY} Z`;

    return { linePath: lD, areaPath: aD };
  }, [points, padTop, heightPlot]);

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
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-4)',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div className="tech-label" style={{ fontSize: '0.6875rem' }}>LONGITUDINAL TRAJECTORY</div>
          <h4 style={{ margin: '2px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
            {selectedState && selectedState !== 'ALL'
              ? `${selectedState} Historical Trend (2018–2022)`
              : 'National Historical Trajectory (2018–2022)'}
          </h4>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              padding: '2px 8px',
              backgroundColor: 'var(--cat-sage-bg)',
              border: '1px solid var(--cat-sage-border)',
              borderRadius: '12px',
              fontSize: '0.6875rem',
              color: 'var(--color-sage-light)',
              fontWeight: 600,
            }}
          >
            +141.83% 5-Yr Growth
          </span>
        </div>
      </div>

      {/* SVG Plot */}
      <div style={{ flex: 1, position: 'relative', padding: 'var(--space-2)' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: '100%', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-sage)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-sage)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padTop + heightPlot * (1 - ratio);
            const val = Math.round(maxVal * ratio);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={svgWidth - padRight}
                  y2={y}
                  stroke="rgba(133, 162, 137, 0.10)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="9.5"
                  fontFamily="var(--font-mono)"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                </text>
              </g>
            );
          })}

          {/* Area Fill & Curve */}
          {areaPath && <path d={areaPath} fill="url(#trendAreaGradient)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--color-sage)"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Interactive Data Points & Year Axis */}
          {points.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <g key={pt.year}>
                {/* Year Label */}
                <text
                  x={pt.x}
                  y={svgHeight - 10}
                  textAnchor="middle"
                  fill={isHovered ? 'var(--text-primary)' : 'var(--text-secondary)'}
                  fontSize="11"
                  fontWeight={isHovered ? '700' : '500'}
                  fontFamily="var(--font-mono)"
                >
                  {pt.year}
                </text>

                {/* Point */}
                {!pt.isMissing && (
                  <g
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill={isHovered ? '#FFFFFF' : 'var(--color-sage)'}
                      stroke="var(--bg-app)"
                      strokeWidth="2"
                      style={{ transition: 'all 0.15s ease' }}
                    />

                    {/* Point Label */}
                    <text
                      x={pt.x}
                      y={pt.y - 10}
                      textAnchor="middle"
                      fill={isHovered ? '#FFFFFF' : 'var(--text-primary)'}
                      fontSize={isHovered ? '11' : '9.5'}
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {pt.cases.toLocaleString()}
                    </text>

                    {/* YoY Tag */}
                    {pt.yoy_growth_pct !== null && (
                      <text
                        x={pt.x}
                        y={pt.y + 16}
                        textAnchor="middle"
                        fill="var(--color-sage-light)"
                        fontSize="8.5"
                        fontWeight="600"
                        fontFamily="var(--font-mono)"
                      >
                        +{pt.yoy_growth_pct}%
                      </text>
                    )}
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer provenance */}
      <div
        style={{
          padding: 'var(--space-2) var(--space-4)',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-elevated)',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.6875rem',
          color: 'var(--text-muted)',
        }}
      >
        <span>Source: Rajya Sabha AU 226 / NCRB Historical Panel</span>
        <span>Isolated Longitudinal Trajectory</span>
      </div>
    </div>
  );
};

export default InteractiveTrendChart;
