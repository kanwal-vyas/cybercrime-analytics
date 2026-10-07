"""
Stage 7 Validation Script — Prediction & Temporal Lag Modeling
Project: Cyber Crime Analytics for National Security

Automated validation suite verifying data integrity, zero target leakage,
chronological train/test split, model metric sanity, generated tables,
visualizations, and serialized model artifacts.
"""

from pathlib import Path
import pandas as pd
import numpy as np

# 1. Dataset & File Integrity Validation
trend_raw = pd.read_csv('data/processed/trend_2018_2022.csv')
assert len(trend_raw) == 36, f"Expected 36 States/UTs in trend data, got {len(trend_raw)}"

dataset_path = Path('outputs/tables/prediction_dataset.csv')
assert dataset_path.exists() and dataset_path.stat().st_size > 100, "prediction_dataset.csv missing or empty"
panel_df = pd.read_csv(dataset_path)

assert len(panel_df) == 106, f"Expected 106 panel observations (70 train, 36 test), got {len(panel_df)}"
assert panel_df.isnull().sum().sum() == 0, f"Found unexpected null values in prediction dataset: {panel_df.isnull().sum().to_dict()}"
assert set(panel_df['split'].unique()) == {'train', 'test'}, "Split column must contain exactly {'train', 'test'}"
print(f"[PASS] 1. Data Integrity: 106 panel observations constructed cleanly with 0 nulls across 36 jurisdictions.")

# 2. Chronology & Target Leakage Validation
train_sub = panel_df[panel_df['split'] == 'train']
test_sub = panel_df[panel_df['split'] == 'test']

assert len(train_sub) == 70, f"Expected 70 training samples, got {len(train_sub)}"
assert len(test_sub) == 36, f"Expected 36 test samples (all 36 States/UTs in 2022), got {len(test_sub)}"
assert set(train_sub['target_year'].unique()) == {2020, 2021}, "Train set must have target years 2020 and 2021"
assert set(test_sub['target_year'].unique()) == {2022}, "Test set must have target year 2022"
assert max(train_sub['target_year']) < min(test_sub['target_year']), "Train target year must strictly precede test target year"

# Verify observation independence (no duplicate tuples)
train_tuples = set(zip(train_sub['state_name'], train_sub['target_year']))
test_tuples = set(zip(test_sub['state_name'], test_sub['target_year']))
assert len(train_tuples.intersection(test_tuples)) == 0, "Overlap found between train and test observation tuples"

# Verify automated leakage audit results
audit_path = Path('outputs/tables/prediction_leakage_audit.csv')
assert audit_path.exists() and audit_path.stat().st_size > 100, "prediction_leakage_audit.csv missing or empty"
audit_df = pd.read_csv(audit_path)
assert len(audit_df) == 5, f"Expected 5 leakage audit checks, got {len(audit_df)}"
assert (audit_df['status'] == 'PASSED').all(), f"Some leakage checks failed:\n{audit_df[audit_df['status'] != 'PASSED']}"
print(f"[PASS] 2. Chronological Separation & Leakage Audit: All 5 automated checks PASSED (Train: 2020-2021, Test: 2022).")

# 3. Model Comparison & Metrics Validation
results_path = Path('outputs/tables/prediction_results.csv')
assert results_path.exists() and results_path.stat().st_size > 100, "prediction_results.csv missing or empty"
res_df = pd.read_csv(results_path)

assert len(res_df) == 7, f"Expected 7 evaluated models, got {len(res_df)}"
expected_cols = ['model_name', 'model_type', 'feature_set', 'train_samples', 'test_samples', 'mae', 'rmse', 'r2', 'median_ae']
for col in expected_cols:
    assert col in res_df.columns, f"Missing column {col} in prediction_results.csv"

assert (res_df['mae'] > 0).all() and np.isfinite(res_df['mae']).all(), "Invalid or non-positive MAE"
assert (res_df['rmse'] > 0).all() and np.isfinite(res_df['rmse']).all(), "Invalid or non-positive RMSE"
assert (res_df['r2'] <= 1.0).all() and (res_df['r2'] >= -1.0).all() and np.isfinite(res_df['r2']).all(), "Invalid R2 score"

# Check baseline and log-linear model metrics specifically
naive_row = res_df[res_df['model_name'] == 'Naive Persistent (Lag-1)'].iloc[0]
assert naive_row['r2'] > 0.80 and naive_row['mae'] < 600, f"Unexpected naive baseline performance: {naive_row.to_dict()}"

log_lr_row = res_df[res_df['model_name'] == 'Log-Linear Regression (Log OLS)'].iloc[0]
assert log_lr_row['r2'] >= 0.88 and log_lr_row['mae'] < 500, f"Unexpected log-linear performance: {log_lr_row.to_dict()}"
print(f"[PASS] 3. Model Evaluation: 7 models verified. Naive MAE = {naive_row['mae']:.1f} (R² = {naive_row['r2']:.3f}), Log-Linear MAE = {log_lr_row['mae']:.1f} (R² = {log_lr_row['r2']:.3f}).")

# 4. State Predictions Validation
preds_path = Path('outputs/tables/prediction_actual_vs_predicted.csv')
assert preds_path.exists() and preds_path.stat().st_size > 100, "prediction_actual_vs_predicted.csv missing or empty"
preds_df = pd.read_csv(preds_path)

assert len(preds_df) == 36, f"Expected 36 State/UT predictions for 2022, got {len(preds_df)}"
assert preds_df['state_name'].nunique() == 36, "Duplicate state predictions found"
assert (preds_df['actual_2022'] >= 0).all(), "Negative actuals found"
assert (preds_df['pred_log_linear'] >= 0).all(), "Negative predictions found"
assert preds_df.isnull().sum().sum() == 0, "Null values found in predictions table"
print(f"[PASS] 4. State Predictions: 36 unique 2022 State/UT predictions verified without nulls or negative values.")

# 5. Output Visualizations Validation
expected_figures = [
    '20_prediction_actual_vs_predicted.png',
    '21_prediction_model_comparison.png',
    '22_prediction_residuals_by_state.png',
    '23_historical_trajectory_forecast.png'
]

for fig_name in expected_figures:
    p = Path('outputs/figures') / fig_name
    assert p.exists() and p.stat().st_size > 1000, f"Figure {fig_name} missing or empty"
    print(f"[PASS] 5. Figure verified: {fig_name} ({p.stat().st_size:,} bytes)")

# 6. Serialized Model Artifacts Validation
expected_models = [
    'linear_regression_ols,_raw.pkl',
    'ridge_regression_l2_regularized.pkl',
    'log_linear_regression_log_ols.pkl',
    'decision_tree_regressor.pkl',
    'random_forest_regressor.pkl'
]

for m_name in expected_models:
    p = Path('outputs/models') / m_name
    assert p.exists() and p.stat().st_size > 100, f"Model artifact {m_name} missing or empty"
    print(f"[PASS] 6. Model artifact verified: {m_name} ({p.stat().st_size:,} bytes)")

print("\n=== ALL STAGE 7 PREDICTION VALIDATION CHECKS PASSED SUCCESSFULLY ===")
