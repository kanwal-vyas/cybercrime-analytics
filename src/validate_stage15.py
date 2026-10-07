"""
Validation Script: Stage 15 — Advanced Clustering & Cluster Validation
Project: Cyber Crime Analytics for National Security

Validates:
1. Dataset & Feature Space Integrity (N=36, 4 proportional composition features, zero volume in distance space)
2. Standardization & Scaling Integrity (StandardScaler properties, finite bounds)
3. Algorithm Execution & Output Dimensions (KMeans, Agglomerative, GMM, DBSCAN across K in [2, 8])
4. Internal Validation Metrics (Silhouette in [-1, 1], Calinski-Harabasz >= 0, Davies-Bouldin >= 0, finite AIC/BIC)
5. Partition Agreement Metrics (ARI in [-1, 1], NMI in [0, 1])
6. Sensitivity Analysis Integrity (N=36 primary retained, N=34 reduced distinct without mutation)
7. Table & Figure Deliverables (7 CSV tables, Figures 50-55, notebook)
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd

# Add repository root to path
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from src.advanced_clustering import (
    CLUSTERING_FEATURES,
    load_clustering_dataset,
    run_comprehensive_validation,
    run_stage15_clustering_suite
)


def validate_stage15() -> bool:
    print("=" * 70)
    print("RUNNING STAGE 15 VALIDATION: Advanced Clustering & Cluster Validation")
    print("=" * 70)
    
    passed_tests = 0
    total_tests = 0
    
    # -------------------------------------------------------------
    # 1. Dataset & Feature Integrity
    # -------------------------------------------------------------
    total_tests += 1
    raw_df, X_scaled, scaler = load_clustering_dataset('data/processed/master_state_2023.csv')
    assert len(raw_df) == 36, f"Expected N=36 jurisdictions, got {len(raw_df)}"
    assert raw_df['state_name'].nunique() == 36, "Duplicate jurisdictions detected in primary dataset"
    assert set(CLUSTERING_FEATURES).issubset(raw_df.columns), "Missing primary clustering features"
    assert raw_df[CLUSTERING_FEATURES].isnull().sum().sum() == 0, "Null values detected in feature matrix"
    
    # Check that total_cases is NOT in the scaled feature matrix
    assert X_scaled.shape == (36, 4), f"Expected X_scaled shape (36, 4), got {X_scaled.shape}"
    assert not np.isnan(X_scaled).any(), "NaN found in scaled matrix"
    assert not np.isinf(X_scaled).any(), "Inf found in scaled matrix"
    
    # Check standardization properties (mean ~ 0, std ~ 1)
    np.testing.assert_allclose(X_scaled.mean(axis=0), 0.0, atol=1e-7)
    np.testing.assert_allclose(X_scaled.std(axis=0), 1.0, atol=1e-7)
    print(f"[{passed_tests+1}] Dataset & Feature Integrity (N=36, 4 proportional features, proper scaling): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 2. Comprehensive Multi-K Validation Matrix
    # -------------------------------------------------------------
    total_tests += 1
    val_df = run_comprehensive_validation(X_scaled)
    assert len(val_df) > 0, "Validation dataframe is empty"
    assert set(['algorithm', 'k', 'silhouette', 'calinski_harabasz', 'davies_bouldin', 'aic', 'bic', 'n_clusters', 'n_noise']).issubset(val_df.columns)
    
    # Check metric bounds
    valid_sil = val_df['silhouette'].dropna()
    assert (valid_sil >= -1.0).all() and (valid_sil <= 1.0).all(), "Silhouette out of range [-1, 1]"
    valid_ch = val_df['calinski_harabasz'].dropna()
    assert (valid_ch >= 0.0).all(), "Calinski-Harabasz score must be >= 0"
    valid_db = val_df['davies_bouldin'].dropna()
    assert (valid_db >= 0.0).all(), "Davies-Bouldin score must be >= 0"
    
    # Check GMM AIC/BIC
    gmm_rows = val_df[val_df['algorithm'] == 'Gaussian Mixture (GMM)']
    assert not gmm_rows['aic'].isnull().any(), "GMM AIC contains nulls"
    assert not gmm_rows['bic'].isnull().any(), "GMM BIC contains nulls"
    print(f"[{passed_tests+1}] Multi-Criteria Validation Matrix (Silhouette, CH, DB, AIC/BIC): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 3. Reference K=4 Evaluation & Frozen Stage 6 Consistency
    # -------------------------------------------------------------
    total_tests += 1
    val_df, algo_comp_df, assign_df, stability_df, profiles_df, agreement_df, sensitivity_df = run_stage15_clustering_suite(
        raw_df, X_scaled
    )
    
    # Explicit Baseline Reproduction against frozen Stage 6 outputs
    stage6_assign_path = REPO_ROOT / 'outputs' / 'tables' / 'cluster_assignments_2023.csv'
    assert stage6_assign_path.exists(), "Frozen Stage 6 cluster_assignments_2023.csv missing"
    stage6_df = pd.read_csv(stage6_assign_path).sort_values('state_name').reset_index(drop=True)
    assign_sorted = assign_df.sort_values('state_name').reset_index(drop=True)
    
    from sklearn.metrics import adjusted_rand_score, normalized_mutual_info_score
    ari_base = adjusted_rand_score(stage6_df['cluster_id'], assign_sorted['stage6_kmeans_cluster'])
    nmi_base = normalized_mutual_info_score(stage6_df['cluster_id'], assign_sorted['stage6_kmeans_cluster'])
    assert ari_base == 1.0, f"Expected ARI=1.0 vs Stage 6 baseline, got {ari_base}"
    assert nmi_base == 1.0, f"Expected NMI=1.0 vs Stage 6 baseline, got {nmi_base}"
    
    # Cluster-size multiset equality
    s6_sizes = sorted(stage6_df['cluster_id'].value_counts().values.tolist())
    s15_sizes = sorted(assign_sorted['stage6_kmeans_cluster'].value_counts().values.tolist())
    assert s6_sizes == s15_sizes == [2, 7, 12, 15], f"Cluster size multiset mismatch: S6={s6_sizes}, S15={s15_sizes}"
    
    # Stage 6 baseline K=4 silhouette check (0.3497)
    stage6_row = algo_comp_df[algo_comp_df['Algorithm'] == 'K-Means (Stage 6 Reference)']
    assert len(stage6_row) == 1, "K-Means reference row missing"
    np.testing.assert_allclose(stage6_row['Silhouette'].values[0], 0.3497, atol=1e-3)
    
    # Check agreement bounds (ARI in [-1, 1], NMI in [0, 1])
    assert (agreement_df['Adjusted_Rand_Index_ARI'] >= -1.0).all() and (agreement_df['Adjusted_Rand_Index_ARI'] <= 1.0).all(), "ARI out of bounds"
    assert (agreement_df['Normalized_Mutual_Info_NMI'] >= 0.0).all() and (agreement_df['Normalized_Mutual_Info_NMI'] <= 1.0).all(), "NMI out of bounds"
    
    # Check profile shapes
    assert len(profiles_df) == 4, f"Expected 4 cluster profiles, got {len(profiles_df)}"
    assert profiles_df['n_states'].sum() == 36, "Cluster profiles do not sum to 36 states"
    print(f"[{passed_tests+1}] Preferred K=4 Evaluation & Frozen Stage 6 Consistency (ARI=1.0, NMI=1.0, multiset [2,7,12,15]): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 4. Jurisdiction Stability & Tiny-Denominator Sensitivity
    # -------------------------------------------------------------
    total_tests += 1
    assert len(stability_df) == 36, f"Expected 36 stability records, got {len(stability_df)}"
    assert 'stability_status' in stability_df.columns, "Missing stability_status column"
    
    # Sensitivity analysis: excluding extreme tiny jurisdictions (cases <= 10 -> N=34)
    assert len(sensitivity_df) == 2, f"Expected 2 sensitivity rows, got {len(sensitivity_df)}"
    assert (sensitivity_df['Jurisdiction_Count_N'].isin([36, 34])).all(), "Unexpected jurisdiction counts in sensitivity analysis"
    # Verify raw_df was not mutated
    assert len(raw_df) == 36, "raw_df was mutated during sensitivity analysis!"
    print(f"[{passed_tests+1}] Jurisdiction Stability & Non-Destructive Sensitivity Analysis: PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 5. Required Output Tables (7 CSVs)
    # -------------------------------------------------------------
    total_tests += 1
    required_tables = [
        'stage15_cluster_validation.csv',
        'stage15_algorithm_comparison.csv',
        'stage15_cluster_assignments.csv',
        'stage15_cluster_profiles.csv',
        'stage15_cluster_agreement.csv',
        'stage15_cluster_stability.csv',
        'stage15_tiny_denominator_sensitivity.csv'
    ]
    for tbl in required_tables:
        p = REPO_ROOT / 'outputs' / 'tables' / tbl
        assert p.exists(), f"Missing required table: {tbl}"
        df_tmp = pd.read_csv(p)
        assert len(df_tmp) > 0, f"Table {tbl} is empty"
    print(f"[{passed_tests+1}] Required Output Tables (7 CSVs present and non-empty): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 6. Required Output Figures (Figures 50-55)
    # -------------------------------------------------------------
    total_tests += 1
    required_figs = [
        '50_cluster_validation_comparison_across_k.png',
        '51_algorithm_comparison_preferred_k.png',
        '52_pca_cluster_visualization.png',
        '53_cluster_profile_comparison.png',
        '54_stage6_vs_alternative_clustering_agreement.png',
        '55_tiny_denominator_sensitivity_analysis.png'
    ]
    for fig in required_figs:
        p = REPO_ROOT / 'outputs' / 'figures' / fig
        assert p.exists(), f"Missing required figure: {fig}"
        assert p.stat().st_size > 5000, f"Figure {fig} file size unusually small (<5KB)"
    print(f"[{passed_tests+1}] Required Output Figures (Figures 50-55 present and valid): PASSED")
    passed_tests += 1
    
    # -------------------------------------------------------------
    # 7. Notebook Deliverable Check
    # -------------------------------------------------------------
    total_tests += 1
    nb_path = REPO_ROOT / 'notebooks' / '13_advanced_clustering.ipynb'
    assert nb_path.exists(), "Missing notebooks/13_advanced_clustering.ipynb"
    assert nb_path.stat().st_size > 1000, "notebooks/13_advanced_clustering.ipynb is empty or too small"
    print(f"[{passed_tests+1}] Notebook Deliverable (notebooks/13_advanced_clustering.ipynb): PASSED")
    passed_tests += 1
    
    print("=" * 70)
    print(f"STAGE 15 VALIDATION SUMMARY: {passed_tests}/{total_tests} SUCCEEDED (100.0%)")
    print("=" * 70)
    return True


if __name__ == '__main__':
    success = validate_stage15()
    if not success:
        sys.exit(1)
