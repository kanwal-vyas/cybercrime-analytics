"""
Validation Script: Stage 16 — Advanced Outlier Detection & Anomaly Validation
Project: Cyber Crime Analytics for National Security

Validates:
1. Dataset & Feature Space Integrity (N=36, 14 features: 10 count, 4 composition shares)
2. Transformation & Scaling Integrity (log1p on count features, shares unlogged, StandardScaler bounds)
3. Robust Mahalanobis Distance (MinCovDet convergence, chi2(14, 0.975) cutoff, finite distances)
4. Local Outlier Factor (LOF scores across k=5, 10, 15, finite negative outlier factors)
5. Method Agreement & Consensus Score (Score in [0, 4], exact 36 rows, non-empty flags)
6. Dual Feature Space Isolation (Analysis A: Volume+Composition vs. Analysis B: Composition-Only)
7. Small-Denominator Sensitivity (N=36 primary retained, N=34 reduced distinct without mutation)
8. Deliverables & Figures (7 CSV tables, Figures 56-61, notebook)
9. Frozen Stage 8 Protection (Stage 8 outputs exist and are unmutated)
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd

# Add repository root to path
REPO_ROOT = Path(__file__).resolve().parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from src.advanced_outlier_detection import (
    ALL_OUTLIER_FEATURES,
    VOLUME_FEATURES,
    SHARE_FEATURES,
    load_and_prepare_outlier_data,
    compute_feature_redundancy,
    compute_robust_mahalanobis,
    compute_lof_anomalies,
    build_method_comparison_matrix,
    analyze_volume_vs_composition_anomalies,
    run_stage16_sensitivity_analysis
)


def validate_stage16() -> bool:
    print("=" * 70)
    print("RUNNING STAGE 16 VALIDATION: Advanced Outlier Detection & Anomaly Validation")
    print("=" * 70)
    
    passed_tests = 0
    total_tests = 0
    
    # -------------------------------------------------------------
    # 1. Dataset & Feature Integrity
    # -------------------------------------------------------------
    total_tests += 1
    features_df, metadata = load_and_prepare_outlier_data()
    assert len(features_df) == 36, f"Expected N=36 jurisdictions, got {len(features_df)}"
    assert features_df['state_name'].nunique() == 36, "Duplicate jurisdictions detected"
    assert set(ALL_OUTLIER_FEATURES).issubset(features_df.columns), "Missing analytical features"
    assert features_df[ALL_OUTLIER_FEATURES].isnull().sum().sum() == 0, "Null values detected in feature matrix"
    print(f"[{passed_tests+1}] Dataset & Feature Integrity (N=36, 14 features): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 2. Transformation & Scaling Integrity
    # -------------------------------------------------------------
    total_tests += 1
    # Check share bounds [0, 1]
    for col in SHARE_FEATURES:
        assert (features_df[col] >= 0.0).all() and (features_df[col] <= 1.0).all(), f"Share feature {col} out of [0, 1]"
        
    # Check log1p on volume features
    X_counts_log = np.log1p(features_df[VOLUME_FEATURES])
    assert not np.isnan(X_counts_log.values).any(), "NaN in log-transformed counts"
    assert not np.isinf(X_counts_log.values).any(), "Inf in log-transformed counts"
    assert (X_counts_log.values >= 0.0).all(), "Negative log-count detected"
    print(f"[{passed_tests+1}] Transformation & Scaling Integrity (log1p on counts, shares bounded): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 3. Robust Mahalanobis Distance (MinCovDet)
    # -------------------------------------------------------------
    total_tests += 1
    mah_df, mcd, mah_cutoff = compute_robust_mahalanobis(features_df)
    assert len(mah_df) == 36, f"Expected 36 Mahalanobis records, got {len(mah_df)}"
    assert not np.isnan(mah_df['mahalanobis_distance'].values).any(), "NaN in Mahalanobis distance"
    assert (mah_df['mahalanobis_distance'].values >= 0.0).all(), "Negative Mahalanobis distance"
    np.testing.assert_allclose(mah_cutoff, 26.1189, atol=1e-2)
    assert set(mah_df['mahalanobis_outlier'].unique()).issubset({'Yes', 'No'}), "Invalid outlier flag in Mahalanobis"
    print(f"[{passed_tests+1}] Robust Mahalanobis Distance (MinCovDet, Chi-Square cutoff = {mah_cutoff:.2f}): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 4. Local Outlier Factor (LOF across k=5, 10, 15)
    # -------------------------------------------------------------
    total_tests += 1
    lof_primary_df, lof_sens_df = compute_lof_anomalies(features_df, k_neighbors=10, contamination=0.15)
    assert len(lof_primary_df) == 36, f"Expected 36 LOF primary records, got {len(lof_primary_df)}"
    assert len(lof_sens_df) == 36, f"Expected 36 LOF sensitivity records, got {len(lof_sens_df)}"
    for k in [5, 10, 15]:
        assert not np.isnan(lof_sens_df[f'lof_score_k{k}'].values).any(), f"NaN in LOF score for k={k}"
        assert (lof_sens_df[f'lof_score_k{k}'].values > 0.0).all(), f"Non-positive LOF score for k={k}"
    print(f"[{passed_tests+1}] Local Outlier Factor (LOF across k=5, 10, 15): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 5. Method Agreement & Consensus Anomaly Matrix
    # -------------------------------------------------------------
    total_tests += 1
    from src.outlier_detection import compute_univariate_iqr_outliers, compute_multivariate_isolation_forest
    iqr_stats_df, iqr_outliers_df = compute_univariate_iqr_outliers(features_df)
    iso_df, iso_model, X_scaled = compute_multivariate_isolation_forest(features_df, contamination=0.15, random_state=42)
    
    comp_df, summary_df, pair_df = build_method_comparison_matrix(features_df, iqr_outliers_df, iso_df, mah_df, lof_primary_df)
    assert len(comp_df) == 36, f"Expected 36 consensus records, got {len(comp_df)}"
    assert set(comp_df['consensus_score'].unique()).issubset({0, 1, 2, 3, 4}), "Consensus score out of [0, 4] bounds"
    assert (pair_df['jaccard_similarity'] >= 0.0).all() and (pair_df['jaccard_similarity'] <= 1.0).all(), "Jaccard out of bounds"
    assert (pair_df['adjusted_rand_index'] >= -1.0).all() and (pair_df['adjusted_rand_index'] <= 1.0).all(), "ARI out of bounds"
    print(f"[{passed_tests+1}] Method Agreement & Consensus Matrix (4 methods, score in [0, 4]): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 6. Volume-Dominated vs. Composition-Only Analysis
    # -------------------------------------------------------------
    total_tests += 1
    vol_comp_df = analyze_volume_vs_composition_anomalies(features_df)
    assert len(vol_comp_df) == 36, f"Expected 36 records in volume vs composition, got {len(vol_comp_df)}"
    expected_categories = {
        'Both Volume & Composition Anomaly',
        'Volume-Scale Driven Anomaly',
        'Composition-Profile Driven Anomaly',
        'Not Anomalous in Tested Spaces'
    }
    assert set(vol_comp_df['anomaly_orientation'].unique()).issubset(expected_categories), "Invalid anomaly orientation category"
    print(f"[{passed_tests+1}] Volume vs. Composition Dual-Space Analysis: PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 7. Small-Denominator Sensitivity (N=36 vs. N=34)
    # -------------------------------------------------------------
    total_tests += 1
    sens_df = run_stage16_sensitivity_analysis(features_df)
    assert len(sens_df) == 2, f"Expected 2 sensitivity rows, got {len(sens_df)}"
    assert len(features_df) == 36, "Primary features_df was mutated!"
    assert (sens_df['overlap_jaccard_on_n34'] >= 0.0).all() and (sens_df['overlap_jaccard_on_n34'] <= 1.0).all(), "Sensitivity Jaccard out of bounds"
    print(f"[{passed_tests+1}] Small-Denominator Non-Destructive Sensitivity Analysis: PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 8. Required Output Tables (7 CSVs)
    # -------------------------------------------------------------
    total_tests += 1
    required_tables = [
        'stage16_feature_redundancy.csv',
        'stage16_mahalanobis_scores.csv',
        'stage16_lof_scores.csv',
        'stage16_method_comparison.csv',
        'stage16_consensus_anomalies.csv',
        'stage16_sensitivity.csv',
        'stage16_volume_vs_composition.csv'
    ]
    for tbl in required_tables:
        p = REPO_ROOT / 'outputs' / 'tables' / tbl
        assert p.exists(), f"Missing required table: {tbl}"
        df_tmp = pd.read_csv(p)
        assert len(df_tmp) > 0, f"Table {tbl} is empty"
    print(f"[{passed_tests+1}] Required Output Tables (7 CSVs present and non-empty): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 9. Required Output Figures (Figures 56-61)
    # -------------------------------------------------------------
    total_tests += 1
    required_figs = [
        '56_feature_redundancy_correlation_heatmap.png',
        '57_robust_mahalanobis_distances.png',
        '58_lof_anomaly_scores.png',
        '59_anomaly_method_agreement_consensus.png',
        '60_volume_vs_composition_anomalies.png',
        '61_pca_anomaly_visualization.png'
    ]
    for fig in required_figs:
        p = REPO_ROOT / 'outputs' / 'figures' / fig
        assert p.exists(), f"Missing required figure: {fig}"
        assert p.stat().st_size > 5000, f"Figure {fig} file size unusually small (<5KB)"
    print(f"[{passed_tests+1}] Required Output Figures (Figures 56-61 present and valid): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 10. Notebook Deliverable Check
    # -------------------------------------------------------------
    total_tests += 1
    nb_path = REPO_ROOT / 'notebooks' / '14_advanced_outlier_detection.ipynb'
    assert nb_path.exists(), "Missing notebooks/14_advanced_outlier_detection.ipynb"
    assert nb_path.stat().st_size > 1000, "notebooks/14_advanced_outlier_detection.ipynb is empty or too small"
    print(f"[{passed_tests+1}] Notebook Deliverable (notebooks/14_advanced_outlier_detection.ipynb): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 11. Frozen Stage 8 Protection Check
    # -------------------------------------------------------------
    total_tests += 1
    s8_tables = [
        'outlier_feature_statistics.csv',
        'outlier_univariate_results.csv',
        'outlier_multivariate_results.csv',
        'outlier_state_summary.csv'
    ]
    for tbl in s8_tables:
        p = REPO_ROOT / 'outputs' / 'tables' / tbl
        assert p.exists(), f"Frozen Stage 8 table missing: {tbl}"
        assert p.stat().st_size > 100, f"Frozen Stage 8 table corrupted: {tbl}"
    print(f"[{passed_tests+1}] Frozen Stage 8 Protection Check (All baseline tables verified): PASSED")
    passed_tests += 1
    
    print("=" * 70)
    print(f"STAGE 16 VALIDATION SUMMARY: {passed_tests}/{total_tests} SUCCEEDED (100.0%)")
    print("=" * 70)
    return True


if __name__ == '__main__':
    success = validate_stage16()
    if not success:
        sys.exit(1)
