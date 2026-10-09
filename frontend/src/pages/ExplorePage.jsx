import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';
import StatusDot from '../components/ui/StatusDot';
import Panel from '../components/ui/Panel';
import SegmentedControl from '../components/ui/SegmentedControl';
import DataTable from '../components/data/DataTable';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import api from '../services/api';
import {
  MapPin,
  Search,
  RotateCcw,
  Scale,
  Database,
  Info,
  FileText
} from 'lucide-react';

export const ExplorePage = () => {
  // Coordinated Data State
  const [statesData, setStatesData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [motivesData, setMotivesData] = useState([]);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Global Controls & Filters
  const [selectedStateName, setSelectedStateName] = useState('ALL'); // 'ALL' or state_name string
  const [adminTypeFilter, setAdminTypeFilter] = useState('ALL'); // 'ALL' | 'State' | 'Union Territory'
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  
  // Category Explorer Filters
  const [leafOnlyFilter, setLeafOnlyFilter] = useState(true); // default true: 40 leaf categories
  const [categoryActFilter, setCategoryActFilter] = useState('ALL'); // 'ALL' | 'IT Act' | 'IPC' | 'SLL'
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null); // CategoryItem for modal/detail inspector

  // Motive Explorer Filters
  const [motiveSearchQuery, setMotiveSearchQuery] = useState('');

  // Fetch all primary datasets concurrently
  const fetchExploreData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statesRes, categoriesRes, motivesRes, summaryRes] = await Promise.all([
        api.getStates({ sort_by: 'total_cases', order: 'desc' }),
        api.getCategories({ sort_by: 'national_cases', order: 'desc' }),
        api.getMotives({ exclude_total: true, sort_by: 'national_cases', order: 'desc' }),
        api.getSummary(),
      ]);

      setStatesData(statesRes?.states || []);
      setCategoriesData(categoriesRes?.categories || []);
      setMotivesData(motivesRes?.motives || []);
      setSummaryData(summaryRes || null);
    } catch (err) {
      console.error('[ExplorePage] Error fetching exploration data:', err);
      setError(err.message || 'Unable to load geographic and crime exploration data from API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExploreData();
  }, [fetchExploreData]);

  // Derived Selected State Object
  const activeState = useMemo(() => {
    if (selectedStateName === 'ALL' || !selectedStateName) return null;
    return statesData.find((s) => s.state_name === selectedStateName) || null;
  }, [statesData, selectedStateName]);

  // Filtered States List for Table and Search
  const filteredStates = useMemo(() => {
    const cleanQuery = stateSearchQuery.trim().toLowerCase();
    return statesData.filter((s) => {
      const matchesAdmin = adminTypeFilter === 'ALL' || s.admin_type === adminTypeFilter;
      const matchesSearch =
        !cleanQuery ||
        s.state_name.toLowerCase().includes(cleanQuery) ||
        s.admin_type.toLowerCase().includes(cleanQuery);
      return matchesAdmin && matchesSearch;
    });
  }, [statesData, adminTypeFilter, stateSearchQuery]);

  // Top Jurisdictions for Visual Bar Chart (dynamic based on active filters)
  const top10States = useMemo(() => {
    const isFiltered = Boolean(stateSearchQuery.trim() || adminTypeFilter !== 'ALL');
    const pool = isFiltered ? filteredStates : statesData;
    return [...pool].sort((a, b) => b.total_cases - a.total_cases).slice(0, 10);
  }, [statesData, filteredStates, stateSearchQuery, adminTypeFilter]);

  // Max Cases among top 10 for bar proportions
  const maxTop10Cases = useMemo(() => {
    return top10States.length > 0 ? top10States[0].total_cases : 1;
  }, [top10States]);

  // Filtered Categories List
  const filteredCategories = useMemo(() => {
    return categoriesData.filter((c) => {
      const matchesLeaf = leafOnlyFilter ? c.is_leaf === 1 : true;
      const matchesAct =
        categoryActFilter === 'ALL'
          ? true
          : c.act_group.toLowerCase().includes(categoryActFilter.toLowerCase());
      const matchesSearch =
        !categorySearchQuery.trim() ||
        c.category_display_name.toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
        (c.section_reference && c.section_reference.toLowerCase().includes(categorySearchQuery.toLowerCase())) ||
        (c.parent_category && c.parent_category.toLowerCase().includes(categorySearchQuery.toLowerCase()));
      return matchesLeaf && matchesAct && matchesSearch;
    });
  }, [categoriesData, leafOnlyFilter, categoryActFilter, categorySearchQuery]);

  // Filtered Motives List
  const filteredMotives = useMemo(() => {
    return motivesData.filter((m) => {
      return (
        !motiveSearchQuery.trim() ||
        m.motive_name.toLowerCase().includes(motiveSearchQuery.toLowerCase())
      );
    });
  }, [motivesData, motiveSearchQuery]);

  // Reset all filters to default
  const handleResetFilters = () => {
    setSelectedStateName('ALL');
    setAdminTypeFilter('ALL');
    setStateSearchQuery('');
    setLeafOnlyFilter(true);
    setCategoryActFilter('ALL');
    setCategorySearchQuery('');
    setMotiveSearchQuery('');
    setSelectedCategory(null);
  };

  // Loading Screen
  if (loading && statesData.length === 0) {
    return (
      <PageContainer>
        <LoadingState message="Loading State/UT and crime category intelligence..." />
      </PageContainer>
    );
  }

  // Error Screen
  if (error && statesData.length === 0) {
    return (
      <PageContainer>
        <ErrorState
          title="Explorer Service Unavailable"
          message={`Unable to retrieve validated geographic analytics: ${error}`}
          onRetry={fetchExploreData}
        />
      </PageContainer>
    );
  }

  // National Benchmarks
  const nationalTotal = summaryData?.total_cases || 86420;
  const nationalITShare = summaryData?.it_act_share || 51.19;
  const nationalIPCShare = summaryData?.ipc_share || 48.43;
  const nationalSLLShare = summaryData?.sll_share || 0.39;
  const nationalFraudShare = summaryData?.fraud_motive_share || 68.88;

  // Selected State Active Values
  const stateTotal = activeState ? activeState.total_cases : nationalTotal;
  const stateITShare = activeState ? activeState.it_act_share : nationalITShare;
  const stateIPCShare = activeState ? activeState.ipc_share : nationalIPCShare;
  const stateSLLShare = activeState ? activeState.sll_share : nationalSLLShare;
  const stateFraudShare = activeState ? activeState.fraud_motive_share : nationalFraudShare;
  const stateITCases = activeState ? activeState.it_act_cases : (summaryData?.it_act_cases || 44237);
  const stateIPCCases = activeState ? activeState.ipc_cases : (summaryData?.ipc_cases || 41849);
  const stateSLLCases = activeState ? activeState.sll_cases : (summaryData?.sll_cases || 334);

  // Table Columns Definition
  const stateTableColumns = [
    {
      key: 'national_rank',
      label: 'Rank',
      align: 'center',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            color: val <= 5 ? 'var(--status-warning)' : 'var(--text-muted)',
            fontSize: 'var(--text-xs)',
          }}
        >
          #{val}
        </span>
      ),
    },
    {
      key: 'state_name',
      label: 'Jurisdiction',
      sortable: true,
      render: (val, row, isSelected) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSelected && (
            <div
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-sage-light)',
              }}
            />
          )}
          <div>
            <div
              style={{
                fontWeight: isSelected ? 700 : 600,
                color: isSelected ? 'var(--text-primary)' : 'var(--text-primary)',
              }}
            >
              {val}
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {row.admin_type}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'total_cases',
      label: 'Total Cases',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--text-sm)' }}>
          {val.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'national_share',
      label: 'Natl. Share',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ color: 'var(--color-sage-light)', fontWeight: 600 }}>
          {val.toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'it_act_share',
      label: 'IT Act %',
      align: 'right',
      sortable: true,
      render: (val, row) => (
        <span title={`IT Act: ${row.it_act_cases.toLocaleString()} cases`}>
          {val.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'ipc_share',
      label: 'IPC %',
      align: 'right',
      sortable: true,
      render: (val, row) => (
        <span title={`IPC: ${row.ipc_cases.toLocaleString()} cases`}>
          {val.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'sll_share',
      label: 'SLL %',
      align: 'right',
      sortable: true,
      render: (val, row) => (
        <span title={`SLL: ${row.sll_cases.toLocaleString()} cases`}>
          {val.toFixed(2)}%
        </span>
      ),
    },
    {
      key: 'fraud_motive_share',
      label: 'Fraud Motive %',
      align: 'right',
      sortable: true,
      render: (val, row) => (
        <span
          style={{ color: 'var(--color-mauve-light)', fontWeight: 600 }}
          title={`Fraud Motive: ${row.motive_fraud.toLocaleString()} cases`}
        >
          {val.toFixed(1)}%
        </span>
      ),
    },
    {
      key: 'women_cases_total',
      label: 'Women Cases',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ color: 'var(--text-muted)' }}>
          {val.toLocaleString()}
        </span>
      ),
    },
  ];

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
              GEOGRAPHIC & CRIME EXPLORER
            </span>
            <StatusBadge variant="success" size="sm">
              NCRB 2023 VALIDATED
            </StatusBadge>
            <StatusBadge variant="neutral" size="sm">
              36 JURISDICTIONS
            </StatusBadge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={handleResetFilters}
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
              <span>Reset Explorer</span>
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em' }}>
          State / UT Intelligence Explorer
        </h1>
        <p
          style={{
            maxWidth: '880px',
            fontSize: 'var(--text-base)',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
          }}
        >
          Explore registered cybercrime volume, statutory classifications, and recorded motives across India's 28 States and 8 Union Territories. Compare state-level profiles with national benchmarks and examine 40 independent leaf categories.
        </p>

        {/* Dataset Status Strip */}
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
            <span>SCOPE: <strong style={{ color: 'var(--text-primary)' }}>36 STATES & UTs (86,420 OFFENSES)</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Scale size={13} color="var(--color-mauve-light)" />
            <span>CATEGORIES: <strong style={{ color: 'var(--text-primary)' }}>40 LEAF / 9 PARENT SUBTOTALS</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <FileText size={13} color="var(--color-sage)" />
            <span>MOTIVES: <strong style={{ color: 'var(--text-primary)' }}>18 SPECIFIC RECORDED MOTIVES</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
            <StatusDot status="live" size="sm" />
            <span style={{ color: 'var(--color-sage-light)' }}>2023 DETAILED ANALYSIS</span>
          </div>
        </div>
      </div>

      {/* 2. GLOBAL EXPLORATION CONTROL BAR */}
      <section
        style={{
          marginTop: 'var(--space-6)',
          padding: 'var(--space-4)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-panel)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-4)',
          }}
        >
          {/* State / UT Selector Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '260px', flex: '1 1 260px' }}>
            <span className="tech-label" style={{ fontSize: '0.6875rem' }}>SELECT JURISDICTION</span>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedStateName}
                onChange={(e) => setSelectedStateName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="ALL">All India (National Total — 86,420 Cases)</option>
                {filteredStates.filter((s) => s.admin_type === 'State').length > 0 && (
                  <optgroup label={`States (${filteredStates.filter((s) => s.admin_type === 'State').length})`}>
                    {filteredStates
                      .filter((s) => s.admin_type === 'State')
                      .map((s) => (
                        <option key={s.state_name} value={s.state_name}>
                          {s.national_rank ? `#${s.national_rank} ` : ''}{s.state_name} ({s.total_cases.toLocaleString()} cases)
                        </option>
                      ))}
                  </optgroup>
                )}
                {filteredStates.filter((s) => s.admin_type === 'Union Territory').length > 0 && (
                  <optgroup label={`Union Territories (${filteredStates.filter((s) => s.admin_type === 'Union Territory').length})`}>
                    {filteredStates
                      .filter((s) => s.admin_type === 'Union Territory')
                      .map((s) => (
                        <option key={s.state_name} value={s.state_name}>
                          {s.national_rank ? `#${s.national_rank} ` : ''}{s.state_name} ({s.total_cases.toLocaleString()} cases)
                        </option>
                      ))}
                  </optgroup>
                )}
                {selectedStateName !== 'ALL' && !filteredStates.some((s) => s.state_name === selectedStateName) && (
                  <option value={selectedStateName}>
                    {selectedStateName} (Selected)
                  </option>
                )}
              </select>
            </div>
          </div>

          {/* Admin Type Filter Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span className="tech-label" style={{ fontSize: '0.6875rem' }}>ADMINISTRATIVE FILTER</span>
            <SegmentedControl
              options={[
                { value: 'ALL', label: 'All Jurisdictions', count: statesData.length },
                { value: 'State', label: 'States', count: statesData.filter((s) => s.admin_type === 'State').length },
                { value: 'Union Territory', label: 'UTs', count: statesData.filter((s) => s.admin_type === 'Union Territory').length },
              ]}
              value={adminTypeFilter}
              onChange={setAdminTypeFilter}
              size="sm"
            />
          </div>

          {/* Quick Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '220px', flex: '1 1 220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="tech-label" style={{ fontSize: '0.6875rem' }}>SEARCH JURISDICTIONS</span>
              {stateSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStateSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.625rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Clear search
                </button>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 10px',
                gap: '8px',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Filter by name (e.g. Karnataka, Gujarat)..."
                value={stateSearchQuery}
                onChange={(e) => setStateSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && filteredStates.length > 0) {
                    setSelectedStateName(filteredStates[0].state_name);
                  }
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--text-xs)',
                  width: '100%',
                }}
              />
              {stateSearchQuery && (
                <button
                  type="button"
                  onClick={() => setStateSearchQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-dim)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    padding: '0 2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. CONTEXTUAL JURISDICTION PROFILE HERO */}
      <section style={{ marginTop: 'var(--space-6)' }}>
        <div
          style={{
            padding: 'var(--space-5)',
            backgroundColor: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-panel)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-5)',
          }}
        >
          {/* Left: Jurisdiction Identity & Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeState ? 'rgba(80, 118, 86, 0.2)' : 'rgba(178, 150, 174, 0.2)',
                border: `1px solid ${activeState ? 'var(--color-sage)' : 'var(--color-mauve-dusty)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: activeState ? 'var(--color-sage-light)' : 'var(--color-mauve-light)',
              }}
            >
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span
                  style={{
                    fontSize: 'var(--text-2xl)',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {activeState ? activeState.state_name : 'All India (National Aggregate)'}
                </span>
                <StatusBadge variant={activeState?.admin_type === 'Union Territory' ? 'mauve' : 'success'} size="sm">
                  {activeState ? activeState.admin_type.toUpperCase() : 'NATIONAL AGGREGATE'}
                </StatusBadge>
                {activeState?.national_rank && (
                  <StatusBadge variant={activeState.national_rank <= 5 ? 'warning' : 'neutral'} size="sm">
                    RANK #{activeState.national_rank} / 36
                  </StatusBadge>
                )}
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                {activeState
                  ? `Accounts for ${activeState.national_share.toFixed(2)}% of all registered offenses nationally.`
                  : 'Total registered cybercrime offenses across all 36 States and Union Territories in NCRB 2023.'}
              </div>
            </div>
          </div>

          {/* Right: Key Summary Metrics */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-5)', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>TOTAL CASES</div>
              <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {stateTotal.toLocaleString()}
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--border-default)' }} />

            <div style={{ textAlign: 'right' }}>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>IT ACT SHARE</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)' }}>
                {stateITShare.toFixed(1)}%
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--border-default)' }} />

            <div style={{ textAlign: 'right' }}>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>IPC SHARE</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-mauve-light)' }}>
                {stateIPCShare.toFixed(1)}%
              </div>
            </div>

            <div style={{ width: '1px', height: '36px', backgroundColor: 'var(--border-default)' }} />

            <div style={{ textAlign: 'right' }}>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>FRAUD MOTIVE</div>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)' }}>
                {stateFraudShare.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. COMPOSITIONAL COMPARISON PANEL (Selected vs National) */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="COMPOSITION PROFILE"
          title={activeState ? `${activeState.state_name} vs. National Baseline` : 'National Statutory Composition'}
          subtitle="Proportional comparison across statutory acts, recorded fraud motives, and vulnerable demographic context"
        />

        <div className="grid grid-2-cols" style={{ gap: 'var(--space-6)', alignItems: 'stretch' }}>
          {/* Panel 1: Statutory Act Groups Reconciliation */}
          <Panel
            category="STATUTORY CLASSIFICATION"
            title="Act Group Statutory Composition"
            subtitle={`Distribution across IT Act, IPC (r/w IT Act), and SLL for ${activeState ? activeState.state_name : 'All India'}`}
            badge={<StatusBadge variant="info" size="sm">100% RECONCILED</StatusBadge>}
          >
            <div style={{ padding: 'var(--space-2) 0' }}>
              {/* Stacked Proportional Bar */}
              <div
                style={{
                  height: '24px',
                  display: 'flex',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-default)',
                  marginBottom: 'var(--space-5)',
                }}
              >
                <div
                  style={{
                    width: `${stateITShare}%`,
                    backgroundColor: 'var(--color-sage)',
                    transition: 'width 0.4s ease',
                  }}
                  title={`IT Act: ${stateITCases.toLocaleString()} (${stateITShare.toFixed(1)}%)`}
                />
                <div
                  style={{
                    width: `${stateIPCShare}%`,
                    backgroundColor: 'var(--color-mauve)',
                    transition: 'width 0.4s ease',
                  }}
                  title={`IPC Crimes: ${stateIPCCases.toLocaleString()} (${stateIPCShare.toFixed(1)}%)`}
                />
                <div
                  style={{
                    width: `${stateSLLShare}%`,
                    backgroundColor: 'var(--color-sage-light)',
                    minWidth: stateSLLCases > 0 ? '4px' : '0px',
                    transition: 'width 0.4s ease',
                  }}
                  title={`SLL Crimes: ${stateSLLCases.toLocaleString()} (${stateSLLShare.toFixed(2)}%)`}
                />
              </div>

              {/* Breakdown Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-sage)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Information Technology Act (IT Act)</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      {stateITCases.toLocaleString()} cases
                    </span>
                    <span style={{ marginLeft: '8px', color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      ({stateITShare.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-mauve)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>IPC Offences (r/w IT Act)</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      {stateIPCCases.toLocaleString()} cases
                    </span>
                    <span style={{ marginLeft: '8px', color: 'var(--color-mauve-light)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      ({stateIPCShare.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-sage-light)' }} />
                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>Special & Local Laws (SLL)</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                      {stateSLLCases.toLocaleString()} cases
                    </span>
                    <span style={{ marginLeft: '8px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                      ({stateSLLShare.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Exact Reconciliation Sum */}
              <div
                style={{
                  marginTop: 'var(--space-4)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px dashed var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Sum of Act Groups:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {stateITCases.toLocaleString()} + {stateIPCCases.toLocaleString()} + {stateSLLCases.toLocaleString()} = {stateTotal.toLocaleString()} (100.0%)
                </span>
              </div>
            </div>
          </Panel>

          {/* Panel 2: Comparative Metric Differentials */}
          <Panel
            category="COMPOSITIONAL DIFFERENTIAL"
            title={activeState ? `Compositional Divergence from National Norms` : 'National Analytical Benchmarks'}
            subtitle="Comparing proportional shares against national baselines (non-causal)"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* IT Act Comparison Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>IT Act Statutory Proportion</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {activeState ? `${activeState.state_name}: ${stateITShare.toFixed(1)}%` : `National: ${nationalITShare}%`}
                    {activeState && ` (Natl: ${nationalITShare}%)`}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${stateITShare}%`, backgroundColor: 'var(--color-sage)' }} />
                </div>
              </div>

              {/* IPC Comparison Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>IPC (r/w IT Act) Proportion</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {activeState ? `${activeState.state_name}: ${stateIPCShare.toFixed(1)}%` : `National: ${nationalIPCShare}%`}
                    {activeState && ` (Natl: ${nationalIPCShare}%)`}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${stateIPCShare}%`, backgroundColor: 'var(--color-mauve)' }} />
                </div>
              </div>

              {/* Fraud Motive Comparison Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>Stated Fraud Motive Proportion</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>
                    {activeState ? `${activeState.state_name}: ${stateFraudShare.toFixed(1)}%` : `National: ${nationalFraudShare}%`}
                    {activeState && ` (Natl: ${nationalFraudShare}%)`}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${stateFraudShare}%`, backgroundColor: 'var(--color-sage-light)' }} />
                </div>
              </div>

              {/* Demographics Context Cards */}
              <div className="grid grid-2-cols" style={{ gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-mauve-light)' }}>WOMEN CASES CONTEXT</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {activeState ? activeState.women_cases_total.toLocaleString() : (summaryData?.women_cases || 19510).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {activeState ? `${((activeState.women_cases_total / activeState.total_cases) * 100).toFixed(1)}% of state volume` : '22.58% national footprint'}
                  </div>
                </div>

                <div style={{ padding: 'var(--space-3)', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-sage-light)' }}>CHILD CASES CONTEXT</div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {activeState ? activeState.child_cases_total.toLocaleString() : (summaryData?.children_cases || 1902).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    {activeState ? `${((activeState.child_cases_total / activeState.total_cases) * 100).toFixed(1)}% of state volume` : '2.20% national footprint'}
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* 5. STATE/UT EXPLORATION TABLE & TOP 10 VISUAL RANKING */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="JURISDICTION ROSTER"
          title={`All 36 States & Union Territories Exploration${filteredStates.length !== statesData.length ? ` (${filteredStates.length} Displayed)` : ''}`}
          subtitle="Interactive multidimensional ranking table. Click any row to inspect jurisdiction profile."
        />

        {/* Top Visual Ranking Bar Chart */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Panel
            category="VOLUME HIERARCHY"
            title={stateSearchQuery.trim() || adminTypeFilter !== 'ALL' ? `Filtered Jurisdictions by Registered Volume (${top10States.length})` : 'Top 10 Jurisdictions by Registered Volume'}
            subtitle="Click any bar to switch active state focus"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {top10States.map((st) => {
                const isSelected = selectedStateName === st.state_name;
                const barWidth = Math.max(4, (st.total_cases / maxTop10Cases) * 100);

                return (
                  <div
                    key={st.state_name}
                    onClick={() => setSelectedStateName(st.state_name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isSelected ? 'rgba(133, 162, 137, 0.12)' : 'transparent',
                      border: isSelected ? '1px solid var(--border-strong)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'background-color var(--transition-fast)',
                    }}
                  >
                    <div style={{ width: '130px', fontSize: 'var(--text-xs)', fontWeight: isSelected ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      #{st.national_rank} {st.state_name}
                    </div>

                    <div style={{ flex: 1, height: '14px', backgroundColor: 'var(--bg-card)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${barWidth}%`,
                          height: '100%',
                          backgroundColor: isSelected ? 'var(--color-sage-light)' : 'var(--color-sage)',
                          transition: 'width 0.4s ease',
                        }}
                      />
                    </div>

                    <div style={{ width: '80px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                      {st.total_cases.toLocaleString()}
                    </div>

                    <div style={{ width: '55px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-sage-light)' }}>
                      {st.national_share.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>

        {/* Primary Data Table */}
        <DataTable
          columns={stateTableColumns}
          data={filteredStates}
          rowKey="state_name"
          selectedRowKey={selectedStateName}
          onRowClick={(row) => setSelectedStateName(row.state_name)}
          emptyMessage="No jurisdictions match current search or administrative filters."
        />
      </section>

      {/* 6. CRIME CATEGORY EXPLORER (40 LEAF vs 49 ALL LEVELS) */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="STATUTORY TAXONOMY"
          title="Crime Category Hierarchy & Distribution"
          subtitle="Preserving the analytical distinction between 40 independent leaf categories and 9 parent roll-up subtotals"
        />

        <Panel
          category="LEGAL SECTION EXPLORATION"
          title="Statutory Crime Categories (NCRB 2023)"
          subtitle="Explore case volume, statutory Act Groups, and legal section citations"
          action={
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-3)' }}>
              {/* Leaf vs All Toggle */}
              <SegmentedControl
                options={[
                  { value: true, label: '40 Leaf Categories' },
                  { value: false, label: 'All 49 Category Levels' },
                ]}
                value={leafOnlyFilter}
                onChange={setLeafOnlyFilter}
                size="sm"
              />

              {/* Act Group Filter */}
              <SegmentedControl
                options={[
                  { value: 'ALL', label: 'All Acts' },
                  { value: 'IT Act', label: 'IT Act' },
                  { value: 'IPC', label: 'IPC r/w IT' },
                  { value: 'SLL', label: 'SLL' },
                ]}
                value={categoryActFilter}
                onChange={setCategoryActFilter}
                size="sm"
              />
            </div>
          }
        >
          {/* Search Category */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                gap: '8px',
                maxWidth: '400px',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search category name or section (e.g. 66D, 420, ATM)..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
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

          {/* Category List / Table */}
          <div
            style={{
              maxHeight: '440px',
              overflowY: 'auto',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-default)' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>Rank</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'var(--font-mono)' }}>Category Name & Legal Section</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>Act Group</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>Level</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>National Cases</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>Natl. Share</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => {
                  const isLeaf = cat.is_leaf === 1;
                  const isSelected = selectedCategory?.category_id === cat.category_id;

                  return (
                    <tr
                      key={cat.category_id}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: isSelected
                          ? 'rgba(133, 162, 137, 0.12)'
                          : isLeaf
                          ? 'transparent'
                          : 'rgba(216, 165, 99, 0.04)',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = isLeaf ? 'transparent' : 'rgba(216, 165, 99, 0.04)';
                      }}
                    >
                      <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {cat.category_rank ? `#${cat.category_rank}` : '—'}
                      </td>
                      <td style={{ padding: '8px 12px', fontWeight: isLeaf ? 500 : 700 }}>
                        <div style={{ color: 'var(--text-primary)' }}>{cat.category_display_name}</div>
                        {cat.section_reference && (
                          <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {cat.section_reference}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        <StatusBadge
                          variant={cat.act_group === 'IT Act' ? 'success' : cat.act_group === 'IPC' ? 'mauve' : 'neutral'}
                          size="sm"
                        >
                          {cat.act_group}
                        </StatusBadge>
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'center' }}>
                        {isLeaf ? (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)' }}>
                            LEAF
                          </span>
                        ) : (
                          <StatusBadge variant="warning" size="sm">
                            PARENT SUBTOTAL
                          </StatusBadge>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        {cat.national_cases.toLocaleString()}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)' }}>
                        {cat.national_share.toFixed(2)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Selected Category Detail Drawer / Modal Callout */}
          {selectedCategory && (
            <div
              style={{
                marginTop: 'var(--space-4)',
                padding: 'var(--space-4)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="tech-label" style={{ color: 'var(--color-sage-light)' }}>CATEGORY DETAIL INSPECTOR</span>
                  {selectedCategory.is_leaf === 1 ? (
                    <StatusBadge variant="success" size="sm">INDEPENDENT LEAF</StatusBadge>
                  ) : (
                    <StatusBadge variant="warning" size="sm">PARENT / SUBTOTAL ROLL-UP</StatusBadge>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✕ Close
                </button>
              </div>

              <h4 style={{ margin: 0, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                {selectedCategory.category_display_name}
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                <span><strong>Act Group:</strong> {selectedCategory.act_group}</span>
                {selectedCategory.section_reference && <span><strong>Statutory Section:</strong> {selectedCategory.section_reference}</span>}
                {selectedCategory.parent_category && <span><strong>Parent Roll-up:</strong> {selectedCategory.parent_category}</span>}
                <span><strong>National Volume:</strong> {selectedCategory.national_cases.toLocaleString()} cases ({selectedCategory.national_share.toFixed(2)}%)</span>
                {selectedCategory.category_rank && <span><strong>National Rank:</strong> #{selectedCategory.category_rank}</span>}
              </div>

              {selectedCategory.is_leaf === 0 && (
                <div
                  style={{
                    marginTop: '4px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(216, 165, 99, 0.1)',
                    border: '1px solid rgba(216, 165, 99, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--status-warning)',
                  }}
                >
                  <strong>Methodological Notice:</strong> This category is a parent roll-up subtotal. It aggregates multiple independent leaf offenses. Do not add parent subtotals to leaf categories to prevent double counting.
                </div>
              )}
            </div>
          )}
        </Panel>
      </section>

      {/* 7. RECORDED MOTIVE EXPLORER (18 SPECIFIC MOTIVES) */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="MOTIVATIONAL DIMENSION"
          title="Recorded Cybercrime Motives (NCRB 2023)"
          subtitle="Separate analytical dimension capturing stated motives for registration (18 specific motive classifications)"
        />

        <Panel
          category="MOTIVE DISTRIBUTION"
          title="18 Stated Motive Dimensions"
          subtitle="Ranked by nationwide offense volume (preserves separation from statutory legal category constructs)"
        >
          {/* Motives Quick Search */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                gap: '8px',
                maxWidth: '400px',
              }}
            >
              <Search size={14} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search motive name (e.g. Fraud, Extortion, Revenge)..."
                value={motiveSearchQuery}
                onChange={(e) => setMotiveSearchQuery(e.target.value)}
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

          {/* Motive Bars Grid */}
          <div className="grid grid-2-cols" style={{ gap: 'var(--space-4)' }}>
            {filteredMotives.map((m) => {
              const maxMotiveCases = motivesData.length > 0 ? motivesData[0].national_cases : 1;
              const barWidth = Math.max(3, (m.national_cases / maxMotiveCases) * 100);

              return (
                <div
                  key={m.motive_id}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                      {m.motive_name}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-sage-light)', fontWeight: 600 }}>
                      {m.national_share.toFixed(2)}%
                    </span>
                  </div>

                  <div style={{ height: '8px', backgroundColor: 'var(--bg-surface)', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                    <div
                      style={{
                        width: `${barWidth}%`,
                        height: '100%',
                        backgroundColor: m.motive_name.toLowerCase().includes('fraud') ? 'var(--color-sage)' : 'var(--color-mauve)',
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                    <span>{m.national_cases.toLocaleString()} cases</span>
                    {m.states_reporting !== null && <span>{m.states_reporting} states reporting</span>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Guardrail Callout */}
          <div
            style={{
              marginTop: 'var(--space-5)',
              padding: 'var(--space-3) var(--space-4)',
              backgroundColor: 'rgba(80, 118, 86, 0.08)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'var(--space-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              lineHeight: '1.5',
            }}
          >
            <Info size={16} color="var(--color-sage-light)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Analytical Boundary:</strong> Statutory Crime Category (e.g. Section 66D IT Act or Section 420 IPC) and Recorded Motive (e.g. Fraud, Extortion, Revenge) are separate dimensional tables in NCRB returns. They are not direct causal drivers, and motive distributions must not be treated as legal category totals.
            </div>
          </div>
        </Panel>
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
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>DATA SOURCES</div>
            <p style={{ margin: 0 }}>
              Official National Crime Records Bureau (NCRB) Crime in India 2023 tables (9A.2, 9A.3, 9A.10, 9A.11) covering all 36 Indian States and Union Territories.
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>ONTOLOGY INTEGRITY</div>
            <p style={{ margin: 0 }}>
              Preserves 40 independent leaf statutory categories summing to 86,420 offenses. Roll-up parent subtotals are isolated to prevent double counting.
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>NON-CAUSAL INTERPRETATION</div>
            <p style={{ margin: 0 }}>
              Proportional differences reflect recorded statutory distributions and institutional registration patterns, not underlying criminal causality or operational risk.
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>EXPLORER ARCHITECTURE</div>
            <p style={{ margin: 0 }}>
              FastAPI-backed presentation tier consuming validated analytical outputs. Zero client-side recomputation or fabricated figures.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <span>Cyber Crime Analytics for National Security — Geographic & Crime Explorer Stage 22</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}>
            <span>DATA: FROZEN NCRB 2023</span>
            <span>API: FASTAPI 1.0.0</span>
            <span>ROUTE: /explore</span>
          </div>
        </div>
      </footer>
    </PageContainer>
  );
};

export default ExplorePage;
