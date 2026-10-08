import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import { BookOpen, Clock } from 'lucide-react';

export const MethodologyPage = () => {
  return (
    <PageContainer>
      <SectionHeader
        category="STAGE 27 — METHODOLOGY & DATA EXPLORER"
        title="Academic Methodology, Schemas & Limitations"
        description="Comprehensive documentation of data provenance, star schema data dictionaries, analytical stage architectures, and the 6 core data limitations."
        badge={<StatusBadge variant="warning">Module Scheduled for Stage 27</StatusBadge>}
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
            <BookOpen size={24} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Academic Transparency & Methodology Module</h3>
          <p style={{ maxWidth: '540px', margin: '0 auto var(--space-6) auto', fontSize: 'var(--text-sm)' }}>
            This module will feature interactive Star Schema diagrams (dim_state, dim_crime_category, dim_motive, dim_year, facts), full disclosure of the 6 core data limitations, and reference mappings to the Power BI 28-table semantic package.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
            <Clock size={14} />
            <span>Implementation scheduled for Stage 27</span>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
};

export default MethodologyPage;
