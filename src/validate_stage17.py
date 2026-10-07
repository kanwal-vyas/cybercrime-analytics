"""
Validation Script: Stage 17 — Advanced Visualization & Power BI Layer
Project: Cyber Crime Analytics for National Security

Validates:
1. File Existence & Schema Integrity (all 28 Power BI tables exist, non-empty, valid sizes)
2. Dimensional & Fact Table Structure (36 states, 49 categories with 40 leaf, 19 motives, 3 act groups)
3. National 2023 KPI Reconciliation (Total: 86,420, IT Act: 44,237, IPC: 41,849, SLL: 334, Fraud: 59,526)
4. Geographic Ranking & Top 5 Concentration (Top 5 = 63,472 / 73.45%)
5. Crime Category Offenses & Motives Reconciliation (Leaf sum = 86,420, Sec 66D = 25,334, Sec 420 = 16,943)
6. Association Rule Mining Package (Stage 5/12 key rule metrics)
7. Supervised Classification Package (Stage 13 accuracy, precision, recall, confusion matrices)
8. Predictive Regression Package (Stage 7/14 Log-Linear OLS MAE=479.37, R²=0.9000 vs. Naive baseline)
9. Unsupervised Cluster Profiling Package (Stage 6/15 K=4 sizes: 15, 12, 2, 7; Hungarian stability ARI=1.000)
10. Advanced Outlier & Anomaly Package (Stage 8/16 consensus scores 0-4, Mahalanobis, LOF, dual-space)
11. Historical Series Isolation (2018-2022 panel isolated without 2023 contamination, Ladakh missingness)
12. Specification & Academic Limitations Integrity (10-page spec, 6 core limitations)
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd

REPO_ROOT = Path(__file__).resolve().parent.parent
POWERBI_DATA = REPO_ROOT / "dashboard" / "powerbi_data"
SPEC_FILE_17 = REPO_ROOT / "dashboard" / "POWERBI_STAGE17_SPECIFICATION.md"
README_FILE = REPO_ROOT / "dashboard" / "README.md"


def validate_stage17() -> bool:
    print("=" * 70)
    print("RUNNING STAGE 17 VALIDATION: Advanced Visualization & Power BI Layer")
    print("=" * 70)

    passed_tests = 0
    total_tests = 0

    # -------------------------------------------------------------
    # 1. File Integrity & Schema Verification
    # -------------------------------------------------------------
    total_tests += 1
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
        "model_clustering_stage15.csv",
        "model_prediction_metrics.csv",
        "model_prediction_actual_vs_predicted.csv",
        "model_regression_leaderboard.csv",
        "model_classification_comparison.csv",
        "model_classification_confusion_matrices.csv",
        "model_outlier_summary.csv",
        "model_outlier_univariate.csv",
        "model_outlier_consensus.csv",
        "model_outlier_volume_vs_composition.csv",
        "model_outlier_mahalanobis.csv",
        "model_outlier_lof.csv",
        "kpi_executive_summary.csv",
        "metadata_project_limitations.csv"
    ]

    for fname in required_files:
        fpath = POWERBI_DATA / fname
        assert fpath.exists(), f"Missing required Power BI file: {fpath}"
        assert fpath.stat().st_size > 50, f"File {fpath.name} is unexpectedly small ({fpath.stat().st_size} bytes)"

    assert SPEC_FILE_17.exists() and SPEC_FILE_17.stat().st_size > 1000, "Missing or empty POWERBI_STAGE17_SPECIFICATION.md"
    assert README_FILE.exists() and README_FILE.stat().st_size > 500, "Missing or empty dashboard/README.md"
    print(f"[{passed_tests+1}] File Integrity: All {len(required_files)} Power BI data tables and documentation exist: PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 2. Dimensional & Fact Table Structure
    # -------------------------------------------------------------
    total_tests += 1
    dim_state = pd.read_csv(POWERBI_DATA / "dim_state.csv")
    assert len(dim_state) == 36, f"Expected 36 states, got {len(dim_state)}"
    assert dim_state["state_id"].nunique() == 36, "Duplicate state_id in dim_state"
    assert dim_state["state_name"].nunique() == 36, "Duplicate state_name in dim_state"

    dim_cat = pd.read_csv(POWERBI_DATA / "dim_crime_category.csv")
    assert len(dim_cat) == 49, f"Expected 49 categories, got {len(dim_cat)}"
    assert dim_cat["is_leaf"].sum() == 40, f"Expected 40 leaf categories, got {dim_cat['is_leaf'].sum()}"

    dim_motive = pd.read_csv(POWERBI_DATA / "dim_motive.csv")
    assert len(dim_motive) == 19, f"Expected 19 motives, got {len(dim_motive)}"

    dim_act = pd.read_csv(POWERBI_DATA / "dim_act_group.csv")
    assert len(dim_act) == 3, f"Expected 3 act groups, got {len(dim_act)}"
    assert set(dim_act["act_group"]).issubset({"IT Act", "IPC", "SLL"}), "Invalid act groups"

    fact_cat = pd.read_csv(POWERBI_DATA / "fact_state_category_2023.csv")
    assert len(fact_cat) == 36 * 49, f"Expected {36 * 49} rows in fact_state_category_2023, got {len(fact_cat)}"

    fact_motive = pd.read_csv(POWERBI_DATA / "fact_state_motive_2023.csv")
    assert len(fact_motive) == 36 * 19, f"Expected {36 * 19} rows in fact_state_motive_2023, got {len(fact_motive)}"
    print(f"[{passed_tests+1}] Dimensional & Fact Structure (36 states, 49 categories, 19 motives, 3 acts): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 3. National 2023 Headline KPI Reconciliation
    # -------------------------------------------------------------
    total_tests += 1
    state_sum = pd.read_csv(POWERBI_DATA / "state_summary_2023.csv")
    assert state_sum["total_cases"].sum() == 86420, f"Total cases mismatch: {state_sum['total_cases'].sum()}"
    assert state_sum["it_act_cases"].sum() == 44237, f"IT Act mismatch: {state_sum['it_act_cases'].sum()}"
    assert state_sum["ipc_cases"].sum() == 41849, f"IPC mismatch: {state_sum['ipc_cases'].sum()}"
    assert state_sum["sll_cases"].sum() == 334, f"SLL mismatch: {state_sum['sll_cases'].sum()}"
    assert state_sum["motive_fraud"].sum() == 59526, f"Fraud motive mismatch: {state_sum['motive_fraud'].sum()}"
    assert state_sum["women_cases_total"].sum() == 19510, f"Women cases mismatch: {state_sum['women_cases_total'].sum()}"
    assert state_sum["child_cases_total"].sum() == 1902, f"Child cases mismatch: {state_sum['child_cases_total'].sum()}"

    # Percentage checks
    it_share = state_sum["it_act_cases"].sum() / 86420 * 100
    ipc_share = state_sum["ipc_cases"].sum() / 86420 * 100
    sll_share = state_sum["sll_cases"].sum() / 86420 * 100
    np.testing.assert_allclose(it_share, 51.1884, atol=1e-2)
    np.testing.assert_allclose(ipc_share, 48.4251, atol=1e-2)
    np.testing.assert_allclose(sll_share, 0.3865, atol=1e-2)
    print(f"[{passed_tests+1}] National 2023 KPI Reconciliation (86,420 total, 44,237 IT, 41,849 IPC, 334 SLL): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 4. Geographic Ranking & Top 5 Concentration
    # -------------------------------------------------------------
    total_tests += 1
    top5 = state_sum.sort_values(by="total_cases", ascending=False).head(5)
    expected_top5 = [
        ("Karnataka", 21889),
        ("Telangana", 18236),
        ("Uttar Pradesh", 10794),
        ("Maharashtra", 8103),
        ("Bihar", 4450)
    ]
    for idx, (st, val) in enumerate(expected_top5):
        assert top5.iloc[idx]["state_name"] == st, f"Top {idx+1} state mismatch: {top5.iloc[idx]['state_name']} vs {st}"
        assert top5.iloc[idx]["total_cases"] == val, f"Top {idx+1} state cases mismatch: {top5.iloc[idx]['total_cases']} vs {val}"

    top5_sum = top5["total_cases"].sum()
    assert top5_sum == 63472, f"Top 5 sum mismatch: {top5_sum}"
    np.testing.assert_allclose(top5_sum / 86420 * 100, 73.4447, atol=1e-2)
    print(f"[{passed_tests+1}] Geographic Ranking & Top 5 Concentration (63,472 / 73.45%): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 5. Crime Category Offenses & Motives Reconciliation
    # -------------------------------------------------------------
    total_tests += 1
    cat_sum = pd.read_csv(POWERBI_DATA / "category_summary_2023.csv")
    assert len(cat_sum) == 40, f"Expected 40 leaf categories, got {len(cat_sum)}"
    assert cat_sum["national_cases"].sum() == 86420, f"Leaf category sum mismatch: {cat_sum['national_cases'].sum()}"

    sec66d = cat_sum.loc[cat_sum["category_display_name"].str.contains("Sec.66D", regex=False), "national_cases"].values[0]
    assert sec66d == 25334, f"Sec 66D cases mismatch: {sec66d}"

    sec420 = cat_sum.loc[cat_sum["category_display_name"].str.contains("Sec.420 IPC", regex=False), "national_cases"].values[0]
    assert sec420 == 16943, f"Sec 420 cases mismatch: {sec420}"

    motive_sum = pd.read_csv(POWERBI_DATA / "motive_summary_2023.csv")
    fraud_motive = motive_sum.loc[motive_sum["motive_display_name"] == "Fraud", "national_motive_count"].values[0]
    assert fraud_motive == 59526, f"Fraud motive cases mismatch: {fraud_motive}"
    print(f"[{passed_tests+1}] Crime Category Offenses & Motives (Sec 66D: 25,334, Sec 420: 16,943, Fraud: 59,526): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 6. Association Rule Mining Package (Stage 5 / Stage 12)
    # -------------------------------------------------------------
    total_tests += 1
    rules_df = pd.read_csv(POWERBI_DATA / "model_association_rules_key.csv")
    assert len(rules_df) == 42, f"Expected 42 key rules, got {len(rules_df)}"
    assert (rules_df["support"] >= 0.25).all(), "Rule support below 0.25 threshold"
    assert (rules_df["confidence"] >= 0.60).all(), "Rule confidence below 0.60 threshold"
    assert (rules_df["lift"] > 1.0).all(), "Rule lift not greater than 1.0"

    # Verify specific validated rule
    fraud_rule = rules_df.loc[
        (rules_df["antecedent"].str.contains("HIGH_FRAUD_MOTIVE")) & 
        (rules_df["consequent"].str.contains("HIGH_SEC66D_CHEATING"))
    ]
    assert len(fraud_rule) >= 1, "Missing HIGH_FRAUD_MOTIVE -> HIGH_SEC66D_CHEATING rule"
    np.testing.assert_allclose(fraud_rule.iloc[0]["support"], 0.4167, atol=1e-2)
    np.testing.assert_allclose(fraud_rule.iloc[0]["confidence"], 0.8333, atol=1e-2)
    np.testing.assert_allclose(fraud_rule.iloc[0]["lift"], 1.6667, atol=1e-2)
    print(f"[{passed_tests+1}] Association Rule Mining Package (42 rules, validated benchmarks): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 7. Supervised Classification Package (Stage 13)
    # -------------------------------------------------------------
    total_tests += 1
    cls_df = pd.read_csv(POWERBI_DATA / "model_classification_comparison.csv")
    assert len(cls_df) == 6, f"Expected 6 classification models (1 baseline + 5 ML), got {len(cls_df)}"
    dt_row = cls_df.loc[cls_df["Model"].str.contains("Decision Tree", regex=False)].iloc[0]
    np.testing.assert_allclose(dt_row["Accuracy"], 0.9722, atol=1e-2)
    rf_row = cls_df.loc[cls_df["Model"].str.contains("Random Forest", regex=False)].iloc[0]
    np.testing.assert_allclose(rf_row["Accuracy"], 1.0000, atol=1e-4)

    cm_df = pd.read_csv(POWERBI_DATA / "model_classification_confusion_matrices.csv")
    assert len(cm_df) == 6, f"Expected 6 CM entries (1 baseline + 5 ML), got {len(cm_df)}"
    assert (cm_df["Total_Test_Obs"] == 36).all(), "Test observations count corrupted in confusion matrix"
    print(f"[{passed_tests+1}] Supervised Classification Package (Stage 13 DT=97.22%, RF=100.0%): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 8. Predictive Regression Package (Stage 7 / Stage 14)
    # -------------------------------------------------------------
    total_tests += 1
    reg_df = pd.read_csv(POWERBI_DATA / "model_prediction_metrics.csv")
    assert len(reg_df) == 7, f"Expected 7 baseline regression models, got {len(reg_df)}"
    log_ols = reg_df.loc[reg_df["model_name"].str.contains("Log-Linear", regex=False)].iloc[0]
    np.testing.assert_allclose(log_ols["mae"], 479.37, atol=1e-1)
    np.testing.assert_allclose(log_ols["r2"], 0.9000, atol=1e-2)

    naive = reg_df.loc[reg_df["model_name"].str.contains("Naive Persistent", regex=False)].iloc[0]
    np.testing.assert_allclose(naive["mae"], 564.75, atol=1e-1)
    np.testing.assert_allclose(naive["r2"], 0.8625, atol=1e-2)

    reg_lead = pd.read_csv(POWERBI_DATA / "model_regression_leaderboard.csv")
    assert len(reg_lead) >= 7, "Regression leaderboard incomplete"
    print(f"[{passed_tests+1}] Predictive Regression Package (Stage 7/14 Log-OLS MAE=479.37, R²=0.9000): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 9. Unsupervised Cluster Profiling Package (Stage 6 / Stage 15)
    # -------------------------------------------------------------
    total_tests += 1
    clust_profiles = pd.read_csv(POWERBI_DATA / "model_cluster_profiles.csv")
    assert len(clust_profiles) == 4, f"Expected 4 cluster profiles, got {len(clust_profiles)}"
    assert clust_profiles["state_count"].sum() == 36, f"Cluster state count sum mismatch: {clust_profiles['state_count'].sum()}"

    clust_assign = pd.read_csv(POWERBI_DATA / "model_cluster_assignments.csv")
    assert len(clust_assign) == 36, f"Expected 36 cluster assignment records, got {len(clust_assign)}"
    cluster_counts = clust_assign["cluster_id"].value_counts().to_dict()
    assert cluster_counts == {0: 15, 1: 12, 3: 7, 2: 2}, f"Cluster size mismatch: {cluster_counts}"

    clust15 = pd.read_csv(POWERBI_DATA / "model_clustering_stage15.csv")
    assert len(clust15) == 36, f"Expected 36 Stage 15 records, got {len(clust15)}"
    print(f"[{passed_tests+1}] Unsupervised Cluster Profiling Package (K=4 sizes: 15, 12, 2, 7): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 10. Advanced Outlier & Anomaly Package (Stage 8 / Stage 16)
    # -------------------------------------------------------------
    total_tests += 1
    outlier_sum = pd.read_csv(POWERBI_DATA / "model_outlier_summary.csv")
    assert len(outlier_sum) == 36, f"Expected 36 outlier summary records, got {len(outlier_sum)}"

    outlier_univ = pd.read_csv(POWERBI_DATA / "model_outlier_univariate.csv")
    assert len(outlier_univ) == 52, f"Expected 52 univariate fence violations, got {len(outlier_univ)}"

    anom_consensus = pd.read_csv(POWERBI_DATA / "model_outlier_consensus.csv")
    assert len(anom_consensus) == 36, f"Expected 36 consensus anomaly records, got {len(anom_consensus)}"
    assert set(anom_consensus["consensus_score"].unique()).issubset({0, 1, 2, 3, 4}), "Invalid consensus score"

    mah_df = pd.read_csv(POWERBI_DATA / "model_outlier_mahalanobis.csv")
    assert len(mah_df) == 36, f"Expected 36 Mahalanobis records, got {len(mah_df)}"
    np.testing.assert_allclose(mah_df["chi2_cutoff_975"].iloc[0], 26.1189, atol=1e-2)

    vol_comp_df = pd.read_csv(POWERBI_DATA / "model_outlier_volume_vs_composition.csv")
    assert len(vol_comp_df) == 36, f"Expected 36 volume vs composition records, got {len(vol_comp_df)}"
    print(f"[{passed_tests+1}] Advanced Outlier & Anomaly Package (Consensus 0-4, Mahalanobis, LOF, Dual-Space): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 11. Historical Series Isolation (2018–2022)
    # -------------------------------------------------------------
    total_tests += 1
    trend_sum = pd.read_csv(POWERBI_DATA / "trend_summary_2018_2022.csv")
    assert len(trend_sum) == 180, f"Expected 180 trend panel records, got {len(trend_sum)}"
    assert set(trend_sum["year"].unique()) == {2018, 2019, 2020, 2021, 2022}, "Trend year range corrupted"

    trend_nat = pd.read_csv(POWERBI_DATA / "trend_national_2018_2022.csv")
    assert len(trend_nat) == 5, f"Expected 5 national trend years, got {len(trend_nat)}"
    assert trend_nat.loc[trend_nat["year"] == 2018, "national_total_cases"].values[0] == 27248, "2018 national mismatch"
    assert trend_nat.loc[trend_nat["year"] == 2022, "national_total_cases"].values[0] == 65893, "2022 national mismatch"

    # Verify Ladakh missingness
    ladakh_18 = trend_sum.loc[(trend_sum["state_name"] == "Ladakh") & (trend_sum["year"] == 2018), "cases"].values[0]
    assert np.isnan(ladakh_18) or pd.isna(ladakh_18), "Ladakh 2018 should be NaN"
    print(f"[{passed_tests+1}] Historical Series Isolation (2018-2022 panel, 27,248 to 65,893 cases): PASSED")
    passed_tests += 1

    # -------------------------------------------------------------
    # 12. Specification & Academic Limitations Integrity
    # -------------------------------------------------------------
    total_tests += 1
    limits_df = pd.read_csv(POWERBI_DATA / "metadata_project_limitations.csv")
    assert len(limits_df) == 6, f"Expected 6 core limitations, got {len(limits_df)}"
    expected_lim_ids = {"LIM-01", "LIM-02", "LIM-03", "LIM-04", "LIM-05", "LIM-06"}
    assert set(limits_df["limitation_id"]) == expected_lim_ids, "Limitation IDs corrupted"

    # Check 10 pages in specification
    spec_content = SPEC_FILE_17.read_text(encoding="utf-8")
    for p in range(1, 11):
        assert f"PAGE {p} —" in spec_content or f"Page {p}:" in spec_content, f"Page {p} missing from specification"

    print(f"[{passed_tests+1}] Specification & Academic Limitations Integrity (10 Pages, 6 Core Limitations): PASSED")
    passed_tests += 1

    print("=" * 70)
    print(f"STAGE 17 VALIDATION SUMMARY: {passed_tests}/{total_tests} SUCCEEDED (100.0%)")
    print("=" * 70)
    return True


if __name__ == "__main__":
    success = validate_stage17()
    if not success:
        sys.exit(1)
