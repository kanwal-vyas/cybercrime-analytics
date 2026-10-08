import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import { Target, Clock } from 'lucide-react';

export const AnomaliesPage = () => {
  return (
    <PageContainer>
      <SectionHeader
        category="STAGE 26 — ANOMALY & OUTLIER UI"
        title="Multidimensional Anomaly Detection & Consensus Scoring"
        description="Statistical departure detection across Robust Mahalanobis (MinCovDet), LOF, Isolation Forest, and univariate Tukey IQR fences."
        badge={<StatusBadge variant="warning">Module Scheduled for Stage 26</StatusBadge>}
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
            <Target size={24} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Anomaly & Outlier Analytics Module</h3>
          <p style={{ maxWidth: '540px', margin: '0 auto var(--space-6) auto', fontSize: 'var(--text-sm)' }}>
            This module will feature consensus anomaly scoring (0 to 4 methods agreeing), volume vs. composition dual-space separation, and non-destructive sensitivity analysis on N=36 vs N=34 (excluding tiny UTs) without normative risk labels.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
            <Clock size={14} />
            <span>Implementation scheduled for Stage 26</span>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
};

export default AnomaliesPage;
