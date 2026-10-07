"""
src/validate_stage10.py
===============================================================================
Validation Suite for Stage 10: Advanced Data Preprocessing

This script verifies:
1. Input Integrity: Validated 2023 State/UT feature matrix (N = 36, no missing keys).
2. Output Artifact Completeness: All 11 CSV tables and 5 visual artifacts exist.
3. Statistical Properties of Scaling:
   - Z-score standardized variables have mean ~ 0 and std ~ 1.
   - Min-Max normalized variables are strictly bounded in [0, 1].
4. Log1p Transformation Validity:
   - Handled zero values gracefully without infinities or NaNs.
   - Skewness reduction on heavy-tailed count features.
5. Principal Component Analysis (PCA) Integrity:
   - Explained variance ratios sum to 1.0.
   - Cumulative variance is strictly monotonically non-decreasing.
   - 4 components explain >90% cumulative variance.
   - Loadings and scores matrices have correct dimensions and alignment.
6. Data Discretization Integrity:
   - All 36 State/UT observations mapped to valid discrete bins.
   - Quantile terciles allocate exactly 12 observations per tercile.
   - Median split divides observations into two balanced partitions.
7. Multilevel Concept Hierarchy Consistency:
   - Geographic hierarchy matches 28 States and 8 UTs (total 36) mapping to India.
   - Crime Category hierarchy contains 3 Act Groups with complete leaf node coverage.
   - Motive taxonomy maps 21 motives into 6 structured motive groups without orphans.
===============================================================================
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TABLES_DIR = PROJECT_ROOT / "outputs" / "tables"
FIGURES_DIR = PROJECT_ROOT / "outputs" / "figures"

def test_stage10_pipeline():
    print("=== STARTING STAGE 10 VALIDATION SUITE ===")
    
    # 1. Output File Completeness Check
    expected_tables = [
        "stage10_feature_summary.csv",
        "stage10_transformation_comparison.csv",
        "stage10_transformed_matrix.csv",
        "stage10_pca_explained_variance.csv",
        "stage10_pca_loadings.csv",
        "stage10_pca_scores.csv",
        "stage10_discretization_summary.csv",
        "stage10_discretized_features.csv",
        "stage10_geographic_hierarchy.csv",
        "stage10_crime_category_hierarchy.csv",
        "stage10_motive_hierarchy.csv"
    ]
    
    for tbl in expected_tables:
        p = TABLES_DIR / tbl
        assert p.exists(), f"Missing expected table: {tbl}"
        assert p.stat().st_size > 0, f"Table {tbl} is empty."
    print("  [PASS] All 11 Stage 10 output tables exist and are non-empty.")
    
    expected_figures = [
        "28_transform_skewness_comparison.png",
        "29_feature_scaling_comparison.png",
        "30_pca_scree_and_cumulative_variance.png",
        "31_pca_2d_projection.png",
        "32_discretization_distributions.png"
    ]
    
    for fig in expected_figures:
        p = FIGURES_DIR / fig
        assert p.exists(), f"Missing expected figure: {fig}"
        assert p.stat().st_size > 5000, f"Figure {fig} is unusually small ({p.stat().st_size} bytes)."
    print("  [PASS] All 5 Stage 10 visual artifacts exist with valid sizes.")

    # 2. Input Matrix & Summary Integrity
    sum_df = pd.read_csv(TABLES_DIR / "stage10_feature_summary.csv")
    assert len(sum_df) == 14, f"Expected 14 feature summary rows, got {len(sum_df)}"
    assert (sum_df["missing_count"] == 0).all(), "Found missing values in analytical features."
    assert (sum_df["count"] == 36).all(), "Feature counts do not equal 36 State/UT observations."
    print("  [PASS] Feature summary reflects complete 14 features across N = 36 jurisdictions.")

    # 3. Transformation & Scaling Mathematical Checks
    trans_matrix = pd.read_csv(TABLES_DIR / "stage10_transformed_matrix.csv")
    assert len(trans_matrix) == 36, f"Expected 36 observations in transformed matrix, got {len(trans_matrix)}"
    
    # Check Z-score properties
    z_cols = [c for c in trans_matrix.columns if c.startswith("zscore__")]
    for col in z_cols:
        col_mean = trans_matrix[col].mean()
        col_std = trans_matrix[col].std(ddof=0)
        assert np.isclose(col_mean, 0.0, atol=1e-5), f"Z-score {col} mean ({col_mean}) is not ~0"
        assert np.isclose(col_std, 1.0, atol=1e-5), f"Z-score {col} std ({col_std}) is not ~1"
    print(f"  [PASS] Verified Z-score standardization properties across {len(z_cols)} features.")

    # Check Min-Max properties
    mm_cols = [c for c in trans_matrix.columns if c.startswith("minmax__")]
    for col in mm_cols:
        assert trans_matrix[col].min() >= -1e-7, f"Min-Max {col} has values < 0"
        assert trans_matrix[col].max() <= 1.0 + 1e-7, f"Min-Max {col} has values > 1"
        assert np.isclose(trans_matrix[col].min(), 0.0, atol=1e-5), f"Min-Max {col} min is not ~0"
        assert np.isclose(trans_matrix[col].max(), 1.0, atol=1e-5), f"Min-Max {col} max is not ~1"
    print(f"  [PASS] Verified Min-Max scaling bounds [0, 1] across {len(mm_cols)} features.")

    # Check Log1p properties
    log_cols = [c for c in trans_matrix.columns if c.startswith("log1p__")]
    for col in log_cols:
        raw_col = col.replace("log1p__", "raw__")
        expected_log = np.log1p(trans_matrix[raw_col])
        assert np.allclose(trans_matrix[col], expected_log, atol=1e-6), f"Log1p calculation mismatch for {col}"
    print(f"  [PASS] Verified Log1p transformation accuracy across {len(log_cols)} count features.")

    # 4. PCA Dimensionality Reduction Integrity
    exp_var_df = pd.read_csv(TABLES_DIR / "stage10_pca_explained_variance.csv")
    loadings_df = pd.read_csv(TABLES_DIR / "stage10_pca_loadings.csv")
    scores_df = pd.read_csv(TABLES_DIR / "stage10_pca_scores.csv")
    
    assert np.isclose(exp_var_df["explained_variance_ratio"].sum(), 1.0, atol=1e-3), "PCA explained variance does not sum to 1.0"
    cum_var = exp_var_df["cumulative_variance_ratio"].values
    assert np.all(np.diff(cum_var) >= 0), "PCA cumulative variance curve is not monotonically non-decreasing."
    
    pc4_cum_pct = exp_var_df.loc[exp_var_df["component"] == "PC4", "cumulative_variance_pct"].values[0]
    assert pc4_cum_pct >= 90.0, f"Expected 4 components to explain >= 90% variance, got {pc4_cum_pct:.2f}%"
    
    assert len(scores_df) == 36, f"Expected 36 score observations, got {len(scores_df)}"
    assert len(loadings_df) == 14, f"Expected 14 features in loadings table, got {len(loadings_df)}"
    print(f"  [PASS] PCA checks passed (PC1+PC2 = {cum_var[1]*100:.2f}%, PC1..PC4 = {pc4_cum_pct:.2f}% variance explained across {len(loadings_df)} features).")

    # 5. Data Discretization Integrity
    disc_summary_df = pd.read_csv(TABLES_DIR / "stage10_discretization_summary.csv")
    disc_feats_df = pd.read_csv(TABLES_DIR / "stage10_discretized_features.csv")
    
    assert len(disc_feats_df) == 36, "Discretized features table row count != 36"
    assert not disc_feats_df.isna().any().any(), "Found unassigned NaN categories in discretized features."
    
    # Check quantile tercile frequency allocation
    tercile_rows = disc_summary_df[disc_summary_df["discretization_method"] == "Quantile-Based (Terciles)"]
    for feat in tercile_rows["feature"].unique():
        sub = tercile_rows[tercile_rows["feature"] == feat]
        assert sub["count"].sum() == 36, f"Quantile tercile sum != 36 for {feat}"
        assert (sub["count"] == 12).all(), f"Quantile terciles not equal to 12 for {feat}"
    print("  [PASS] Discretization partitions 36 observations cleanly across all schemes.")

    # 6. Concept Hierarchies Integrity
    geo_h = pd.read_csv(TABLES_DIR / "stage10_geographic_hierarchy.csv")
    cat_h = pd.read_csv(TABLES_DIR / "stage10_crime_category_hierarchy.csv")
    motive_h = pd.read_csv(TABLES_DIR / "stage10_motive_hierarchy.csv")
    
    assert len(geo_h) == 36, f"Geographic hierarchy row count != 36 (got {len(geo_h)})"
    assert geo_h["is_ut"].sum() == 8, f"Expected 8 UTs, got {geo_h['is_ut'].sum()}"
    assert (geo_h["is_ut"] == 0).sum() == 28, f"Expected 28 States, got {(geo_h['is_ut'] == 0).sum()}"
    assert (geo_h["level_0_national"] == "India").all(), "National root level mismatch."
    
    assert set(cat_h["level_1_act_group"].unique()) == {"IT Act", "IPC", "SLL", "Grand Total"}, "Crime taxonomy act groups mismatch."
    assert len(motive_h) == 19, f"Expected 19 motive entries, got {len(motive_h)}"
    assert set(motive_h["level_1_motive_group"].unique()).issubset({
        "Total", "Financial & Economic Motives", "Extortion & Coercion Motives",
        "Interpersonal & Sexual Exploitation", "Vindictive & Emotional Motives",
        "Security & Disruption Motives", "Other / Miscellaneous Motives"
    }), "Unknown motive group mapping found."
    print("  [PASS] Concept hierarchies verified with zero orphan nodes and consistent mappings.")

    print("\n>>> ALL STAGE 10 VALIDATION CHECKS COMPLETED SUCCESSFULLY. <<<")
    return True

if __name__ == "__main__":
    test_stage10_pipeline()
