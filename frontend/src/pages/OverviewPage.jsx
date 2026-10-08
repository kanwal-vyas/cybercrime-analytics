import React, { useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import MetricCard from '../components/ui/MetricCard';
import StatusBadge from '../components/ui/StatusBadge';
import Panel from '../components/ui/Panel';
import Divider from '../components/ui/Divider';
import FilterControl from '../components/ui/FilterControl';
import SelectControl from '../components/ui/SelectControl';
import SegmentedControl from '../components/ui/SegmentedControl';
import DataTable from '../components/data/DataTable';
import ChartContainer from '../components/charts/ChartContainer';
import LoadingState from '../components/ui/LoadingState';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { Shield, Layers, BarChart2, Activity, Database, Sparkles, CheckCircle2, Lock } from 'lucide-react';

export const OverviewPage = () => {
  const [filterText, setFilterText] = useState('');
  const [selectedAct, setSelectedAct] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [demoStateTab, setDemoStateTab] = useState('chart');

  // Sample data demonstrating the DataTable container
  const sampleTableColumns = [
    { key: 'rank', label: '#', align: 'center', sortable: true, nowrap: true },
    { key: 'state', label: 'State / UT Jurisdiction', sortable: true },
    { key: 'total_cases', label: 'Registered Cases', align: 'right', sortable: true, numeric: true },
    { key: 'national_share', label: 'National Share', align: 'right', sortable: true, numeric: true },
    { key: 'primary_motive', label: 'Primary Motive', sortable: true },
    { key: 'act_group', label: 'Dominant Act', sortable: true },
    { key: 'status', label: 'Profile Cluster', align: 'center', render: (val) => (
      <StatusBadge variant={val === 'Cluster 1' ? 'warning' : val === 'Cluster 2' ? 'mauve' : 'success'} size="sm">
        {val}
      </StatusBadge>
    )},
  ];

  const sampleTableData = [
    { id: 1, rank: 1, state: 'Karnataka', total_cases: 21889, national_share: '25.33%', primary_motive: 'Fraud (17,623)', act_group: 'IT Act (69.2%)', status: 'Cluster 1' },
    { id: 2, rank: 2, state: 'Telangana', total_cases: 18236, national_share: '21.10%', primary_motive: 'Fraud (15,488)', act_group: 'IT Act (67.4%)', status: 'Cluster 1' },
    { id: 3, rank: 3, state: 'Uttar Pradesh', total_cases: 10794, national_share: '12.49%', primary_motive: 'Fraud (6,890)', act_group: 'IPC r/w IT (78.9%)', status: 'Cluster 0' },
    { id: 4, rank: 4, state: 'Maharashtra', total_cases: 8103, national_share: '9.38%', primary_motive: 'Fraud (5,124)', act_group: 'IPC r/w IT (54.1%)', status: 'Cluster 0' },
    { id: 5, rank: 5, state: 'Bihar', total_cases: 4450, national_share: '5.15%', primary_motive: 'Fraud (3,412)', act_group: 'IPC r/w IT (88.4%)', status: 'Cluster 0' },
    { id: 6, rank: 6, state: 'Kerala', total_cases: 3374, national_share: '3.90%', primary_motive: 'Extortion (1,120)', act_group: 'IT Act (52.3%)', status: 'Cluster 3' },
    { id: 7, rank: 35, state: 'Dadra & Nagar Haveli', total_cases: 6, national_share: '0.01%', primary_motive: 'Sexual Exploitation (5)', act_group: 'IT Act (100.0%)', status: 'Cluster 2' },
    { id: 8, rank: 36, state: 'Lakshadweep', total_cases: 1, national_share: '<0.01%', primary_motive: 'Sexual Exploitation (1)', act_group: 'IT Act (100.0%)', status: 'Cluster 2' },
  ];

  const filteredData = sampleTableData.filter(item => 
    item.state.toLowerCase().includes(filterText.toLowerCase()) ||
    item.primary_motive.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <PageContainer>
      {/* Hero / System Header */}
      <div
        style={{
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 'var(--space-8)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <StatusBadge variant="success" pulse size="sm">
            STAGE 19 UI FOUNDATION ONLINE
          </StatusBadge>
          <StatusBadge variant="mauve" size="sm">
            STAGES 1–18 AUDITED & FROZEN
          </StatusBadge>
          <StatusBadge variant="info" size="sm">
            DARK ANALYTICAL LAB THEME
          </StatusBadge>
        </div>

        <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-2)' }}>
          Cyber Crime Analytics for National Security
        </h1>
        <p style={{ maxWidth: '840px', fontSize: 'var(--text-base)', color: 'var(--text-secondary)' }}>
          A specialized cybersecurity intelligence and data mining workstation analyzing 86,420 registered Indian cybercrime offenses across 36 States & Union Territories. Built on audited NCRB cross-sections, longitudinal lag panels, multi-dimensional OLAP cubes, and validated machine learning models.
        </p>

        {/* Technical Metadata Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 'var(--space-6)',
            marginTop: 'var(--space-6)',
            padding: 'var(--space-3) var(--space-4)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            <span style={{ color: 'var(--text-dim)' }}>DATASET: </span>
            <span style={{ color: 'var(--color-ivory)' }}>NCRB CII 2023 & RS AU 226</span>
          </div>
          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle)' }} />
          <div>
            <span style={{ color: 'var(--text-dim)' }}>GRAIN: </span>
            <span style={{ color: 'var(--color-ivory)' }}>36 States/UTs × 40 Leaf Offenses</span>
          </div>
          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle)' }} />
          <div>
            <span style={{ color: 'var(--text-dim)' }}>LEAKAGE AUDIT: </span>
            <span style={{ color: 'var(--status-success)' }}>0 LEAKAGE INSTANCES</span>
          </div>
          <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--border-subtle)' }} />
          <div>
            <span style={{ color: 'var(--text-dim)' }}>CAUSALITY: </span>
            <span style={{ color: 'var(--color-mauve-dusty)' }}>STRICTLY NON-CAUSAL</span>
          </div>
        </div>
      </div>

      {/* 1. Core Analytical KPI Metric Cards */}
      <section>
        <SectionHeader
          category="FOUNDATION PREVIEW — METRIC CARD COMPONENT"
          title="National Analytical Indicators"
          description="Authoritative national baseline metrics verified during the Stage 18 comprehensive quality audit."
          badge={<StatusBadge variant="success">100% Reconciled</StatusBadge>}
        />

        <div className="grid-metrics">
          <MetricCard
            label="Total Registered Cybercrimes"
            value="86,420"
            unit="Cases"
            description="NCRB 2023 Table 9A.2 Leaf Offenses"
            change="100.0% National"
            changeType="neutral"
            statusBadge="Authoritative Total"
            badgeVariant="success"
            accentColor="var(--primary)"
            icon={Shield}
          />

          <MetricCard
            label="IT Act Offenses"
            value="44,237"
            unit="Cases"
            description="51.19% of national volume"
            change="Sec. 66D: 25,334"
            changeType="positive"
            statusBadge="IT Act"
            badgeVariant="info"
            accentColor="var(--status-info)"
            icon={Layers}
          />

          <MetricCard
            label="IPC Crimes r/w IT Act"
            value="41,849"
            unit="Cases"
            description="48.43% of national volume"
            change="Sec. 420: 16,943"
            changeType="accent"
            statusBadge="IPC r/w IT"
            badgeVariant="mauve"
            accentColor="var(--color-mauve-dusty)"
            icon={Activity}
          />

          <MetricCard
            label="Fraud Motive Dominance"
            value="68.88%"
            unit="Share"
            description="59,526 / 86,420 total cases"
            change="61,365 Financial Leaf"
            changeType="warning"
            statusBadge="Primary Motive"
            badgeVariant="warning"
            accentColor="var(--status-warning)"
            icon={BarChart2}
          />

          <MetricCard
            label="Top 5 State Concentration"
            value="73.45%"
            unit="Share"
            description="63,472 cases across 5 jurisdictions"
            change="KA, TS, UP, MH, BR"
            changeType="positive"
            statusBadge="High Concentration"
            badgeVariant="success"
            accentColor="var(--color-sage-deep)"
            icon={Database}
          />
        </div>
      </section>

      <Divider label="FOUNDATIONAL UI COMPONENTS" />

      {/* 2. Interactive Data Table & Filter System Showcase */}
      <section>
        <SectionHeader
          category="FOUNDATION PREVIEW — DATA TABLE & FILTER SYSTEM"
          title="Analytical Data Table with Interactive Sorting & Slicing"
          description="Demonstrates the reusable DataTable container, density styling, numeric alignment, and multi-criteria filter controls ready for Stage 20 API integration."
        />

        <Panel
          variant="default"
          title="State & Union Territory Cross-Section (Representative Extract)"
          subtitle="Showing representative state rankings with composition indicators"
          action={
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
              <FilterControl
                value={filterText}
                onChange={setFilterText}
                onClear={() => setFilterText('')}
                placeholder="Search state or motive..."
              />
              <SelectControl
                value={selectedAct}
                onChange={setSelectedAct}
                placeholder="All Act Groups"
                options={[
                  { value: 'it', label: 'IT Act Dominant' },
                  { value: 'ipc', label: 'IPC Dominant' },
                  { value: 'sll', label: 'SLL Dominant' },
                ]}
              />
              <SegmentedControl
                size="sm"
                value={activeTab}
                onChange={setActiveTab}
                options={[
                  { value: 'all', label: 'All Jurisdictions', count: 36 },
                  { value: 'top5', label: 'Top 5', count: 5 },
                  { value: 'ut', label: 'UTs', count: 8 },
                ]}
              />
            </div>
          }
        >
          <DataTable
            columns={sampleTableColumns}
            data={filteredData}
            emptyMessage={`No state records matching "${filterText}".`}
          />
        </Panel>
      </section>

      {/* 3. Reusable Chart Container & Visualization Shell */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          category="FOUNDATION PREVIEW — VISUALIZATION CONTAINERS"
          title="Analytical Chart Container Shell"
          description="Standardized wrapper for interactive visual analytics, chart controls, methodology footnotes, and technical loading/empty state handling."
        />

        <div className="grid-2col">
          {/* Chart Shell 1 */}
          <ChartContainer
            category="VOLUME CONCENTRATION"
            title="Top 5 Jurisdictions Pareto Breakdown"
            subtitle="Demonstrating the ChartContainer component shell with control tabs"
            sourceNote="Source: NCRB Crime in India (2023) Table 9A.2 & 9A.3 · Dimensional Grain: State × Category"
            controls={
              <SegmentedControl
                size="sm"
                value={demoStateTab}
                onChange={setDemoStateTab}
                options={[
                  { value: 'chart', label: 'Active Visualization' },
                  { value: 'loading', label: 'Loading State' },
                  { value: 'empty', label: 'Empty State' },
                  { value: 'error', label: 'Error State' },
                ]}
              />
            }
          >
            {demoStateTab === 'loading' ? (
              <LoadingState lines={4} message="Aggregating Pareto volume lattice..." />
            ) : demoStateTab === 'empty' ? (
              <EmptyState title="No Slices Selected" description="Select one or more legal act groups to view volume distributions." />
            ) : demoStateTab === 'error' ? (
              <ErrorState title="Visualization Error" message="Failed to render WebGL chart canvas for the selected feature space." />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-2) 0',
                }}
              >
                {/* Visual Bar Previews */}
                {[
                  { name: 'Karnataka', val: 21889, pct: 100, share: '25.33%', color: 'var(--primary)' },
                  { name: 'Telangana', val: 18236, pct: 83.3, share: '21.10%', color: 'var(--primary)' },
                  { name: 'Uttar Pradesh', val: 10794, pct: 49.3, share: '12.49%', color: 'var(--accent-mauve)' },
                  { name: 'Maharashtra', val: 8103, pct: 37.0, share: '9.38%', color: 'var(--accent-mauve)' },
                  { name: 'Bihar', val: 4450, pct: 20.3, share: '5.15%', color: 'var(--color-sage-deep)' },
                ].map((item) => (
                  <div key={item.name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)' }}>
                      <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{item.val.toLocaleString()} cases ({item.share})</span>
                    </div>
                    <div
                      style={{
                        height: '18px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      <div
                        style={{
                          width: `${item.pct}%`,
                          height: '100%',
                          backgroundColor: item.color,
                          borderRadius: 'var(--radius-sm)',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ChartContainer>

          {/* Design Token System Palette Inspector */}
          <Panel
            variant="default"
            title="Laboratory Design System Palette"
            subtitle="Harmonious sage, mauve, and dark analytical surface tokens"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div>
                <div className="tech-label" style={{ marginBottom: 'var(--space-2)' }}>Core Base Palette</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-2)' }}>
                  {[
                    { name: 'Deep Sage', hex: '#507656', role: 'Primary Brand' },
                    { name: 'Light Sage', hex: '#85A289', role: 'Interactive' },
                    { name: 'Warm Ivory', hex: '#E8E3DE', role: 'Primary Text' },
                    { name: 'Dusty Mauve', hex: '#B296AE', role: 'Accent Mauve' },
                    { name: 'Deep Mauve', hex: '#765070', role: 'Deep Accent' },
                  ].map((c) => (
                    <div key={c.name} style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          height: '42px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: c.hex,
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          marginBottom: '4px',
                        }}
                      />
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{c.hex}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="tech-label" style={{ marginBottom: 'var(--space-2)' }}>Surface & Elevation Hierarchy</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                  {[
                    { name: 'Base App', bg: 'var(--bg-app)', border: 'var(--border-subtle)' },
                    { name: 'Surface', bg: 'var(--bg-surface)', border: 'var(--border-default)' },
                    { name: 'Elevated', bg: 'var(--bg-surface-elevated)', border: 'var(--border-strong)' },
                    { name: 'Overlay', bg: 'var(--bg-surface-overlay)', border: 'var(--border-accent)' },
                  ].map((s) => (
                    <div
                      key={s.name}
                      style={{
                        padding: 'var(--space-3)',
                        backgroundColor: s.bg,
                        border: `1px solid ${s.border}`,
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{s.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="tech-label" style={{ marginBottom: 'var(--space-2)' }}>Status & Anomaly Semantics</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <StatusBadge variant="success">Verified (Success)</StatusBadge>
                  <StatusBadge variant="warning">Caution / Share</StatusBadge>
                  <StatusBadge variant="danger">High Extreme / Outlier</StatusBadge>
                  <StatusBadge variant="info">IT Act Classification</StatusBadge>
                  <StatusBadge variant="mauve">IPC r/w IT Act</StatusBadge>
                  <StatusBadge variant="neutral">Unimputed NaN</StatusBadge>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* 4. UI Engineering Track Roadmap Blueprint */}
      <section style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeader
          category="ROADMAP ARCHITECTURE"
          title="UI Engineering Track Execution Pipeline"
          description="Stages 19–29 form the dedicated presentation layer consuming the validated analytical core (Stages 1–18)."
        />

        <div className="grid-3col">
          <Panel
            variant="elevated"
            title="Stage 19: UI Foundation"
            subtitle="Current Stage · Active"
            action={<StatusBadge variant="success">Complete & Audited</StatusBadge>}
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Establishes React + Vite scaffold, CSS variables design tokens (Deep Sage, Light Sage, Warm Ivory, Dusty Mauve), 18 reusable technical UI components, route shell, and API client layer.
            </p>
          </Panel>

          <Panel
            variant="default"
            title="Stage 20: Backend / API Layer"
            subtitle="Next Stage · Scheduled"
            action={<StatusBadge variant="warning">Planned</StatusBadge>}
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              FastAPI REST service providing validated data access to SQLite warehouse (cybercrime.db), master 2023 datasets, historical lag panels, and serialized ML model artifacts.
            </p>
          </Panel>

          <Panel
            variant="default"
            title="Stages 21–27: Specialized Pages"
            subtitle="Analytical Modules · Scheduled"
            action={<StatusBadge variant="neutral">Planned</StatusBadge>}
          >
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Executive Dashboard (Stage 21), Geographic Explorer (Stage 22), Historical Analytics (Stage 23), ML Models (Stage 24), Patterns (Stage 25), Anomalies (Stage 26), Methodology (Stage 27).
            </p>
          </Panel>
        </div>
      </section>
    </PageContainer>
  );
};

export default OverviewPage;
