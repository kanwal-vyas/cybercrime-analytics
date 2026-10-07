"""
src/validate_stage9.py
===============================================================================
Cyber Crime Analytics for National Security
Stage 9: Power BI Dashboard & Data Package Validation Suite

This test suite executes rigorous automated validations on the Power BI
dashboard data package (`dashboard/powerbi_data/`), semantic data model, and
specification document (`dashboard/POWERBI_SPECIFICATION.md`).

Validation Suites:
1. File Existence & Structural Integrity: Verifies all 18 dashboard tables exist.
2. Dimensional & Fact Table Integrity: Validates exact row counts and primary keys.
3. 2023 KPI Reconciliation: Reconciles national totals, legal acts, motives, subsets.
4. Historical Separation Audit: Enforces zero contamination between 2018-2022 and 2023.
5. Analytical Models Reconciliation: Reconciles Stages 5, 6, 7, 8 model exports.
6. Documentation & Specification Integrity: Verifies POWERBI_SPECIFICATION.md.
===============================================================================
"""

import sys
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
POWERBI_DATA = PROJECT_ROOT / "dashboard" / "powerbi_data"
SPEC_FILE = PROJECT_ROOT / "dashboard" / "POWERBI_SPECIFICATION.md"


def test_file_existence_and_sizes():
    """Suite 1: Verify all 18 dashboard data tables exist and are non-empty."""
    required_files = [
        "dim_state.csv",
        "dim_crime_category.csv",
        "dim_motive.csv",
        "dim_act_group.csv",
        "fact_state_category_2023.csv",
        "fact_state_motive_2023.csv",
        "state_summary_2023.csv",
        "category_summary_2023.csv",
        "motive_summary_2023.csv",
        "trend_summary_2018_2022.csv",
        "trend_national_2018_2022.csv",
        "model_association_rules_key.csv",
        "model_cluster_profiles.csv",
        "model_cluster_assignments.csv",
        "model_prediction_metrics.csv",
        "model_prediction_actual_vs_predicted.csv",
        "model_outlier_summary.csv",
        "model_outlier_univariate.csv",
        "kpi_executive_summary.csv",
        "metadata_project_limitations.csv"
    ]

    for fname in required_files:
        fpath = POWERBI_DATA / fname
        assert fpath.exists(), f"Missing required Power BI file: {fpath}"
        assert fpath.stat().st_size > 50, f"File {fpath.name} is unexpectedly small ({fpath.stat().st_size} bytes)"

    print(f"[PASS] 1. File Integrity: All {len(required_files)} Power BI data tables exist and are non-empty.")


def test_dimensional_and_fact_structure():
    """Suite 2: Validate exact dimensions, fact row counts, and primary key uniqueness."""
    dim_state = pd.read_csv(POWERBI_DATA / "dim_state.csv")
    assert len(dim_state) == 36, f"Expected 36 states, got {len(dim_state)}"
    assert dim_state["state_id"].nunique() == 36, "Duplicate state_id in dim_state"
    assert dim_state["state_name"].nunique() == 36, "Duplicate state_name in dim_state"

    dim_cat = pd.read_csv(POWERBI_DATA / "dim_crime_category.csv")
    assert len(dim_cat) == 49, f"Expected 49 categories, got {len(dim_cat)}"
    assert dim_cat["category_id"].nunique() == 49, "Duplicate category_id in dim_crime_category"
    assert dim_cat["is_leaf"].sum() == 40, f"Expected 40 leaf categories, got {dim_cat['is_leaf'].sum()}"

    dim_motive = pd.read_csv(POWERBI_DATA / "dim_motive.csv")
    assert len(dim_motive) == 19, f"Expected 19 motives, got {len(dim_motive)}"
    assert dim_motive["motive_id"].nunique() == 19, "Duplicate motive_id in dim_motive"

    fact_cat = pd.read_csv(POWERBI_DATA / "fact_state_category_2023.csv")
    assert len(fact_cat) == 36 * 49, f"Expected {36 * 49} rows, got {len(fact_cat)}"
    assert fact_cat["cases"].min() >= 0, "Negative case count in fact_state_category_2023"

    fact_motive = pd.read_csv(POWERBI_DATA / "fact_state_motive_2023.csv")
    assert len(fact_motive) == 36 * 19, f"Expected {36 * 19} rows, got {len(fact_motive)}"
    assert fact_motive["motive_count"].min() >= 0, "Negative motive count in fact_state_motive_2023"

    print("[PASS] 2. Dimensional & Fact Structure: Exact dimension sizes (36 states, 49 categories, 19 motives) verified.")


def test_2023_kpi_reconciliation():
    """Suite 3: Reconcile all 2023 national totals, legal acts, motives, and demographic subsets."""
    state_sum = pd.read_csv(POWERBI_DATA / "state_summary_2023.csv")
    assert state_sum["total_cases"].sum() == 86420, f"Total cases mismatch: {state_sum['total_cases'].sum()}"
    assert state_sum["reported_grand_total"].sum() == 86420, "Reported grand total mismatch"
    assert state_sum["it_act_cases"].sum() == 44237, f"IT Act mismatch: {state_sum['it_act_cases'].sum()}"
    assert state_sum["ipc_cases"].sum() == 41849, f"IPC mismatch: {state_sum['ipc_cases'].sum()}"
    assert state_sum["sll_cases"].sum() == 334, f"SLL mismatch: {state_sum['sll_cases'].sum()}"
    assert state_sum["motive_fraud"].sum() == 59526, f"Fraud motive mismatch: {state_sum['motive_fraud'].sum()}"
    assert state_sum["women_cases_total"].sum() == 19510, f"Women cases mismatch: {state_sum['women_cases_total'].sum()}"
    assert state_sum["child_cases_total"].sum() == 1902, f"Child cases mismatch: {state_sum['child_cases_total'].sum()}"

    # Top states verification
    top_state = state_sum.sort_values(by="total_cases", ascending=False).iloc[0]
    second_state = state_sum.sort_values(by="total_cases", ascending=False).iloc[1]
    assert top_state["state_name"] == "Karnataka" and top_state["total_cases"] == 21889, "Top state mismatch"
    assert second_state["state_name"] == "Telangana" and second_state["total_cases"] == 18236, "Second state mismatch"

    # Legal Acts Rollup
    act_group = pd.read_csv(POWERBI_DATA / "dim_act_group.csv")
    assert act_group["total_cases"].sum() == 86420, "Act group sum mismatch"
    it_act_share = act_group[act_group["act_group"] == "IT Act"]["share_pct"].iloc[0]
    ipc_share = act_group[act_group["act_group"] == "IPC"]["share_pct"].iloc[0]
    sll_share = act_group[act_group["act_group"] == "SLL"]["share_pct"].iloc[0]
    assert np.isclose(it_act_share, 51.19, atol=0.01), f"IT Act share mismatch: {it_act_share}"
    assert np.isclose(ipc_share, 48.43, atol=0.01), f"IPC share mismatch: {ipc_share}"
    assert np.isclose(sll_share, 0.39, atol=0.01), f"SLL share mismatch: {sll_share}"

    # Category Pareto check
    cat_sum = pd.read_csv(POWERBI_DATA / "category_summary_2023.csv")
    assert len(cat_sum) == 40, f"Expected 40 leaf categories in summary, got {len(cat_sum)}"
    assert cat_sum["national_cases"].sum() == 86420, "Category summary cases mismatch"
    top_cat = cat_sum.iloc[0]
    second_cat = cat_sum.iloc[1]
    assert top_cat["category_id"] == 8 and top_cat["national_cases"] == 25334, f"Top category mismatch: {top_cat['category_id']}, {top_cat['national_cases']}"
    assert second_cat["category_id"] == 32 and second_cat["national_cases"] == 16943, f"Second category mismatch: {second_cat['category_id']}, {second_cat['national_cases']}"
    assert np.isclose(top_cat["national_share_pct"] + second_cat["national_share_pct"], 48.92, atol=0.02), "Top 2 Pareto sum mismatch"

    print("[PASS] 3. 2023 KPI Reconciliation: 86,420 total cases, 44,237 IT Act, 41,849 IPC, 334 SLL, 59,526 Fraud, 19,510 Women, 1,902 Child exactly verified.")


def test_historical_separation():
    """Suite 4: Enforce strict separation between 2018-2022 series and 2023."""
    trend_df = pd.read_csv(POWERBI_DATA / "trend_summary_2018_2022.csv")
    assert len(trend_df) == 36 * 5, f"Expected 180 rows, got {len(trend_df)}"
    assert set(trend_df["year"].unique()) == {2018, 2019, 2020, 2021, 2022}, f"Unexpected years in trend_summary: {trend_df['year'].unique()}"
    assert 2023 not in trend_df["year"].values, "Violation: 2023 data found in historical 2018-2022 series"

    trend_nat = pd.read_csv(POWERBI_DATA / "trend_national_2018_2022.csv")
    assert len(trend_nat) == 5, f"Expected 5 annual rows, got {len(trend_nat)}"
    expected_national = {
        2018: 27248,
        2019: 44735,
        2020: 50035,
        2021: 52974,
        2022: 65893
    }
    for _, row in trend_nat.iterrows():
        yr = int(row["year"])
        cases = int(row["national_total_cases"])
        assert cases == expected_national[yr], f"National cases mismatch for {yr}: expected {expected_national[yr]}, got {cases}"

    print("[PASS] 4. Historical Data Separation: 2018-2022 series isolated cleanly without 2023 contamination.")


def test_analytical_models_reconciliation():
    """Suite 5: Validate association rules, clustering, prediction, and outlier tables."""
    # Stage 5 Association Rules
    rules_df = pd.read_csv(POWERBI_DATA / "model_association_rules_key.csv")
    assert len(rules_df) >= 30, f"Expected at least 30 key rules, got {len(rules_df)}"
    assert rules_df["lift"].min() > 1.0, "Sub-optimal lift in key rules"
    assert rules_df["confidence"].min() >= 0.60, "Low confidence rule in key rules"

    # Stage 6 Clustering
    profiles_df = pd.read_csv(POWERBI_DATA / "model_cluster_profiles.csv")
    assert len(profiles_df) == 4, f"Expected 4 cluster profiles, got {len(profiles_df)}"
    assert profiles_df["state_count"].sum() == 36, "Cluster sizes do not sum to 36 states"

    assign_df = pd.read_csv(POWERBI_DATA / "model_cluster_assignments.csv")
    assert len(assign_df) == 36, f"Expected 36 state cluster assignments, got {len(assign_df)}"

    # Stage 7 Prediction
    pred_metrics = pd.read_csv(POWERBI_DATA / "model_prediction_metrics.csv")
    assert len(pred_metrics) == 7, f"Expected 7 evaluated models, got {len(pred_metrics)}"
    log_ols = pred_metrics[pred_metrics["model_name"].str.contains("Log-Linear", case=False)].iloc[0]
    assert np.isclose(log_ols["mae"], 479.37, atol=0.01), f"Log-Linear MAE mismatch: {log_ols['mae']}"
    assert np.isclose(log_ols["r2"], 0.9000, atol=0.001), f"Log-Linear R2 mismatch: {log_ols['r2']}"

    pred_actual = pd.read_csv(POWERBI_DATA / "model_prediction_actual_vs_predicted.csv")
    assert len(pred_actual) == 36, f"Expected 36 state predictions for 2022, got {len(pred_actual)}"
    assert pred_actual["actual_2022"].sum() == 65893, "2022 actual test set sum mismatch"

    # Stage 8 Outlier Detection
    outlier_sum = pd.read_csv(POWERBI_DATA / "model_outlier_summary.csv")
    assert len(outlier_sum) == 36, f"Expected 36 state outlier rows, got {len(outlier_sum)}"
    class_counts = outlier_sum["outlier_classification"].value_counts().to_dict()
    assert class_counts["No detected outlier"] == 18, f"Expected 18 non-outliers, got {class_counts['No detected outlier']}"
    assert class_counts["Univariate outlier"] == 12, f"Expected 12 univariate-only, got {class_counts['Univariate outlier']}"
    assert class_counts["Both"] == 5, f"Expected 5 Both, got {class_counts['Both']}"
    assert class_counts["Multivariate outlier"] == 1, f"Expected 1 Multivariate-only, got {class_counts['Multivariate outlier']}"

    outlier_univ = pd.read_csv(POWERBI_DATA / "model_outlier_univariate.csv")
    assert len(outlier_univ) == 52, f"Expected 52 univariate fence violation records, got {len(outlier_univ)}"

    print("[PASS] 5. Analytical Models: Stages 5, 6, 7, and 8 models verified and reconciled exactly.")


def test_specification_documentation():
    """Suite 6: Verify POWERBI_SPECIFICATION.md exists and contains all required sections."""
    assert SPEC_FILE.exists(), f"Missing specification document: {SPEC_FILE}"
    content = SPEC_FILE.read_text(encoding="utf-8")
    assert len(content) > 2000, "POWERBI_SPECIFICATION.md is unexpectedly short"
    assert "Executive Overview" in content, "Missing Executive Overview section in spec"
    assert "Geographic / State Analysis" in content, "Missing Geographic Analysis section in spec"
    assert "Crime Categories & Motives" in content, "Missing Categories & Motives section in spec"
    assert "Analytical Models" in content, "Missing Analytical Models section in spec"
    assert "Historical Trend & Predictive Analysis" in content, "Missing Historical Trend section in spec"
    assert "Data Sources & Methodological Limitations" in content, "Missing Limitations section in spec"
    assert "DAX Measure Library" in content, "Missing DAX measure library in spec"
    assert "QA Reconciliation Matrix" in content, "Missing QA matrix in spec"

    print("[PASS] 6. Documentation & Specification: POWERBI_SPECIFICATION.md verified with complete 6-page architecture.")


def run_all_stage9_tests():
    """Run all Stage 9 test suites."""
    print("=== STARTING STAGE 9 POWER BI DASHBOARD VALIDATION SUITE ===\n")
    test_file_existence_and_sizes()
    test_dimensional_and_fact_structure()
    test_2023_kpi_reconciliation()
    test_historical_separation()
    test_analytical_models_reconciliation()
    test_specification_documentation()
    print("\n=== ALL STAGE 9 POWER BI DASHBOARD VALIDATIONS PASSED SUCCESSFULLY ===")


if __name__ == "__main__":
    run_all_stage9_tests()
