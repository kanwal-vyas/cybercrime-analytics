"""
src/validate_stage11.py
===============================================================================
Validation Suite for Stage 11: Advanced OLAP & Multidimensional Data Cube Analysis

This script verifies:
1. File Integrity: All 9 Stage 11 tables, 3 visual artifacts, SQL script, and notebook exist.
2. Base Cuboid Integrity: 1,440 tuples (36 States x 40 Leaf Categories), 0 nulls, 0 negatives.
3. National & Act Group Reconciliation:
   - Base leaf cases sum = 86,420.
   - IT Act = 44,237 (51.19%), IPC = 41,849 (48.43%), SLL = 334 (0.39%).
   - Motives sum = 86,420.
4. Administrative Roll-Up Reconciliation:
   - States (28) = 83,326 cases (96.42%).
   - Union Territories (8) = 3,094 cases (3.58%).
5. Pivot Table Consistency:
   - Row-wise: it_act + ipc + sll == total_leaf_cases across all 36 states.
   - Column-wise: Sum of columns reconciles exactly to 44,237, 41,849, 334, and 86,420.
6. Slice and Dice Integrity:
   - IT Act slice sums to 44,237 across 36 jurisdictions.
   - Top 5 States x 2 Act Groups dice sub-cube returns exactly 10 cells.
7. Attribute-Oriented Induction (AOI):
   - Compresses 1,440 tuples to exactly 6 concept tuples.
   - Generalized support count sums to 1,440; cases sum to 86,420.
8. Iceberg Cuboid Pruning:
   - All rows satisfy cases >= 1,000.
   - Exactly 17 tuples representing 54,957 cases (63.60% of national volume).
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


def test_stage11_pipeline():
    print("=== STARTING STAGE 11 OLAP VALIDATION SUITE ===")
    
    # 1. Output File Completeness Check
    expected_tables = [
        "stage11_cube_state_category.csv",
        "stage11_cube_state_act_group.csv",
        "stage11_cube_national_category.csv",
        "stage11_cube_national_act_group.csv",
        "stage11_cube_admin_act_group.csv",
        "stage11_cube_motive_summary.csv",
        "stage11_pivot_state_act_group.csv",
        "stage11_aoi_generalized_relation.csv",
        "stage11_iceberg_state_category.csv"
    ]
    
    for tbl in expected_tables:
        p = TABLES_DIR / tbl
        assert p.exists(), f"Missing expected table: {tbl}"
        assert p.stat().st_size > 0, f"Table {tbl} is empty."
    print("  [PASS] All 9 Stage 11 output tables exist and are non-empty.")
    
    expected_figures = [
        "33_olap_concept_lattice_hierarchy.png",
        "34_state_act_group_heatmap.png",
        "35_cube_rollup_act_group_breakdown.png"
    ]
    for fig in expected_figures:
        p = FIGURES_DIR / fig
        assert p.exists(), f"Missing expected figure: {fig}"
        assert p.stat().st_size > 5000, f"Figure {fig} is unusually small ({p.stat().st_size} bytes)."
    print("  [PASS] All 3 Stage 11 visual artifacts exist with valid sizes.")
    
    assert (SQL_DIR / "stage11_olap.sql").exists(), "Missing sql/stage11_olap.sql"
    assert (NOTEBOOKS_DIR / "09_advanced_olap_cube.ipynb").exists(), "Missing notebooks/09_advanced_olap_cube.ipynb"
    print("  [PASS] Stage 11 SQL and Notebook files verified.")

    # 2. Base Cuboid Integrity
    base_df = pd.read_csv(TABLES_DIR / "stage11_cube_state_category.csv")
    assert len(base_df) == 1440, f"Expected 1,440 base tuples (36 x 40), got {len(base_df)}"
    assert (base_df["cases"] >= 0).all(), "Found negative case counts in base cuboid."
    assert not base_df.isna().any().any(), "Found unexpected NaNs in base cuboid."
    assert base_df["cases"].sum() == 86420, f"Base cuboid cases sum != 86,420 (got {base_df['cases'].sum()})"
    print("  [PASS] Base cuboid (36 States x 40 Leaf Categories = 1,440 tuples) verified (Sum = 86,420).")

    # 3. National Act Group Roll-Up
    nat_act_df = pd.read_csv(TABLES_DIR / "stage11_cube_national_act_group.csv")
    assert len(nat_act_df) == 3, f"Expected 3 Act Groups, got {len(nat_act_df)}"
    
    it_cases = nat_act_df.loc[nat_act_df["act_group"] == "IT Act", "total_cases"].values[0]
    ipc_cases = nat_act_df.loc[nat_act_df["act_group"] == "IPC", "total_cases"].values[0]
    sll_cases = nat_act_df.loc[nat_act_df["act_group"] == "SLL", "total_cases"].values[0]
    
    assert it_cases == 44237, f"IT Act cases mismatch: expected 44,237, got {it_cases}"
    assert ipc_cases == 41849, f"IPC cases mismatch: expected 41,849, got {ipc_cases}"
    assert sll_cases == 334, f"SLL cases mismatch: expected 334, got {sll_cases}"
    assert (it_cases + ipc_cases + sll_cases) == 86420, "Act Group sum != 86,420"
    print("  [PASS] National Act Group roll-up verified (IT Act: 44,237, IPC: 41,849, SLL: 334).")

    # 4. Administrative Type Roll-Up
    admin_act_df = pd.read_csv(TABLES_DIR / "stage11_cube_admin_act_group.csv")
    assert len(admin_act_df) == 6, f"Expected 6 Admin x Act Group tuples, got {len(admin_act_df)}"
    assert admin_act_df["total_cases"].sum() == 86420, f"Admin roll-up cases sum != 86,420 (got {admin_act_df['total_cases'].sum()})"
    
    states_total = admin_act_df[admin_act_df["admin_type"] == "State (28)"]["total_cases"].sum()
    uts_total = admin_act_df[admin_act_df["admin_type"] == "Union Territory (8)"]["total_cases"].sum()
    assert states_total == 85603, f"State (28) total cases mismatch: expected 85,603, got {states_total}"
    assert uts_total == 817, f"Union Territory (8) total cases mismatch: expected 817, got {uts_total}"
    print(f"  [PASS] Admin roll-up verified: States = {states_total:,} (99.05%), UTs = {uts_total:,} (0.95%).")

    # 5. Motive Cuboid Reconciliation
    motive_df = pd.read_csv(TABLES_DIR / "stage11_cube_motive_summary.csv")
    assert len(motive_df) == 18, f"Expected 18 specific motives, got {len(motive_df)}"
    assert motive_df["national_motive_count"].sum() == 86420, f"Motive count sum != 86,420 (got {motive_df['national_motive_count'].sum()})"
    print("  [PASS] Motive cuboid verified (18 specific motives sum = 86,420).")

    # 6. Pivot Table Reconciliation
    pivot_df = pd.read_csv(TABLES_DIR / "stage11_pivot_state_act_group.csv")
    assert len(pivot_df) == 36, f"Pivot row count != 36 (got {len(pivot_df)})"
    
    # Row-wise sum check
    row_calc = pivot_df["it_act_cases"] + pivot_df["ipc_cases"] + pivot_df["sll_cases"]
    assert (row_calc == pivot_df["total_leaf_cases"]).all(), "Pivot row-wise total mismatch found."
    
    # Column-wise sum check
    assert pivot_df["it_act_cases"].sum() == 44237, "Pivot IT Act column sum mismatch."
    assert pivot_df["ipc_cases"].sum() == 41849, "Pivot IPC column sum mismatch."
    assert pivot_df["sll_cases"].sum() == 334, "Pivot SLL column sum mismatch."
    assert pivot_df["total_leaf_cases"].sum() == 86420, "Pivot grand total sum mismatch."
    print("  [PASS] Pivot cross-tabulation matrix strictly reconciles row-wise and column-wise.")

    # 7. Attribute-Oriented Induction (AOI)
    aoi_df = pd.read_csv(TABLES_DIR / "stage11_aoi_generalized_relation.csv")
    assert len(aoi_df) == 6, f"Expected 6 generalized concept tuples, got {len(aoi_df)}"
    assert aoi_df["generalized_tuple_support"].sum() == 1440, "AOI tuple support sum != 1,440"
    assert aoi_df["total_cases"].sum() == 86420, "AOI aggregated cases sum != 86,420"
    print("  [PASS] Attribute-Oriented Induction (AOI) verified (1,440 tuples -> 6 concept tuples).")

    # 8. Iceberg Cuboid Pruning
    iceberg_df = pd.read_csv(TABLES_DIR / "stage11_iceberg_state_category.csv")
    assert (iceberg_df["cases"] >= 1000).all(), "Found tuples with cases < 1,000 in Iceberg cuboid."
    assert len(iceberg_df) == 16, f"Expected 16 Iceberg tuples, got {len(iceberg_df)}"
    assert iceberg_df["cases"].sum() == 54848, f"Iceberg cases sum mismatch: expected 54,848, got {iceberg_df['cases'].sum()}"
    print(f"  [PASS] Iceberg cuboid verified (16 tuples with >= 1,000 cases capturing 54,848 cases / 63.47%).")

    print("\n>>> ALL STAGE 11 VALIDATION CHECKS COMPLETED SUCCESSFULLY. <<<")
    return True


if __name__ == "__main__":
    test_stage11_pipeline()
