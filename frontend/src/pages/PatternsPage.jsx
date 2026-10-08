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
  GitMerge,
  Layers,
  ShieldCheck,
  Search,
  ArrowRight,
  AlertTriangle,
  Scale,
  Sparkles
} from 'lucide-react';

const CLUSTER_COLORS = {
  0: { color: '#85A289', name: 'Cluster 0 (Lower IT / Mod Fraud)', bg: 'rgba(133, 162, 137, 0.15)', border: 'rgba(133, 162, 137, 0.35)', label: 'Sage' },
  1: { color: '#B296AE', name: 'Cluster 1 (High IT / High Fraud)', bg: 'rgba(178, 150, 174, 0.15)', border: 'rgba(178, 150, 174, 0.35)', label: 'Mauve' },
  2: { color: '#D6A15D', name: 'Cluster 2 (Small-Denominator / Sex Expl)', bg: 'rgba(214, 161, 93, 0.15)', border: 'rgba(214, 161, 93, 0.35)', label: 'Amber' },
  3: { color: '#607D8B', name: 'Cluster 3 (Higher Extortion Share)', bg: 'rgba(96, 125, 139, 0.15)', border: 'rgba(96, 125, 139, 0.35)', label: 'Slate Blue' },
};

export const PatternsPage = () => {
  // Primary API Data State
  const [associationData, setAssociationData] = useState(null);
  const [clusteringData, setClusteringData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI Interactive States
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'association' | 'clustering'
  
  // Association Rules Filters
  const [ruleSearchQuery, setRuleSearchQuery] = useState('');
  const [minConfidenceFilter, setMinConfidenceFilter] = useState(0.60);
  const [minLiftFilter, setMinLiftFilter] = useState(1.0);
  const [hoveredRule, setHoveredRule] = useState(null);

  // Clustering Filters & State
  const [selectedClusterFilter, setSelectedClusterFilter] = useState('ALL'); // 'ALL' | 0 | 1 | 2 | 3
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [hoveredStatePoint, setHoveredStatePoint] = useState(null);

  // Fetch Pattern Mining & Clustering Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assocRes, clustRes] = await Promise.all([
        api.getAssociationRules(),
        api.getClusterProfiles(),
      ]);
      setAssociationData(assocRes);
      setClusteringData(clustRes);
    } catch (err) {
      console.error('[PatternsPage] Error fetching association and clustering data:', err);
      setError(err.message || 'Unable to retrieve pattern mining outputs from backend API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Association Data
  const rawRules = useMemo(() => associationData?.rules || [], [associationData]);

  // Filtered Association Rules
  const filteredRules = useMemo(() => {
    return rawRules.filter((r) => {
      if (r.confidence < minConfidenceFilter) return false;
      if (r.lift < minLiftFilter) return false;
      if (ruleSearchQuery.trim()) {
        const q = ruleSearchQuery.toLowerCase().trim();
        const anteMatch = r.antecedent.toLowerCase().includes(q);
        const consMatch = r.consequent.toLowerCase().includes(q);
        if (!anteMatch && !consMatch) return false;
      }
      return true;
    });
  }, [rawRules, minConfidenceFilter, minLiftFilter, ruleSearchQuery]);

  // Derived Clustering Data
  const clusterProfiles = useMemo(() => clusteringData?.cluster_profiles || [], [clusteringData]);
  const stateAssignments = useMemo(() => clusteringData?.state_assignments || [], [clusteringData]);

  // Filtered State Cluster Assignments
  const filteredStateAssignments = useMemo(() => {
    return stateAssignments.filter((st) => {
      if (selectedClusterFilter !== 'ALL' && st.cluster_id !== Number(selectedClusterFilter)) {
        return false;
      }
      if (stateSearchQuery.trim()) {
        const q = stateSearchQuery.toLowerCase().trim();
        return st.state_name.toLowerCase().includes(q);
      }
      return true;
    });
  }, [stateAssignments, selectedClusterFilter, stateSearchQuery]);

  if (loading) {
    return (
      <PageContainer>
        <SectionHeader
          category="STAGE 25 — ASSOCIATION RULES & CLUSTERING UI"
          title="Association & Clustering Analytics"
          description="Materializing validated association rules (Apriori / FP-Growth) and composition clusters (K-Means K=4) from FastAPI backend..."
        />
        <LoadingState message="Retrieving validated pattern mining and clustering outputs from backend /api/models/..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <SectionHeader
          category="STAGE 25 — ASSOCIATION RULES & CLUSTERING UI"
          title="Association & Clustering Analytics"
          description="Error connecting to validated analytical endpoints."
        />
        <ErrorState message={error} onRetry={fetchData} />
      </PageContainer>
    );
  }

  // Association Rules Table Columns
  const associationColumns = [
    {
      key: 'rule_id',
      label: 'ID',
      sortable: true,
      render: (val) => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{val}</span>,
    },
    {
      key: 'antecedent',
      label: 'Antecedent [IF]',
      sortable: true,
      render: (val) => (
        <code style={{ fontSize: '0.6875rem', color: 'var(--color-sage-light)' }}>
          {val.replace('HIGH_', '')}
        </code>
      ),
    },
    {
      key: 'arrow',
      label: '',
      sortable: false,
      render: () => <ArrowRight size={12} style={{ color: 'var(--text-dim)' }} />,
    },
    {
      key: 'consequent',
      label: 'Consequent [THEN]',
      sortable: true,
      render: (val) => (
        <code style={{ fontSize: '0.6875rem', color: 'var(--color-mauve-dusty)' }}>
          {val.replace('HIGH_', '')}
        </code>
      ),
    },
    {
      key: 'support',
      label: 'Support',
      align: 'right',
      sortable: true,
      render: (val) => `${(val * 100).toFixed(1)}%`,
    },
    {
      key: 'confidence',
      label: 'Confidence',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: val >= 0.9 ? 'var(--color-sage-light)' : 'var(--text-primary)' }}>
          {(val * 100).toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'lift',
      label: 'Lift',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: val >= 1.75 ? 'var(--status-warning)' : 'var(--color-mauve-dusty)' }}>
          {val.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'conviction',
      label: 'Conviction',
      align: 'right',
      sortable: true,
      render: (val) => (val !== undefined ? val.toFixed(2) : '—'),
    },
  ];

  // State Assignments Table Columns
  const stateClusteringColumns = [
    {
      key: 'state_name',
      label: 'State / Union Territory',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: CLUSTER_COLORS[row.cluster_id]?.color || '#85A289',
            }}
          />
          <span style={{ fontWeight: 600 }}>{val}</span>
        </div>
      ),
    },
    {
      key: 'cluster_id',
      label: 'Cluster',
      sortable: true,
      render: (val) => {
        const cfg = CLUSTER_COLORS[val] || { color: '#85A289', bg: 'rgba(133, 162, 137, 0.15)', border: 'rgba(133, 162, 137, 0.35)', label: 'Sage' };
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: cfg.bg,
              border: `1px solid ${cfg.border}`,
              color: cfg.color,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cfg.color }} />
            Cluster {val}
          </span>
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
      key: 'it_act_share',
      label: 'IT Act Share',
      align: 'right',
      sortable: true,
      render: (val) => `${(val * 100).toFixed(1)}%`,
    },
    {
      key: 'fraud_motive_share',
      label: 'Fraud Motive',
      align: 'right',
      sortable: true,
      render: (val) => `${(val * 100).toFixed(1)}%`,
    },
    {
      key: 'extortion_motive_share',
      label: 'Extortion Motive',
      align: 'right',
      sortable: true,
      render: (val) => `${(val * 100).toFixed(1)}%`,
    },
    {
      key: 'sexual_exploitation_motive_share',
      label: 'Sex Expl Motive',
      align: 'right',
      sortable: true,
      render: (val) => `${(val * 100).toFixed(1)}%`,
    },
  ];

  return (
    <PageContainer>
      {/* 1. Header Section */}
      <SectionHeader
        category="STAGE 25 — ASSOCIATION RULES & CLUSTERING UI"
        title="Association & Clustering Analytics"
        description="Unsupervised exploration of state-level profile co-occurrences (Apriori & FP-Growth) and geometric composition clusters (K-Means K=4) across the 2023 cross-section."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <StatusBadge variant="success">STATE-LEVEL PATTERN ANALYSIS</StatusBadge>
            <StatusBadge variant="neutral">36 JURISDICTIONS</StatusBadge>
            <StatusBadge variant="accent">2023 CROSS-SECTION</StatusBadge>
          </div>
        }
      />

      {/* 2. Strict Non-Causal Scope & Methodological Notice */}
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
                Strict Non-Causal Scope & Methodological Notice
              </h4>
            </div>
            <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Association rules</strong> describe observed co-occurrence patterns across 36 State/UT macro transactions. <strong>Clustering</strong> describes geometric similarity in standardized composition share features. Neither analysis establishes causation, temporal crime propagation, or assigns an operational crime-risk score.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <GitMerge size={14} style={{ color: 'var(--color-sage-light)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Association Track:</strong> Identifies binary profile combinations exceeding support (≥ 25%) and confidence (≥ 60%) baselines across 36 jurisdictions.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <Layers size={14} style={{ color: 'var(--color-mauve-dusty)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Clustering Track:</strong> Partitions 36 States/UTs into 4 composition profiles (Silhouette = 0.3497) based on legal and motive shares (total volume strictly excluded).
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
          label="FREQUENT ITEMSETS & RULES"
          value="1,924"
          unit="RULES"
          description="129 Frequent Itemsets mined via Apriori & FP-Growth (100% equivalence)"
          badgeVariant="neutral"
          statusBadge="42 Pair Rules"
          accentColor="var(--color-sage-light)"
          icon={GitMerge}
        />
        <MetricCard
          label="KEY HIGHLIGHTED RULE"
          value="Lift 1.67"
          description="HIGH_FRAUD_MOTIVE ⇒ HIGH_SEC66D_CHEATING (Supp: 41.7%, Conf: 83.3%)"
          badgeVariant="success"
          statusBadge="Syllabus Benchmark"
          accentColor="var(--color-sage-deep)"
          icon={Sparkles}
        />
        <MetricCard
          label="PRIMARY CLUSTERING (K=4)"
          value="0.3497"
          unit="SILHOUETTE"
          description="K-Means (K=4, StandardScaler) • Calinski-Harabasz: 20.25"
          badgeVariant="success"
          statusBadge="4 Profiles"
          accentColor="var(--color-mauve-dusty)"
          icon={Layers}
        />
        <MetricCard
          label="SMALL-DENOMINATOR SENSITIVITY"
          value="Cluster 2"
          unit="N=2 UTs"
          description="Dadra & Nagar Haveli (N=6), Lakshadweep (N=1) absorb extreme sex-expl share"
          badgeVariant="warning"
          statusBadge="Cautionary Tag"
          accentColor="var(--status-warning)"
          icon={AlertTriangle}
        />
      </div>

      {/* 4. Segmented Control View Selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <SegmentedControl
          options={[
            { value: 'all', label: 'ALL PATTERNS' },
            { value: 'association', label: 'ASSOCIATION RULES (Apriori / FP-Growth)' },
            { value: 'clustering', label: 'CLUSTERING (K-Means K=4)' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Authoritative Provenance: Stages 5, 6, 12 & 15
        </div>
      </div>

      {/* 5. MODULE A: ASSOCIATION RULE MINING */}
      {(activeTab === 'all' || activeTab === 'association') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>
                UNSUPERVISED PATTERN MINING • STAGES 5 & 12
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
                Association Rule Mining (State-Level Syllabus Demonstration)
              </h3>
            </div>
            <StatusBadge variant="neutral">Transactions: 36 States/UTs • 8 Binarized Indicators</StatusBadge>
          </div>

          {/* Association Methodology Summary */}
          <Panel variant="subtle" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Transaction Unit:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  36 Indian States & UTs (Macro Aggregates)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Discretization:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-sage-light)', marginTop: '2px' }}>
                  Median Split (8 Binary Indicators)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Threshold Filters:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Min Support: 25% • Min Confidence: 60% • Lift &gt; 1.0
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Algorithmic Equivalence:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-mauve-dusty)', marginTop: '2px' }}>
                  Apriori & FP-Growth (100% Match)
                </div>
              </div>
            </div>
          </Panel>

          {/* Featured Academic Association Rules */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            <Panel variant="elevated" style={{ borderLeft: '3px solid var(--color-sage-light)' }}>
              <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-sage-light)', marginBottom: '4px' }}>
                PRIMARY SYLLABUS BENCHMARK
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Fraud Motive ⇒ Sec. 66D Personation
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <span>Supp: <strong style={{ color: 'var(--text-primary)' }}>41.7%</strong></span>
                <span>Conf: <strong style={{ color: 'var(--color-sage-light)' }}>83.3%</strong></span>
                <span>Lift: <strong style={{ color: 'var(--status-warning)' }}>1.67</strong></span>
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                State-level co-occurrence of high fraud motivation and Section 66D cyber cheating.
              </div>
            </Panel>

            <Panel variant="elevated" style={{ borderLeft: '3px solid var(--color-mauve-dusty)' }}>
              <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-mauve-dusty)', marginBottom: '4px' }}>
                EXTORTION & SEXUAL EXPLOITATION CO-OCCURRENCE
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Extortion Motive ⇒ Sexual Exploitation
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <span>Supp: <strong style={{ color: 'var(--text-primary)' }}>47.2%</strong></span>
                <span>Conf: <strong style={{ color: 'var(--color-sage-light)' }}>94.4%</strong></span>
                <span>Lift: <strong style={{ color: 'var(--status-warning)' }}>1.89</strong></span>
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                Strongest pairwise rule with 94.4% conditional confidence across 17 states.
              </div>
            </Panel>

            <Panel variant="elevated" style={{ borderLeft: '3px solid var(--status-warning)' }}>
              <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--status-warning)', marginBottom: '4px' }}>
                IDENTITY THEFT & EXTORTION LINKAGE
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Extortion Motive ⇒ Identity Theft (Sec. 66C)
              </div>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                <span>Supp: <strong style={{ color: 'var(--text-primary)' }}>47.2%</strong></span>
                <span>Conf: <strong style={{ color: 'var(--color-sage-light)' }}>94.4%</strong></span>
                <span>Lift: <strong style={{ color: 'var(--status-warning)' }}>1.79</strong></span>
              </div>
              <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                High extortion states reliably co-exhibit above-median identity theft FIR volume.
              </div>
            </Panel>
          </div>

          {/* Association Rules Explorer Table + Display Filters */}
          <Panel variant="elevated" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Association Rules Explorer ({filteredRules.length} of {rawRules.length} Pair Rules Displayed)
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Interactive display filters for exploring the 42 validated pairwise rules mined across 36 State/UT transactions.
                </p>
              </div>

              {/* Interactive Display Filter Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                {/* Search Antecedent / Consequent */}
                <div style={{ position: 'relative', width: '180px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                  <input
                    type="text"
                    placeholder="Search rule terms..."
                    value={ruleSearchQuery}
                    onChange={(e) => setRuleSearchQuery(e.target.value)}
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

                {/* Min Confidence Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Min Conf:</span>
                  <input
                    type="range"
                    min="0.60"
                    max="0.95"
                    step="0.05"
                    value={minConfidenceFilter}
                    onChange={(e) => setMinConfidenceFilter(parseFloat(e.target.value))}
                    style={{ width: '80px', accentColor: 'var(--color-sage-light)', cursor: 'pointer' }}
                  />
                  <span style={{ color: 'var(--color-sage-light)', fontWeight: 600 }}>{(minConfidenceFilter * 100).toFixed(0)}%</span>
                </div>

                {/* Min Lift Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Min Lift:</span>
                  <select
                    value={minLiftFilter}
                    onChange={(e) => setMinLiftFilter(parseFloat(e.target.value))}
                    style={{
                      backgroundColor: 'var(--bg-surface-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      fontSize: 'var(--text-xs)',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="1.0">≥ 1.00</option>
                    <option value="1.5">≥ 1.50</option>
                    <option value="1.7">≥ 1.70</option>
                    <option value="1.8">≥ 1.80</option>
                  </select>
                </div>
              </div>
            </div>

            <DataTable
              columns={associationColumns}
              data={filteredRules}
              rowKey="rule_id"
              emptyMessage="No association rules match current filter criteria."
            />

            <div style={{ marginTop: 'var(--space-3)', fontSize: '0.6875rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
              * Methodological Note: Positive lift values (&gt; 1.0) indicate that Antecedent and Consequent co-occur across State/UT macro profiles more frequently than expected under independence. These patterns describe state-level co-presence, not individual case logs or causal mechanisms.
            </div>
          </Panel>

          {/* Rule Strength Scatter Plot Visualizer */}
          <ChartContainer
            category="RULE STRENGTH SCATTER"
            title="Support vs Confidence vs Lift Map"
            subtitle="Evaluating 42 pairwise rules (X=Confidence, Y=Lift, Bubble Radius=Support)"
            sourceNote="Rules concentrated in upper-right quadrant exhibit highest conditional reliability"
            height="340px"
          >
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <svg viewBox="0 0 700 260" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Grid Lines */}
                <line x1="50" y1="20" x2="50" y2="220" stroke="var(--border-subtle)" strokeWidth="1" />
                <line x1="50" y1="220" x2="680" y2="220" stroke="var(--border-subtle)" strokeWidth="1" />

                {/* Y-Axis (Lift: 1.0 to 2.0) */}
                {[1.0, 1.25, 1.5, 1.75, 2.0].map((liftVal) => {
                  const y = 220 - ((liftVal - 1.0) / 1.0) * 190;
                  return (
                    <g key={liftVal}>
                      <line x1="45" y1={y} x2="680" y2={y} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
                      <text x="40" y={y + 4} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
                        {liftVal.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* X-Axis (Confidence: 0.60 to 1.00) */}
                {[0.60, 0.70, 0.80, 0.90, 1.00].map((confVal) => {
                  const x = 50 + ((confVal - 0.60) / 0.40) * 620;
                  return (
                    <g key={confVal}>
                      <line x1={x} y1="20" x2={x} y2="225" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
                      <text x={x} y="240" fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                        {(confVal * 100).toFixed(0)}%
                      </text>
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text x="365" y="255" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                  CONFIDENCE (CONDITIONAL PROBABILITY)
                </text>
                <text x="15" y="120" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" transform="rotate(-90 15 120)">
                  LIFT (STRENGTH OVER BASELINE)
                </text>

                {/* Scatter Bubbles */}
                {rawRules.map((r) => {
                  const x = 50 + ((r.confidence - 0.60) / 0.40) * 620;
                  const y = 220 - ((r.lift - 1.0) / 1.0) * 190;
                  const radius = 4 + (r.support / 0.50) * 8;
                  const isHovered = hoveredRule?.rule_id === r.rule_id;

                  return (
                    <g
                      key={r.rule_id}
                      onMouseEnter={() => setHoveredRule(r)}
                      onMouseLeave={() => setHoveredRule(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? radius + 3 : radius}
                        fill={r.lift >= 1.75 ? 'var(--status-warning)' : 'var(--color-sage-light)'}
                        fillOpacity={isHovered ? 1 : 0.65}
                        stroke={isHovered ? '#ffffff' : 'var(--border-default)'}
                        strokeWidth={isHovered ? 2 : 1}
                        style={{ transition: 'all 0.2s ease' }}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip */}
              {hoveredRule && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'rgba(14, 19, 16, 0.95)',
                    border: '1px solid var(--color-sage-light)',
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    zIndex: 10,
                    minWidth: '240px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--color-sage-light)', marginBottom: '4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px' }}>
                    {hoveredRule.rule_id}: {hoveredRule.antecedent.replace('HIGH_', '')} ⇒ {hoveredRule.consequent.replace('HIGH_', '')}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Confidence:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{(hoveredRule.confidence * 100).toFixed(1)}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Lift:</span>
                    <strong style={{ color: 'var(--status-warning)' }}>{hoveredRule.lift.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Support:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{(hoveredRule.support * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              )}
            </div>
          </ChartContainer>
        </div>
      )}

      {/* 6. MODULE B: CLUSTERING */}
      {(activeTab === 'all' || activeTab === 'clustering') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>
                UNSUPERVISED CLUSTERING • STAGES 6 & 15
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
                K-Means State Composition Taxonomy (K=4)
              </h3>
            </div>
            <StatusBadge variant="success">Silhouette: 0.3497 • StandardScaler • random_state=42</StatusBadge>
          </div>

          {/* Clustering Methodology & Metrics Summary */}
          <Panel variant="subtle" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Algorithm Configuration:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  K-Means (K=4, StandardScaler, k-means++)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Validation Metrics:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-sage-light)', marginTop: '2px' }}>
                  Silhouette: 0.3497 • Calinski-Harabasz: 20.25 • DB: 0.8849
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Feature Space:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  4 Composition Shares (Total Volume Strictly Excluded)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Sample Stability:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-mauve-dusty)', marginTop: '2px' }}>
                  76.5% Hungarian Agreement under N=34 Sensitivity
                </div>
              </div>
            </div>
          </Panel>

          {/* 4 Cluster Profile Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
            {clusterProfiles.map((cp) => {
              const cfg = CLUSTER_COLORS[cp.cluster_id] || { color: '#85A289' };
              const isSelected = selectedClusterFilter === String(cp.cluster_id);

              return (
                <Panel
                  key={cp.cluster_id}
                  variant="elevated"
                  style={{
                    borderLeft: `4px solid ${cfg.color}`,
                    backgroundColor: isSelected ? 'rgba(133, 162, 137, 0.08)' : 'var(--bg-surface)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setSelectedClusterFilter(isSelected ? 'ALL' : String(cp.cluster_id))}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: cfg.bg,
                        border: `1px solid ${cfg.border}`,
                        color: cfg.color,
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cfg.color }} />
                      Cluster {cp.cluster_id} · {cfg.label}
                    </span>
                    <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      {cp.state_count} States ({cp.state_pct.toFixed(1)}%)
                    </span>
                  </div>

                  <h4 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                    {cp.cluster_label}
                  </h4>

                  {/* Feature Breakdown Progress Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>IT Act Share:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{(cp.it_act_share_mean * 100).toFixed(1)}%</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                        <div style={{ height: '100%', width: `${cp.it_act_share_mean * 100}%`, backgroundColor: cfg.color }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Fraud Motive Share:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{(cp.fraud_motive_share_mean * 100).toFixed(1)}%</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                        <div style={{ height: '100%', width: `${cp.fraud_motive_share_mean * 100}%`, backgroundColor: cfg.color }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Extortion Share:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{(cp.extortion_motive_share_mean * 100).toFixed(1)}%</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                        <div style={{ height: '100%', width: `${cp.extortion_motive_share_mean * 100}%`, backgroundColor: cfg.color }} />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                        <span>Sex Expl Share:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{(cp.sexual_exploitation_motive_share_mean * 100).toFixed(1)}%</strong>
                      </div>
                      <div style={{ height: '4px', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                        <div style={{ height: '100%', width: `${cp.sexual_exploitation_motive_share_mean * 100}%`, backgroundColor: cfg.color }} />
                      </div>
                    </div>
                  </div>

                  {cp.cluster_id === 2 && (
                    <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2)', backgroundColor: 'rgba(216, 165, 99, 0.12)', borderRadius: 'var(--radius-sm)', fontSize: '0.625rem', color: 'var(--status-warning)' }}>
                      ⚠ Small-denominator profile (Dadra & Nagar Haveli N=6, Lakshadweep N=1).
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>

          {/* 2D PCA Cluster Projection Visualizer */}
          <ChartContainer
            category="2D PCA PROJECTION"
            title="PCA Projection of Standardized Composition Features"
            subtitle="36 States & UTs projected onto First 2 Principal Components (Color = K-Means Cluster)"
            sourceNote="PCA axes summarize linear combinations of legal act and motive shares. Non-causal geometric embedding."
            height="360px"
          >
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
              <svg viewBox="0 0 700 280" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                {/* Grid Center Lines */}
                <line x1="50" y1="140" x2="680" y2="140" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="3 3" />
                <line x1="365" y1="20" x2="365" y2="260" stroke="rgba(255, 255, 255, 0.06)" strokeDasharray="3 3" />

                {/* Axis Labels */}
                <text x="365" y="275" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                  PCA COMPONENT 1 (PRINCIPAL SPREAD)
                </text>
                <text x="20" y="140" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" transform="rotate(-90 20 140)">
                  PCA COMPONENT 2
                </text>

                {/* State Points */}
                {stateAssignments.map((st) => {
                  // PCA1 range: [-3.5, 3.5] -> [80, 650]
                  // PCA2 range: [-2.5, 3.5] -> [250, 30]
                  const x = 365 + (st.PCA1 / 3.8) * 280;
                  const y = 140 - (st.PCA2 / 3.8) * 110;
                  const cfg = CLUSTER_COLORS[st.cluster_id] || { color: '#85A289' };
                  const isHovered = hoveredStatePoint?.state_name === st.state_name;
                  const isFilteredOut = selectedClusterFilter !== 'ALL' && String(st.cluster_id) !== selectedClusterFilter;

                  return (
                    <g
                      key={st.state_name}
                      onMouseEnter={() => setHoveredStatePoint(st)}
                      onMouseLeave={() => setHoveredStatePoint(null)}
                      style={{ cursor: 'pointer', opacity: isFilteredOut ? 0.15 : 1, transition: 'opacity 0.2s ease' }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isHovered ? 7 : 5}
                        fill={cfg.color}
                        fillOpacity={isHovered ? 1 : 0.85}
                        stroke={isHovered ? '#ffffff' : 'var(--bg-surface)'}
                        strokeWidth={isHovered ? 2 : 1}
                        style={{ transition: 'all 0.2s ease' }}
                      />
                      {(isHovered || st.total_cases >= 3000 || st.cluster_id === 2) && (
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

              {/* Hover Tooltip for PCA Point */}
              {hoveredStatePoint && (
                <div
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: `1px solid ${CLUSTER_COLORS[hoveredStatePoint.cluster_id]?.color || 'var(--primary)'}`,
                    borderRadius: 'var(--radius-sm)',
                    padding: 'var(--space-3)',
                    boxShadow: 'var(--shadow-lg)',
                    fontSize: 'var(--text-xs)',
                    fontFamily: 'var(--font-mono)',
                    zIndex: 10,
                    minWidth: '240px',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px' }}>
                    {hoveredStatePoint.state_name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Assigned Profile:</span>
                    <strong style={{ color: CLUSTER_COLORS[hoveredStatePoint.cluster_id]?.color }}>
                      Cluster {hoveredStatePoint.cluster_id} ({CLUSTER_COLORS[hoveredStatePoint.cluster_id]?.label})
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>2023 Cases:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{hoveredStatePoint.total_cases.toLocaleString()}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>IT Act Share:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{(hoveredStatePoint.it_act_share * 100).toFixed(1)}%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Fraud Motive Share:</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{(hoveredStatePoint.fraud_motive_share * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Explicit 4-Color Category Legend */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-4)',
                flexWrap: 'wrap',
                padding: 'var(--space-2) var(--space-4)',
                borderTop: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-surface-elevated)',
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {[0, 1, 2, 3].map((cId) => {
                const cfg = CLUSTER_COLORS[cId];
                const isSelected = selectedClusterFilter === String(cId);
                return (
                  <div
                    key={cId}
                    onClick={() => setSelectedClusterFilter(selectedClusterFilter === String(cId) ? 'ALL' : String(cId))}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? cfg.bg : 'transparent',
                      border: isSelected ? `1px solid ${cfg.border}` : '1px solid transparent',
                      opacity: selectedClusterFilter === 'ALL' || selectedClusterFilter === String(cId) ? 1 : 0.45,
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: cfg.color }} />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Cluster {cId}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({cfg.label})</span>
                  </div>
                );
              })}
            </div>
          </ChartContainer>

          {/* State Cluster Membership Table */}
          <Panel variant="elevated" style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  State / UT Cluster Membership & Feature Breakdown ({filteredStateAssignments.length} Jurisdictions)
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Jurisdictions grouped by geometric proximity in 4D standardized composition space (StandardScaler, K=4).
                </p>
              </div>

              {/* Cluster Filter Buttons + Search Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {['ALL', '0', '1', '2', '3'].map((cId) => {
                    const isSelected = selectedClusterFilter === cId;
                    const cfg = cId !== 'ALL' ? CLUSTER_COLORS[cId] : null;
                    return (
                      <button
                        key={cId}
                        onClick={() => setSelectedClusterFilter(cId)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '0.6875rem',
                          fontFamily: 'var(--font-mono)',
                          borderRadius: 'var(--radius-sm)',
                          border: isSelected
                            ? `1px solid ${cfg ? cfg.color : 'var(--primary)'}`
                            : '1px solid var(--border-default)',
                          backgroundColor: isSelected
                            ? (cfg ? cfg.bg : 'var(--primary-muted)')
                            : 'var(--bg-surface-elevated)',
                          color: isSelected
                            ? (cfg ? cfg.color : 'var(--text-primary)')
                            : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: isSelected ? 700 : 500,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          transition: 'all var(--transition-fast)',
                        }}
                      >
                        {cfg && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cfg.color }} />}
                        {cId === 'ALL' ? 'All Clusters' : `C${cId}`}
                      </button>
                    );
                  })}
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
              columns={stateClusteringColumns}
              data={filteredStateAssignments}
              rowKey="state_name"
              emptyMessage="No State/UT found for current cluster and search filter."
            />
          </Panel>

          {/* Small-Denominator Cautionary Banner */}
          <Panel variant="elevated" style={{ marginTop: 'var(--space-6)', borderLeft: '4px solid var(--status-warning)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-3)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--status-warning)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 var(--space-1) 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Mandatory Small-Denominator Caution (Cluster 2)
                </h4>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Very small jurisdiction totals (Dadra & Nagar Haveli total = 6 cases, Lakshadweep total = 1 case) produce extreme percentage shares (e.g. 100% IT Act, 91.7% sexual exploitation motive). Cluster 2 isolates these tiny-denominator proportion distortions; it does <strong>not</strong> indicate high absolute crime volume or heightened criminological risk.
                </p>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* 7. METHODOLOGICAL COMPARISON TABLE: ASSOCIATION VS CLUSTERING */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <Scale size={18} style={{ color: 'var(--color-sage-light)' }} />
          <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
            Methodological Comparison: Association Rules vs K-Means Clustering
          </h3>
        </div>

        <Panel variant="elevated" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <th style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>DIMENSION</th>
                <th style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)' }}>ASSOCIATION RULE MINING</th>
                <th style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-mauve-dusty)' }}>K-MEANS CLUSTERING</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--text-primary)' }}>Unit of Analysis</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>36 State/UT discrete transactions</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>36 State/UT 4D continuous share vectors</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--text-primary)' }}>Feature Representation</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>8 Binary high/low indicators (Median split)</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>4 Standardized continuous proportions (StandardScaler)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--text-primary)' }}>Analytical Purpose</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Discover co-occurrence patterns exceeding support/confidence baselines</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Group jurisdictions by geometric composition similarity (K=4)</td>
              </tr>
              <tr>
                <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--text-primary)' }}>Academic Interpretation</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Descriptive co-presence (non-causal, syllabus demonstration)</td>
                <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Descriptive taxonomy (non-normative, no threat ranking)</td>
              </tr>
            </tbody>
          </table>
        </Panel>
      </div>
    </PageContainer>
  );
};

export default PatternsPage;
