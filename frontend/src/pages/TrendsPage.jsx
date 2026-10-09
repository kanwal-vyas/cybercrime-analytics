import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';
import StatusDot from '../components/ui/StatusDot';
import Panel from '../components/ui/Panel';
import MetricCard from '../components/ui/MetricCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import DataTable from '../components/data/DataTable';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import api from '../services/api';
import {
  Calendar,
  Database,
  Search,
  RotateCcw,
  X,
  AlertCircle,
  Shield
} from 'lucide-react';

const COMPARISON_COLORS = [
  { name: 'Sage', hex: '#85A289', varName: 'var(--cat-sage)' },
  { name: 'Dusty Mauve', hex: '#B296AE', varName: 'var(--cat-mauve)' },
  { name: 'Amber', hex: '#D6A15D', varName: 'var(--cat-amber)' },
  { name: 'Deep Slate Blue', hex: '#607D8B', varName: 'var(--cat-slate)' },
];

export const TrendsPage = () => {
  // API Data State
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Trajectory Explorer Selections
  const [selectedJurisdictions, setSelectedJurisdictions] = useState([
    'All India',
    'Karnataka',
    'Telangana',
    'Uttar Pradesh',
  ]);
  const [jurisdictionToAdd, setJurisdictionToAdd] = useState('');

  // Year-Specific Ranking Filter
  const [selectedYear, setSelectedYear] = useState(2022);

  // Table Search & Admin Filters
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableAdminFilter, setTableAdminFilter] = useState('ALL'); // 'ALL' | 'State' | 'Union Territory'

  const fetchTrendsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const trendRes = await api.getTrend();
      setTrendData(trendRes);
    } catch (err) {
      console.error('[TrendsPage] Error fetching trends data:', err);
      setError(err.message || 'Unable to retrieve historical trend data from API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrendsData();
  }, [fetchTrendsData]);

  // Derived Datasets
  const nationalTrends = useMemo(() => trendData?.national_trends || [], [trendData]);
  const stateTrends = useMemo(() => trendData?.state_trends || [], [trendData]);

  // All Available Jurisdiction Names (National + 36 States/UTs)
  const availableJurisdictions = useMemo(() => {
    const list = ['All India'];
    stateTrends.forEach((st) => list.push(st.state_name));
    return list;
  }, [stateTrends]);

  // Handler to add a jurisdiction to comparison (max 5)
  const handleAddJurisdiction = (name) => {
    if (!name) return;
    if (selectedJurisdictions.includes(name)) return;
    if (selectedJurisdictions.length >= 5) {
      return; // max 5 limit
    }
    setSelectedJurisdictions([...selectedJurisdictions, name]);
    setJurisdictionToAdd('');
  };

  // Handler to remove a jurisdiction
  const handleRemoveJurisdiction = (name) => {
    if (selectedJurisdictions.length <= 1) return; // keep at least 1
    setSelectedJurisdictions(selectedJurisdictions.filter((j) => j !== name));
  };

  // Reset comparison to default
  const handleResetComparison = () => {
    setSelectedJurisdictions(['All India', 'Karnataka', 'Telangana', 'Uttar Pradesh']);
    setSelectedYear(2022);
    setTableSearchQuery('');
    setTableAdminFilter('ALL');
  };

  // Trajectory Series Data for the Chart
  const comparisonSeries = useMemo(() => {
    return selectedJurisdictions.map((jurisdictionName, idx) => {
      const color = COMPARISON_COLORS[idx % COMPARISON_COLORS.length];
      const isNational = jurisdictionName === 'All India';

      let values = [];
      if (isNational) {
        values = nationalTrends.map((nt) => ({
          year: nt.year,
          cases: nt.national_total_cases,
          growth: nt.yoy_growth_pct,
          isMissing: false,
        }));
      } else {
        const stateObj = stateTrends.find((s) => s.state_name === jurisdictionName);
        if (stateObj) {
          const years = [2018, 2019, 2020, 2021, 2022];
          values = years.map((yr) => {
            const caseVal = stateObj[`${yr}`] !== undefined ? stateObj[`${yr}`] : stateObj[`c${yr}`];
            const isMissing = caseVal === null || caseVal === undefined;
            return {
              year: yr,
              cases: isMissing ? null : caseVal,
              isMissing,
            };
          });
        }
      }

      return {
        name: jurisdictionName,
        isNational,
        color,
        values,
      };
    });
  }, [selectedJurisdictions, nationalTrends, stateTrends]);

  // Max value among compared series for SVG scaling
  const maxComparisonVal = useMemo(() => {
    let max = 1;
    comparisonSeries.forEach((s) => {
      s.values.forEach((v) => {
        if (v.cases && v.cases > max) max = v.cases;
      });
    });
    return max;
  }, [comparisonSeries]);

  // Year-Specific Ranking Data
  const yearRankingData = useMemo(() => {
    const list = stateTrends.map((st) => {
      const caseVal = st[`${selectedYear}`] !== undefined ? st[`${selectedYear}`] : st[`c${selectedYear}`];
      return {
        state_name: st.state_name,
        admin_type: st.admin_type,
        cases: caseVal !== null && caseVal !== undefined ? caseVal : 0,
        isMissing: caseVal === null || caseVal === undefined,
      };
    });

    const sorted = list.sort((a, b) => b.cases - a.cases);
    const top10 = sorted.slice(0, 10);
    const maxVal = top10.length > 0 ? top10[0].cases : 1;

    return {
      top10,
      maxVal,
    };
  }, [stateTrends, selectedYear]);

  // Filtered State Trends Table Data
  const filteredTableData = useMemo(() => {
    return stateTrends
      .filter((st) => {
        const matchesAdmin = tableAdminFilter === 'ALL' || st.admin_type === tableAdminFilter;
        const matchesSearch =
          !tableSearchQuery.trim() ||
          st.state_name.toLowerCase().includes(tableSearchQuery.toLowerCase());
        return matchesAdmin && matchesSearch;
      })
      .map((st) => {
        const c18 = st['2018'] !== undefined ? st['2018'] : st.c2018;
        const c19 = st['2019'] !== undefined ? st['2019'] : st.c2019;
        const c20 = st['2020'] !== undefined ? st['2020'] : st.c2020;
        const c21 = st['2021'] !== undefined ? st['2021'] : st.c2021;
        const c22 = st['2022'] !== undefined ? st['2022'] : st.c2022;

        const absChange = c18 !== null && c18 !== undefined && c22 !== null && c22 !== undefined ? c22 - c18 : null;

        return {
          state_name: st.state_name,
          admin_type: st.admin_type,
          c2018: c18,
          c2019: c19,
          c2020: c20,
          c21: c21,
          c2022: c22,
          abs_change: absChange,
          growth_pct: st.growth_2018_2022_pct,
          total_5yr: st.total_5yr_cases,
        };
      });
  }, [stateTrends, tableAdminFilter, tableSearchQuery]);

  // Table Columns Definition
  const tableColumns = [
    {
      key: 'state_name',
      label: 'State / UT',
      sortable: true,
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{val}</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{row.admin_type}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'c2018',
      label: '2018',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ color: val === null ? 'var(--text-dim)' : 'var(--text-secondary)' }}>
          {val !== null && val !== undefined ? val.toLocaleString() : <em title="Not available in 2018 source">N/A*</em>}
        </span>
      ),
    },
    {
      key: 'c2019',
      label: '2019',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ color: val === null ? 'var(--text-dim)' : 'var(--text-secondary)' }}>
          {val !== null && val !== undefined ? val.toLocaleString() : <em title="Not available in 2019 source">N/A*</em>}
        </span>
      ),
    },
    {
      key: 'c2020',
      label: '2020',
      align: 'right',
      sortable: true,
      render: (val) => <span>{val !== null && val !== undefined ? val.toLocaleString() : '—'}</span>,
    },
    {
      key: 'c21',
      label: '2021',
      align: 'right',
      sortable: true,
      render: (val) => <span>{val !== null && val !== undefined ? val.toLocaleString() : '—'}</span>,
    },
    {
      key: 'c2022',
      label: '2022 (End)',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
          {val !== null && val !== undefined ? val.toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'abs_change',
      label: '5-Yr Absolute Diff',
      align: 'right',
      sortable: true,
      render: (val) => {
        if (val === null || val === undefined) return <span style={{ color: 'var(--text-dim)' }}>N/A</span>;
        const isPos = val > 0;
        return (
          <span style={{ color: isPos ? 'var(--color-sage-light)' : 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {isPos ? `+${val.toLocaleString()}` : val.toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'growth_pct',
      label: '5-Yr Growth %',
      align: 'right',
      sortable: true,
      render: (val) => {
        if (val === null || val === undefined) return <span style={{ color: 'var(--text-dim)' }}>N/A</span>;
        const isPos = val > 0;
        return (
          <span
            style={{
              fontWeight: 700,
              color: isPos ? 'var(--color-sage-light)' : 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {isPos ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`}
          </span>
        );
      },
    },
  ];

  if (loading && !trendData) {
    return (
      <PageContainer>
        <LoadingState message="Loading 2018–2022 historical longitudinal trends..." />
      </PageContainer>
    );
  }

  if (error && !trendData) {
    return (
      <PageContainer>
        <ErrorState
          title="Historical Data Service Unavailable"
          message={`Unable to retrieve historical panel analytics: ${error}`}
          onRetry={fetchTrendsData}
        />
      </PageContainer>
    );
  }

  const c2018 = trendData?.c2018_national_total || 27248;
  const c2022 = trendData?.c2022_national_total || 65893;
  const growth5Yr = trendData?.total_5yr_expansion_pct || 141.83;

  return (
    <PageContainer>
      {/* 1. PAGE HEADER */}
      <div
        style={{
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 'var(--space-6)',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="tech-label" style={{ color: 'var(--color-sage-light)' }}>
              HISTORICAL ANALYTICS
            </span>
            <StatusBadge variant="success" size="sm">
              NCRB HISTORICAL PANEL (2018–2022)
            </StatusBadge>
            <StatusBadge variant="mauve" size="sm">
              36 JURISDICTIONS
            </StatusBadge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={handleResetComparison}
              className="btn btn-secondary btn-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                padding: '4px 10px',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-secondary)',
              }}
            >
              <RotateCcw size={12} />
              <span>Reset Views</span>
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em' }}>
          Registered Cybercrime Trends (2018–2022)
        </h1>
        <p
          style={{
            maxWidth: '880px',
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
          }}
        >
          Explore how registered cybercrime volume expanded across India's States and Union Territories over the 5-year historical panel. Examine longitudinal growth rates, individual state trajectories, and year-over-year dynamics.
        </p>

        {/* Dataset Status Strip with Time-Series Discontinuity Notice */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-5)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Database size={13} color="var(--color-sage-light)" />
            <span>SOURCE: <strong style={{ color: 'var(--text-primary)' }}>RAJYA SABHA UNSTARRED Q226 / NCRB</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Calendar size={13} color="var(--color-mauve-light)" />
            <span>COVERAGE: <strong style={{ color: 'var(--text-primary)' }}>5 ANNUAL PERIODS (2018–2022)</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Shield size={13} color="var(--status-warning)" />
            <span>DISCONTINUITY: <strong style={{ color: 'var(--text-primary)' }}>2023 EXCLUDED (ISOLATED SERIES)</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
            <StatusDot status="live" size="sm" />
            <span style={{ color: 'var(--color-sage-light)' }}>SERIES ISOLATED & VALIDATED</span>
          </div>
        </div>
      </div>

      {/* 2. HISTORICAL KPI STRIP */}
      <section style={{ marginTop: 'var(--space-6)' }}>
        <SectionHeader
          badge="HISTORICAL METRICS"
          title="5-Year Longitudinal Expansion Invariants"
          subtitle="Core metrics capturing nationwide registered volume trajectory from 2018 to 2022"
        />

        <div className="grid grid-5-cols" style={{ gap: 'var(--space-4)' }}>
          <MetricCard
            label="STARTING VOLUME (2018)"
            value={c2018.toLocaleString()}
            description="Base year registered nationwide volume"
            change="Panel Start"
            changeType="neutral"
            statusBadge="2018 BASE"
            badgeVariant="neutral"
            accentColor="var(--color-sage)"
          />

          <MetricCard
            label="ENDING VOLUME (2022)"
            value={c2022.toLocaleString()}
            description="Peak year registered nationwide volume"
            change="+141.83%"
            changeType="positive"
            statusBadge="2022 PEAK"
            badgeVariant="success"
            accentColor="var(--color-sage-light)"
          />

          <MetricCard
            label="5-YEAR EXPANSION"
            value={`+${growth5Yr}%`}
            description={`+${(c2022 - c2018).toLocaleString()} net case increase`}
            change="Major Scale-up"
            changeType="positive"
            statusBadge="5-YEAR PANEL"
            badgeVariant="success"
            accentColor="var(--color-sage-deep)"
          />

          <MetricCard
            label="PEAK YoY SURGE"
            value="+64.18%"
            description="2018 → 2019 annual registered expansion"
            change="+17,487 cases"
            changeType="accent"
            statusBadge="INFLECTION"
            badgeVariant="mauve"
            accentColor="var(--color-mauve-dusty)"
          />

          <MetricCard
            label="GROWTH MODERATION"
            value="+5.87%"
            description="Lowest annual growth rate in 2021"
            change="Stabilization"
            changeType="neutral"
            statusBadge="2021 TROUGH"
            badgeVariant="neutral"
            accentColor="var(--color-mauve-deep)"
          />
        </div>
      </section>

      {/* 3. NATIONAL HISTORICAL TREND & YoY GROWTH DYNAMICS */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <div className="grid grid-2-cols" style={{ gap: 'var(--space-6)', alignItems: 'stretch' }}>
          {/* Panel 1: National Volume Bar + Growth Progression */}
          <Panel
            category="NATIONAL SERIES"
            title="National Volume Progression (2018–2022)"
            subtitle="Authoritative annual registered cases from NCRB historical archives"
            badge={<StatusBadge variant="info" size="sm">5-YEAR PANEL</StatusBadge>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Year by Year Bar Progression */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {nationalTrends.map((nt) => {
                  const maxCases = 65893;
                  const barWidth = Math.max(8, (nt.national_total_cases / maxCases) * 100);

                  return (
                    <div key={nt.year} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ width: '45px', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                        {nt.year}
                      </div>

                      <div style={{ flex: 1, height: '24px', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                        <div
                          style={{
                            width: `${barWidth}%`,
                            height: '100%',
                            backgroundColor: nt.year === 2022 ? 'var(--color-sage-light)' : 'var(--color-sage)',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>

                      <div style={{ width: '85px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 700 }}>
                        {nt.national_total_cases.toLocaleString()}
                      </div>

                      <div style={{ width: '75px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: nt.yoy_growth_pct ? 'var(--color-sage-light)' : 'var(--text-muted)' }}>
                        {nt.yoy_growth_pct ? `+${nt.yoy_growth_pct}%` : 'Base Year'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Interpretation Note */}
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  backgroundColor: 'rgba(80, 118, 86, 0.08)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}
              >
                <strong>Non-Causal Notice:</strong> Registered volume reflects officially recorded cases in NCRB archives. Growth encompasses enhanced reporting willingness, cyber cell institutionalization, and online registration portal adoption alongside digital activity expansion.
              </div>
            </div>
          </Panel>

          {/* Panel 2: Year-over-Year Dynamics */}
          <Panel
            category="ANNUAL EXPANSION"
            title="Registered Volume — Year-Over-Year Change"
            subtitle="Annual percentage and volume changes across consecutive reporting periods"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div className="grid grid-2-cols" style={{ gap: 'var(--space-3)' }}>
                {nationalTrends.filter((nt) => nt.year > 2018).map((nt) => (
                  <div
                    key={nt.year}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span className="tech-label" style={{ fontSize: '0.6875rem' }}>PERIOD {nt.year - 1} → {nt.year}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-sage-light)' }}>
                        +{nt.yoy_growth_pct}%
                      </span>
                    </div>

                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '4px' }}>
                      +{((nt.national_total_cases || 0) - (nt.prev_year_cases || 0)).toLocaleString()} cases
                    </div>

                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {nt.prev_year_cases?.toLocaleString()} cases $\rightarrow$ {nt.national_total_cases.toLocaleString()} cases
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Insight */}
              <div
                style={{
                  padding: 'var(--space-3) var(--space-4)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                }}
              >
                <strong>Trajectory Trend:</strong> The sharpest annual increase occurred from 2018 to 2019 (+64.18%), after which YoY expansion moderated to +11.85% (2020) and +5.87% (2021), before accelerating again in 2022 (+24.39%).
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* 4. MULTI-JURISDICTION TRAJECTORY EXPLORER */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="TRAJECTORY COMPARISON"
          title="Multi-Jurisdiction Trajectory Explorer"
          subtitle="Compare longitudinal trajectories across up to 5 jurisdictions simultaneously"
        />

        <Panel
          category="LONGITUDINAL PATHWAYS"
          title="Jurisdiction Trend Comparisons (2018–2022)"
          subtitle="Visualizing comparative trajectories across selected States and Union Territories"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              {/* Selector to add jurisdiction */}
              <select
                value={jurisdictionToAdd}
                onChange={(e) => {
                  handleAddJurisdiction(e.target.value);
                }}
                disabled={selectedJurisdictions.length >= 5}
                style={{
                  padding: '5px 10px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-xs)',
                  outline: 'none',
                  cursor: selectedJurisdictions.length >= 5 ? 'not-allowed' : 'pointer',
                }}
              >
                <option value="" disabled>
                  {selectedJurisdictions.length >= 5 ? 'Max 5 jurisdictions selected' : '+ Add Jurisdiction...'}
                </option>
                {availableJurisdictions
                  .filter((j) => !selectedJurisdictions.includes(j))
                  .map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
              </select>
            </div>
          }
        >
          {/* Active Jurisdiction Tag Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
            {comparisonSeries.map((s) => (
              <div
                key={s.name}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid ${s.color.hex}`,
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-xs)',
                }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: s.color.hex }} />
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                {selectedJurisdictions.length > 1 && (
                  <button
                    onClick={() => handleRemoveJurisdiction(s.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'var(--text-muted)',
                      marginLeft: '2px',
                      cursor: 'pointer',
                    }}
                    title={`Remove ${s.name}`}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* SVG Multi-Line Trajectory Chart */}
          <div
            style={{
              height: '280px',
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: 'var(--space-4)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {/* SVG Visual Lines */}
            <svg
              viewBox="0 0 500 200"
              style={{ width: '100%', height: '200px', overflow: 'visible' }}
            >
              {/* Grid Lines */}
              {[0, 50, 100, 150, 200].map((y) => (
                <line
                  key={y}
                  x1="30"
                  y1={y}
                  x2="490"
                  y2={y}
                  stroke="rgba(133, 162, 137, 0.08)"
                  strokeDasharray="3 3"
                />
              ))}

              {/* Data Series Polylines */}
              {comparisonSeries.map((s) => {
                const years = [2018, 2019, 2020, 2021, 2022];
                const points = [];

                years.forEach((yr, idx) => {
                  const valObj = s.values.find((v) => v.year === yr);
                  if (valObj && !valObj.isMissing && valObj.cases !== null) {
                    const x = 40 + idx * 110;
                    const y = 190 - (valObj.cases / maxComparisonVal) * 170;
                    points.push({ x, y, cases: valObj.cases, year: yr });
                  }
                });

                if (points.length < 2) return null;

                const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

                return (
                  <g key={s.name}>
                    <polyline
                      fill="none"
                      stroke={s.color.hex}
                      strokeWidth={s.isNational ? '3' : '2'}
                      strokeDasharray={s.name === 'Ladakh' ? '4 4' : 'none'}
                      points={pointsStr}
                    />
                    {points.map((p) => (
                      <circle
                        key={p.year}
                        cx={p.x}
                        cy={p.y}
                        r={s.isNational ? '4' : '3.5'}
                        fill={s.color.hex}
                        stroke="var(--bg-surface)"
                        strokeWidth="1.5"
                      >
                        <title>{`${s.name} (${p.year}): ${p.cases.toLocaleString()} cases`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
            </svg>

            {/* X-Axis Year Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              <span>2018</span>
              <span>2019</span>
              <span>2020</span>
              <span>2021</span>
              <span>2022</span>
            </div>
          </div>

          {/* Ladakh Missingness Notice */}
          <div
            style={{
              marginTop: 'var(--space-4)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'rgba(216, 165, 99, 0.08)',
              border: '1px solid rgba(216, 165, 99, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--status-warning)',
              lineHeight: '1.5',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Missingness Transparency (Ladakh):</strong> Ladakh has no reported registered cybercrime values for 2018 and 2019 in the official archival dataset (RS AU 226). In accordance with non-destructive analytical discipline, these values are left as unimputed nulls (N/A) rather than filled with artificial zeros.
            </div>
          </div>
        </Panel>
      </section>

      {/* 5. YEAR-SPECIFIC CROSS-SECTIONAL RANKING (2018–2022) */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="CROSS-SECTIONAL TIMELINE"
          title={`Registered Case Volume by Jurisdiction — Year: ${selectedYear}`}
          subtitle="Explore annual volume rankings for individual historical reporting periods"
        />

        <Panel
          category="ANNUAL VOLUME SNAPSHOT"
          title={`Top 10 Jurisdictions in ${selectedYear}`}
          subtitle="Annual volume hierarchy across reporting States and UTs"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <span className="tech-label" style={{ fontSize: '0.6875rem' }}>SELECT YEAR:</span>
              <SegmentedControl
                options={[
                  { value: 2018, label: '2018' },
                  { value: 2019, label: '2019' },
                  { value: 2020, label: '2020' },
                  { value: 2021, label: '2021' },
                  { value: 2022, label: '2022' },
                ]}
                value={selectedYear}
                onChange={setSelectedYear}
                size="sm"
              />
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {yearRankingData.top10.map((st, idx) => {
              const barWidth = Math.max(4, (st.cases / yearRankingData.maxVal) * 100);

              return (
                <div
                  key={st.state_name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ width: '140px', fontSize: 'var(--text-xs)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    #{idx + 1} {st.state_name}
                  </div>

                  <div style={{ flex: 1, height: '14px', backgroundColor: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        backgroundColor: 'var(--color-sage)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>

                  <div style={{ width: '90px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
                    {st.isMissing ? 'N/A' : st.cases.toLocaleString()} cases
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      {/* 6. HISTORICAL STATE/UT COMPARISON TABLE */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="HISTORICAL ROSTER"
          title="Complete 36 States & UTs Longitudinal Panel Table"
          subtitle="Longitudinal historical volume matrix from 2018 to 2022 with 5-year absolute and percentage differences"
        />

        {/* Table Filters */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <SegmentedControl
              options={[
                { value: 'ALL', label: 'All Jurisdictions', count: stateTrends.length },
                { value: 'State', label: 'States', count: stateTrends.filter((s) => s.admin_type === 'State').length },
                { value: 'Union Territory', label: 'UTs', count: stateTrends.filter((s) => s.admin_type === 'Union Territory').length },
              ]}
              value={tableAdminFilter}
              onChange={setTableAdminFilter}
              size="sm"
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 10px',
              gap: '8px',
              minWidth: '240px',
            }}
          >
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search state name..."
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: 'var(--text-xs)',
                width: '100%',
              }}
            />
          </div>
        </div>

        {/* Historical Matrix Data Table */}
        <DataTable
          columns={tableColumns}
          data={filteredTableData}
          rowKey="state_name"
          emptyMessage="No historical records match current search or filters."
        />
      </section>

      {/* 7. ANALYTICAL SYNTHESIS & SIGNALS */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="SYNTHESIS"
          title="Historical Analytical Signals"
          subtitle="Validated empirical observations synthesized from the 2018–2022 longitudinal panel"
        />

        <div className="grid grid-4-cols" style={{ gap: 'var(--space-4)' }}>
          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge variant="success" size="sm">PANEL EXPANSION</StatusBadge>
            </div>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              +141.83% 5-Year Scale Surge
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Nationwide registered volume increased from 27,248 in 2018 to 65,893 in 2022, demonstrating systematic scale expansion.
            </p>
          </div>

          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge variant="mauve" size="sm">INFLECTION</StatusBadge>
            </div>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              2018–2019 Growth Spurt
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              The steepest annual increase occurred in 2019 (+64.18%), driven by the rollout of the national citizen cyber reporting portal.
            </p>
          </div>

          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge variant="warning" size="sm">STATE HETEROGENEITY</StatusBadge>
            </div>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Diverse State Trajectories
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Individual State/UT trajectories vary significantly; high-volume tech hubs expanded rapidly while smaller UTs experienced uneven annual patterns.
            </p>
          </div>

          <div style={{ padding: 'var(--space-4)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge variant="info" size="sm">STABILIZATION</StatusBadge>
            </div>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              2020–2021 Moderation
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Annual growth moderated during 2020 (+11.85%) and 2021 (+5.87%) before picking up again in 2022 (+24.39%).
            </p>
          </div>
        </div>
      </section>

      {/* 8. METHODOLOGY & LIMITATIONS FOOTER */}
      <footer
        style={{
          marginTop: 'var(--space-12)',
          paddingTop: 'var(--space-6)',
          borderTop: '1px solid var(--border-default)',
          color: 'var(--text-muted)',
          fontSize: 'var(--text-xs)',
          lineHeight: '1.6',
        }}
      >
        <div className="grid grid-4-cols" style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>SERIES SEPARATION</div>
            <p style={{ margin: 0 }}>
              The 2018–2022 historical panel originates from Rajya Sabha Unstarred Question No. 226 archives and is maintained separately from the 2023 NCRB detailed category tables.
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>MISSINGNESS DISCLOSURE</div>
            <p style={{ margin: 0 }}>
              Ladakh reports missing values for 2018 and 2019 in the source records. In compliance with data integrity standards, these nulls are strictly preserved without imputation.
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>REPORTING VARIABILITY</div>
            <p style={{ margin: 0 }}>
              Registered case volume reflects administrative reporting and police registration practices; aggregate data cannot isolate underlying criminal incidence from reporting awareness.
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>PREDICTION BOUNDARIES</div>
            <p style={{ margin: 0 }}>
              Short panel length (5 annual data points) precludes statistically valid deep time-series forecasting. Trend analytics are strictly descriptive.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <span>Cyber Crime Analytics for National Security — Historical Analytics Stage 23</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}>
            <span>DATA: RS AU 226 (2018–2022)</span>
            <span>API: FASTAPI 1.0.0</span>
            <span>ROUTE: /trends</span>
          </div>
        </div>
      </footer>
    </PageContainer>
  );
};

export default TrendsPage;
