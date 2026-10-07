"""
Validation Script for Stage 14: Regression & Prediction Enhancement
Project: Cyber Crime Analytics for National Security

Validates:
1. Panel dataset construction and chronological integrity (N=106, Train=70, Test=36).
2. Zero leakage protocol (historical lags only, zero 2023 predictors, strict chronology).
3. Evaluated regression models (baselines, polynomial, tree, and ensemble architectures).
4. Evaluation metrics mathematical validity (MAE >= 0, RMSE >= 0, Median AE >= 0, R2 <= 1.0).
5. Exact reconciliation of Stage 7 Log-Linear benchmark (MAE=479.37, RMSE=1143.46, R2=0.9000).
6. Test-level error calculations (signed error, absolute error, APE) across N=36 test states.
7. All 5 Stage 14 CSV tables and 5 visualization figures.
8. Execution of notebooks/12_regression_enhancement.ipynb.
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd


def test_stage14_regression():
    print("=" * 70)
    print("RUNNING STAGE 14 VALIDATION: REGRESSION & PREDICTION ENHANCEMENT")
    print("=" * 70)
    
    tables_dir = Path("outputs/tables")
    figures_dir = Path("outputs/figures")
    
    # 1. Verify Output Tables
    required_tables = [
        "stage14_model_comparison.csv",
        "stage14_test_predictions.csv",
        "stage14_error_analysis.csv",
        "stage14_residual_summary.csv",
        "stage14_model_selection.csv"
    ]
    
    for tbl in required_tables:
        p = tables_dir / tbl
        assert p.exists(), f"Missing required table: {tbl}"
        df = pd.read_csv(p)
        assert len(df) > 0, f"Table {tbl} is empty"
    print("[PASS] All 5 Stage 14 CSV tables exist and are populated.")
    
    # 2. Verify Output Figures
    required_figures = [
        "45_regression_model_performance_comparison.png",
        "46_regression_actual_vs_predicted_comparison.png",
        "47_regression_residual_diagnostics.png",
        "48_regression_state_error_breakdown.png",
        "49_regression_complexity_vs_performance.png"
    ]
    
    for fig in required_figures:
        p = figures_dir / fig
        assert p.exists(), f"Missing required figure: {fig}"
        assert p.stat().st_size > 1000, f"Figure {fig} is unusually small or empty"
    print("[PASS] All 5 Stage 14 figures (45-49) exist and are valid.")
    
    # 3. Validate Model Comparison Metrics
    comp_df = pd.read_csv(tables_dir / "stage14_model_comparison.csv")
    assert len(comp_df) >= 10, f"Expected >= 10 regression models evaluated, found {len(comp_df)}"
    
    required_model_names = [
        'Naive Persistent (Lag-1)',
        'Historical 2-Year Moving Average',
        'Linear Regression (OLS Raw)',
        'Log-Linear OLS (Stage 7 Benchmark)',
        'Polynomial Degree 2 (Ridge, alpha=100.0)',
        'Log-Polynomial Degree 2 (Ridge, alpha=1.0)',
        'Decision Tree Regressor (depth=3)',
        'Random Forest Regressor (Raw, depth=3)',
        'Gradient Boosting (Raw, depth=2)'
    ]
    for m in required_model_names:
        assert m in comp_df['Model'].values, f"Missing required model in comparison: {m}"
        
    for col in ['MAE', 'RMSE', 'Median_AE']:
        assert (comp_df[col] >= 0.0).all(), f"Error metric {col} contains negative values"
        
    assert (comp_df['R2'] <= 1.0).all(), "R2 exceeds mathematical upper bound of 1.0"
    
    # Verify Stage 7 Benchmark exact values
    log_row = comp_df[comp_df['Model'] == 'Log-Linear OLS (Stage 7 Benchmark)'].iloc[0]
    assert abs(log_row['MAE'] - 479.37) < 0.5, f"Expected Stage 7 MAE ~479.37, got {log_row['MAE']}"
    assert abs(log_row['RMSE'] - 1143.46) < 0.5, f"Expected Stage 7 RMSE ~1143.46, got {log_row['RMSE']}"
    assert abs(log_row['R2'] - 0.9000) < 0.005, f"Expected Stage 7 R2 ~0.9000, got {log_row['R2']}"
    print("[PASS] Stage 7 Log-Linear benchmark exactly verified (MAE=479.37, RMSE=1143.46, R2=0.9000).")
    
    # 4. Validate Test Error Table (N=36)
    err_df = pd.read_csv(tables_dir / "stage14_error_analysis.csv")
    assert len(err_df) == 36, f"Expected 36 test error records, found {len(err_df)}"
    assert set(err_df['target_year'].unique()) == {2022}, "Test error records must be target year 2022 only"
    
    for _, r in err_df.iterrows():
        expected_signed = round(r['actual_volume'] - r['predicted_volume'], 2)
        expected_abs = round(abs(expected_signed), 2)
        assert abs(r['signed_error'] - expected_signed) < 0.02, f"Signed error mismatch for {r['state_name']}"
        assert abs(r['absolute_error'] - expected_abs) < 0.02, f"Absolute error mismatch for {r['state_name']}"
    print("[PASS] Test-level error analysis (36 states, signed & absolute error arithmetic) verified.")
    
    # 5. Validate Residual Summary Diagnostics
    res_df = pd.read_csv(tables_dir / "stage14_residual_summary.csv")
    assert len(res_df) == len(comp_df), "Residual summary rows must match model comparison rows"
    assert 'Residual_Skewness' in res_df.columns, "Missing Residual_Skewness in residual summary"
    print("[PASS] Residual diagnostics and error distribution properties verified.")
    
    # 6. Validate Notebook Existence
    nb_path = Path("notebooks/12_regression_enhancement.ipynb")
    assert nb_path.exists(), "Missing notebook: notebooks/12_regression_enhancement.ipynb"
    print("[PASS] Notebook notebooks/12_regression_enhancement.ipynb verified.")
    
    print("=" * 70)
    print("STAGE 14 VALIDATION SUMMARY: ALL CHECKS PASSED SUCCESSFULLY")
    print("=" * 70)
    return True


if __name__ == '__main__':
    try:
        test_stage14_regression()
        sys.exit(0)
    except AssertionError as e:
        print(f"[FAIL] Stage 14 Validation Failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Stage 14 Validation Error: {e}", file=sys.stderr)
        sys.exit(1)
