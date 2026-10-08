/**
 * Project Constants & Navigation Configuration
 * Cyber Crime Analytics for National Security
 */

export const PROJECT_METADATA = {
  title: 'Cyber Crime Analytics',
  subtitle: 'National Security Intelligence Lab',
  dataset: 'NCRB Crime in India (2023) & Historical Panel (2018–2022)',
  verifiedStatus: 'Stages 1–18 Audited & Frozen',
  academicUnit: '36 Indian States & UTs (N = 36)',
  authoritativeTotal: '86,420 Cases',
};

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', path: '/', stage: 'Stage 19 (Foundation) / Stage 21 (Exec)' },
  { id: 'explore', label: 'Explore', path: '/explore', stage: 'Stage 22 — Geographic & Crime Explorer' },
  { id: 'trends', label: 'Trends', path: '/trends', stage: 'Stage 23 — Historical Analytics' },
  { id: 'models', label: 'Models', path: '/models', stage: 'Stage 24 — ML & Prediction Analytics' },
  { id: 'patterns', label: 'Patterns', path: '/patterns', stage: 'Stage 25 — Association Rules & Clustering' },
  { id: 'anomalies', label: 'Anomalies', path: '/anomalies', stage: 'Stage 26 — Anomaly & Outlier UI' },
  { id: 'methodology', label: 'Methodology', path: '/methodology', stage: 'Stage 27 — Methodology & Data Explorer' },
];
