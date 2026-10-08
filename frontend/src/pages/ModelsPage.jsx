import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import Panel from '../components/ui/Panel';
import StatusBadge from '../components/ui/StatusBadge';
import { Cpu, Clock } from 'lucide-react';

export const ModelsPage = () => {
  return (
    <PageContainer>
      <SectionHeader
        category="STAGE 24 — MACHINE LEARNING ANALYTICS UI"
        title="Supervised Classification & Predictive Regression"
        description="Interactive exploration of Decision Tree, SVM, Naive Bayes, Random Forest classifiers, and Log-Linear panel regression models."
        badge={<StatusBadge variant="warning">Module Scheduled for Stage 24</StatusBadge>}
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
            <Cpu size={24} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>Machine Learning Analytics Module</h3>
          <p style={{ maxWidth: '540px', margin: '0 auto var(--space-6) auto', fontSize: 'var(--text-sm)' }}>
            This module will present the 10-model regression leaderboard (Log-Linear R² = 0.9000 superiority), classification metrics, confusion matrices, and chronological evaluation splits (Train: 2020–2021, Held-Out Test: 2022).
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
            <Clock size={14} />
            <span>Implementation scheduled for Stage 24</span>
          </div>
        </div>
      </Panel>
    </PageContainer>
  );
};

export default ModelsPage;
