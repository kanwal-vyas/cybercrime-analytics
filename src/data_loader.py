"""
data_loader.py
================

Data loading utilities for the Cyber Crime Analytics project.
Handles loading raw NCRB datasets, processed master datasets, and
establishing SQLite connections to data/database/cybercrime.db.
"""

from pathlib import Path
import sqlite3
from typing import Dict, List, Optional
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[1]
RAW_DATA_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DATA_DIR = PROJECT_ROOT / "data" / "processed"
DATABASE_DIR = PROJECT_ROOT / "data" / "database"
DB_PATH = DATABASE_DIR / "cybercrime.db"

# Canonical raw dataset file mappings
RAW_FILES = {
    "categories_2023": "NCRB_CII_2023_Table_9A_2_0.csv",
    "motives_2023": "NCRB_CII_2023_Table_9A_3_0.csv",
    "women_2023": "NCRB_CII_2023_Table_9A_10_0.csv",
    "children_2023": "NCRB_CII_2023_Table_9A_11_0.csv",
    "trend_2018_2022": "RS_Session_266_AU_226_A_i.csv",
}

# Aggregate labels to exclude when filtering down to the 36 individual States/UTs
AGGREGATE_LABELS = {
    "TOTAL (STATES)", "TOTAL (UTs)", "TOTAL (ALL INDIA)",
    "TOTAL STATE(S)", "TOTAL UT(S)", "TOTAL (STATES / UTS)",
    "TOTAL (ALL-INDIA)", "TOTAL (STATES/UTS)"
}


def real_rows(df: pd.DataFrame, state_col: str = "State/UT") -> pd.DataFrame:
    """Filter out aggregate summary rows (e.g. TOTAL ALL INDIA) leaving only 36 States/UTs."""
    mask = ~df[state_col].astype(str).str.strip().str.upper().isin(AGGREGATE_LABELS)
    return df[mask].copy()


def load_raw_dataset(name: str) -> pd.DataFrame:
    """Load a specific raw CSV dataset by key."""
    if name not in RAW_FILES:
        raise KeyError(f"Unknown dataset key '{name}'. Available: {list(RAW_FILES.keys())}")
    filepath = RAW_DATA_DIR / RAW_FILES[name]
    if not filepath.exists():
        raise FileNotFoundError(f"Raw file not found: {filepath}")
    return pd.read_csv(filepath)


def load_all_raw() -> Dict[str, pd.DataFrame]:
    """Load all 5 raw datasets into a dictionary of DataFrames."""
    return {k: load_raw_dataset(k) for k in RAW_FILES}


def load_processed_dataset(filename: str = "master_state_2023.csv") -> pd.DataFrame:
    """Load a processed dataset from data/processed/."""
    filepath = PROCESSED_DATA_DIR / filename
    if not filepath.exists():
        # Fallback to project root if present
        root_filepath = PROJECT_ROOT / filename
        if root_filepath.exists():
            return pd.read_csv(root_filepath)
        raise FileNotFoundError(f"Processed file not found: {filepath}")
    return pd.read_csv(filepath)


def load_master_2023() -> pd.DataFrame:
    """Load the validated 2023 master state-level table."""
    return load_processed_dataset("master_state_2023.csv")


def load_trend_data() -> pd.DataFrame:
    """Load the cleaned 2018-2022 historical trend table."""
    return load_processed_dataset("trend_2018_2022.csv")


def get_sqlite_connection(db_path: Optional[Path] = None) -> sqlite3.Connection:
    """
    Return a connection to the SQLite analytical database with foreign keys enabled.
    """
    target_path = db_path or DB_PATH
    target_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(target_path))
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def query_db(query: str, db_path: Optional[Path] = None, params: Optional[tuple] = None) -> pd.DataFrame:
    """Execute a SQL query against the analytical database and return a DataFrame."""
    conn = get_sqlite_connection(db_path)
    try:
        return pd.read_sql_query(query, conn, params=params)
    finally:
        conn.close()
