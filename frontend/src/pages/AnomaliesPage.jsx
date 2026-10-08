import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';
import Panel from '../components/ui/Panel';
import MetricCard from '../components/ui/MetricCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import DataTable from '../components/data/DataTable';
import ChartContainer from '../components/charts/ChartContainer';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import api from '../services/api';
import {
  Target,
  Layers,
  ShieldCheck,
  Search,
  AlertTriangle,
  Scale,
  Sparkles,
  Activity,
  Check,
  Compass
} from 'lucide-react';

const CONSENSUS_COLORS = {
  4: { color: '#D8A563', name: 'Consensus Anomaly (4/4)', bg: 'rgba(216, 165, 99, 0.15)', badge: 'warning' },
  3: { color: '#B296AE', name: 'High Agreement (3/4)', bg: 'rgba(178, 150, 174, 0.15)', badge: 'accent' },
  2: { color: '#85A289', name: 'Partial Agreement (2/4)', bg: 'rgba(133, 162, 137, 0.12)', badge: 'neutral' },
  1: { color: '#507656', name: 'Single Method (1/4)', bg: 'rgba(80, 118, 86, 0.1)', badge: 'neutral' },
  0: { color: '#66706B', name: 'No Detection (0/4)', bg: 'transparent', badge: 'neutral' },
};

const ORIENTATION_COLORS = {
  'Both Volume & Composition Anomaly': { color: '#D8A563', label: 'Both Volume & Composition' },
  'Volume-Scale Driven Anomaly': { color: '#85A289', label: 'Volume-Scale Driven' },
  'Compositional Departure Only': { color: '#B296AE', label: 'Compositional Departure' },
  'Not Anomalous in Tested Spaces': { color: '#66706B', label: 'Baseline Structure' },
};

export const AnomaliesPage = () => {
  // Primary API Data State
  const [outlierData, setOutlierData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI Interactive States
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'consensus' | 'orientation' | 'methods'
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [selectedScoreFilter, setSelectedScoreFilter] = useState('ALL'); // 'ALL' | '4' | '3' | '2' | '1' | '0'
  const [selectedOrientationFilter, setSelectedOrientationFilter] = useState('ALL');
  const [hoveredScatterState, setHoveredScatterState] = useState(null);

  // Fetch Outlier & Anomaly Data from Backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOutlierConsensus();
      setOutlierData(data);
    } catch (err) {
      console.error('[AnomaliesPage] Error fetching outlier data:', err);
      setError(err.message || 'Unable to retrieve outlier analytics from backend API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combined State Records (Consensus + Orientation)
  const combinedStateRecords = useMemo(() => {
    if (!outlierData) return [];
    const cs = outlierData.consensus_summary || [];
    const vcMap = new Map((outlierData.volume_vs_composition || []).map((x) => [x.state_name, x]));

    return cs.map((item) => {
      const vc = vcMap.get(item.state_name) || {};
      return {
        ...item,
        joint_iso_outlier: vc.joint_iso_outlier || 'No',
        joint_mah_outlier: vc.joint_mah_outlier || 'No',
        comp_iso_outlier: vc.comp_iso_outlier || 'No',
        comp_mah_outlier: vc.comp_mah_outlier || 'No',
        joint_mahalanobis_dist: vc.joint_mahalanobis_dist || 0,
        comp_mahalanobis_dist: vc.comp_mahalanobis_dist || 0,
        anomaly_orientation: vc.anomaly_orientation || 'Not Anomalous in Tested Spaces',
      };
    });
  }, [outlierData]);

  // Filtered State Records for Table
  const filteredRecords = useMemo(() => {
    return combinedStateRecords.filter((st) => {
      if (selectedScoreFilter !== 'ALL' && st.consensus_score !== Number(selectedScoreFilter)) {
        return false;
      }
      if (selectedOrientationFilter !== 'ALL' && st.anomaly_orientation !== selectedOrientationFilter) {
        return false;
      }
      if (stateSearchQuery.trim()) {
        const q = stateSearchQuery.toLowerCase().trim();
        return st.state_name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [combinedStateRecords, selectedScoreFilter, selectedOrientationFilter, stateSearchQuery]);

  // Consensus Score Distribution Summary
  const consensusDistribution = useMemo(() => {
    const dist = { 4: 0, 3: 0, 2: 0, 1: 0, 0: 0 };
    combinedStateRecords.forEach((st) => {
      dist[st.consensus_score] = (dist[st.consensus_score] || 0) + 1;
    });
    return dist;
  }, [combinedStateRecords]);

  // Orientation Distribution Summary
  const orientationDistribution = useMemo(() => {
    const dist = {};
    combinedStateRecords.forEach((st) => {
      dist[st.anomaly_orientation] = (dist[st.anomaly_orientation] || 0) + 1;
    });
    return dist;
  }, [combinedStateRecords]);

  if (loading) {
    return (
      <PageContainer>
        <SectionHeader
          category="STAGE 26 — ANOMALY & OUTLIER ANALYTICS"
          title="Multivariate State/UT Departures"
          description="Materializing validated multidimensional anomaly screenings, consensus scores, and dual-space separations from FastAPI backend..."
        />
        <LoadingState message="Retrieving validated anomaly detections and sensitivity evaluations from backend /api/models/outliers..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <SectionHeader
          category="STAGE 26 — ANOMALY & OUTLIER ANALYTICS"
          title="Multivariate State/UT Departures"
          description="Error connecting to validated analytical endpoints."
        />
        <ErrorState message={error} onRetry={fetchData} />
      </PageContainer>
    );
  }

  // Consensus Table Columns
  const consensusColumns = [
    {
      key: 'state_name',
      label: 'State / Union Territory',
      sortable: true,
      render: (val, row) => {
        const cfg = CONSENSUS_COLORS[row.consensus_score] || { color: '#85A289' };
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: cfg.color,
              }}
            />
            <span style={{ fontWeight: 600 }}>{val}</span>
          </div>
        );
      },
    },
    {
      key: 'total_cases',
      label: '2023 Cases',
      align: 'right',
      sortable: true,
      render: (val) => val.toLocaleString(),
    },
    {
      key: 'iqr_outlier',
      label: 'IQR Fence',
      align: 'center',
      sortable: true,
      render: (val) =>
        val === 'Yes' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
            <Check size={12} style={{ marginRight: '2px' }} /> Flagged
          </span>
        ) : (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.6875rem' }}>—</span>
        ),
    },
    {
      key: 'isolation_forest_outlier',
      label: 'Iso Forest',
      align: 'center',
      sortable: true,
      render: (val) =>
        val === 'Yes' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--color-mauve-dusty)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
            <Check size={12} style={{ marginRight: '2px' }} /> Flagged
          </span>
        ) : (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.6875rem' }}>—</span>
        ),
    },
    {
      key: 'lof_outlier',
      label: 'LOF (k=10)',
      align: 'center',
      sortable: true,
      render: (val) =>
        val === 'Yes' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--status-warning)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
            <Check size={12} style={{ marginRight: '2px' }} /> Flagged
          </span>
        ) : (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.6875rem' }}>—</span>
        ),
    },
    {
      key: 'mahalanobis_outlier',
      label: 'Mahalanobis',
      align: 'center',
      sortable: true,
      render: (val) =>
        val === 'Yes' ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--status-warning)', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
            <Check size={12} style={{ marginRight: '2px' }} /> Flagged
          </span>
        ) : (
          <span style={{ color: 'var(--text-dim)', fontSize: '0.6875rem' }}>—</span>
        ),
    },
    {
      key: 'consensus_score',
      label: 'Method Agreement',
      align: 'center',
      sortable: true,
      render: (val) => {
        const cfg = CONSENSUS_COLORS[val] || { color: '#85A289' };
        return (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                fontSize: '0.75rem',
                color: cfg.color,
                backgroundColor: cfg.bg,
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                border: `1px solid ${val >= 3 ? cfg.color : 'var(--border-subtle)'}`,
              }}
            >
              {val} / 4
            </span>
          </div>
        );
      },
    },
    {
      key: 'anomaly_orientation',
      label: 'Anomaly Driver',
      sortable: true,
      render: (val) => {
        const cfg = ORIENTATION_COLORS[val] || { color: 'var(--text-muted)' };
        return (
          <span className="tech-label" style={{ fontSize: '0.625rem', color: cfg.color }}>
            {val.replace(' Anomaly', '').replace(' in Tested Spaces', '')}
          </span>
        );
      },
    },
  ];

  return (
    <PageContainer>
      {/* 1. Header Section */}
      <SectionHeader
        category="STAGE 26 — ANOMALY & OUTLIER ANALYTICS"
        title="Multivariate State/UT Departures"
        description="Multi-method statistical screening identifying jurisdictions departing from broader volume and composition feature spaces across the 2023 cross-section."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <StatusBadge variant="success">MULTI-METHOD SCREENING</StatusBadge>
            <StatusBadge variant="neutral">36 JURISDICTIONS</StatusBadge>
            <StatusBadge variant="accent">2023 CROSS-SECTION</StatusBadge>
          </div>
        }
      />

      {/* 2. Core Methodological Notice Banner */}
      <Panel variant="elevated" style={{ borderLeft: '4px solid var(--color-sage-light)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <div
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(133, 162, 137, 0.15)',
              color: 'var(--color-sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-1)' }}>
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Strict Non-Causal Screening Scope & Methodological Notice
              </h4>
            </div>
            <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Outlier detection identifies observations that <strong>depart from the statistical structure of the selected feature space</strong>. An outlier is not an error, criminal hotspot, or high-risk jurisdiction. These methods are <strong>descriptive statistical screening tools</strong> and do not establish causality or operational cybercrime risk.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <Target size={14} style={{ color: 'var(--color-sage-light)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Consensus Screening:</strong> Measures methodological agreement across 4 distinct detection paradigms ($0 \to 4$ methods agreeing).
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <Compass size={14} style={{ color: 'var(--color-mauve-dusty)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Dual-Space Separation:</strong> Distinguishes pure volume-scale departures from pure compositional/share departures.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* 3. Top-Level Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <MetricCard
          label="CONSENSUS ANOMALIES (4/4)"
          value="3"
          unit="STATES/UTS"
          description="Karnataka, Dadra & Nagar Haveli and Daman & Diu, Lakshadweep"
          badgeVariant="warning"
          statusBadge="Full Consensus"
          accentColor="var(--status-warning)"
          icon={Target}
        />
        <MetricCard
          label="ROBUST MAHALANOBIS"
          value="8 / 36"
          unit="FLAGGED"
          description="χ²(14, 0.975) reference screening threshold = 26.119 (MinCovDet)"
          badgeVariant="neutral"
          statusBadge="Multivariate Dist"
          accentColor="var(--color-sage-light)"
          icon={Activity}
        />
        <MetricCard
          label="ISOLATION FOREST"
          value="6 / 36"
          unit="FLAGGED"
          description="Baseline contamination c = 0.15 (14-dimensional partition tree)"
          badgeVariant="success"
          statusBadge="Partition Tree"
          accentColor="var(--color-mauve-dusty)"
          icon={Layers}
        />
        <MetricCard
          label="LOCAL OUTLIER FACTOR"
          value="4 / 36"
          unit="FLAGGED"
          description="k = 10 nearest-neighbor local density deviation baseline"
          badgeVariant="accent"
          statusBadge="Density Based"
          accentColor="var(--color-sage-deep)"
          icon={Sparkles}
        />
      </div>

      {/* 4. Segmented Control Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <SegmentedControl
          options={[
            { value: 'all', label: 'ALL ANALYSES' },
            { value: 'consensus', label: 'METHOD CONSENSUS MATRIX' },
            { value: 'orientation', label: 'VOLUME VS COMPOSITION DUAL-SPACE' },
            { value: 'methods', label: 'DETECTION METHODOLOGIES' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Authoritative Provenance: Stages 8 & 16 Analytical Record
        </div>
      </div>

      {/* 5. METHOD COMPARISON & CONSENSUS DISTRIBUTION SUMMARY */}
      {(activeTab === 'all' || activeTab === 'consensus') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>
                STATISTICAL SCREENING COMPARISON • STAGES 8 & 16
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
                Multi-Method Outlier Screening Matrix & Consensus Agreement
              </h3>
            </div>
            <StatusBadge variant="neutral">Consensus Score Range: 0 to 4 Methods Agreeing</StatusBadge>
          </div>

          {/* 4 Methods Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <Panel variant="elevated" style={{ borderLeft: '3px solid var(--color-sage-light)' }}>
              <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-sage-light)', marginBottom: '4px' }}>
                UNIVARIATE SCREENING
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Tukey IQR Fences (1.5 × IQR)
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <strong>18 / 36</strong> States • <strong>52</strong> feature-level violations
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>
                Identifies extreme single-feature deviations across 14 legal and motive dimensions.
              </div>
            </Panel>

            <Panel variant="elevated" style={{ borderLeft: '3px solid var(--color-mauve-dusty)' }}>
              <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-mauve-dusty)', marginBottom: '4px' }}>
                MULTIVARIATE PARTITIONING
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Isolation Forest (c = 0.15)
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <strong>6 / 36</strong> States flagged (random_state=42)
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>
                Isolates observations requiring fewer random partition splits in 14D space.
              </div>
            </Panel>

            <Panel variant="elevated" style={{ borderLeft: '3px solid var(--color-sage-deep)' }}>
              <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-sage-deep)', marginBottom: '4px' }}>
                LOCAL DENSITY DEVIATION
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Local Outlier Factor (k = 10)
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <strong>4 / 36</strong> States flagged at baseline k=10
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>
                Compares local reachability density relative to 10 nearest spatial neighbors.
              </div>
            </Panel>

            <Panel variant="elevated" style={{ borderLeft: '3px solid var(--status-warning)' }}>
              <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--status-warning)', marginBottom: '4px' }}>
                ROBUST MULTIVARIATE DISTANCE
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Robust Mahalanobis (MinCovDet)
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <strong>8 / 36</strong> States flagged (χ² ref cutoff = 26.119)
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>
                Ellipsoidal distance accounting for feature covariance; robust to masking.
              </div>
            </Panel>
          </div>

          {/* Consensus Distribution Chart */}
          <ChartContainer
            category="METHOD AGREEMENT DISTRIBUTION"
            title="Consensus Anomaly Distribution Across 36 Jurisdictions"
            subtitle="Evaluating how many of the 4 detection methods agree on each jurisdiction"
            sourceNote="Agreement indicates methodological consistency in the observed statistical departure, not criminological severity."
            height="180px"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
              {[4, 3, 2, 1, 0].map((score) => {
                const count = consensusDistribution[score] || 0;
                const pct = ((count / 36) * 100).toFixed(1);
                const cfg = CONSENSUS_COLORS[score];

                return (
                  <div key={score} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ width: '140px', color: cfg.color, fontWeight: score >= 3 ? 700 : 500 }}>
                      {score} / 4 Methods:
                    </span>
                    <div style={{ flex: 1, height: '14px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(count / 15) * 100}%`,
                          backgroundColor: cfg.color,
                          borderRadius: '2px',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>
                    <span style={{ width: '80px', textAlign: 'right', color: 'var(--text-primary)' }}>
                      <strong>{count}</strong> ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </ChartContainer>

          {/* Consensus Explorer Table */}
          <Panel variant="elevated" style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  State / UT Method Agreement Matrix ({filteredRecords.length} of 36 Jurisdictions)
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Detailed detection flags across all 4 statistical screening algorithms.
                </p>
              </div>

              {/* Score Filter Buttons + Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {['ALL', '4', '3', '2', '1', '0'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedScoreFilter(s)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '0.6875rem',
                        fontFamily: 'var(--font-mono)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-default)',
                        backgroundColor: selectedScoreFilter === s ? 'var(--color-sage-light)' : 'var(--bg-surface-elevated)',
                        color: selectedScoreFilter === s ? '#090C0A' : 'var(--text-primary)',
                        cursor: 'pointer',
                        fontWeight: selectedScoreFilter === s ? 700 : 500,
                      }}
                    >
                      {s === 'ALL' ? 'All' : `${s}/4`}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '180px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    placeholder="Search State/UT..."
                    value={stateSearchQuery}
                    onChange={(e) => setStateSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 12px 6px 30px',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--text-xs)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <DataTable
              columns={consensusColumns}
              data={filteredRecords}
              rowKey="state_name"
              emptyMessage="No State/UT matches current consensus filter."
            />
          </Panel>
        </div>
      )}

      {/* 6. VOLUME VS COMPOSITION DUAL-SPACE SEPARATION */}
      {(activeTab === 'all' || activeTab === 'orientation') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>
                DUAL-SPACE DECOMPOSITION • STAGE 16
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
                Volume-Scale vs Compositional Outlier Drivers
              </h3>
            </div>
            <StatusBadge variant="accent">Separation of Scale Magnitude from Feature Proportion</StatusBadge>
          </div>

          {/* 4 Orientation Classification Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <Panel
              variant="elevated"
              style={{
                borderLeft: '4px solid #D8A563',
                cursor: 'pointer',
                backgroundColor: selectedOrientationFilter === 'Both Volume & Composition Anomaly' ? 'rgba(216, 165, 99, 0.08)' : 'var(--bg-surface)',
              }}
              onClick={() => setSelectedOrientationFilter(selectedOrientationFilter === 'Both Volume & Composition Anomaly' ? 'ALL' : 'Both Volume & Composition Anomaly')}
            >
              <div className="tech-label" style={{ fontSize: '0.625rem', color: '#D8A563', marginBottom: '2px' }}>DUAL DEPARTURE</div>
              <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Both Volume & Composition
              </h4>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#D8A563' }}>
                {orientationDistribution['Both Volume & Composition Anomaly'] || 6} States
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Karnataka, UP, Jharkhand, Kerala, Odisha, Dadra & Nagar Haveli.
              </div>
            </Panel>

            <Panel
              variant="elevated"
              style={{
                borderLeft: '4px solid #85A289',
                cursor: 'pointer',
                backgroundColor: selectedOrientationFilter === 'Volume-Scale Driven Anomaly' ? 'rgba(133, 162, 137, 0.08)' : 'var(--bg-surface)',
              }}
              onClick={() => setSelectedOrientationFilter(selectedOrientationFilter === 'Volume-Scale Driven Anomaly' ? 'ALL' : 'Volume-Scale Driven Anomaly')}
            >
              <div className="tech-label" style={{ fontSize: '0.625rem', color: '#85A289', marginBottom: '2px' }}>SCALE DRIVEN</div>
              <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Volume-Scale Driven Only
              </h4>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#85A289' }}>
                {orientationDistribution['Volume-Scale Driven Anomaly'] || 5} States
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Maharashtra, Telangana, Andhra Pradesh, Bihar, Haryana.
              </div>
            </Panel>

            <Panel
              variant="elevated"
              style={{
                borderLeft: '4px solid #B296AE',
                cursor: 'pointer',
                backgroundColor: selectedOrientationFilter === 'Compositional Departure Only' ? 'rgba(178, 150, 174, 0.08)' : 'var(--bg-surface)',
              }}
              onClick={() => setSelectedOrientationFilter(selectedOrientationFilter === 'Compositional Departure Only' ? 'ALL' : 'Compositional Departure Only')}
            >
              <div className="tech-label" style={{ fontSize: '0.625rem', color: '#B296AE', marginBottom: '2px' }}>PROPORTION DRIVEN</div>
              <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Compositional Departure Only
              </h4>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#B296AE' }}>
                {orientationDistribution['Compositional Departure Only'] || 8} States/UTs
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Andaman, Arunachal, Goa, Gujarat, Nagaland, Puducherry, Sikkim, Ladakh.
              </div>
            </Panel>

            <Panel
              variant="elevated"
              style={{
                borderLeft: '4px solid #66706B',
                cursor: 'pointer',
                backgroundColor: selectedOrientationFilter === 'Not Anomalous in Tested Spaces' ? 'rgba(255, 255, 255, 0.04)' : 'var(--bg-surface)',
              }}
              onClick={() => setSelectedOrientationFilter(selectedOrientationFilter === 'Not Anomalous in Tested Spaces' ? 'ALL' : 'Not Anomalous in Tested Spaces')}
            >
              <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--text-muted)', marginBottom: '2px' }}>BASELINE</div>
              <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Not Anomalous in Tested Spaces
              </h4>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                {orientationDistribution['Not Anomalous in Tested Spaces'] || 17} States
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Jurisdictions conforming to standard multivariate ellipsoids.
              </div>
            </Panel>
          </div>

          {/* Dual-Space Scatter Plot (Joint Distance vs Composition Distance) */}
          <ChartContainer
            category="DUAL-SPACE GEOMETRIC SEPARATION"
            title="Joint Scale Space vs Pure Composition Space Mahalanobis Distances"
            subtitle="Comparing Multivariate Anomaly Drivers (X = Joint Distance, Y = Composition Distance)"
            sourceNote="Log-scaled visual mapping. Dashed lines denote χ² reference screening thresholds in respective spaces."
            height="360px"
          >
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <svg viewBox="0 0 700 280" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Reference Grid */}
                <line x1="50" y1="20" x2="50" y2="240" stroke="var(--border-subtle)" strokeWidth="1" />
                <line x1="50" y1="240" x2="680" y2="240" stroke="var(--border-subtle)" strokeWidth="1" />

                {/* Reference Screening Lines */}
                {/* Joint cutoff ~ 26.12 -> x mapped */}
                <line x1="280" y1="20" x2="280" y2="240" stroke="rgba(216, 165, 99, 0.4)" strokeDasharray="4 4" />
                <text x="285" y="35" fill="var(--status-warning)" fontSize="9" fontFamily="var(--font-mono)">
                  Joint Cutoff (26.12)
                </text>

                {/* Comp cutoff ~ 11.14 -> y mapped */}
                <line x1="50" y1="130" x2="680" y2="130" stroke="rgba(178, 150, 174, 0.4)" strokeDasharray="4 4" />
                <text x="600" y="125" fill="var(--color-mauve-dusty)" fontSize="9" fontFamily="var(--font-mono)">
                  Comp Cutoff (11.14)
                </text>

                {/* Axis Labels */}
                <text x="365" y="270" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                  JOINT VOLUME-SCALE MAHALANOBIS DISTANCE (LOG SCALE)
                </text>
                <text x="20" y="130" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" transform="rotate(-90 20 130)">
                  PURE COMPOSITION DISTANCE
                </text>

                {/* State Scatter Points */}
                {combinedStateRecords.map((st) => {
                  const jDist = Math.max(1, st.joint_mahalanobis_dist);
                  const cDist = Math.max(1, st.comp_mahalanobis_dist);

                  // Log-scale mapping
                  const x = 50 + (Math.log10(jDist) / 2.7) * 600;
                  const y = 240 - (Math.log10(cDist) / 2.0) * 200;

                  const cfg = ORIENTATION_COLORS[st.anomaly_orientation] || { color: '#66706B' };
                  const isHovered = hoveredScatterState?.state_name === st.state_name;
                  const isFilteredOut = selectedOrientationFilter !== 'ALL' && st.anomaly_orientation !== selectedOrientationFilter;

                  return (
                    <g
                      key={st.state_name}
                      onMouseEnter={() => setHoveredScatterState(st)}
                      onMouseLeave={() => setHoveredScatterState(null)}
                      style={{ cursor: 'pointer', opacity: isFilteredOut ? 0.15 : 1, transition: 'opacity 0.2s ease' }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : st.consensus_score >= 3 ? 6 : 4}
                        fill={cfg.color}
                        fillOpacity={isHovered ? 1 : 0.85}
                        stroke={isHovered ? '#ffffff' : 'var(--bg-surface)'}
                        strokeWidth={isHovered ? 2 : 1}
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      {(isHovered || st.consensus_score >= 3 || st.total_cases >= 10000) && (
                        <text
                          x={x + 7}
                          y={y + 3}
                          fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                          fontSize={isHovered ? '11' : '9'}
                          fontFamily="var(--font-mono)"
                          fontWeight={isHovered ? '700' : '500'}
                        >
                          {st.state_name.replace(' and ', ' & ')}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip */}
              {hoveredScatterState && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(14, 19, 16, 0.95)',
                    border: `1px solid ${ORIENTATION_COLORS[hoveredScatterState.anomaly_orientation]?.color || 'var(--color-sage-light)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    zIndex: 10,
                    minWidth: '260px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px' }}>
                    {hoveredScatterState.state_name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Anomaly Driver:</span>
                    <strong style={{ color: ORIENTATION_COLORS[hoveredScatterState.anomaly_orientation]?.color }}>
                      {hoveredScatterState.anomaly_orientation}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Consensus Score:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{hoveredScatterState.consensus_score} / 4 Methods</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Joint Mahalanobis Dist:</span>
                    <strong style={{ color: hoveredScatterState.joint_mahalanobis_dist >= 26.119 ? 'var(--status-warning)' : 'var(--text-muted)' }}>
                      {hoveredScatterState.joint_mahalanobis_dist.toFixed(2)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Comp Mahalanobis Dist:</span>
                    <strong style={{ color: hoveredScatterState.comp_mahalanobis_dist >= 11.14 ? 'var(--color-mauve-dusty)' : 'var(--text-muted)' }}>
                      {hoveredScatterState.comp_mahalanobis_dist.toFixed(2)}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          </ChartContainer>
        </div>
      )}

      {/* 7. METHODOLOGICAL DEEP-DIVES & SENSITIVITY SAFEGUARDS */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <Scale size={18} style={{ color: 'var(--color-sage-light)' }} />
          <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
            Sensitivity Safeguards & Academic Interpretation Boundaries
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Card 1: Sensitivity Analysis */}
          <Panel variant="elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-sage-light)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                N=36 vs N=34 Sensitivity Stability (Stage 16)
              </h4>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-3) 0' }}>
              The sensitivity analysis shows that identified state-level multivariate departures remain highly stable after excluding the two tiny-denominator jurisdictions:
            </p>
            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Robust Mahalanobis Jaccard:</span>
                <strong style={{ color: 'var(--color-sage-light)' }}>0.8750 (7/8 Maintained)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Isolation Forest Jaccard:</span>
                <strong style={{ color: 'var(--color-mauve-dusty)' }}>0.8000 (4/5 Maintained)</strong>
              </div>
            </div>
          </Panel>

          {/* Card 2: Small-Denominator Warning */}
          <Panel variant="elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--status-warning)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Small-Denominator Extreme Caution
              </h4>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-3) 0' }}>
              Union Territories with minimal annual totals (Ladakh = 1 case, Lakshadweep = 1 case, Dadra & Nagar Haveli = 6 cases) produce extreme composition proportions and sparse feature profiles.
            </p>
            <div style={{ fontSize: '0.6875rem', color: 'var(--status-warning)', fontFamily: 'var(--font-mono)' }}>
              ⚠ Anomaly status in tiny UTs is driven by denominator sparsity, not elevated cybercrime risk.
            </div>
          </Panel>

          {/* Card 3: Non-Normative Terminology */}
          <Panel variant="elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <Target size={16} style={{ color: 'var(--color-sage-light)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Non-Normative Academic Interpretation
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li><strong>Statistical Extremity:</strong> Departures indicate unusual location in feature space, not bad/dangerous jurisdictions.</li>
              <li><strong>No Risk Scores:</strong> Consensus scores reflect methodological agreement count ($0–4$), not operational policing priority.</li>
              <li><strong>Screening Reference:</strong> The $\chi^2(14, 0.975)$ cutoff ($26.119$) serves as a descriptive reference threshold, not a finite-sample significance proof.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
};

export default AnomaliesPage;
