import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageContainer from '../components/layout/PageContainer';
import SectionHeader from '../components/ui/SectionHeader';
import StatusBadge from '../components/ui/StatusBadge';
import StatusDot from '../components/ui/StatusDot';
import Panel from '../components/ui/Panel';
import MetricCard from '../components/ui/MetricCard';
import SegmentedControl from '../components/ui/SegmentedControl';
import DataTable from '../components/data/DataTable';
import ChartContainer from '../components/charts/ChartContainer';
import LoadingState from '../components/ui/LoadingState';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import api from '../services/api';
import {
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Target,
  ShieldCheck,
  Scale,
  Search,
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';

export const ModelsPage = () => {
  // Primary API Data State
  const [classificationData, setClassificationData] = useState(null);
  const [regressionData, setRegressionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI Interactive States
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'classification' | 'regression'
  const [selectedClassifier, setSelectedClassifier] = useState('Decision Tree (depth=3)');
  const [selectedRegressionModel, setSelectedRegressionModel] = useState('Log-Linear Regression (Log OLS)');
  const [predictionModelKey, setPredictionModelKey] = useState('pred_log_linear'); // 'pred_log_linear' | 'pred_naive_lag1' | 'pred_linear_raw' | 'pred_random_forest'
  const [stateSearchQuery, setStateSearchQuery] = useState('');
  const [hoveredScatterPoint, setHoveredScatterPoint] = useState(null);

  // Fetch ML Model Data from FastAPI backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [classRes, regRes] = await Promise.all([
        api.getClassificationMetrics(),
        api.getRegressionMetrics(),
      ]);
      setClassificationData(classRes);
      setRegressionData(regRes);
    } catch (err) {
      console.error('[ModelsPage] Error fetching machine learning model data:', err);
      setError(err.message || 'Unable to retrieve validated model outputs from backend API.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Classification Data
  const classModels = useMemo(() => classificationData?.models || [], [classificationData]);
  const confusionMatrices = useMemo(() => classificationData?.confusion_matrices || [], [classificationData]);
  const featureImportanceList = useMemo(() => classificationData?.feature_importance || [], [classificationData]);

  // Active Selected Confusion Matrix
  const activeConfusionMatrix = useMemo(() => {
    return confusionMatrices.find((cm) => cm.Model === selectedClassifier) || confusionMatrices[1] || null;
  }, [confusionMatrices, selectedClassifier]);

  // Derived Regression Data
  const regModels = useMemo(() => regressionData?.models || [], [regressionData]);
  const actualVsPredicted = useMemo(() => regressionData?.actual_vs_predicted || [], [regressionData]);

  // Filtered State Predictions for DataTable
  const filteredPredictions = useMemo(() => {
    if (!stateSearchQuery.trim()) return actualVsPredicted;
    const q = stateSearchQuery.toLowerCase().trim();
    return actualVsPredicted.filter((item) => item.state_name.toLowerCase().includes(q));
  }, [actualVsPredicted, stateSearchQuery]);

  // Prediction Model Names Mapping
  const predModelConfig = useMemo(() => {
    switch (predictionModelKey) {
      case 'pred_naive_lag1':
        return { label: 'Naive Persistent (Lag-1)', predKey: 'pred_naive_lag1', errKey: 'error_naive', color: '#D8A563' };
      case 'pred_linear_raw':
        return { label: 'Linear Regression (Raw OLS)', predKey: 'pred_linear_raw', errKey: 'error_linear_raw', color: '#B296AE' };
      case 'pred_random_forest':
        return { label: 'Random Forest Regressor', predKey: 'pred_random_forest', errKey: 'error_rf', color: '#765070' };
      case 'pred_log_linear':
      default:
        return { label: 'Log-Linear OLS (Selected Best, R²=0.90)', predKey: 'pred_log_linear', errKey: 'error_log_linear', color: '#85A289' };
    }
  }, [predictionModelKey]);

  if (loading) {
    return (
      <PageContainer>
        <SectionHeader
          category="STAGE 24 — MACHINE LEARNING ANALYTICS"
          title="Supervised Classification & Predictive Regression"
          description="Materializing validated model outputs and chronological evaluation metrics from FastAPI backend..."
        />
        <LoadingState message="Retrieving validated classification and regression models from backend /api/models/..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <SectionHeader
          category="STAGE 24 — MACHINE LEARNING ANALYTICS"
          title="Supervised Classification & Predictive Regression"
          description="Error connecting to validated analytical endpoints."
        />
        <ErrorState message={error} onRetry={fetchData} />
      </PageContainer>
    );
  }

  // Classification Table Columns
  const classificationColumns = [
    {
      key: 'Model',
      label: 'Model Architecture',
      sortable: true,
      render: (val, row) => {
        const isSelected = row.Model === selectedClassifier;
        const isFeatured = row.Model.includes('Decision Tree');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--color-sage-light)' : 'var(--text-primary)' }}>
              {val}
            </span>
            {isFeatured && (
              <StatusBadge size="sm" variant="success">
                Featured Interpretable
              </StatusBadge>
            )}
            {row.Accuracy === 1.0 && !isFeatured && (
              <StatusBadge size="sm" variant="neutral">
                Separable
              </StatusBadge>
            )}
          </div>
        );
      },
    },
    {
      key: 'Accuracy',
      label: 'Accuracy',
      align: 'right',
      sortable: true,
      render: (val) => `${(val * 100).toFixed(2)}%`,
    },
    {
      key: 'Balanced_Accuracy',
      label: 'Balanced Acc.',
      align: 'right',
      sortable: true,
      render: (val) => (val !== undefined ? `${(val * 100).toFixed(2)}%` : '—'),
    },
    {
      key: 'Precision',
      label: 'Precision',
      align: 'right',
      sortable: true,
      render: (val) => (val !== undefined ? `${(val * 100).toFixed(2)}%` : '—'),
    },
    {
      key: 'Recall',
      label: 'Recall',
      align: 'right',
      sortable: true,
      render: (val) => (val !== undefined ? `${(val * 100).toFixed(2)}%` : '—'),
    },
    {
      key: 'Specificity',
      label: 'Specificity',
      align: 'right',
      sortable: true,
      render: (val) => (val !== undefined ? `${(val * 100).toFixed(2)}%` : '—'),
    },
    {
      key: 'F1_Score',
      label: 'F1-Score',
      align: 'right',
      sortable: true,
      render: (val) => (val !== undefined ? (val * 100).toFixed(2) + '%' : '—'),
    },
    {
      key: 'ROC_AUC',
      label: 'ROC-AUC',
      align: 'right',
      sortable: true,
      render: (val) => (val !== undefined ? val.toFixed(4) : '—'),
    },
  ];

  // Regression Table Columns
  const regressionColumns = [
    {
      key: 'model_name',
      label: 'Regression Model',
      sortable: true,
      render: (val, row) => {
        const isBest = row.r2 >= 0.9;
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: isBest ? 600 : 500, color: isBest ? 'var(--color-sage-light)' : 'var(--text-primary)' }}>
                {val}
              </span>
              {isBest && (
                <StatusBadge size="sm" variant="success">
                  Selected Best
                </StatusBadge>
              )}
            </div>
            {row.description && (
              <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {row.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'model_type',
      label: 'Family',
      sortable: true,
      render: (val) => (
        <span className="tech-label" style={{ fontSize: '0.6875rem' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'feature_set',
      label: 'Feature Set',
      sortable: true,
      render: (val) => (
        <code style={{ fontSize: '0.6875rem', color: 'var(--color-mauve-dusty)' }}>
          {val}
        </code>
      ),
    },
    {
      key: 'mae',
      label: 'MAE (Cases)',
      align: 'right',
      sortable: true,
      render: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      key: 'rmse',
      label: 'RMSE',
      align: 'right',
      sortable: true,
      render: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
    {
      key: 'r2',
      label: 'R² Score',
      align: 'right',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 600, color: val >= 0.88 ? 'var(--color-sage-light)' : val >= 0.8 ? 'var(--text-primary)' : 'var(--status-warning)' }}>
          {val.toFixed(4)}
        </span>
      ),
    },
    {
      key: 'median_ae',
      label: 'Median AE',
      align: 'right',
      sortable: true,
      render: (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    },
  ];

  // State Prediction Table Columns
  const statePredictionColumns = [
    {
      key: 'state_name',
      label: 'State / Union Territory',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      key: 'actual_2022',
      label: 'Actual 2022 (Cases)',
      align: 'right',
      sortable: true,
      render: (val) => val.toLocaleString(),
    },
    {
      key: predModelConfig.predKey,
      label: `Predicted (${predModelConfig.label.split(' ')[0]})`,
      align: 'right',
      sortable: true,
      render: (val) => Math.round(val).toLocaleString(),
    },
    {
      key: predModelConfig.errKey,
      label: 'Residual Error (e)',
      align: 'right',
      sortable: true,
      render: (val) => {
        const isPositive = val > 0;
        const color = Math.abs(val) <= 100 ? 'var(--color-sage-light)' : Math.abs(val) <= 500 ? 'var(--status-warning)' : 'var(--status-danger)';
        return (
          <span style={{ color, fontFamily: 'var(--font-mono)' }}>
            {isPositive ? `+${Math.round(val).toLocaleString()}` : Math.round(val).toLocaleString()}
          </span>
        );
      },
    },
    {
      key: 'abs_error_ratio',
      label: 'Relative Error',
      align: 'right',
      sortable: true,
      render: (_, row) => {
        const actual = row.actual_2022;
        const err = row[predModelConfig.errKey];
        if (actual === 0) return '—';
        const ratio = Math.abs(err) / actual;
        const pct = (ratio * 100).toFixed(1);
        return (
          <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: ratio <= 0.2 ? 'var(--color-sage-light)' : 'var(--text-muted)' }}>
            {pct}%
          </span>
        );
      },
    },
  ];

  return (
    <PageContainer>
      {/* 1. Header Section */}
      <SectionHeader
        category="STAGE 24 — MACHINE LEARNING ANALYTICS"
        title="Supervised Classification & Predictive Regression"
        description="Empirical benchmark of predictive and discriminative algorithms across historical State/UT cybercrime panel data (2018–2022) with chronological train/test partitions."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <StatusBadge variant="success">VALIDATED HISTORICAL MODELS</StatusBadge>
            <StatusBadge variant="neutral">NCRB STATE/UT PANEL</StatusBadge>
            <StatusBadge variant="accent">CHRONOLOGICAL EVALUATION (2022 HELD-OUT)</StatusBadge>
          </div>
        }
      />

      {/* 2. Top Methodology Notice & Academic Guidance */}
      <Panel variant="elevated" style={{ borderLeft: '4px solid var(--color-sage-light)', marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <div
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(133, 162, 137, 0.15)',
              color: 'var(--color-sage-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-1)' }}>
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Strict Non-Causal Scope & Methodological Notice
              </h4>
            </div>
            <p style={{ margin: '0 0 var(--space-3) 0', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              These models evaluate <strong>historical State/UT registered volume persistence</strong> using time-lagged temporal features. They do <strong>not</strong> establish causal mechanisms, determine underlying crime incidence, predict individual offender behavior, or constitute operational policing risk scores.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-3)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <Target size={14} style={{ color: 'var(--color-sage-light)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Classification Task:</strong> Predicts if next year's registered volume falls into a high-volume regime (≥ 367 cases) based on historical lags.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-xs)' }}>
                <TrendingUp size={14} style={{ color: 'var(--color-mauve-dusty)', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Regression Task:</strong> Estimates continuous next-year volume ($R^2 = 0.9000$ Log-Linear OLS) from historical log-transformed volume lags.
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* 3. Top-Level Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-6)',
        }}
      >
        <MetricCard
          label="CHRONOLOGICAL PARTITION"
          value="N=70 / 36"
          description="Train: 2020–2021 (N=70) • Test: 2022 Held-Out (N=36)"
          badgeVariant="neutral"
          statusBadge="Zero Leakage"
          accentColor="var(--color-sage-light)"
          icon={Layers}
        />
        <MetricCard
          label="FEATURED INTERPRETABLE CLASSIFIER"
          value="97.22%"
          unit="ACC"
          description="Decision Tree (depth=3) • F1: 97.44% (NB, SVM, RF achieve 1.0000 on test set)"
          badgeVariant="neutral"
          statusBadge="Interpretable Tree"
          accentColor="var(--color-sage-deep)"
          icon={Award}
        />
        <MetricCard
          label="PRIMARY REGRESSOR"
          value="0.9000"
          unit="R²"
          description="Log-Linear OLS • MAE: 479.37 cases • MedAE: 69.85"
          badgeVariant="success"
          statusBadge="Log-Linear OLS"
          accentColor="var(--color-mauve-dusty)"
          icon={TrendingUp}
        />
        <MetricCard
          label="FEATURE IMPORTANCE"
          value="0.9444"
          unit="IMPORTANCE"
          description="log_lag_1 — Decision Tree feature importance: 0.9444 (RF: 0.2714)"
          badgeVariant="accent"
          statusBadge="Tree Model Split"
          accentColor="var(--status-warning)"
          icon={Cpu}
        />
      </div>

      {/* 4. Model Family Segmented Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <SegmentedControl
          options={[
            { value: 'all', label: 'ALL MODELS & METHODOLOGY' },
            { value: 'classification', label: 'CLASSIFICATION (High-Volume Regime)' },
            { value: 'regression', label: 'REGRESSION (Continuous Volume)' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
        />
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          Authoritative Source: Stages 7, 13 & 14 Analytical Record
        </div>
      </div>

      {/* 5. CLASSIFICATION SECTION */}
      {(activeTab === 'all' || activeTab === 'classification') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>
                SUPERVISED LEARNING • UNIT 5 SYLLABUS ALIGNMENT
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
                High-Volume Regime Classification (Stage 13)
              </h3>
            </div>
            <StatusBadge variant="neutral">Target: HIGH_NEXT_YEAR ∈ {'{0, 1}'} (Threshold: ≥ 367.0 cases)</StatusBadge>
          </div>

          {/* Classification Context Summary */}
          <Panel variant="subtle" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Task Definition:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {classificationData?.task_definition || 'Binary High-Volume Regime Prediction'}
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Threshold Derivation:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-sage-light)', marginTop: '2px' }}>
                  Training Median (367.0 cases, N=70)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Feature Inputs:</span>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  6 Historical Lag Features (lag_1, lag_2, log_lags...)
                </div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Held-Out Test Sample:</span>
                <div style={{ fontWeight: 600, color: 'var(--color-mauve-dusty)', marginTop: '2px' }}>
                  2022 Full Panel (N=36 States/UTs)
                </div>
              </div>
            </div>
          </Panel>

          {/* Classification Leaderboard Table */}
          <Panel variant="elevated" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Classification Model Leaderboard
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Click a model row to inspect its exact 2x2 confusion matrix on the 36 held-out 2022 test observations.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatusDot variant="success" />
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Selected Model: {selectedClassifier}
                </span>
              </div>
            </div>

            <DataTable
              columns={classificationColumns}
              data={classModels}
              rowKey="Model"
              selectedRowKey={selectedClassifier}
              onRowClick={(row) => setSelectedClassifier(row.Model)}
            />

            <div style={{ marginTop: 'var(--space-3)', fontSize: '0.6875rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
              * Decision Tree (depth=3) is featured as an interpretable benchmark (97.22% accuracy, F1=0.9744). Note that Gaussian Naive Bayes, Linear SVM, RBF SVM, and Random Forest all achieved 1.0000 (100%) accuracy on the 2022 held-out test split.
            </div>
          </Panel>

          {/* Classification Visuals: Performance Comparison + Confusion Matrix + Feature Importance */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
            {/* 1. Confusion Matrix Inspector */}
            <ChartContainer
              category="CONFUSION MATRIX INSPECTOR"
              title={selectedClassifier}
              subtitle="2022 Held-Out Test Evaluation (N=36 observations)"
              sourceNote="Ground Truth: 2022 NCRB Historical Panel (Threshold: 367 cases)"
              height="260px"
            >
              {activeConfusionMatrix ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '6px', textAlign: 'center', maxWidth: '420px', margin: '0 auto', width: '100%' }}>
                    {/* Header Row */}
                    <div />
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', padding: '4px' }}>
                      PRED LOW (&lt;367)
                    </div>
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)', padding: '4px' }}>
                      PRED HIGH (≥367)
                    </div>

                    {/* Actual Low Row */}
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                      ACTUAL LOW
                    </div>
                    <div
                      style={{
                        backgroundColor: 'rgba(133, 162, 137, 0.18)',
                        border: '1px solid var(--color-sage-deep)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-3)',
                      }}
                    >
                      <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-sage-light)' }}>TRUE NEGATIVE (TN)</div>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)' }}>
                        {activeConfusionMatrix.True_Negative_TN}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>Correct Low-Vol</div>
                    </div>
                    <div
                      style={{
                        backgroundColor: activeConfusionMatrix.False_Positive_FP > 0 ? 'rgba(216, 165, 99, 0.2)' : 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-3)',
                      }}
                    >
                      <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>FALSE POSITIVE (FP)</div>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: activeConfusionMatrix.False_Positive_FP > 0 ? 'var(--status-warning)' : 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {activeConfusionMatrix.False_Positive_FP}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>Type I Error</div>
                    </div>

                    {/* Actual High Row */}
                    <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--color-sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                      ACTUAL HIGH
                    </div>
                    <div
                      style={{
                        backgroundColor: activeConfusionMatrix.False_Negative_FN > 0 ? 'rgba(224, 112, 112, 0.18)' : 'rgba(255, 255, 255, 0.02)',
                        border: activeConfusionMatrix.False_Negative_FN > 0 ? '1px solid var(--status-danger)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-3)',
                      }}
                    >
                      <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--status-danger)' }}>FALSE NEGATIVE (FN)</div>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: activeConfusionMatrix.False_Negative_FN > 0 ? 'var(--status-danger)' : 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                        {activeConfusionMatrix.False_Negative_FN}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>Type II Error</div>
                    </div>
                    <div
                      style={{
                        backgroundColor: 'rgba(133, 162, 137, 0.25)',
                        border: '1px solid var(--color-sage-light)',
                        borderRadius: 'var(--radius-sm)',
                        padding: 'var(--space-3)',
                      }}
                    >
                      <div className="tech-label" style={{ fontSize: '0.625rem', color: 'var(--color-sage-light)' }}>TRUE POSITIVE (TP)</div>
                      <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-sage-light)', fontFamily: 'var(--font-mono)' }}>
                        {activeConfusionMatrix.True_Positive_TP}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: 'var(--text-dim)' }}>Correct High-Vol</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-3)', fontSize: '0.6875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    <span>Total Test Obs: <strong>{activeConfusionMatrix.Total_Test_Obs}</strong></span>
                    <span>Actual High: <strong>{activeConfusionMatrix.True_Positive_TP + activeConfusionMatrix.False_Negative_FN}</strong></span>
                    <span>Actual Low: <strong>{activeConfusionMatrix.True_Negative_TN + activeConfusionMatrix.False_Positive_FP}</strong></span>
                  </div>
                </div>
              ) : (
                <EmptyState description="No confusion matrix available for selected model." />
              )}
            </ChartContainer>

            {/* 2. Feature Importance Visualizer */}
            <ChartContainer
              category="FEATURE IMPORTANCE"
              title="Fitted Model Feature Importance"
              subtitle="Decision Tree Gini Importance vs Random Forest MDI"
              sourceNote="Feature importance reflects how the fitted model uses the feature; it does not imply causal importance."
              height="260px"
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0' }}>
                {featureImportanceList.map((item) => {
                  const dtPct = (item.Decision_Tree_Importance * 100).toFixed(1);
                  const rfPct = (item.Random_Forest_Importance * 100).toFixed(1);
                  const isDominant = item.Feature === 'log_lag_1';

                  return (
                    <div key={item.Feature} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: isDominant ? 'var(--color-sage-light)' : 'var(--text-secondary)', fontWeight: isDominant ? 600 : 400 }}>
                          {item.Feature}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>
                          DT: <strong style={{ color: 'var(--color-sage-light)' }}>{dtPct}%</strong> | RF: <strong style={{ color: 'var(--color-mauve-dusty)' }}>{rfPct}%</strong>
                        </span>
                      </div>
                      {/* Stacked / Overlaid progress bar */}
                      <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.04)', borderRadius: '4px', overflow: 'hidden', display: 'flex', gap: '2px' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${item.Decision_Tree_Importance * 100}%`,
                            backgroundColor: 'var(--color-sage-light)',
                            borderRadius: '2px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                        <div
                          style={{
                            height: '100%',
                            width: `${item.Random_Forest_Importance * 100}%`,
                            backgroundColor: 'var(--color-mauve-dusty)',
                            borderRadius: '2px',
                            opacity: 0.6,
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)', fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-sage-light)', borderRadius: '2px' }} />
                    <span>Decision Tree Importance</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--color-mauve-dusty)', borderRadius: '2px' }} />
                    <span>Random Forest Importance</span>
                  </div>
                </div>
              </div>
            </ChartContainer>
          </div>
        </div>
      )}

      {/* 6. REGRESSION SECTION */}
      {(activeTab === 'all' || activeTab === 'regression') && (
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            <div>
              <div className="tech-label" style={{ fontSize: '0.6875rem' }}>
                PREDICTIVE REGRESSION • STAGES 7 & 14 BENCHMARK
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
                Candidate Regression Leaderboard & Prediction Diagnostics ({regModels.length} Models Exposed by API)
              </h3>
            </div>
            <StatusBadge variant="success">Selected Best: Log-Linear OLS (R² = 0.9000, MAE = 479.37)</StatusBadge>
          </div>

          {/* Regression Leaderboard Table */}
          <Panel variant="elevated" style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  Candidate Model Evaluation on Held-Out 2022 Panel ({regModels.length} Models Exposed by API)
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Models trained strictly on 2020–2021 panel observations (N=70) and evaluated on 2022 held-out out-of-time data.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StatusDot variant="success" />
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Selected Best: Log-Linear OLS
                </span>
              </div>
            </div>

            <DataTable
              columns={regressionColumns}
              data={regModels}
              rowKey="model_name"
              selectedRowKey={selectedRegressionModel}
              onRowClick={(row) => setSelectedRegressionModel(row.model_name)}
            />

            <div style={{ marginTop: 'var(--space-3)', fontSize: '0.6875rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
              * Methodological Note: Log-Linear OLS (R² = 0.9000, MAE = 479.37 cases) outperforms raw Linear OLS (R² = 0.7840, MAE = 776.08 cases) and Ridge regularized models by stabilizing severe cross-state heteroscedasticity across the 3 orders of magnitude in State/UT case counts.
            </div>
          </Panel>

          {/* Actual vs Predicted Scatter Visualizer + Interactive Model Selector */}
          <ChartContainer
            category="ACTUAL VS PREDICTED DIAGNOSTIC"
            title="State/UT Cybercrime Volume Predictions (2022 Held-Out Panel)"
            subtitle="Comparing 2022 Observed Registration vs Model Fitted Trajectory (N=36)"
            sourceNote="Identity Line (y=x) indicates perfect prediction. Log-transformed display for scale legibility."
            height="380px"
            controls={
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>MODEL:</span>
                <select
                  value={predictionModelKey}
                  onChange={(e) => setPredictionModelKey(e.target.value)}
                  style={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '4px 8px',
                    fontSize: '0.6875rem',
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  <option value="pred_log_linear">Log-Linear OLS (R² = 0.9000)</option>
                  <option value="pred_naive_lag1">Naive Persistent Lag-1 (R² = 0.8625)</option>
                  <option value="pred_linear_raw">Linear OLS Raw (R² = 0.7840)</option>
                  <option value="pred_random_forest">Random Forest Regressor (R² = 0.8118)</option>
                </select>
              </div>
            }
          >
            <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Responsive SVG Scatter Plot */}
              <div style={{ width: '100%', height: '300px', position: 'relative' }}>
                <svg
                  viewBox="0 0 700 300"
                  style={{ width: '100%', height: '100%', overflow: 'visible' }}
                >
                  {/* Grid Lines */}
                  <line x1="60" y1="20" x2="60" y2="260" stroke="var(--border-subtle)" strokeWidth="1" />
                  <line x1="60" y1="260" x2="680" y2="260" stroke="var(--border-subtle)" strokeWidth="1" />
                  
                  {/* Grid horizontal ticks */}
                  {[0, 1, 2, 3, 4].map((tick) => {
                    const y = 260 - tick * 60;
                    const val = Math.pow(10, tick);
                    return (
                      <g key={tick}>
                        <line x1="55" y1={y} x2="680" y2={y} stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
                        <text x="50" y={y + 4} fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">
                          {val >= 1000 ? `${val / 1000}k` : val}
                        </text>
                      </g>
                    );
                  })}

                  {/* Grid vertical ticks */}
                  {[0, 1, 2, 3, 4].map((tick) => {
                    const x = 60 + tick * 155;
                    const val = Math.pow(10, tick);
                    return (
                      <g key={tick}>
                        <line x1={x} y1="20" x2={x} y2="265" stroke="rgba(255, 255, 255, 0.04)" strokeDasharray="3 3" />
                        <text x={x} y="280" fill="var(--text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                          {val >= 1000 ? `${val / 1000}k` : val}
                        </text>
                      </g>
                    );
                  })}

                  {/* 45 Degree Identity Line (y = x) */}
                  <line
                    x1="60"
                    y1="260"
                    x2="680"
                    y2="20"
                    stroke="var(--text-dim)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.5"
                  />
                  <text x="650" y="40" fill="var(--text-muted)" fontSize="9" fontFamily="var(--font-mono)">
                    Ideal Fit (y = x)
                  </text>

                  {/* Axis Labels */}
                  <text x="370" y="295" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">
                    ACTUAL 2022 REGISTERED CASES (LOG SCALE)
                  </text>
                  <text x="20" y="140" fill="var(--text-muted)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle" transform="rotate(-90 20 140)">
                    PREDICTED 2022 CASES
                  </text>

                  {/* Scatter Data Points */}
                  {actualVsPredicted.map((item) => {
                    const actual = Math.max(1, item.actual_2022);
                    const pred = Math.max(1, item[predModelConfig.predKey]);
                    
                    // Log-scaled mapping to [60, 680] and [260, 20]
                    const logActual = Math.log10(actual);
                    const logPred = Math.log10(pred);
                    const maxLog = 4.2; // ~15,000 cases

                    const cx = 60 + (logActual / maxLog) * 620;
                    const cy = 260 - (logPred / maxLog) * 240;

                    const isHovered = hoveredScatterPoint?.state_name === item.state_name;
                    const isMajor = actual >= 2000;

                    return (
                      <g
                        key={item.state_name}
                        onMouseEnter={() => setHoveredScatterPoint(item)}
                        onMouseLeave={() => setHoveredScatterPoint(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isHovered ? 7 : isMajor ? 5 : 4}
                          fill={isHovered ? 'var(--color-sage-light)' : predModelConfig.color}
                          fillOpacity={isHovered ? 1 : 0.8}
                          stroke={isHovered ? '#ffffff' : 'var(--bg-surface)'}
                          strokeWidth={isHovered ? 2 : 1}
                          style={{ transition: 'all 0.2s ease' }}
                        />
                        {/* Callout labels for top volume states */}
                        {(isMajor || isHovered) && (
                          <text
                            x={cx + 8}
                            y={cy + 3}
                            fill={isHovered ? 'var(--text-primary)' : 'var(--text-muted)'}
                            fontSize={isHovered ? '11' : '9'}
                            fontFamily="var(--font-mono)"
                            fontWeight={isHovered ? '700' : '500'}
                          >
                            {item.state_name.replace(' and ', ' & ')}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Floating Tooltip for Hovered Point */}
                {hoveredScatterPoint && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      backgroundColor: 'rgba(14, 19, 16, 0.95)',
                      border: '1px solid var(--color-sage-light)',
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-3)',
                      boxShadow: 'var(--shadow-lg)',
                      fontSize: 'var(--text-xs)',
                      fontFamily: 'var(--font-mono)',
                      zIndex: 10,
                      minWidth: '220px',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--color-sage-light)', marginBottom: '4px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '2px' }}>
                      {hoveredScatterPoint.state_name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Actual 2022:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{hoveredScatterPoint.actual_2022.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Predicted:</span>
                      <strong style={{ color: predModelConfig.color }}>
                        {Math.round(hoveredScatterPoint[predModelConfig.predKey]).toLocaleString()}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Residual Error:</span>
                      <strong style={{ color: hoveredScatterPoint[predModelConfig.errKey] >= 0 ? 'var(--color-sage-light)' : 'var(--status-danger)' }}>
                        {hoveredScatterPoint[predModelConfig.errKey] >= 0 ? `+${hoveredScatterPoint[predModelConfig.errKey].toLocaleString()}` : hoveredScatterPoint[predModelConfig.errKey].toLocaleString()}
                      </strong>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ChartContainer>

          {/* State Predictions Data Table */}
          <Panel variant="elevated" style={{ marginTop: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                  State/UT 2022 Predictions & Residual Errors ({predModelConfig.label})
                </h4>
                <p style={{ margin: '2px 0 0 0', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  Detailed breakdown across all 36 States and Union Territories for the 2022 evaluation window.
                </p>
              </div>

              {/* State Search Input */}
              <div style={{ position: 'relative', width: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  placeholder="Filter state/UT..."
                  value={stateSearchQuery}
                  onChange={(e) => setStateSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 12px 6px 30px',
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--text-xs)',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <DataTable
              columns={statePredictionColumns}
              data={filteredPredictions}
              rowKey="state_name"
              emptyMessage="No matching State/UT found in predictions."
            />
          </Panel>
        </div>
      )}

      {/* 7. METHODOLOGICAL FOUNDATIONS & LIMITATIONS */}
      <div style={{ marginTop: 'var(--space-8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-4)' }}>
          <Scale size={18} style={{ color: 'var(--color-sage-light)' }} />
          <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--text-primary)' }}>
            Methodological Architecture & Academic Boundaries
          </h3>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 'var(--space-5)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {/* Card 1: Chronological Split */}
          <Panel variant="elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <Clock size={16} style={{ color: 'var(--color-sage-light)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Why a Chronological Split?
              </h4>
            </div>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--space-3) 0' }}>
              Standard random K-Fold cross-validation suffers from <strong>severe temporal look-ahead leakage</strong> in time-series panel data because future observations leak into training folds.
            </p>
            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.6875rem', fontFamily: 'var(--font-mono)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>EVALUATION PARTITION:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-sage-light)' }}>
                <span>Train: 2020–2021 (N=70)</span>
                <ArrowRight size={12} />
                <span style={{ color: 'var(--color-mauve-dusty)' }}>Test: 2022 (N=36 Held-Out)</span>
              </div>
            </div>
          </Panel>

          {/* Card 2: Leakage Safeguards */}
          <Panel variant="elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--color-sage-light)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Leakage Safeguards Audit Checklist
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusDot variant="success" />
                <span>Historical lag features only ($t-1$, $t-2$)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusDot variant="success" />
                <span>No contemporaneous 2022 target information</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusDot variant="success" />
                <span>Classification threshold ($367.0$) derived from training median</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <StatusDot variant="success" />
                <span>2022 retained as an untouched held-out evaluation set</span>
              </div>
            </div>
          </Panel>

          {/* Card 3: Six Core Academic Limitations */}
          <Panel variant="elevated">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--space-2)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--status-warning)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                Core Limitations & Interpretation Boundary
              </h4>
            </div>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', fontSize: '0.6875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <li><strong>Administrative Volume:</strong> NCRB figures reflect reported FIR registrations, not total underlying crime incidence.</li>
              <li><strong>Non-Causality:</strong> High $R^2$ ($0.90$) and classification accuracy ($97.2\%$) reflect stable cross-state scale hierarchy, not causal determinants.</li>
              <li><strong>Single Out-of-Time Period:</strong> Evaluation is conducted across a single held-out test year ($2022$).</li>
              <li><strong>No Operational Risk Scoring:</strong> Models must not be used for predictive policing or individual profiling.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </PageContainer>
  );
};

export default ModelsPage;
