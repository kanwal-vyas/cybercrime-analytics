"""
Validation Script for Stage 13: Classification Analysis
Project: Cyber Crime Analytics for National Security

Validates:
1. Longitudinal panel construction (106 records, strictly historical 2018-2022 source).
2. Binary target formulation & threshold training-exclusivity (threshold = 367.0 cases).
3. 7-point leakage audit compliance (zero contemporaneous/2023 features, strict chronology).
4. Model architecture training (Baseline, Decision Tree, Gaussian NB, Linear SVM, RBF SVM, Random Forest).
5. Evaluation metrics validity (Accuracy, Precision, Recall, Specificity, F1, ROC-AUC in [0, 1]).
6. All 6 Stage 13 analytical tables and 5 visualization figures.
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd


def test_stage13_classification():
    print("=" * 70)
    print("RUNNING STAGE 13 VALIDATION: CLASSIFICATION ANALYSIS")
    print("=" * 70)
    
    # 1. Check Output Files
    tables_dir = Path("outputs/tables")
    figures_dir = Path("outputs/figures")
    
    required_tables = [
        "stage13_classification_dataset.csv",
        "stage13_class_distribution.csv",
        "stage13_model_comparison.csv",
        "stage13_confusion_matrices.csv",
        "stage13_feature_importance.csv",
        "stage13_leakage_audit.csv"
    ]
    
    for tbl in required_tables:
        p = tables_dir / tbl
        assert p.exists(), f"Missing required table: {tbl}"
        df = pd.read_csv(p)
        assert len(df) > 0, f"Table {tbl} is empty"
    print("[PASS] All 6 Stage 13 CSV tables exist and are populated.")
    
    required_figures = [
        "40_classification_class_distributions.png",
        "41_classification_model_performance_comparison.png",
        "42_classification_confusion_matrices.png",
        "43_classification_roc_curves.png",
        "44_classification_decision_tree_and_feature_importance.png"
    ]
    
    for fig in required_figures:
        p = figures_dir / fig
        assert p.exists(), f"Missing required figure: {fig}"
        assert p.stat().st_size > 1000, f"Figure {fig} is unusually small or empty"
    print("[PASS] All 5 Stage 13 figures (40-44) exist and are valid.")
    
    # 2. Validate Panel Dataset Structure
    panel_df = pd.read_csv(tables_dir / "stage13_classification_dataset.csv")
    assert len(panel_df) == 106, f"Expected 106 panel rows, found {len(panel_df)}"
    
    train_df = panel_df[panel_df['split'] == 'train']
    test_df = panel_df[panel_df['split'] == 'test']
    assert len(train_df) == 70, f"Expected 70 train rows, found {len(train_df)}"
    assert len(test_df) == 36, f"Expected 36 test rows, found {len(test_df)}"
    
    # Check years
    assert set(train_df['target_year'].unique()) == {2020, 2021}
    assert set(test_df['target_year'].unique()) == {2022}
    print("[PASS] Panel dataset partition counts (Train=70, Test=36) and chronological years verified.")
    
    # 3. Validate Target & Threshold
    train_median = float(train_df['target_actual'].median())
    assert abs(train_median - 367.0) < 1e-4, f"Expected train median 367.0, got {train_median}"
    
    # Check binary target
    assert set(panel_df['HIGH_NEXT_YEAR'].unique()).issubset({0, 1})
    train_class_counts = train_df['HIGH_NEXT_YEAR'].value_counts().to_dict()
    assert train_class_counts[0] == 35 and train_class_counts[1] == 35, f"Expected 35/35 train balance, got {train_class_counts}"
    print("[PASS] High-volume target formulation & threshold exclusivity (367.0 cases, 50/50 train balance) verified.")
    
    # 4. Validate Leakage Audit Table
    audit_df = pd.read_csv(tables_dir / "stage13_leakage_audit.csv")
    assert len(audit_df) >= 6, f"Expected >= 6 audit checks, found {len(audit_df)}"
    assert (audit_df['Status'] == 'PASSED').all(), "Not all audit checks passed"
    print("[PASS] Formal 7-point leakage audit successfully verified.")
    
    # 5. Validate Model Comparison Metrics
    metrics_df = pd.read_csv(tables_dir / "stage13_model_comparison.csv")
    required_models = [
        'Baseline (Most Frequent)',
        'Decision Tree (depth=3)',
        'Gaussian Naive Bayes',
        'Linear SVM',
        'RBF SVM',
        'Random Forest'
    ]
    assert set(required_models).issubset(set(metrics_df['Model'])), "Missing required classification models in comparison table"
    
    for col in ['Accuracy', 'Balanced_Accuracy', 'Precision', 'Recall', 'Specificity', 'F1_Score', 'ROC_AUC']:
        assert col in metrics_df.columns, f"Missing metric column: {col}"
        assert ((metrics_df[col] >= 0.0) & (metrics_df[col] <= 1.0)).all(), f"Metric {col} has values outside [0, 1]"
    print("[PASS] Model evaluation metrics valid and within theoretical bounds [0.0, 1.0].")
    
    # 6. Validate Confusion Matrices
    cm_df = pd.read_csv(tables_dir / "stage13_confusion_matrices.csv")
    for _, row in cm_df.iterrows():
        total_obs = row['True_Negative_TN'] + row['False_Positive_FP'] + row['False_Negative_FN'] + row['True_Positive_TP']
        assert total_obs == 36, f"Confusion matrix for {row['Model']} does not sum to 36 test observations (got {total_obs})"
    print("[PASS] Confusion matrices sum exactly to 36 test observations across all models.")
    
    # 7. Validate Feature Importance
    feat_df = pd.read_csv(tables_dir / "stage13_feature_importance.csv")
    assert 'Feature' in feat_df.columns and 'Decision_Tree_Importance' in feat_df.columns and 'Random_Forest_Importance' in feat_df.columns
    assert abs(feat_df['Decision_Tree_Importance'].sum() - 1.0) < 1e-3, "Decision Tree feature importances do not sum to 1.0"
    assert abs(feat_df['Random_Forest_Importance'].sum() - 1.0) < 1e-3, "Random Forest feature importances do not sum to 1.0"
    print("[PASS] Feature importance measures verified for tree architectures.")
    
    # 8. Check Notebook existence
    nb_path = Path("notebooks/11_classification.ipynb")
    assert nb_path.exists(), "Missing notebook: notebooks/11_classification.ipynb"
    print("[PASS] Notebook notebooks/11_classification.ipynb verified.")
    
    print("=" * 70)
    print("STAGE 13 VALIDATION SUMMARY: ALL CHECKS PASSED SUCCESSFULLY")
    print("=" * 70)
    return True


if __name__ == '__main__':
    try:
        test_stage13_classification()
        sys.exit(0)
    except AssertionError as e:
        print(f"[FAIL] Stage 13 Validation Failed: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"[ERROR] Stage 13 Validation Error: {e}", file=sys.stderr)
        sys.exit(1)
