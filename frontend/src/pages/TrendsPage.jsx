import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import { TrendingUp, Clock } from 'lucide-react';

export const TrendsPage = () => {
  return (
    <PageContainer>
      <SectionHeader
        category="STAGE 23 — HISTORICAL ANALYTICS"
        title="Longitudinal Panel & Growth Trajectories"
        description="Analysis of 2018–2022 historical cybercrime trends across Indian states, compound growth metrics, and time-series panel dynamics."
        badge={<StatusBadge variant="warning">Module Scheduled for Stage 23</StatusBadge>}
      />

      <Panel variant="elevated">
        <div style={{ textAlign: 'center', padding: 'var(--space-10) var(--space-4)' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)',
              margin: '0 auto var(--space-4) auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}
          >
            <TrendingUp size={24} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Historical Analytics Module</h3>
          <p style={{ maxWidth: '520px', margin: '0 auto var(--space-6) auto', fontSize: 'var(--text-sm)' }}>
            This module will feature 5-year longitudinal growth trajectories (27,248 to 65,893 cases), state-level time-series comparisons, and isolated series management with Ladakh missingness transparency.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
            <Clock size={14} />
            <span>Implementation scheduled for Stage 23</span>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
};

export default TrendsPage;
