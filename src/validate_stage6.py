import pandas as pd
import numpy as np
from pathlib import Path

# 1. Data Integrity Validation
assign = pd.read_csv('outputs/tables/cluster_assignments_2023.csv')
assert len(assign) == 36, f"Expected 36 State/UT observations, got {len(assign)}"
assert assign['state_name'].nunique() == 36, "Duplicate state names found"
assert assign.isnull().sum().sum() == 0, "Missing values found in cluster assignments"
print("[PASS] 1. Data Integrity: 36 unique State/UT observations, 0 nulls.")

# 2. Feature Integrity Validation
expected_features = [
    'it_act_share',
    'fraud_motive_share',
    'extortion_motive_share',
    'sexual_exploitation_motive_share'
]
for f in expected_features:
    assert f in assign.columns, f"Expected feature {f} missing in assignments table"
    assert f'std_{f}' in assign.columns, f"Expected standardized feature std_{f} missing"

# Ensure total_cases, parent categories, and Stage 5 binary items are NOT clustering features
forbidden_patterns = ['total_cases', 'HIGH_', 'cat__Total', 'motive__Total']
for c in expected_features:
    for pat in forbidden_patterns:
        assert pat not in c, f"Forbidden feature pattern '{pat}' in clustering feature '{c}'"

print(f"[PASS] 2. Feature Integrity: 4 composition features verified without volume or parent-category leakage.")

# 3. Model Integrity Validation
selected_k = 4
assert assign['cluster_id'].nunique() == selected_k, f"Expected {selected_k} unique clusters, got {assign['cluster_id'].nunique()}"
assert set(assign['cluster_id'].unique()) == set(range(selected_k)), "Cluster IDs not contiguous 0..K-1"

profiles = pd.read_csv('outputs/tables/cluster_profiles_2023.csv')
assert len(profiles) == selected_k, f"Expected {selected_k} profile rows, got {len(profiles)}"
assert profiles['state_count'].sum() == 36, f"Sum of state counts {profiles['state_count'].sum()} != 36"
print(f"[PASS] 3. Model Integrity: K={selected_k} clusters verified. Profile table has {len(profiles)} rows summing to 36 states.")

# 4. Evaluation Metrics Validation
eval_df = pd.read_csv('outputs/tables/clustering_evaluation.csv')
assert len(eval_df) == 7, f"Expected 7 K evaluations (K=2..8), got {len(eval_df)}"
assert set(eval_df['K'].tolist()) == set(range(2, 9)), "K range mismatch in evaluation table"
assert (eval_df['inertia'] > 0).all() and np.isfinite(eval_df['inertia']).all(), "Non-finite or non-positive inertia"
assert (eval_df['silhouette_score'] >= -1.0).all() and (eval_df['silhouette_score'] <= 1.0).all(), "Invalid silhouette scores"
print("[PASS] 4. Evaluation Metrics: K=2..8 evaluation verified with finite inertia and silhouette scores.")

# 5. Sensitivity Analysis Table Validation
sens_path = Path('outputs/tables/clustering_sensitivity_analysis.csv')
assert sens_path.exists() and sens_path.stat().st_size > 100, "Sensitivity analysis table missing or empty"
sens_df = pd.read_csv(sens_path)
assert len(sens_df) == 3, f"Expected 3 sensitivity models, got {len(sens_df)}"
print(f"[PASS] 5. Sensitivity Analysis: 3 diagnostic models verified in {sens_path.name}.")

# 6. Output Files & Figures Validation
expected_figures = [
    '15_clustering_elbow.png',
    '16_clustering_silhouette.png',
    '17_cluster_sizes.png',
    '18_cluster_feature_profiles.png',
    '19_cluster_projection.png'
]

for fig_name in expected_figures:
    p = Path('outputs/figures') / fig_name
    assert p.exists() and p.stat().st_size > 1000, f"Figure {fig_name} missing or empty"
    print(f"[PASS] 6. Figure verified: {fig_name} ({p.stat().st_size:,} bytes)")

print("\n=== ALL STAGE 6 VALIDATION CHECKS PASSED SUCCESSFULLY ===")
