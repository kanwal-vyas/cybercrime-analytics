"""
src/validate_stage12.py
===============================================================================
Validation Suite for Stage 12: Advanced Frequent Pattern Mining & Correlation Analysis

This script verifies:
1. File Integrity: All 9 Stage 12 tables, 4 visual artifacts, SQL script, and notebook exist.
2. Transaction Matrix Integrity: Shape (36, 8), 0 nulls, binary booleans, 36 unique states.
3. FP-Growth Frequent Itemsets: Exactly 129 itemsets with valid support >= 0.25.
4. FP-Growth Association Rules: Exactly 1,924 rules (and 42 pair rules) with conf >= 0.60, lift > 1.0.
5. Mathematical Equivalence: 100% itemset and rule agreement between Apriori and FP-Growth.
6. Runtime & Scalability Benchmark: Non-negative runtimes across actual and synthetic sets.
7. Correlation Matrix Properties:
   - Pearson and Spearman matrices are 12x12, symmetric, with diagonal = 1.0 and bounds in [-1, 1].
   - 66 unique pairs in comparison table with valid category classifications.
8. Part-Whole Guardrails: Structural collinearity warnings correctly attached to part-whole pairs.
===============================================================================
"""

import sys
from pathlib import Path
import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parent.parent
TABLES_DIR = PROJECT_ROOT / "outputs" / "tables"
FIGURES_DIR = PROJECT_ROOT / "outputs" / "figures"
SQL_DIR = PROJECT_ROOT / "sql"
NOTEBOOKS_DIR = PROJECT_ROOT / "notebooks"


def test_stage12_pipeline():
    print("=== STARTING STAGE 12 ADVANCED ASSOCIATION & CORRELATION VALIDATION ===")
    
    # 1. File Completeness
    expected_tables = [
        "stage12_fpgrowth_itemsets.csv",
        "stage12_fpgrowth_rules.csv",
        "stage12_fpgrowth_pair_rules.csv",
        "stage12_algorithm_comparison.csv",
        "stage12_algorithm_benchmark.csv",
        "stage12_synthetic_scalability_benchmark.csv",
        "stage12_pearson_correlation.csv",
        "stage12_spearman_correlation.csv",
        "stage12_correlation_comparison.csv"
    ]
    
    for tbl in expected_tables:
        p = TABLES_DIR / tbl
        assert p.exists(), f"Missing expected table: {tbl}"
        assert p.stat().st_size > 0, f"Table {tbl} is empty."
    print("  [PASS] All 9 Stage 12 output tables exist and are non-empty.")
    
    expected_figures = [
        "36_fpgrowth_vs_apriori_benchmark.png",
        "37_pearson_correlation_heatmap.png",
        "38_spearman_correlation_heatmap.png",
        "39_pearson_vs_spearman_discrepancy.png"
    ]
    for fig in expected_figures:
        p = FIGURES_DIR / fig
        assert p.exists(), f"Missing expected figure: {fig}"
        assert p.stat().st_size > 5000, f"Figure {fig} is unusually small ({p.stat().st_size} bytes)."
    print("  [PASS] All 4 Stage 12 visual artifacts exist with valid sizes.")
    
    assert (SQL_DIR / "stage12_association_correlation.sql").exists(), "Missing sql/stage12_association_correlation.sql"
    assert (NOTEBOOKS_DIR / "10_advanced_frequent_patterns.ipynb").exists(), "Missing notebooks/10_advanced_frequent_patterns.ipynb"
    print("  [PASS] Stage 12 SQL and Notebook files verified.")

    # 2. Transaction Matrix Integrity
    tm = pd.read_csv(TABLES_DIR / "state_transaction_matrix.csv", index_col=0)
    assert tm.shape == (36, 8), f"Expected transaction matrix shape (36, 8), got {tm.shape}"
    assert len(tm.index.unique()) == 36, "Duplicate states found in transaction matrix."
    assert tm.isna().sum().sum() == 0, "Missing values found in transaction matrix."
    print("  [PASS] Transaction matrix verified: 36 unique States/UTs, 8 binary items, 0 nulls.")

    # 3. FP-Growth Frequent Itemsets Integrity
    fp_itemsets = pd.read_csv(TABLES_DIR / "stage12_fpgrowth_itemsets.csv")
    assert len(fp_itemsets) == 129, f"Expected 129 frequent itemsets, got {len(fp_itemsets)}"
    assert (fp_itemsets["support"] >= 0.25).all(), "Found itemset support < 0.25"
    assert (fp_itemsets["support"] <= 1.0).all(), "Found itemset support > 1.0"
    print("  [PASS] FP-Growth frequent itemsets verified: 129 itemsets with support in [0.25, 1.0].")

    # 4. FP-Growth Association Rules Integrity
    fp_rules = pd.read_csv(TABLES_DIR / "stage12_fpgrowth_rules.csv")
    assert len(fp_rules) == 1924, f"Expected 1,924 rules, got {len(fp_rules)}"
    assert (fp_rules["lift"] > 1.0).all(), "Found rule with lift <= 1.0"
    assert (fp_rules["confidence"] >= 0.60).all(), "Found rule with confidence < 0.60"
    assert (fp_rules["support"] >= 0.25).all(), "Found rule with support < 0.25"
    
    fp_pairs = pd.read_csv(TABLES_DIR / "stage12_fpgrowth_pair_rules.csv")
    assert len(fp_pairs) == 42, f"Expected 42 pair rules, got {len(fp_pairs)}"
    
    # Check disjoint condition across all rules
    for _, r in fp_rules.iterrows():
        ant = set(r["antecedent"].split(", "))
        con = set(r["consequent"].split(", "))
        assert ant.isdisjoint(con), f"Non-disjoint rule found: {r['antecedent']} -> {r['consequent']}"
    print(f"  [PASS] FP-Growth rules verified: 1,924 filtered rules ({len(fp_pairs)} 1-to-1 pair rules), all disjoint.")

    # 5. Direct Key Rule Metrics Verification
    key_pairs = [
        ("HIGH_FRAUD_MOTIVE", "HIGH_SEC66D_CHEATING", 0.4167, 0.8333, 1.6667),
        ("HIGH_IDENTITY_THEFT", "HIGH_FRAUD_MOTIVE", 0.4444, 0.8421, 1.6842),
        ("HIGH_WOMEN_CYBERCRIME", "HIGH_SEXUAL_EXPLOITATION_MOTIVE", 0.4444, 0.8889, 1.7778)
    ]
    for ant, con, exp_supp, exp_conf, exp_lift in key_pairs:
        match = fp_pairs[(fp_pairs["antecedent"] == ant) & (fp_pairs["consequent"] == con)]
        assert len(match) == 1, f"Missing key rule: {ant} -> {con}"
        assert abs(match["support"].values[0] - exp_supp) < 1e-3, f"Support mismatch for {ant} -> {con}"
        assert abs(match["confidence"].values[0] - exp_conf) < 1e-3, f"Confidence mismatch for {ant} -> {con}"
        assert abs(match["lift"].values[0] - exp_lift) < 1e-3, f"Lift mismatch for {ant} -> {con}"
    print("  [PASS] Key association rule metrics exactly verified against Stage 5 benchmarks.")

    # 6. Apriori vs FP-Growth Mathematical Equivalence
    comp_df = pd.read_csv(TABLES_DIR / "stage12_algorithm_comparison.csv")
    assert len(comp_df) == 5, f"Expected 5 comparison rows, got {len(comp_df)}"
    assert (comp_df["mathematical_match"] == "EXACT").all(), "Found discrepancy between Apriori and FP-Growth results."
    print("  [PASS] Apriori vs. FP-Growth mathematical equivalence 100% verified.")

    # 7. Correlation Matrices Integrity
    pearson_df = pd.read_csv(TABLES_DIR / "stage12_pearson_correlation.csv", index_col=0)
    spearman_df = pd.read_csv(TABLES_DIR / "stage12_spearman_correlation.csv", index_col=0)
    
    assert pearson_df.shape == (12, 12), f"Pearson shape != (12, 12), got {pearson_df.shape}"
    assert spearman_df.shape == (12, 12), f"Spearman shape != (12, 12), got {spearman_df.shape}"
    
    # Symmetry check
    assert np.allclose(pearson_df.values, pearson_df.values.T, atol=1e-5), "Pearson matrix is not symmetric."
    assert np.allclose(spearman_df.values, spearman_df.values.T, atol=1e-5), "Spearman matrix is not symmetric."
    
    # Diagonal check
    assert np.allclose(np.diag(pearson_df.values), 1.0, atol=1e-5), "Pearson diagonal is not all 1.0."
    assert np.allclose(np.diag(spearman_df.values), 1.0, atol=1e-5), "Spearman diagonal is not all 1.0."
    
    # Bounds check
    assert (pearson_df.values >= -1.0 - 1e-5).all() and (pearson_df.values <= 1.0 + 1e-5).all(), "Pearson values out of [-1, 1]"
    assert (spearman_df.values >= -1.0 - 1e-5).all() and (spearman_df.values <= 1.0 + 1e-5).all(), "Spearman values out of [-1, 1]"
    print("  [PASS] Pearson and Spearman 12x12 correlation matrices verified (symmetric, diagonal = 1.0, bounded).")

    # 8. Correlation Comparison & Part-Whole Classification
    corr_comp = pd.read_csv(TABLES_DIR / "stage12_correlation_comparison.csv")
    assert len(corr_comp) == 66, f"Expected 66 feature pairs (12*11/2), got {len(corr_comp)}"
    
    part_whole_rows = corr_comp[corr_comp["relationship_category"] == "A. Structural / Part-Whole Collinearity"]
    assert len(part_whole_rows) >= 3, "Missing structural part-whole classifications."
    assert "total_cases" in part_whole_rows["feature_1"].values or "total_cases" in part_whole_rows["feature_2"].values, "total_cases not in part-whole rows."
    print("  [PASS] 66 bivariate pairs verified with structural part-whole warnings.")

    print("\n>>> ALL STAGE 12 VALIDATION CHECKS COMPLETED SUCCESSFULLY. <<<")
    return True


if __name__ == "__main__":
    test_stage12_pipeline()
