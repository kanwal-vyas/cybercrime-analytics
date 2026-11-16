import React, { useState, useMemo } from 'react';
import statePaths from '../../assets/india_state_paths.json';
import { MapPin, RotateCcw } from 'lucide-react';

/**
 * Interactive India Choropleth GeoJSON/SVG Map
 * 
 * Provides an analytical geospatial visualization of 36 Indian States & Union Territories
 * with multiple multi-metric layers (Volume, Act Dominance, K=4 Clusters, Anomaly Flags),
 * rich hover inspection cards, and synchronized click-to-filter mechanics.
 */
export const IndiaChoroplethMap = ({
  states: rawStates = [],
  statesData,
  selectedState = null,
  onSelectState = () => { },
  clusteringData = null,
  outliersData = null,
  height = '620px',
  title = 'Geospatial Intelligence Map',
  subtitle = 'Interactive 36 States/UTs Choropleth Projection',
  className = '',
  style = {},
}) => {
  const states = useMemo(() => statesData || rawStates || [], [statesData, rawStates]);

  // Layer selection: 'volume' | 'act_dominance' | 'cluster' | 'anomalies'
  const [activeLayer, setActiveLayer] = useState('volume');
  const [hoveredState, setHoveredState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Map state data by state_name for instant O(1) lookup
  const stateDataMap = useMemo(() => {
    const map = new Map();
    states.forEach((s) => {
      map.set(s.state_name, s);
    });
    return map;
  }, [states]);

  // Cluster assignments lookup
  const clusterMap = useMemo(() => {
    const map = new Map();
    if (clusteringData?.state_assignments) {
      clusteringData.state_assignments.forEach((item) => {
        map.set(item.state_name, item);
      });
    }
    return map;
  }, [clusteringData]);

  // Consensus anomalies set
  const anomalySet = useMemo(() => {
    const set = new Set();
    if (outliersData?.consensus_jurisdictions) {
      outliersData.consensus_jurisdictions.forEach((name) => set.add(name));
    }
    // Standard consensus outliers if API models not loaded
    if (set.size === 0) {
      ['Karnataka', 'Telangana', 'Uttar Pradesh', 'Maharashtra', 'Bihar', 'Delhi'].forEach(
        (name) => set.add(name)
      );
    }
    return set;
  }, [outliersData]);

  // Volume bounds for logarithmic scaling
  const maxVolume = useMemo(() => {
    if (!states.length) return 21889;
    return Math.max(...states.map((s) => s.total_cases || 0));
  }, [states]);

  // Calculate dynamic fill color for a given state
  const getStateColor = (stateName) => {
    const record = stateDataMap.get(stateName);
    const isHovered = hoveredState?.state_name === stateName;

    // Fallback if record not loaded yet
    const volume = record?.total_cases || 0;
    const itShare = record?.it_act_share || 50;
    const ipcShare = record?.ipc_share || 50;

    if (activeLayer === 'volume') {
      if (volume <= 0) return '#1A231E';
      // Logarithmic intensity 0 to 1
      const logMax = Math.log(maxVolume + 1);
      const logVal = Math.log(volume + 1);
      const ratio = Math.min(Math.max(logVal / logMax, 0), 1);

      // Multi-stop tactical palette: Dark slate -> Deep Forest -> Vibrant Sage -> Highlight Amber
      if (ratio > 0.85) return isHovered ? '#F0BD5D' : '#E0A340'; // Top volume (KA, TS, UP)
      if (ratio > 0.65) return isHovered ? '#A4C4A9' : '#85A289'; // High volume
      if (ratio > 0.45) return isHovered ? '#6B8E70' : '#507656'; // Mid-high volume
      if (ratio > 0.25) return isHovered ? '#3F5B44' : '#304735'; // Mid-low volume
      return isHovered ? '#253528' : '#1B261E'; // Low volume
    }

    if (activeLayer === 'act_dominance') {
      if (itShare > 60) {
        return isHovered ? '#97B69B' : '#6A9370'; // Heavy IT Act
      }
      if (ipcShare > 60) {
        return isHovered ? '#C7AFC4' : '#956E92'; // Heavy IPC
      }
      return isHovered ? '#6C888B' : '#4E6B6E'; // Balanced
    }

    if (activeLayer === 'cluster') {
      const clusterInfo = clusterMap.get(stateName);
      const clusterId = clusterInfo?.cluster_id ?? 0;
      switch (clusterId) {
        case 0:
          return isHovered ? '#A4C4A9' : '#85A289'; // Cluster 0: Moderate Fraud (Sage)
        case 1:
          return isHovered ? '#7895A2' : '#607D8B'; // Cluster 1: Balanced (Slate)
        case 2:
          return isHovered ? '#E5B87E' : '#D6A15D'; // Cluster 2: Small UTs / Sex Expl (Amber)
        case 3:
          return isHovered ? '#C7AFC4' : '#B296AE'; // Cluster 3: High IT/Fraud (Mauve)
        default:
          return '#3A483F';
      }
    }

    if (activeLayer === 'anomalies') {
      const isAnomaly = anomalySet.has(stateName);
      if (isAnomaly) {
        return isHovered ? '#E57373' : '#D65A65'; // Flagged Multivariate Anomaly
      }
      return isHovered ? '#2E3D33' : '#1C2520'; // Nominal
    }

    return '#2B392F';
  };

  const handleMouseMove = (e) => {
    // Relative coordinates inside container
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleStateHover = (stateName) => {
    const record = stateDataMap.get(stateName) || {
      state_name: stateName,
      total_cases: 0,
      admin_type: 'Unknown',
      national_share: 0,
    };
    setHoveredState(record);
  };

  const handleStateLeave = () => {
    setHoveredState(null);
  };

  const handleStateClick = (stateName) => {
    if (selectedState === stateName) {
      onSelectState('ALL');
    } else {
      onSelectState(stateName);
    }
  };

  // List of prominent Union Territories for quick-access pill navigation
  const quickUtList = [
    'Delhi',
    'Chandigarh',
    'Puducherry',
    'Goa',
    'Ladakh',
    'Jammu and Kashmir',
    'Andaman and Nicobar Islands',
    'Lakshadweep',
    'Dadra and Nagar Haveli and Daman and Diu',
  ];

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
      onMouseMove={handleMouseMove}
    >
      {/* Header & Multi-Layer Selector */}
      <div
        style={{
          padding: 'var(--space-3) var(--space-5)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          backgroundColor: 'var(--bg-surface-elevated)',
          zIndex: 10,
        }}
      >
        <div>
          <div className="tech-label" style={{ fontSize: '0.6875rem', marginBottom: '2px' }}>
            GEOSPATIAL INTELLIGENCE
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h4 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
              {title}
            </h4>
            {subtitle && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {subtitle}
              </span>
            )}
            {selectedState && selectedState !== 'ALL' && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--cat-amber-bg)',
                  border: '1px solid var(--cat-amber-border)',
                  color: 'var(--cat-amber)',
                  fontWeight: 600,
                }}
              >
                Filtered: {selectedState}
              </span>
            )}
          </div>
        </div>

        {/* Tactical Layer Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '2px',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <button
              onClick={() => setActiveLayer('volume')}
              style={{
                border: 'none',
                background: activeLayer === 'volume' ? 'var(--color-sage-deep)' : 'transparent',
                color: activeLayer === 'volume' ? '#fff' : 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Registered Volume
            </button>
            <button
              onClick={() => setActiveLayer('act_dominance')}
              style={{
                border: 'none',
                background: activeLayer === 'act_dominance' ? 'var(--color-mauve-deep)' : 'transparent',
                color: activeLayer === 'act_dominance' ? '#fff' : 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Act Dominance
            </button>
            <button
              onClick={() => setActiveLayer('cluster')}
              style={{
                border: 'none',
                background: activeLayer === 'cluster' ? 'var(--cat-amber)' : 'transparent',
                color: activeLayer === 'cluster' ? '#111' : 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              K-Means Cluster (K=4)
            </button>
            <button
              onClick={() => setActiveLayer('anomalies')}
              style={{
                border: 'none',
                background: activeLayer === 'anomalies' ? 'var(--status-danger)' : 'transparent',
                color: activeLayer === 'anomalies' ? '#fff' : 'var(--text-secondary)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Outliers & Anomalies
            </button>
          </div>

          {selectedState && selectedState !== 'ALL' && (
            <button
              onClick={() => onSelectState('ALL')}
              title="Reset state filter to All Jurisdictions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '5px 9px',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={12} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Map Body with SVG Canvas & Overlay HUD */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#070A08',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Map Watermark / Coordinates Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(133, 162, 137, 0.05) 1px, transparent 0)',
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />

        {/* SVG India Map Projection */}
        <svg
          viewBox="0 0 800 950"
          style={{
            width: '100%',
            height: '100%',
            maxHeight: '100%',
            display: 'block',
            filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.5))',
          }}
        >
          <g>
            {Object.entries(statePaths).map(([stateName, pathD]) => {
              const isSelected = selectedState === stateName;
              const isHovered = hoveredState?.state_name === stateName;
              const hasSelection = Boolean(selectedState && selectedState !== 'ALL');
              const fill = getStateColor(stateName);

              // Dim non-selected states when a specific state is focused
              const opacity = hasSelection ? (isSelected ? 1 : 0.35) : isHovered ? 1 : 0.92;
              const stroke = isSelected
                ? '#5DE6A6'
                : isHovered
                  ? '#FFFFFF'
                  : 'rgba(133, 162, 137, 0.45)';
              const strokeWidth = isSelected ? 2.5 : isHovered ? 1.8 : 0.75;

              return (
                <path
                  key={stateName}
                  d={pathD}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  style={{
                    opacity,
                    cursor: 'pointer',
                    transition: 'fill 0.2s ease, opacity 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease',
                  }}
                  onMouseEnter={(e) => handleStateHover(stateName, e)}
                  onMouseLeave={handleStateLeave}
                  onClick={() => handleStateClick(stateName)}
                />
              );
            })}
          </g>
        </svg>

        {/* Dynamic Map Legend HUD (Bottom Left) */}
        <div
          style={{
            position: 'absolute',
            bottom: 'var(--space-3)',
            left: 'var(--space-4)',
            backgroundColor: 'rgba(10, 15, 12, 0.94)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(133, 162, 137, 0.35)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            zIndex: 5,
            pointerEvents: 'none',
            color: '#E8E3DE',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)',
          }}
        >
          {activeLayer === 'volume' && (
            <div>
              <div style={{ fontWeight: 700, color: '#A4C4A9', marginBottom: '6px', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                VOLUME HEAT SCALE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#B4C0B7', fontSize: '0.6875rem' }}>Low (1)</span>
                <div
                  style={{
                    width: '100px',
                    height: '8px',
                    borderRadius: '4px',
                    background: 'linear-gradient(to right, #1B261E, #304735, #507656, #85A289, #E0A340)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <span style={{ color: '#FBBF24', fontWeight: 700, fontSize: '0.75rem' }}>21,889</span>
              </div>
            </div>
          )}

          {activeLayer === 'act_dominance' && (
            <div>
              <div style={{ fontWeight: 700, color: '#A4C4A9', marginBottom: '6px', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                STATUTORY ACT DOMINANCE
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#E8E3DE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#6A9370', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span style={{ color: '#E8E3DE', fontWeight: 500 }}>IT Act Dominant (&gt;60%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#956E92', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span style={{ color: '#E8E3DE', fontWeight: 500 }}>IPC Dominant (&gt;60%)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#4E6B6E', borderRadius: '2px', border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span style={{ color: '#E8E3DE', fontWeight: 500 }}>Balanced Statutory Portfolio</span>
                </div>
              </div>
            </div>
          )}

          {activeLayer === 'cluster' && (
            <div>
              <div style={{ fontWeight: 700, color: '#A4C4A9', marginBottom: '6px', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                COMPOSITIONAL CLUSTERS (K=4)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#E8E3DE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--cat-sage)', borderRadius: '2px' }} />
                  <span style={{ color: '#E8E3DE', fontWeight: 500 }}>C0: Mod. Fraud / Low IT (n=15)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--cat-slate)', borderRadius: '2px' }} />
                  <span style={{ color: '#E8E3DE', fontWeight: 500 }}>C1: Balanced IT & IPC (n=12)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--cat-amber)', borderRadius: '2px' }} />
                  <span style={{ color: '#E8E3DE', fontWeight: 500 }}>C2: Small UTs / Sex. Expl. (n=2)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: 'var(--cat-mauve)', borderRadius: '2px' }} />
                  <span style={{ color: '#E8E3DE', fontWeight: 500 }}>C3: High IT & Fraud (n=7)</span>
                </div>
              </div>
            </div>
          )}

          {activeLayer === 'anomalies' && (
            <div>
              <div style={{ fontWeight: 700, color: '#A4C4A9', marginBottom: '6px', fontSize: '0.6875rem', letterSpacing: '0.04em' }}>
                OUTLIER CONSENSUS SCREENING
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: '#E8E3DE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#D65A65', borderRadius: '2px', border: '1px solid #FF8A95' }} />
                  <span style={{ color: '#FCA5A5', fontWeight: 600 }}>Multivariate Departure (Consensus)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#1C2520', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '2px' }} />
                  <span style={{ color: '#D1DDD4', fontWeight: 500 }}>Statistically Nominal Jurisdiction</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Floating Hover Card */}
        {hoveredState && (
          <div
            style={{
              position: 'absolute',
              top: Math.min(Math.max(mousePos.y - 120, 10), 400),
              left: Math.min(Math.max(mousePos.x + 20, 10), 520),
              backgroundColor: 'rgba(10, 15, 12, 0.96)',
              border: '1px solid rgba(133, 162, 137, 0.45)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.65)',
              padding: 'var(--space-3) var(--space-4)',
              width: '260px',
              zIndex: 30,
              pointerEvents: 'none',
              backdropFilter: 'blur(10px)',
              color: '#E8E3DE',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: '#FFFFFF' }}>
                {hoveredState.state_name}
              </span>
              <span
                style={{
                  fontSize: '0.625rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: hoveredState.is_ut ? 'var(--cat-amber-bg)' : 'var(--cat-sage-bg)',
                  color: hoveredState.is_ut ? 'var(--cat-amber)' : 'var(--cat-sage)',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {hoveredState.admin_type || (hoveredState.is_ut ? 'UT' : 'State')}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-2)', marginBottom: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>
                {(hoveredState.total_cases || 0).toLocaleString()}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#B4C0B7' }}>
                cases ({hoveredState.national_share || 0}% national)
              </span>
            </div>

            {/* Statutory Split Progress Mini-Bar */}
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: '#D1DDD4', marginBottom: '2px' }}>
                <span>IT Act: {hoveredState.it_act_share || 0}%</span>
                <span>IPC: {hoveredState.ipc_share || 0}%</span>
              </div>
              <div style={{ height: '4px', display: 'flex', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${hoveredState.it_act_share || 50}%`, backgroundColor: 'var(--color-sage)' }} />
                <div style={{ width: `${hoveredState.ipc_share || 50}%`, backgroundColor: 'var(--color-mauve)' }} />
              </div>
            </div>

            {/* Intelligence Context Details */}
            <div style={{ fontSize: '0.6875rem', color: '#E8E3DE', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#A4B8AB' }}>Fraud Motive Share:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#FFFFFF' }}>
                  {hoveredState.fraud_motive_share != null
                    ? (hoveredState.fraud_motive_share <= 1
                        ? (hoveredState.fraud_motive_share * 100).toFixed(1)
                        : Number(hoveredState.fraud_motive_share).toFixed(1))
                    : 0}%
                </span>
              </div>
              {clusterMap.has(hoveredState.state_name) && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#A4B8AB' }}>Composition Cluster:</span>
                  <span style={{ fontWeight: 600, color: 'var(--cat-amber)' }}>
                    Cluster {clusterMap.get(hoveredState.state_name).cluster_id}
                  </span>
                </div>
              )}
              {anomalySet.has(hoveredState.state_name) && (
                <div style={{ marginTop: '4px', padding: '2px 6px', backgroundColor: 'rgba(214, 90, 101, 0.25)', border: '1px solid rgba(214, 90, 101, 0.5)', borderRadius: '3px', color: '#FCA5A5', fontWeight: 600, fontSize: '0.625rem' }}>
                  Multivariate Anomaly Flag
                </div>
              )}
            </div>

            <div style={{ marginTop: '8px', paddingTop: '4px', borderTop: '1px solid rgba(133, 162, 137, 0.2)', fontSize: '0.625rem', color: 'var(--color-sage-light)', textAlign: 'center', fontWeight: 500 }}>
              Click jurisdiction to filter explorer view
            </div>
          </div>
        )}
      </div>

      {/* Quick Jurisdiction Navigator Ribbon (Easily select smaller UTs and any state) */}
      <div
        style={{
          padding: 'var(--space-2) var(--space-4)',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderTop: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          overflowX: 'auto',
          fontSize: '0.75rem',
          zIndex: 10,
        }}
      >
        <span style={{ color: 'var(--text-primary)', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={12} color="var(--color-sage-light)" />
          Fast Select:
        </span>
        {quickUtList.map((name) => {
          const isSelected = selectedState === name;
          return (
            <button
              key={name}
              onClick={() => handleStateClick(name)}
              style={{
                border: isSelected ? '1px solid var(--color-sage-light)' : '1px solid var(--border-default)',
                backgroundColor: isSelected ? 'var(--color-sage-deep)' : 'var(--bg-surface)',
                color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 9px',
                fontSize: '0.6875rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              {name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IndiaChoroplethMap;
