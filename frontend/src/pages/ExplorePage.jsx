import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import { Compass, Clock } from 'lucide-react';

export const ExplorePage = () => {
  return (
    <PageContainer>
      <SectionHeader
        category="STAGE 22 — GEOGRAPHIC & CRIME EXPLORER"
        title="State & Crime Category Exploration"
        description="Interactive cross-sectional exploration of 36 States/UTs, 49 legal crime categories, and 18 motive dimensions from NCRB 2023."
        badge={<StatusBadge variant="warning">Module Scheduled for Stage 22</StatusBadge>}
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
            <Compass size={24} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Geographic & Category Explorer Module</h3>
          <p style={{ maxWidth: '520px', margin: '0 auto var(--space-6) auto', fontSize: 'var(--text-sm)' }}>
            This interface will provide interactive filtering, comparative state profiling, legal Act Group drill-downs, and leaf vs. subtotal category analysis.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
            <Clock size={14} />
            <span>Implementation scheduled for Stage 22</span>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
};

export default ExplorePage;
