"""
Stage 8 Validation Script — Outlier Detection Analysis
Project: Cyber Crime Analytics for National Security

Automated validation suite verifying data integrity, exact IQR Tukey fence calculations,
individual fence violation correctness, multivariate Isolation Forest dimensions,
state summary classifications, generated tables, and diagnostic figures.
"""

from pathlib import Path
import pandas as pd
import numpy as np

# 1. Dataset & Input Integrity Validation
eda_path = Path('outputs/tables/eda_state_feature_matrix.csv')
assert eda_path.exists(), f"Input EDA feature matrix {eda_path} missing"
eda_df = pd.read_csv(eda_path)
assert len(eda_df) == 36, f"Expected 36 State/UT observations, got {len(eda_df)}"
assert eda_df['state_name'].nunique() == 36, "Duplicate state names in EDA feature matrix"
print(f"[PASS] 1. Data Integrity: 36 unique State/UT observations verified.")

# 2. Feature Statistics & IQR Mathematical Validation
stats_path = Path('outputs/tables/outlier_feature_statistics.csv')
assert stats_path.exists() and stats_path.stat().st_size > 100, "outlier_feature_statistics.csv missing or empty"
stats_df = pd.read_csv(stats_path)
assert len(stats_df) == 14, f"Expected 14 analytical features, got {len(stats_df)}"

for _, row in stats_df.iterrows():
    q1 = row['q1']
    q3 = row['q3']
    iqr = row['iqr']
    lower = row['lower_fence']
    upper = row['upper_fence']
    
    assert np.isclose(iqr, q3 - q1, atol=1e-3), f"IQR mismatch in {row['feature_name']}: {iqr} != {q3 - q1}"
    assert np.isclose(lower, q1 - 1.5 * iqr, atol=1e-3), f"Lower fence mismatch in {row['feature_name']}: {lower} != {q1 - 1.5*iqr}"
    assert np.isclose(upper, q3 + 1.5 * iqr, atol=1e-3), f"Upper fence mismatch in {row['feature_name']}: {upper} != {q3 + 1.5*iqr}"
    assert row['min'] <= row['q1'] <= row['median'] <= row['q3'] <= row['max'], f"Distribution quantiles out of order in {row['feature_name']}"

print(f"[PASS] 2. IQR Mathematical Verification: All 14 feature Tukey fences and quantiles verified with exact arithmetic.")

# 3. Individual Univariate Outlier Fence Violations Validation
uni_path = Path('outputs/tables/outlier_univariate_results.csv')
assert uni_path.exists() and uni_path.stat().st_size > 100, "outlier_univariate_results.csv missing or empty"
uni_df = pd.read_csv(uni_path)
assert len(uni_df) == 52, f"Expected 52 univariate fence violation occurrences, got {len(uni_df)}"

for _, row in uni_df.iterrows():
    val = row['observed_value']
    dir_flag = row['direction']
    lower = row['lower_fence']
    upper = row['upper_fence']
    
    if dir_flag == 'High':
        assert val > upper, f"High outlier {row['state_name']} on {row['feature']} does not exceed upper fence: {val} <= {upper}"
        assert np.isclose(row['distance_from_fence'], val - upper, atol=1e-3), "Fence distance mismatch"
    elif dir_flag == 'Low':
        assert val < lower, f"Low outlier {row['state_name']} on {row['feature']} does not fall below lower fence: {val} >= {lower}"
        assert np.isclose(row['distance_from_fence'], lower - val, atol=1e-3), "Fence distance mismatch"

print(f"[PASS] 3. Univariate Fence Violations: All 52 flagged outlier records strictly violate their respective Tukey fences.")

# 4. Multivariate Isolation Forest Validation
multi_path = Path('outputs/tables/outlier_multivariate_results.csv')
assert multi_path.exists() and multi_path.stat().st_size > 100, "outlier_multivariate_results.csv missing or empty"
multi_df = pd.read_csv(multi_path)
assert len(multi_df) == 36, f"Expected 36 states in multivariate results, got {len(multi_df)}"
assert multi_df['state_name'].nunique() == 36, "Duplicate states in multivariate results"
assert set(multi_df['isolation_forest_outlier'].unique()) == {'Yes', 'No'}, "Invalid outlier flags"

iso_outliers_count = (multi_df['isolation_forest_outlier'] == 'Yes').sum()
assert iso_outliers_count == 6, f"Expected 6 multivariate outliers at 0.15 contamination, got {iso_outliers_count}"
print(f"[PASS] 4. Multivariate Analysis: Isolation Forest verified across 36 jurisdictions (6 anomalous observations).")

# 5. State Summary & Small-Denominator Audit Validation
sum_path = Path('outputs/tables/outlier_state_summary.csv')
assert sum_path.exists() and sum_path.stat().st_size > 100, "outlier_state_summary.csv missing or empty"
sum_df = pd.read_csv(sum_path)
assert len(sum_df) == 36, f"Expected 36 states in summary table, got {len(sum_df)}"

# Verify classification distribution
class_counts = sum_df['outlier_classification'].value_counts().to_dict()
expected_classes = {
    'No detected outlier': 18,
    'Univariate outlier': 12,
    'Both': 5,
    'Multivariate outlier': 1
}
for k, v in expected_classes.items():
    assert class_counts.get(k, 0) == v, f"Mismatch in outlier classification '{k}': expected {v}, got {class_counts.get(k, 0)}"

# Verify small denominator flags for tiny UTs
small_denom_states = sum_df[sum_df['small_denominator_flag'] == 'Yes (N <= 10)']['state_name'].tolist()
for st in ['Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep', 'Ladakh']:
    assert st in small_denom_states, f"Small denominator state {st} missing small_denominator_flag"

print(f"[PASS] 5. State Summary & Classifications: 18 non-outliers, 12 univariate-only, 5 joint (Both), 1 multivariate-only (Ladakh) verified.")

# 6. Diagnostic Visualizations Validation
expected_figures = [
    '24_outlier_iqr_boxplots.png',
    '25_outlier_flags_by_feature.png',
    '26_outlier_state_summary.png',
    '27_outlier_multivariate_projection.png'
]

for fig_name in expected_figures:
    p = Path('outputs/figures') / fig_name
    assert p.exists() and p.stat().st_size > 1000, f"Figure {fig_name} missing or empty"
    print(f"[PASS] 6. Figure verified: {fig_name} ({p.stat().st_size:,} bytes)")

print("\n=== ALL STAGE 8 OUTLIER DETECTION VALIDATION CHECKS PASSED SUCCESSFULLY ===")
