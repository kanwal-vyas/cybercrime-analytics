import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import { GitMerge, Clock } from 'lucide-react';

export const PatternsPage = () => {
  return (
    <PageContainer>
      <SectionHeader
        category="STAGE 25 — ASSOCIATION RULES & CLUSTERING UI"
        title="Unsupervised Pattern Mining & Cluster Profiles"
        description="Mining co-occurring state crime profiles via Apriori/FP-Growth and discovering structural composition groups via K-Means ($K=4$)."
        badge={<StatusBadge variant="warning">Module Scheduled for Stage 25</StatusBadge>}
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
            <GitMerge size={24} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Patterns & Clustering Module</h3>
          <p style={{ maxWidth: '540px', margin: '0 auto var(--space-6) auto', fontSize: 'var(--text-sm)' }}>
            This module will feature 1,924 filtered association rules with interactive Support/Confidence/Lift sliders, 2D PCA cluster projections, and the 4-profile state taxonomy (Clusters 0, 1, 2, 3) labeled with strict non-causal caveats.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
            <Clock size={14} />
            <span>Implementation scheduled for Stage 25</span>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
};

export default PatternsPage;
