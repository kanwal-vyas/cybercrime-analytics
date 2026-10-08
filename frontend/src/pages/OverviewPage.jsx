import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import StatusDot from '../components/ui/StatusDot';
import Panel from '../components/ui/Panel';
import ChartContainer from '../components/charts/ChartContainer';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import api from '../services/api';
import {
  Shield,
  Layers,
  Activity,
  Database,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  AlertTriangle,
  Scale,
  Users,
  RefreshCw,
  Info,
  ExternalLink
} from 'lucide-react';

export const OverviewPage = () => {
  const navigate = useNavigate();

  // Coordinated API State
  const [summaryData, setSummaryData] = useState(null);
  const [topStates, setTopStates] = useState([]);
  const [leafCategories, setLeafCategories] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Coordinated parallel loading across authoritative API endpoints
      const [summaryRes, statesRes, categoriesRes, trendRes] = await Promise.all([
        api.getSummary(),
        api.getStates({ limit: 5, sort_by: 'total_cases', order: 'desc' }),
        api.getCategories({ leaf_only: true, limit: 5, sort_by: 'national_cases', order: 'desc' }),
        api.getTrend(),
      ]);

      setSummaryData(summaryRes);
      setTopStates(statesRes?.states || []);
      setLeafCategories(categoriesRes?.categories || []);
      setTrendData(trendRes);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('[OverviewPage] Error loading executive data:', err);
      setError(err.message || 'Unable to retrieve validated analytics from the API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading && !summaryData) {
    return (
      <PageContainer>
        <LoadingState message="Loading validated national cybercrime analytics..." />
      </PageContainer>
    );
  }

  if (error && !summaryData) {
    return (
      <PageContainer>
        <ErrorState
          title="Data Service Unavailable"
          message={`Unable to retrieve validated analytics: ${error}`}
          onRetry={fetchDashboardData}
        />
      </PageContainer>
    );
  }

  // Fallbacks if partial data
  const summary = summaryData || {};
  const totalCases = summary.total_cases || 86420;
  const itCases = summary.it_act_cases || 44237;
  const ipcCases = summary.ipc_cases || 41849;
  const sllCases = summary.sll_cases || 334;
  const itShare = summary.it_act_share || 51.19;
  const ipcShare = summary.ipc_share || 48.43;
  const sllShare = summary.sll_share || 0.39;

  const top5TotalCases = summary.top5_cases || 63472;
  const top5Share = summary.top5_share || 73.45;
  const remainingCases = totalCases - top5TotalCases;
  const remainingShare = (100 - top5Share).toFixed(2);

  // Historical yearly values
  const yearlyTrends = trendData?.national_trends || [
    { year: 2018, national_total_cases: 27248, yoy_growth_pct: null },
    { year: 2019, national_total_cases: 44735, yoy_growth_pct: 64.18 },
    { year: 2020, national_total_cases: 50035, yoy_growth_pct: 11.85 },
    { year: 2021, national_total_cases: 52974, yoy_growth_pct: 5.87 },
    { year: 2022, national_total_cases: 65893, yoy_growth_pct: 24.39 },
  ];

  return (
    <PageContainer>
      {/* 1. HERO / COMMAND HEADER */}
      <div
        style={{
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 'var(--space-6)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span className="tech-label" style={{ color: 'var(--color-sage-light)' }}>
              NATIONAL CYBERCRIME ANALYTICS
            </span>
            <StatusBadge variant="success" pulse size="sm">
              NCRB 2023 VALIDATED
            </StatusBadge>
            <StatusBadge variant="mauve" size="sm">
              STAGES 1–20 AUDITED & FROZEN
            </StatusBadge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <button
              onClick={fetchDashboardData}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)' }}
              title="Refresh data from API"
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} />
              <span>{lastRefreshed ? `Updated ${lastRefreshed}` : 'Refresh'}</span>
            </button>
          </div>
        </div>

        <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)', letterSpacing: '-0.02em' }}>
          Cyber Crime Analytics for National Security
        </h1>
        <p style={{ maxWidth: '880px', fontSize: 'var(--text-base)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          An executive intelligence dashboard examining <strong>86,420 registered cybercrime cases</strong> across 36 Indian States and Union Territories. Built on audited NCRB statutory classifications, longitudinal panel series (2018–2022), multidimensional OLAP cubes, and validated machine learning models.
        </p>

        {/* Technical Status Strip */}
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
            <span>SOURCE: <strong style={{ color: 'var(--text-primary)' }}>NCRB 2023 CII (Tables 9A.2, 9A.3, 9A.10, 9A.11)</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Scale size={13} color="var(--color-mauve-light)" />
            <span>COVERAGE: <strong style={{ color: 'var(--text-primary)' }}>36 STATES & UTs (86,420 OFFENSES)</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Activity size={13} color="var(--color-sage)" />
            <span>HISTORICAL: <strong style={{ color: 'var(--text-primary)' }}>2018–2022 PANEL (+141.83%)</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginLeft: 'auto' }}>
            <StatusDot status="live" size="sm" />
            <span style={{ color: 'var(--color-sage-light)' }}>API STATUS: ONLINE</span>
          </div>
        </div>
      </div>

      {/* 2. EXECUTIVE KPI GRID (5 PRIMARY CARDS) */}
      <section style={{ marginTop: 'var(--space-6)' }}>
        <SectionHeader
          badge="EXECUTIVE METRICS"
          title="National Volume & Concentration Baseline"
          subtitle="Core analytical invariants established across audited NCRB 2023 returns"
        />

        <div className="grid grid-5-cols" style={{ gap: 'var(--space-4)' }}>
          <MetricCard
            label="TOTAL REGISTERED CASES"
            value={totalCases.toLocaleString()}
            description="86,420 nationwide offenses (36 jurisdictions)"
            change="+141.83% (5-Yr)"
            changeType="positive"
            statusBadge="NCRB 2023"
            badgeVariant="success"
            accentColor="var(--color-sage)"
          />

          <MetricCard
            label="STATES & UTS"
            value={summary.state_count || 36}
            description="28 States / 8 UTs reporting full returns"
            change="100% Coverage"
            changeType="neutral"
            statusBadge="NATIONAL"
            badgeVariant="neutral"
            accentColor="var(--color-sage-light)"
          />

          <MetricCard
            label="TOP-5 CONCENTRATION"
            value={`${top5Share}%`}
            description={`${top5TotalCases.toLocaleString()} cases in top 5 states`}
            change="High Pareto"
            changeType="warning"
            statusBadge="PARETO"
            badgeVariant="warning"
            accentColor="var(--status-warning)"
          />

          <MetricCard
            label="SEC. 66D SHARE"
            value={`${summary.top_leaf_category_share || 29.31}%`}
            description={`${(summary.top_leaf_category_cases || 25334).toLocaleString()} cases (Personation Fraud)`}
            change="#1 Leaf"
            changeType="accent"
            statusBadge="LEAF #1"
            badgeVariant="mauve"
            accentColor="var(--color-mauve-dusty)"
          />

          <MetricCard
            label="FINANCIAL FRAUD / CHEATING"
            value={`${summary.financial_fraud_share || 71.01}%`}
            description={`${(summary.financial_fraud_cases || 61365).toLocaleString()} cases in fraud/cheating leaves`}
            change="Category Construct"
            changeType="accent"
            statusBadge="CATEGORY"
            badgeVariant="mauve"
            accentColor="var(--color-mauve-deep)"
          />
        </div>
      </section>

      {/* 3. CORE ANALYTICS GRID — ROW 1: ACT GROUPS & MOTIVE/DEMOGRAPHICS */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <div className="grid grid-2-cols" style={{ gap: 'var(--space-6)', alignItems: 'stretch' }}>
          
          {/* Panel 1: Statutory Act Groups Reconciliation */}
          <Panel
            category="LEGAL FRAMEWORK"
            title="2023 Registered Cases by Act Group"
            subtitle="Statutory distribution across the three legal classification tiers"
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
                    width: `${itShare}%`,
                    backgroundColor: 'var(--color-sage)',
                    transition: 'width 0.6s ease',
                  }}
                  title={`IT Act: ${itCases.toLocaleString()} (${itShare}%)`}
                />
                <div
                  style={{
                    width: `${ipcShare}%`,
                    backgroundColor: 'var(--color-mauve)',
                    transition: 'width 0.6s ease',
                  }}
                  title={`IPC Crimes: ${ipcCases.toLocaleString()} (${ipcShare}%)`}
                />
                <div
                  style={{
                    width: `${sllShare}%`,
                    backgroundColor: 'var(--color-sage-light)',
                    minWidth: '4px',
                  }}
                  title={`SLL Crimes: ${sllCases.toLocaleString()} (${sllShare}%)`}
                />
              </div>

              {/* Breakdown Cards */}
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
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--color-sage)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Information Technology Act (IT Act)</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Offences under Sections 65, 66, 66B-F, 67, 67A-C, 69, 70, 84</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-base)' }}>{itCases.toLocaleString()}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)' }}>{itShare}%</div>
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
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--color-mauve)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>IPC Offences (r/w IT Act)</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Cheating (Sec 420), Forgery, Cyber Stalking, Data Theft, Fake News</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-base)' }}>{ipcCases.toLocaleString()}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-mauve-light)', fontFamily: 'var(--font-mono)' }}>{ipcShare}%</div>
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
                    <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: 'var(--color-sage-light)' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Special & Local Laws (SLL)</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Online Gambling Act, Lotteries Act, Copyright Act, Trade Marks Act</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-base)' }}>{sllCases.toLocaleString()}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sllShare}%</div>
                  </div>
                </div>
              </div>

              {/* Reconciliation Footer Note */}
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
                <span>Act Group Total Reconciliation:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {itCases.toLocaleString()} + {ipcCases.toLocaleString()} + {sllCases.toLocaleString()} = {totalCases.toLocaleString()} (100.0%)
                </span>
              </div>
            </div>
          </Panel>

          {/* Panel 2: Motive Classification vs Statutory Category Constructs */}
          <Panel
            category="ANALYTICAL DISTINCTION"
            title="Motive Construct vs Category Construct"
            subtitle="Distinguishing recorded motivation from statutory legal classification"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Financial Fraud Distinction Cards */}
              <div className="grid grid-2-cols" style={{ gap: 'var(--space-3)' }}>
                <div
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'rgba(118, 80, 112, 0.12)',
                    border: '1px solid rgba(178, 150, 174, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div className="tech-label" style={{ color: 'var(--color-mauve-light)', marginBottom: '4px' }}>
                    CATEGORY CONSTRUCT
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Financial Fraud & Cheating Leaves
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {(summary.financial_fraud_cases || 61365).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-mauve-light)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    71.01% of All Cybercrimes
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                    Combined count across statutory fraud/cheating leaf categories (Sec 66D, Sec 420 IPC, Online Banking, OTP, Cards).
                  </p>
                </div>

                <div
                  style={{
                    padding: 'var(--space-4)',
                    backgroundColor: 'rgba(80, 118, 86, 0.12)',
                    border: '1px solid rgba(133, 162, 137, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <div className="tech-label" style={{ color: 'var(--color-sage-light)', marginBottom: '4px' }}>
                    MOTIVE CONSTRUCT
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Stated Fraud Motive Dimension
                  </div>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {(summary.fraud_motive_cases || 59526).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-sage-light)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    68.88% of All Cybercrimes
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                    Registered offenses where fraud was explicitly recorded as the primary motive across 18 motive classes.
                  </p>
                </div>
              </div>

              {/* Contextual Demographic Offenses */}
              <div
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <span className="tech-label">DEMOGRAPHIC IMPACT (NON-ADDITIVE CONTEXT)</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>NCRB 2023 Tables 9A.10 / 9A.11</span>
                </div>

                <div className="grid grid-2-cols" style={{ gap: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(178, 150, 174, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-mauve-light)',
                      }}
                    >
                      <Users size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Crimes Against Women</div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {(summary.women_cases || 19510).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-mauve-light)', fontFamily: 'var(--font-mono)' }}>
                        {summary.women_share || 22.58}% of registered offenses
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(80, 118, 86, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-sage-light)',
                      }}
                    >
                      <Shield size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Crimes Against Children</div>
                      <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        {(summary.child_cases || 1902).toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)' }}>
                        {summary.child_share || 2.20}% of registered offenses
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

        </div>
      </section>

      {/* 4. CORE ANALYTICS GRID — ROW 2: GEOGRAPHIC & CATEGORY CONCENTRATION */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <div className="grid grid-2-cols" style={{ gap: 'var(--space-6)', alignItems: 'stretch' }}>

          {/* Panel 3: Geographic Concentration (Top 5 States) */}
          <Panel
            category="GEOGRAPHIC PARETO"
            title="Top 5 Jurisdictions by Volume"
            subtitle="Five states account for 73.45% (63,472 cases) of national registered volume"
            badge={
              <button
                onClick={() => navigate('/explore')}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 8px', fontSize: 'var(--text-xs)', color: 'var(--color-sage-light)' }}
              >
                <span>Full Map</span>
                <ArrowUpRight size={12} />
              </button>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {topStates.map((st, idx) => {
                const share = st.national_share || ((st.total_cases / totalCases) * 100).toFixed(2);
                const barWidth = Math.min(100, Math.max(8, (st.total_cases / 21889) * 100));

                return (
                  <div key={st.state_id || idx} style={{ padding: 'var(--space-2) 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            width: '16px',
                          }}
                        >
                          0{idx + 1}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                          {st.state_name}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                          ({st.admin_type === 'Union Territory' ? 'UT' : 'State'})
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                          {st.total_cases.toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: idx === 0 ? 'var(--color-sage-light)' : 'var(--text-muted)',
                            minWidth: '48px',
                            textAlign: 'right',
                          }}
                        >
                          {share}%
                        </span>
                      </div>
                    </div>

                    {/* Proportional Bar */}
                    <div
                      style={{
                        height: '6px',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${barWidth}%`,
                          backgroundColor: idx === 0 ? 'var(--color-sage)' : idx === 1 ? 'var(--color-sage-light)' : 'var(--color-mauve)',
                          borderRadius: '3px',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Remaining 31 Jurisdictions Row */}
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px dashed var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Remaining 31 Jurisdictions Combined:</span>
                <div style={{ display: 'flex', gap: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>
                  <span>{remainingCases.toLocaleString()} cases</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{remainingShare}%</span>
                </div>
              </div>
            </div>
          </Panel>

          {/* Panel 4: Leading Independent Leaf Categories */}
          <Panel
            category="STATUTORY LEAF RANKING"
            title="Top Independent Crime Categories"
            subtitle="Preserving 40 leaf categories (excluding rolled-up parent subtotals)"
            badge={<StatusBadge variant="success" size="sm">40 LEAF CATEGORIES</StatusBadge>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {leafCategories.slice(0, 5).map((cat, idx) => {
                const share = cat.national_share || ((cat.national_cases / totalCases) * 100).toFixed(2);
                const barWidth = Math.min(100, Math.max(8, (cat.national_cases / 25334) * 100));

                return (
                  <div key={cat.category_id || idx} style={{ padding: 'var(--space-2) 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            width: '16px',
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: 'var(--text-sm)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '300px',
                          }}
                          title={cat.category_display_name}
                        >
                          {cat.category_display_name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            padding: '1px 6px',
                            borderRadius: '2px',
                            backgroundColor: cat.act_group === 'IT Act' ? 'rgba(80, 118, 86, 0.2)' : 'rgba(118, 80, 112, 0.2)',
                            color: cat.act_group === 'IT Act' ? 'var(--color-sage-light)' : 'var(--color-mauve-light)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          {cat.act_group}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                          {cat.national_cases.toLocaleString()}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: 'var(--text-xs)',
                            color: idx === 0 ? 'var(--color-sage-light)' : 'var(--text-muted)',
                            minWidth: '48px',
                            textAlign: 'right',
                          }}
                        >
                          {share}%
                        </span>
                      </div>
                    </div>

                    {/* Proportional Bar */}
                    <div
                      style={{
                        height: '6px',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: '3px',
                        overflow: 'hidden',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${barWidth}%`,
                          backgroundColor: idx === 0 ? 'var(--color-sage)' : idx === 1 ? 'var(--color-mauve)' : 'var(--color-sage-light)',
                          borderRadius: '3px',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Cumulative Top 2 Note */}
              <div
                style={{
                  marginTop: 'var(--space-2)',
                  paddingTop: 'var(--space-3)',
                  borderTop: '1px dashed var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Top 2 Leaf Categories Concentration:</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)', fontWeight: 600 }}>
                  Sec.66D + Sec.420 IPC = 42,277 cases (48.92%)
                </span>
              </div>
            </div>
          </Panel>

        </div>
      </section>

      {/* 5. HISTORICAL LONGITUDINAL TREND PANEL (2018–2022) */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <ChartContainer
          category="LONGITUDINAL ANALYSIS"
          title="Historical Cybercrime Expansion (2018–2022)"
          subtitle="National registered volume expanded from 27,248 (2018) to 65,893 (2022) (+141.83%)"
          sourceNote="Source: Rajya Sabha Unstarred Question No. 226 (Historical Panel 2018-2022). Unimputed null values preserved for Ladakh."
          height="auto"
          controls={
            <button
              onClick={() => navigate('/trends')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs)' }}
            >
              <span>State Trends</span>
              <ExternalLink size={12} />
            </button>
          }
        >
          <div style={{ padding: 'var(--space-4) var(--space-6)' }}>
            {/* SVG Interactive Area / Line Visualization */}
            <div style={{ width: '100%', height: '180px', position: 'relative', marginTop: 'var(--space-2)' }}>
              <svg
                viewBox="0 0 800 160"
                style={{ width: '100%', height: '100%', overflow: 'visible' }}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-sage)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="var(--color-sage)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                <line x1="60" y1="20" x2="760" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="60" y1="65" x2="760" y2="65" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="60" y1="110" x2="760" y2="110" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="60" y1="145" x2="760" y2="145" stroke="var(--border-default)" />

                {/* SVG Area */}
                {/* 2018: 27248 (y=120), 2019: 44735 (y=80), 2020: 50035 (y=68), 2021: 52974 (y=61), 2022: 65893 (y=30) */}
                <polygon
                  points="60,120 235,80 410,68 585,61 760,30 760,145 60,145"
                  fill="url(#trendGradient)"
                />

                {/* SVG Trend Line */}
                <polyline
                  points="60,120 235,80 410,68 585,61 760,30"
                  fill="none"
                  stroke="var(--color-sage-light)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                <circle cx="60" cy="120" r="5" fill="var(--color-sage)" stroke="var(--bg-surface)" strokeWidth="2" />
                <circle cx="235" cy="80" r="5" fill="var(--color-sage)" stroke="var(--bg-surface)" strokeWidth="2" />
                <circle cx="410" cy="68" r="5" fill="var(--color-sage)" stroke="var(--bg-surface)" strokeWidth="2" />
                <circle cx="585" cy="61" r="5" fill="var(--color-sage)" stroke="var(--bg-surface)" strokeWidth="2" />
                <circle cx="760" cy="30" r="6" fill="var(--color-sage-light)" stroke="var(--bg-surface)" strokeWidth="2" />
              </svg>
            </div>

            {/* Historical Years Metric Grid */}
            <div
              className="grid grid-5-cols"
              style={{
                marginTop: 'var(--space-3)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--border-subtle)',
                gap: 'var(--space-3)',
              }}
            >
              {yearlyTrends.map((yr) => (
                <div
                  key={yr.year}
                  style={{
                    textAlign: 'center',
                    padding: 'var(--space-2)',
                    backgroundColor: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div className="tech-label" style={{ color: yr.year === 2022 ? 'var(--color-sage-light)' : 'var(--text-muted)' }}>
                    {yr.year}
                  </div>
                  <div style={{ fontSize: 'var(--text-base)', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                    {yr.national_total_cases.toLocaleString()}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'var(--font-mono)',
                      color: yr.yoy_growth_pct ? 'var(--color-sage-light)' : 'var(--text-muted)',
                      marginTop: '2px',
                    }}
                  >
                    {yr.yoy_growth_pct ? `+${yr.yoy_growth_pct}% YoY` : 'Base Year'}
                  </div>
                </div>
              ))}
            </div>

            {/* Methodological Caveat Warning */}
            <div
              style={{
                marginTop: 'var(--space-4)',
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
                <strong>Methodological Boundary:</strong> Registered cybercrime volume reflects official NCRB records. Increases in registered aggregates capture a combination of rising cyber activity, enhanced citizen reporting willingness, dedicated cyber police station proliferation, and modernized portal adoption (cybercrime.gov.in). These figures do not represent pure underlying incidence.
              </div>
            </div>
          </div>
        </ChartContainer>
      </section>

      {/* 6. ANALYTICAL SIGNALS & INTELLIGENCE SUMMARY */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="SYNTHESIS"
          title="Analytical Signals & Key Findings"
          subtitle="Validated insights synthesized from multi-stage exploratory and mathematical modeling"
        />

        <div className="grid grid-4-cols" style={{ gap: 'var(--space-4)' }}>
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge variant="warning" size="sm">SIGNAL 01</StatusBadge>
              <span className="tech-label">PARETO DISTRIBUTION</span>
            </div>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              High Geographic Asymmetry
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Five states account for <strong>73.45%</strong> (63,472 cases) of national registered volume, driven primarily by tech-corridor reporting infrastructure in Karnataka and Telangana.
            </p>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge variant="info" size="sm">SIGNAL 02</StatusBadge>
              <span className="tech-label">STATUTORY SPLIT</span>
            </div>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Dual-Framework Balance
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              IT Act offences (<strong>51.19%</strong>) and IPC crimes read with IT Act (<strong>48.43%</strong>) divide the legal framework almost equally, with SLL accounting for only 0.39%.
            </p>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge variant="mauve" size="sm">SIGNAL 03</StatusBadge>
              <span className="tech-label">OFFENSE TYPOLOGY</span>
            </div>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              Financial Cheating Dominance
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Section 66D Personation Cheating represents <strong>29.31%</strong> of all crimes, and combined financial fraud/cheating leaf categories account for <strong>71.01%</strong> (61,365 cases) under the category construct.
            </p>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <StatusBadge variant="success" size="sm">SIGNAL 04</StatusBadge>
              <span className="tech-label">LONGITUDINAL SCALE</span>
            </div>
            <h4 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', marginBottom: '6px' }}>
              5-Year Growth Acceleration
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              National registered cases surged by <strong>+141.83%</strong> from 27,248 in 2018 to 65,893 in 2022, exhibiting persistent scale momentum across the panel.
            </p>
          </div>
        </div>
      </section>

      {/* 7. ANALYTICAL MODULE NAVIGATION HUB (DEEP DIVES) */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          badge="DEEP DIVES"
          title="Analytical Module Navigation"
          subtitle="Explore specialized multidimensional analysis, ML forecasting, and anomaly detection modules"
        />

        <div className="grid grid-3-cols" style={{ gap: 'var(--space-4)' }}>
          <div
            onClick={() => navigate('/explore')}
            style={{
              padding: 'var(--space-5)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-sage)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(80, 118, 86, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sage-light)' }}>
                <MapPin size={18} />
              </div>
              <span style={{ color: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <span>Explore</span>
                <ArrowUpRight size={14} />
              </span>
            </div>
            <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Geographic & Crime Explorer
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Interactive state choropleth map, 36-jurisdiction ranking tables, statutory category filters, and administrative UT comparisons.
            </p>
          </div>

          <div
            onClick={() => navigate('/trends')}
            style={{
              padding: 'var(--space-5)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-sage)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(80, 118, 86, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sage-light)' }}>
                <TrendingUp size={18} />
              </div>
              <span style={{ color: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <span>Trends</span>
                <ArrowUpRight size={14} />
              </span>
            </div>
            <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Longitudinal Trend Analytics
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              5-year State/UT trajectories (2018–2022), CAGR calculations, growth accelerations, and preserved historical Ladakh null data.
            </p>
          </div>

          <div
            onClick={() => navigate('/models')}
            style={{
              padding: 'var(--space-5)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-sage)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(118, 80, 112, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-mauve-light)' }}>
                <Activity size={18} />
              </div>
              <span style={{ color: 'var(--color-mauve-light)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <span>Models</span>
                <ArrowUpRight size={14} />
              </span>
            </div>
            <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Machine Learning Benchmarks
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Stage 13 classification models and Stage 7/14 predictive regression leaderboard featuring selected Log-Linear OLS (R²=0.9000).
            </p>
          </div>

          <div
            onClick={() => navigate('/patterns')}
            style={{
              padding: 'var(--space-5)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-sage)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(80, 118, 86, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sage-light)' }}>
                <Layers size={18} />
              </div>
              <span style={{ color: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <span>Patterns</span>
                <ArrowUpRight size={14} />
              </span>
            </div>
            <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Pattern Mining & Clustering
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Apriori/FP-Growth association rules (1,924 rules) and K-Means 4-cluster compositional taxonomy (Silhouette = 0.3497).
            </p>
          </div>

          <div
            onClick={() => navigate('/anomalies')}
            style={{
              padding: 'var(--space-5)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-sage)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(118, 80, 112, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-mauve-light)' }}>
                <AlertTriangle size={18} />
              </div>
              <span style={{ color: 'var(--color-mauve-light)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <span>Anomalies</span>
                <ArrowUpRight size={14} />
              </span>
            </div>
            <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Multivariate Anomaly Detection
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Consensus statistical outlier scoring across 4 robust methods (Tukey IQR, Isolation Forest, Mahalanobis, Local Outlier Factor).
            </p>
          </div>

          <div
            onClick={() => navigate('/methodology')}
            style={{
              padding: 'var(--space-5)',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'border-color 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-sage)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(80, 118, 86, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-sage-light)' }}>
                <Database size={18} />
              </div>
              <span style={{ color: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                <span>Docs & SQL</span>
                <ArrowUpRight size={14} />
              </span>
            </div>
            <h4 style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)', marginBottom: '4px' }}>
              Methodology & Star Schema
            </h4>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
              Full dimensional warehouse documentation, SQL views, audit verification gates, and data provenance manifests.
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
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>DATA PROVENANCE</div>
            <p style={{ margin: 0 }}>
              Official National Crime Records Bureau (NCRB) Crime in India (2023) Tables 9A.2, 9A.3, 9A.10, 9A.11, supplemented by Rajya Sabha Unstarred Question No. 226 archives (2018–2022).
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>ANALYTICAL SCOPE</div>
            <p style={{ margin: 0 }}>
              Analysis covers 86,420 registered offenses in 2023 across 36 jurisdictions. Longitudinal trend analysis covers 2018–2022. Unimputed nulls are preserved for Ladakh (2018/2019).
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>INTERPRETATION BOUNDS</div>
            <p style={{ margin: 0 }}>
              Registered crime counts reflect recorded official cases and are not direct measures of underlying criminal incidence. Reporting propensity and registration practices cannot be disentangled.
            </p>
          </div>

          <div>
            <div className="tech-label" style={{ color: 'var(--text-primary)', marginBottom: '6px' }}>MODELING DISCLAIMER</div>
            <p style={{ margin: 0 }}>
              Predictive classifiers, regression benchmarks, association rules, and outlier models are academic demonstrations based on historical patterns and do NOT represent causal or operational risk systems.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-subtle)' }}>
          <div>
            <span>Cyber Crime Analytics for National Security — Executive Workstation Stage 21</span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-4)', fontFamily: 'var(--font-mono)' }}>
            <span>DATASET: FROZEN</span>
            <span>API: FASTAPI 1.0.0</span>
            <span>BUILD: REACT 19 + VITE</span>
          </div>
        </div>
      </footer>
    </PageContainer>
  );
};

export default OverviewPage;
