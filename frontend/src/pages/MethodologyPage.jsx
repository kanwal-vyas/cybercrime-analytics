import React, { useState, useEffect, useCallback } from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Panel from '../components/ui/Panel';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import SegmentedControl from '../components/ui/SegmentedControl';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import DataTable from '../components/data/DataTable';
import api from '../services/api';
import {
  Database,
  Layers,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Server,
  FolderTree,
  Terminal,
  CheckCircle2,
  HelpCircle,
  BarChart2,
  Workflow,
  Search
} from 'lucide-react';

const SECTION_TABS = [
  { id: 'all', value: 'all', label: 'ALL SECTIONS' },
  { id: 'provenance', value: 'provenance', label: 'DATA PROVENANCE & SOURCES' },
  { id: 'architecture', value: 'architecture', label: 'SYSTEM ARCHITECTURE & WAREHOUSE' },
  { id: 'methods', value: 'methods', label: 'ANALYTICAL METHODS SPECIFICATION' },
  { id: 'validation', value: 'validation', label: 'VALIDATION & QUALITY GATES' },
  { id: 'limitations', value: 'limitations', label: 'DEFINITIONS & LIMITATIONS' },
  { id: 'explorer', value: 'explorer', label: 'INTERACTIVE METADATA EXPLORER' },
];

export const MethodologyPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Metadata state for explorer
  const [explorerTab, setExplorerTab] = useState('categories');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [motivesData, setMotivesData] = useState([]);
  const [statesData, setStatesData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMetadata = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, motRes, stRes, trRes] = await Promise.all([
        api.getCategories(),
        api.getMotives(),
        api.getStates(),
        api.getTrend(),
      ]);
      setCategoriesData(catRes.categories || catRes || []);
      setMotivesData(motRes.motives || motRes || []);
      setStatesData(stRes.states || stRes || []);
      setTrendData(trRes.trends || trRes || []);
    } catch (err) {
      setError(err.message || 'Failed to load metadata dictionary from API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  return (
    <PageContainer>
      {/* 1. PAGE HEADER */}
      <SectionHeader
        category="STAGE 27 — ACADEMIC METHODOLOGY & DATA PROVENANCE"
        title="Methodology & Data Explorer"
        description="Authoritative technical specification of data provenance, star schema data dictionaries, analytical stage architectures, quality validation gates, and academic limitations."
        badge={
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <StatusBadge variant="success">NCRB CII 2023</StatusBadge>
            <StatusBadge variant="info">2018–2022 HISTORICAL PANEL</StatusBadge>
            <StatusBadge variant="neutral">36 JURISDICTIONS</StatusBadge>
            <StatusBadge variant="accent">ANALYTICAL PIPELINE v1</StatusBadge>
          </div>
        }
      />

      {/* 2. CRITICAL DATA PROVENANCE DISTINCTION & WARNING */}
      <div
        style={{
          backgroundColor: 'rgba(178, 150, 174, 0.08)',
          border: '1px solid var(--color-mauve-dusty)',
          borderLeft: '4px solid var(--color-mauve-dusty)',
          borderRadius: 'var(--radius-sm)',
          padding: 'var(--space-4) var(--space-5)',
          marginBottom: 'var(--space-6)',
          display: 'flex',
          gap: 'var(--space-4)',
          alignItems: 'flex-start',
        }}
      >
        <AlertTriangle size={22} style={{ color: 'var(--color-mauve-dusty)', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <div
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-mauve-dusty)',
              marginBottom: 'var(--space-1)',
            }}
          >
            Critical Data Provenance Distinction & Temporal Separation
          </div>
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            The <strong>2018–2022 historical panel</strong> (derived from Rajya Sabha Session 266 AU 226) and the <strong>2023 detailed NCRB cross-section</strong> (derived from NCRB Crime in India 2023 Table 9A) originate from different administrative reporting structures and are intentionally analyzed as separate analytical objects. The historical series is strictly <strong>not</strong> extended with 2023 values to prevent non-comparable longitudinal distortions.
          </p>
        </div>
      </div>

      {/* 3. SECTION NAVIGATION SELECTOR */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <SegmentedControl
          options={SECTION_TABS}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* 4. TOP SUMMARY METRIC STRIP */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <MetricCard
          label="2023 DETAILED UNIVERSE"
          value="86,420"
          description="36 States/UTs × 40 Leaf Offenses"
          badgeVariant="success"
          statusBadge="NCRB 2023"
          icon={FileText}
        />
        <MetricCard
          label="HISTORICAL PANEL SIZE"
          value="180 Tuples"
          description="36 States/UTs × 5 Years (2018–2022)"
          badgeVariant="neutral"
          statusBadge="Rajya Sabha"
          icon={Layers}
        />
        <MetricCard
          label="STAR SCHEMA WAREHOUSE"
          value="4 Dims / 3 Facts"
          description="SQLite Analytical Repository"
          badgeVariant="accent"
          statusBadge="Relational"
          icon={Database}
        />
        <MetricCard
          label="VALIDATION INTEGRITY"
          value="100% Passed"
          description="Stages 1–29 Complete & Frozen"
          badgeVariant="success"
          statusBadge="Verified"
          icon={ShieldCheck}
        />
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: DATA PROVENANCE & DATASET INVENTORY */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'provenance') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Database size={18} style={{ color: 'var(--color-sage-light)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              1. Authoritative Data Source Inventory & Scale
            </h3>
          </div>

          <Panel variant="bordered" style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Source Identifier</th>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Official Publication Title</th>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Temporal Scope</th>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Grain & Dimension Scale</th>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Analytical Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)', fontWeight: 600 }}>Table 9A.2</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>NCRB Crime in India 2023: Cyber Crime Categories</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>2023 Cross-Section</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>36 States × 49 Offense Rows (40 Leaf)</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Category profiling, Pareto analysis, OLAP cubes, K-Means clustering, Outlier screening</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)', fontWeight: 600 }}>Table 9A.3</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>NCRB Crime in India 2023: Motives for Cyber Crimes</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>2023 Cross-Section</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>36 States × 18 Specific Motives (19 rows)</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Motive composition, Fraud dominance (68.88%), Cluster profiling, Association rules</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)', fontWeight: 600 }}>Table 9A.10</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>NCRB Crime in India 2023: Cybercrimes Against Women</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>2023 Cross-Section</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>36 States × Targeted Offense Rows</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Demographic vulnerability analysis, EDA special subsets</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)', fontWeight: 600 }}>Table 9A.11</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>NCRB Crime in India 2023: Cybercrimes Against Children</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>2023 Cross-Section</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>36 States × Targeted Offense Rows</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Child sexual exploitation analysis, POCSO-related cyber offense profiling</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-mauve-dusty)', fontWeight: 600 }}>RS_Session_266</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Rajya Sabha Unstarred Question No. 226 Answer</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>2018–2022 Panel</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>36 States × 5 Years (180 tuples)</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Supervised Regression (Log-Linear OLS), Regime Classification, Historical Trend Series</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Raw Data Immutability Notice */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <Panel variant="elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-sage-light)' }} />
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Principle of Raw Data Immutability
                </h4>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                All raw government source CSV files reside unchanged in <code>data/raw/</code>. Data cleaning, header normalization, and schema mapping occur deterministically via version-controlled pipelines. The React/Vite UI operates strictly as a read-only presentation client.
              </p>
            </Panel>

            <Panel variant="elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                <Activity size={16} style={{ color: 'var(--color-mauve-dusty)' }} />
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Authoritative National Totals
                </h4>
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                The 2023 category and motive tables reconcile exactly to <strong>86,420 total registered cybercrimes</strong>. The historical series tracks annual national registered totals from <strong>27,248 (2018)</strong> to <strong>65,893 (2022)</strong> across 36 jurisdictions.
              </p>
            </Panel>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION B: SYSTEM ARCHITECTURE & WAREHOUSE STAR SCHEMA */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'architecture') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Layers size={18} style={{ color: 'var(--color-sage-light)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              2. System Architecture & Relational Star Schema
            </h3>
          </div>

          {/* Architecture Pipeline Flow Visual */}
          <Panel variant="bordered" style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 'var(--space-3)' }}>
              Application Data & Presentation Architecture Flow
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'var(--space-2)',
                textAlign: 'center',
                alignItems: 'center',
              }}
            >
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-sage-light)', fontWeight: 700 }}>01. RAW DATA</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>NCRB & Rajya Sabha CSVs (Immutable)</div>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>➔</div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-sage-light)', fontWeight: 700 }}>02. WAREHOUSE</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>SQLite Star Schema (4 Dims, 3 Facts)</div>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>➔</div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-mauve-dusty)', fontWeight: 700 }}>03. ANALYTICAL CORE</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Stages 1–18 (Validated & Frozen Models)</div>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>➔</div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-mauve-dusty)', fontWeight: 700 }}>04. FASTAPI BACKEND</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Read-Only REST Layer (Stage 20)</div>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: 'var(--text-xs)' }}>➔</div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--text-primary)', fontWeight: 700 }}>05. REACT / VITE UI</div>
                <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Interactive UI Pages (Stages 21–27)</div>
              </div>
            </div>
          </Panel>

          {/* Star Schema Dimension & Fact Structure */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {/* Dimension Tables */}
            <Panel variant="elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                <FolderTree size={16} style={{ color: 'var(--color-sage-light)' }} />
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Warehouse Dimension Tables (OLAP Core)
                </h4>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  <span><code>dim_state</code> (36 Rows)</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>28 States + 8 Union Territories</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  <span><code>dim_year</code> (6 Rows)</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>2018, 2019, 2020, 2021, 2022, 2023</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  <span><code>dim_crime_category</code> (49 Rows)</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>40 Independent Leaf Offenses + 9 Hierarchical Subtotals</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span><code>dim_motive</code> (19 Rows)</span>
                  <strong style={{ fontFamily: 'var(--font-mono)' }}>18 Specific Motives + 1 Total Motives Row</strong>
                </div>
              </div>
            </Panel>

            {/* Fact Tables */}
            <Panel variant="elevated">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-3)' }}>
                <Server size={16} style={{ color: 'var(--color-mauve-dusty)' }} />
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Warehouse Fact Tables & Grain Specifications
                </h4>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  <div>
                    <div><code>fact_cybercrime_category_2023</code></div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Grain: State × Category × 2023</div>
                  </div>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)' }}>1,764 Rows</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '4px' }}>
                  <div>
                    <div><code>fact_cybercrime_motive_2023</code></div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Grain: State × Motive × 2023</div>
                  </div>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)' }}>684 Rows</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div><code>fact_cybercrime_trend</code></div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Grain: State × Year (2018–2022)</div>
                  </div>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mauve-dusty)' }}>180 Rows</strong>
                </div>
              </div>
            </Panel>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-secondary)',
            }}
          >
            <strong>Structural Schema Notice:</strong> No combined <em>Category × Motive</em> cube exists in the underlying official NCRB records. Categories and motives are tabulated independently by reporting police authorities and must not be cross-tabulated without synthetic assumptions.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION C: ANALYTICAL METHODS SPECIFICATION */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'methods') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Workflow size={18} style={{ color: 'var(--color-sage-light)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              3. Analytical Methods & Mathematical Specifications
            </h3>
          </div>

          {/* Methods Summary Table */}
          <Panel variant="bordered" style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Analytical Family</th>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Primary Algorithm</th>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Mathematical Configuration</th>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Input Feature Space</th>
                    <th style={{ padding: 'var(--space-3)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>Authoritative Benchmark Result</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--color-sage-light)' }}>Pattern Mining</td>
                    <td style={{ padding: 'var(--space-3)' }}>Apriori / FP-Growth (Stage 5/12)</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>Min Supp = 0.25, Min Conf = 0.60, Lift &gt; 1.0</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>8 Binary Median-Split Offense Indicators ($N=36$)</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)' }}>129 Itemsets, 1,924 Rules, 42 Pair Rules</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--color-sage-light)' }}>Unsupervised Clustering</td>
                    <td style={{ padding: 'var(--space-3)' }}>K-Means Clustering (Stage 6/15)</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>$K=4$, StandardScaler, seed=42</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>4 Proportional Share Features (Volume Excluded)</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)' }}>Silhouette = 0.3497 (Sizes: 15, 12, 2, 7)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--color-mauve-dusty)' }}>Supervised Regression</td>
                    <td style={{ padding: 'var(--space-3)' }}>Log-Linear OLS (Stage 7/14)</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>$\ln(Y) \sim \ln(Lag_1) + \Delta$, Train 20–21, Test 22</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>Log-Transformed Longitudinal Lag Regressors</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-mauve-dusty)' }}>MAE = 479.37, RMSE = 1143.46, $R^2 = 0.9000$</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--color-mauve-dusty)' }}>Supervised Classification</td>
                    <td style={{ padding: 'var(--space-3)' }}>Interpretable Decision Tree (Stage 13)</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>Depth = 3, High-Volume Regime (&gt;367 cases)</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>6 Lag-Derived Predictors (Chronological Test $N=36$)</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--color-mauve-dusty)' }}>Accuracy = 0.9722, F1 = 0.9744, ROC-AUC = 0.975</td>
                  </tr>
                  <tr>
                    <td style={{ padding: 'var(--space-3)', fontWeight: 600, color: 'var(--status-warning)' }}>Outlier & Anomaly</td>
                    <td style={{ padding: 'var(--space-3)' }}>Robust Mahalanobis & Multi-Method (Stage 8/16)</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)' }}>MinCovDet, $\chi^2(14, 0.975) = 26.119$ Reference Cutoff</td>
                    <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>14D Standardized Log Counts & Proportions</td>
                    <td style={{ padding: 'var(--space-3)', fontFamily: 'var(--font-mono)', color: 'var(--status-warning)' }}>8/36 Mahalanobis, 6/36 IF, 4/36 LOF, 18/36 IQR</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Panel>

          {/* Detailed Method Callouts */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            <Panel variant="elevated">
              <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-sm)', color: 'var(--color-sage-light)' }}>
                Association Rules Representation
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                In the absence of individual incident transaction logs, each of the 36 States/UTs functions as a transaction. Items represent binary presence above the median across 8 major crime types. <em>All mined rules describe cross-sectional co-occurrence and do not establish causal relationships.</em>
              </p>
            </Panel>

            <Panel variant="elevated">
              <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-sm)', color: 'var(--color-sage-light)' }}>
                Volume-Excluded Cluster Profiling
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                K-Means clustering feature space is strictly composed of proportion shares (IT Act share, fraud motive share, extortion motive share, sexual exploitation motive share). Raw case volume was explicitly excluded to prevent high-volume jurisdictions from dominating cluster formations.
              </p>
            </Panel>

            <Panel variant="elevated">
              <h4 style={{ margin: '0 0 var(--space-2) 0', fontSize: 'var(--text-sm)', color: 'var(--color-mauve-dusty)' }}>
                Chronological Machine Learning Split
              </h4>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                All predictive models strictly adhere to a temporal partition (Train: 2020–2021, Test: 2022 held-out) with zero random cross-validation shuffling to prevent temporal lookahead leakage. Gaussian NB, Linear SVM, RBF SVM, and Random Forest all achieved 1.0000 test accuracy.
              </p>
            </Panel>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION D: VALIDATION & QUALITY ASSURANCE GATES */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'validation') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <ShieldCheck size={18} style={{ color: 'var(--color-sage-light)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              4. Validation Framework & Quality Assurance Philosophy
            </h3>
          </div>

          <Panel variant="bordered" style={{ marginBottom: 'var(--space-4)' }}>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-4) 0' }}>
              Every analytical stage in the project is protected by automated, reproducible Python validation gates. The full suite enforces strict mathematical invariants, relational key integrity, and non-destructive data handling before changes are committed:
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-3)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)', flexShrink: 0 }} />
                <span><strong>Raw Source Immutability:</strong> All raw source CSVs verified unchanged.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)', flexShrink: 0 }} />
                <span><strong>Jurisdiction Key Alignment:</strong> Exact 36-state relational join across all tables.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)', flexShrink: 0 }} />
                <span><strong>National Total Reconciliation:</strong> Exact match to 86,420 total cases.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)', flexShrink: 0 }} />
                <span><strong>Temporal Series Separation:</strong> 2018–2022 panel kept distinct from 2023.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)', flexShrink: 0 }} />
                <span><strong>No Unexplained Nulls/Negatives:</strong> Complete domain validation across all facts.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)', flexShrink: 0 }} />
                <span><strong>Leakage Prevention:</strong> Chronological test splits with zero test contamination.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)', flexShrink: 0 }} />
                <span><strong>Sensitivity Auditing:</strong> Non-destructive $N=36$ vs $N=34$ stability audits.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)', flexShrink: 0 }} />
                <span><strong>FastAPI Contract Integrity:</strong> 11 backend test suites & 8 validation gates.</span>
              </div>
            </div>
          </Panel>

          {/* Power BI Semantic Package Documentation */}
          <Panel variant="elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <BarChart2 size={16} style={{ color: 'var(--color-mauve-dusty)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Power BI Semantic Package Layer (Stage 17)
              </h4>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              The repository contains a fully validated 28-table Power BI semantic data package in <code>dashboard/powerbi_data/</code> with a 10-page architecture and 25+ pre-calculated DAX measure specifications. Both the Power BI semantic layer and this React/FastAPI web workstation serve as presentation tiers over the exact same frozen analytical core.
            </p>
          </Panel>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION E: DEFINITIONS & ACADEMIC LIMITATIONS */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'limitations') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <HelpCircle size={18} style={{ color: 'var(--color-sage-light)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              5. Key Definitions & 9 Core Academic Limitations
            </h3>
          </div>

          {/* Glossary Panel */}
          <Panel variant="bordered" style={{ marginBottom: 'var(--space-5)' }}>
            <h4 style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
              Core Data & Analytical Definitions
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-3)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div>
                <strong style={{ color: 'var(--color-sage-light)' }}>Registered Cybercrime Cases:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  Crimes officially recorded under the IT Act, IPC, or SLL by state police agencies; does not directly measure unobserved or unreported cybercrime incidence.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-sage-light)' }}>Crime Category ≠ Motive:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  Statutory offense classifications (e.g. Sec. 66D) describe legal violations; Motive categories (e.g. Fraud, Extortion) describe registered intent. They are separate analytical dimensions.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-sage-light)' }}>Leaf Category:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  Independent, non-overlapping detailed offenses ($n=40$) that sum exactly to the national total. Subtotal rows ($n=9$) represent hierarchical aggregates.
                </p>
              </div>
              <div>
                <strong style={{ color: 'var(--color-sage-light)' }}>Statistical Outlier:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  An observation that departs from the broader multivariate feature space. Flagging reflects mathematical distance, not criminological danger or operational risk.
                </p>
              </div>
            </div>
          </Panel>

          {/* 9 Core Limitations Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {[
              {
                num: '01',
                title: 'Registered Volume vs. True Incidence',
                text: 'Registered case figures reflect crimes formally recorded by law enforcement agencies, not total cybercrime incidence. Unreported cybercrime ("dark figure") is not captured.',
              },
              {
                num: '02',
                title: 'Reporting & Institutional Variation',
                text: 'Cross-state variations reflect a combination of underlying incidence, public awareness, digital infrastructure, and institutional police registration practices; aggregate data cannot isolate these factors.',
              },
              {
                num: '03',
                title: 'Cross-Sectional 2023 Design',
                text: 'Detailed 2023 category and motive analyses are cross-sectional and cannot establish temporal causality, intervention effectiveness, or policy impact.',
              },
              {
                num: '04',
                title: 'Historical Source Separation',
                text: 'The 2018–2022 panel originates from parliamentary data with different aggregation rules and is intentionally not merged with 2023 NCRB tables.',
              },
              {
                num: '05',
                title: 'Small Denominator Sensitivity',
                text: 'Jurisdictions with minimal annual totals (Ladakh = 1, Lakshadweep = 1, DNHDD = 6) generate volatile percentage shares and should be interpreted with extreme caution.',
              },
              {
                num: '06',
                title: 'Predictive Model Scope',
                text: 'Machine learning regressions and classifications provide empirical baseline benchmarks on held-out historical data; they are not deployment-grade operational policing risk scores.',
              },
              {
                num: '07',
                title: 'Association Rule Limitations',
                text: 'Mined association rules describe cross-sectional state-level co-occurrence above medians; they do not imply that one crime type causes or triggers another.',
              },
              {
                num: '08',
                title: 'Cluster Profile Boundaries',
                text: 'K-Means clusters characterize descriptive similarity across specific proportional features; they do not represent normative tiers or performance rankings.',
              },
              {
                num: '09',
                title: 'Outlier Detection Feature Dependence',
                text: 'Outlier flags depend entirely on the selected feature space and detection algorithms. $\\chi^2$ cutoffs serve as screening references rather than formal finite-sample p-values.',
              },
            ].map((lim) => (
              <Panel key={lim.num} variant="elevated">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6875rem', color: 'var(--color-mauve-dusty)', fontWeight: 700 }}>
                    [{lim.num}]
                  </span>
                  <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                    {lim.title}
                  </h4>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {lim.text}
                </p>
              </Panel>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION F: TECHNICAL PROVENANCE & REPRODUCIBILITY */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'provenance') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Terminal size={18} style={{ color: 'var(--color-sage-light)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              6. Technical Provenance & Repository Structure
            </h3>
          </div>

          <Panel variant="bordered">
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-4)',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>REPOSITORY RELATIVE PATHS:</div>
                <div style={{ color: 'var(--color-sage-light)' }}>data/raw/</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginBottom: '8px' }}>Immutable raw source CSVs</div>
                
                <div style={{ color: 'var(--color-sage-light)' }}>data/database/cybercrime.db</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginBottom: '8px' }}>SQLite analytical star schema warehouse</div>

                <div style={{ color: 'var(--color-sage-light)' }}>dashboard/powerbi_data/</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem' }}>28 Power BI semantic tables & DAX specs</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>APPLICATION TIERS:</div>
                <div style={{ color: 'var(--color-mauve-dusty)' }}>backend/app/</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginBottom: '8px' }}>FastAPI read-only data service (Stage 20)</div>

                <div style={{ color: 'var(--color-mauve-dusty)' }}>frontend/src/</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', marginBottom: '8px' }}>React + Vite laboratory interface (Stages 19–27)</div>

                <div style={{ color: 'var(--color-mauve-dusty)' }}>src/validate_stage*.py</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem' }}>Automated validation & regression audit gates</div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION G: INTERACTIVE METADATA EXPLORER */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'explorer') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
            <Search size={18} style={{ color: 'var(--color-sage-light)' }} />
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
              7. Interactive Metadata Explorer (Live Data Dictionaries)
            </h3>
          </div>

          <Panel variant="bordered">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {[
                  { id: 'categories', label: `Categories (${categoriesData.length || 49})` },
                  { id: 'motives', label: `Motives (${motivesData.length || 19})` },
                  { id: 'states', label: `Jurisdictions (${statesData.length || 36})` },
                  { id: 'trend', label: `Historical Panel (${trendData.length || 180})` },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setExplorerTab(t.id); setSearchTerm(''); }}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-mono)',
                      border: '1px solid',
                      borderColor: explorerTab === t.id ? 'var(--color-sage-light)' : 'var(--border-subtle)',
                      backgroundColor: explorerTab === t.id ? 'var(--bg-surface-elevated)' : 'transparent',
                      color: explorerTab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <input
                type="text"
                placeholder="Filter dimension records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  minWidth: '220px',
                }}
              />
            </div>

            {loading ? (
              <LoadingState message="Loading live warehouse metadata dictionary..." />
            ) : error ? (
              <ErrorState title="Metadata Load Error" message={error} onRetry={fetchMetadata} />
            ) : (
              <div>
                {/* 1. Categories Explorer */}
                {explorerTab === 'categories' && (
                  <DataTable
                    columns={[
                      { key: 'category_id', label: 'ID', sortable: true },
                      { key: 'category_name', label: 'Category / Offense Name', sortable: true },
                      { key: 'act_group', label: 'Act Group', sortable: true },
                      { key: 'is_leaf', label: 'Type', render: (val) => (
                        <StatusBadge variant={val ? 'success' : 'warning'}>
                          {val ? 'Leaf Offense' : 'Subtotal / Parent'}
                        </StatusBadge>
                      ), sortable: true },
                      { key: 'parent_category', label: 'Parent Node', sortable: true },
                    ]}
                    data={categoriesData.filter((c) =>
                      !searchTerm ||
                      c.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      c.act_group?.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    pageSize={10}
                  />
                )}

                {/* 2. Motives Explorer */}
                {explorerTab === 'motives' && (
                  <DataTable
                    columns={[
                      { key: 'motive_id', label: 'ID', sortable: true },
                      { key: 'motive_name', label: 'Motive Name', sortable: true },
                      { key: 'total_cases_2023', label: '2023 National Total', sortable: true, render: (val) => (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{val?.toLocaleString() || '-'}</span>
                      ) },
                      { key: 'national_share_pct', label: 'National Share', sortable: true, render: (val) => (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{val !== undefined ? `${val.toFixed(2)}%` : '-'}</span>
                      ) },
                    ]}
                    data={motivesData.filter((m) =>
                      !searchTerm || m.motive_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    pageSize={10}
                  />
                )}

                {/* 3. States Explorer */}
                {explorerTab === 'states' && (
                  <DataTable
                    columns={[
                      { key: 'state_id', label: 'ID', sortable: true },
                      { key: 'state_name', label: 'Jurisdiction Name', sortable: true },
                      { key: 'is_ut', label: 'Jurisdiction Type', sortable: true, render: (val) => (
                        <StatusBadge variant={val ? 'accent' : 'neutral'}>
                          {val ? 'Union Territory' : 'State'}
                        </StatusBadge>
                      ) },
                      { key: 'total_cases_2023', label: '2023 Total Cases', sortable: true, render: (val) => (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{val?.toLocaleString() || '-'}</span>
                      ) },
                      { key: 'national_share_pct', label: 'National Share', sortable: true, render: (val) => (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>{val !== undefined ? `${val.toFixed(2)}%` : '-'}</span>
                      ) },
                    ]}
                    data={statesData.filter((s) =>
                      !searchTerm || s.state_name?.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    pageSize={10}
                  />
                )}

                {/* 4. Trend Explorer */}
                {explorerTab === 'trend' && (
                  <DataTable
                    columns={[
                      { key: 'state_name', label: 'Jurisdiction', sortable: true },
                      { key: 'year', label: 'Year', sortable: true },
                      { key: 'cases', label: 'Registered Cases', sortable: true, render: (val) => (
                        <span style={{ fontFamily: 'var(--font-mono)' }}>
                          {val === null || val === undefined ? (
                            <span style={{ color: 'var(--text-dim)' }}>Missing (Ladakh)</span>
                          ) : (
                            val.toLocaleString()
                          )}
                        </span>
                      ) },
                    ]}
                    data={trendData.filter((t) =>
                      !searchTerm || t.state_name?.toLowerCase().includes(searchTerm.toLowerCase()) || String(t.year).includes(searchTerm)
                    )}
                    pageSize={10}
                  />
                )}
              </div>
            )}
          </Panel>
        </div>
      )}
    </PageContainer>
  );
};

export default MethodologyPage;
