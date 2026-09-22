"""
db_builder.py
==============
Builds and populates the SQLite analytical data warehouse (cybercrime.db)
from processed datasets (master_state_2023.csv and trend_2018_2022.csv).
Runs comprehensive data-quality and referential integrity validations.
"""

from pathlib import Path
import re
import sqlite3
import pandas as pd

from src.data_loader import get_sqlite_connection, load_master_2023, load_trend_data
from src.preprocessing import CATEGORIES_PARENT_TOTAL_COLS

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SQL_DIR = PROJECT_ROOT / "sql"
DB_DIR = PROJECT_ROOT / "data" / "database"
DB_PATH = DB_DIR / "cybercrime.db"

# List of known Union Territories of India
UNION_TERRITORIES = {
    "A&N Islands", "Andaman and Nicobar Islands", "Andaman & Nicobar Islands",
    "Chandigarh",
    "D&N Haveli and Daman & Diu", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Delhi UT",
    "Jammu and Kashmir", "Jammu & Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry"
}


def parse_category_metadata(col_name: str, parent_set: set) -> dict:
    """
    Parse category column name into structured dimensional attributes:
    display_name, act_group, parent_category, is_leaf, section_reference.
    """
    raw = col_name[len("cat__"):] if col_name.startswith("cat__") else col_name
    is_leaf = 0 if col_name in parent_set or raw in CATEGORIES_PARENT_TOTAL_COLS else 1

    # Determine Act Group
    if raw == "Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)":
        act_group = "Grand Total"
        parent_category = None
        display_name = "Total Cyber Crimes (Grand Total)"
    elif raw.startswith("A. Offences under I.T. Act") or raw == "Total Offences under I.T. Act":
        act_group = "IT Act"
        parent_category = "Offences under I.T. Act"
        display_name = raw.replace("A. Offences under I.T. Act - ", "")
    elif raw.startswith("B. IPC Crimes") or raw.startswith("Fraud") or raw.startswith("Cyber Stalking") or raw.startswith("Data theft") or raw == "Total Offences under IPC":
        act_group = "IPC"
        parent_category = "IPC Crimes"
        display_name = raw.replace("B. IPC Crimes(Involving Communication Devices as Medium/Target or r/w IT Act) - ", "")
    elif raw.startswith("C. Offences under SLL") or raw == "Total Offences under SLL":
        act_group = "SLL"
        parent_category = "Offences under SLL"
        display_name = raw.replace("C. Offences under SLL (Involving Communication Devices as Medium/ Target) r/w IT Act - ", "").replace("C. Offences under SLL (Involving Communication Devices as Medium/ Target) r/w IT Act", "")
    else:
        act_group = "IPC"
        parent_category = "IPC Crimes"
        display_name = raw

    display_name = display_name.strip(" -")

    # Extract Section reference if available (e.g., Sec.66, Sec.420)
    sec_match = re.search(r"\((Sec\.[^\)]+)\)", raw) or re.search(r"\(Sec\s*[\d\w,\s\-\/]+\)", raw)
    section_ref = sec_match.group(0).strip("()") if sec_match else None

    return {
        "category_raw_name": col_name,
        "category_display_name": display_name,
        "act_group": act_group,
        "parent_category": parent_category,
        "is_leaf": is_leaf,
        "section_reference": section_ref
    }


def parse_motive_metadata(col_name: str) -> dict:
    """Parse motive column name into structured dimensional attributes."""
    raw = col_name[len("motive__"):] if col_name.startswith("motive__") else col_name
    is_total = 1 if raw.lower() == "total" else 0
    display_name = raw.replace("_", " ").strip()
    return {
        "motive_raw_name": col_name,
        "motive_display_name": display_name,
        "is_total": is_total
    }


def build_database(db_path: Path = DB_PATH) -> sqlite3.Connection:
    """Execute schema, populate all dimensions and facts, and register views."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    if db_path.exists():
        db_path.unlink()

    conn = get_sqlite_connection(db_path)
    cur = conn.cursor()

    print(f"1. Initializing schema from {SQL_DIR / 'schema.sql'}...")
    with open(SQL_DIR / "schema.sql", "r", encoding="utf-8") as f:
        schema_sql = f.read()
    cur.executescript(schema_sql)

    # -------------------------------------------------------------------------
    # Populate Dimensions
    # -------------------------------------------------------------------------
    master_df = load_master_2023()
    trend_df = load_trend_data()

    print("2. Populating dim_year...")
    years = [2023, 2018, 2019, 2020, 2021, 2022]
    cur.executemany("INSERT INTO dim_year (year) VALUES (?);", [(y,) for y in years])

    print("3. Populating dim_state...")
    states = sorted(master_df["State/UT"].unique())
    state_tuples = [(s, 1 if s in UNION_TERRITORIES else 0) for s in states]
    cur.executemany("INSERT INTO dim_state (state_name, is_ut) VALUES (?, ?);", state_tuples)

    # State lookup
    state_id_map = {row[1]: row[0] for row in cur.execute("SELECT state_id, state_name FROM dim_state;").fetchall()}
    year_id_map = {row[1]: row[0] for row in cur.execute("SELECT year_id, year FROM dim_year;").fetchall()}

    print("4. Populating dim_crime_category...")
    cat_cols = [c for c in master_df.columns if c.startswith("cat__")]
    parent_set = {f"cat__{p}" for p in CATEGORIES_PARENT_TOTAL_COLS}
    cat_meta_list = [parse_category_metadata(c, parent_set) for c in cat_cols]

    cur.executemany(
        """
        INSERT INTO dim_crime_category 
        (category_raw_name, category_display_name, act_group, parent_category, is_leaf, section_reference)
        VALUES (:category_raw_name, :category_display_name, :act_group, :parent_category, :is_leaf, :section_reference);
        """,
        cat_meta_list
    )
    cat_id_map = {row[1]: row[0] for row in cur.execute("SELECT category_id, category_raw_name FROM dim_crime_category;").fetchall()}

    print("5. Populating dim_motive...")
    motive_cols = [c for c in master_df.columns if c.startswith("motive__")]
    motive_meta_list = [parse_motive_metadata(c) for c in motive_cols]
    cur.executemany(
        """
        INSERT INTO dim_motive (motive_raw_name, motive_display_name, is_total)
        VALUES (:motive_raw_name, :motive_display_name, :is_total);
        """,
        motive_meta_list
    )
    motive_id_map = {row[1]: row[0] for row in cur.execute("SELECT motive_id, motive_raw_name FROM dim_motive;").fetchall()}

    # -------------------------------------------------------------------------
    # Populate Fact Tables
    # -------------------------------------------------------------------------
    print("6. Populating fact_cybercrime_category_2023...")
    year_2023_id = year_id_map[2023]
    cat_fact_rows = []
    for _, row in master_df.iterrows():
        s_id = state_id_map[row["State/UT"]]
        for col in cat_cols:
            c_id = cat_id_map[col]
            cases = int(row[col])
            cat_fact_rows.append((s_id, year_2023_id, c_id, cases))

    cur.executemany(
        "INSERT INTO fact_cybercrime_category_2023 (state_id, year_id, category_id, cases) VALUES (?, ?, ?, ?);",
        cat_fact_rows
    )

    print("7. Populating fact_cybercrime_motive_2023...")
    motive_fact_rows = []
    for _, row in master_df.iterrows():
        s_id = state_id_map[row["State/UT"]]
        for col in motive_cols:
            m_id = motive_id_map[col]
            count = int(row[col])
            motive_fact_rows.append((s_id, year_2023_id, m_id, count))

    cur.executemany(
        "INSERT INTO fact_cybercrime_motive_2023 (state_id, year_id, motive_id, motive_count) VALUES (?, ?, ?, ?);",
        motive_fact_rows
    )

    print("8. Populating fact_cybercrime_trend...")
    trend_fact_rows = []
    for _, row in trend_df.iterrows():
        s_id = state_id_map[row["State/UT"]]
        for yr in [2018, 2019, 2020, 2021, 2022]:
            val = row[str(yr)]
            cases = None if pd.isna(val) else int(val)
            trend_fact_rows.append((s_id, yr, cases))

    cur.executemany(
        "INSERT INTO fact_cybercrime_trend (state_id, year, cases) VALUES (?, ?, ?);",
        trend_fact_rows
    )

    # -------------------------------------------------------------------------
    # Register Analytical Views
    # -------------------------------------------------------------------------
    print(f"9. Registering views from {SQL_DIR / 'views.sql'}...")
    with open(SQL_DIR / "views.sql", "r", encoding="utf-8") as f:
        views_sql = f.read()
    cur.executescript(views_sql)

    conn.commit()
    print("Database built successfully.")
    return conn


def run_data_quality_checks(conn: sqlite3.Connection):
    """Run referential integrity and mathematical consistency validations."""
    cur = conn.cursor()
    print("\n--- DATA QUALITY & INTEGRITY CHECKS ---")

    # 1. FK Integrity Check
    fk_violations = cur.execute("PRAGMA foreign_key_check;").fetchall()
    assert len(fk_violations) == 0, f"FK Violations detected: {fk_violations}"
    print("[PASS] Foreign Key Integrity: 0 violations.")

    # 2. Table Row Counts
    tables = [
        "dim_state", "dim_year", "dim_crime_category", "dim_motive",
        "fact_cybercrime_category_2023", "fact_cybercrime_motive_2023", "fact_cybercrime_trend"
    ]
    counts = {}
    for t in tables:
        cnt = cur.execute(f"SELECT COUNT(*) FROM {t};").fetchone()[0]
        counts[t] = cnt
        print(f"  Table `{t}`: {cnt:,} rows")

    assert counts["dim_state"] == 36, f"Expected 36 states, got {counts['dim_state']}"
    assert counts["dim_crime_category"] == 49, f"Expected 49 categories, got {counts['dim_crime_category']}"
    assert counts["dim_motive"] == 19, f"Expected 19 motives, got {counts['dim_motive']}"
    assert counts["fact_cybercrime_category_2023"] == 36 * 49, "Fact category row count mismatch"
    assert counts["fact_cybercrime_motive_2023"] == 36 * 19, "Fact motive row count mismatch"
    assert counts["fact_cybercrime_trend"] == 36 * 5, "Fact trend row count mismatch"
    print("[PASS] All dimension and fact row counts match expected exact dimensions.")

    # 3. Mathematical Reconciliation Check: Sum of leaf cases == Reported Grand Total
    recon_query = """
    SELECT 
        state_name, 
        reported_grand_total, 
        total_leaf_cases, 
        reconciliation_diff 
    FROM vw_state_cybercrime_summary 
    WHERE reconciliation_diff != 0;
    """
    mismatches = cur.execute(recon_query).fetchall()
    assert len(mismatches) == 0, f"Category sum discrepancies found: {mismatches}"
    print("[PASS] Leaf Category Sum Reconciliation: 100% match across all 36 States/UTs (0 discrepancies).")

    # 4. View Queries Check
    views = [
        "vw_state_cybercrime_summary", "vw_category_cybercrime_summary",
        "vw_act_group_summary", "vw_state_category_analysis",
        "vw_motive_summary", "vw_historical_trend_growth"
    ]
    for v in views:
        v_cnt = cur.execute(f"SELECT COUNT(*) FROM {v};").fetchone()[0]
        print(f"  View `{v}`: {v_cnt:,} rows returned successfully.")
    print("[PASS] All analytical views operational.")


if __name__ == "__main__":
    connection = build_database()
    run_data_quality_checks(connection)
    connection.close()
