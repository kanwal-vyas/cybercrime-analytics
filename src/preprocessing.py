"""
preprocessing.py
=================
Stage 2 — Data cleaning and transformation functions for the Cyber Crime
Analytics project. Prepares master analytical datasets from raw NCRB tables.

Never modifies data/raw/.
"""

import re
import numpy as np
import pandas as pd

try:
    from src.data_loader import real_rows
except ImportError:
    from data_loader import real_rows

# Parent/subtotal columns within categories_2023 (verified in notebook 01, Phase 2e).
# These must be EXCLUDED when selecting "leaf" (independent, non-overlapping) numeric
# features to avoid double-counting a total alongside its own children.
CATEGORIES_PARENT_TOTAL_COLS = [
    "A. Offences under I.T. Act - Computer Related Offences - Computer Related Offences (Total)",
    "A. Offences under I.T. Act - Computer Related Offences - A) Computer Related Offences (Sec.66) (Total) -",
    "A. Offences under I.T. Act - Publication/ transmission of obscene / sexually explicit act in electronic form (Sec. 67) - Publication/ transmission of obscene / sexually explicit act in electronic form (Total)",
    "Total Offences under I.T. Act",
    "Fraud (Sec.420 r/w Sec.465, 468- 471 IPC) - Fraud (Sec.420 r/w Sec.465,468- 471 IPC) (Total)",
    "B. IPC Crimes(Involving Communication Devices as Medium/Target or r/w IT Act) - Counterfeiting - Counterfeiting (Total)",
    "Total Offences under IPC",
    "Total Offences under SLL",
    "Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)",
]


def clean_column_names(df: pd.DataFrame) -> pd.DataFrame:
    """
    Collapse embedded newlines/multiple spaces and strip leading/trailing whitespace.
    """
    out = df.copy()
    new_cols = []
    for c in out.columns:
        c2 = c.replace("\n", " ")
        c2 = re.sub(r"\s+", " ", c2).strip()
        new_cols.append(c2)
    out.columns = new_cols
    return out


def _prep_table(df: pd.DataFrame, prefix: str) -> pd.DataFrame:
    """Clean headers, drop aggregate rows, strip State/UT, prefix every non-key column
    with its source table prefix."""
    d = clean_column_names(df)
    d = real_rows(d)
    if "Sl. No." in d.columns:
        d = d.drop(columns=["Sl. No."])
    d["State/UT"] = d["State/UT"].str.strip()
    rename_map = {c: f"{prefix}__{c}" for c in d.columns if c != "State/UT"}
    return d.rename(columns=rename_map).set_index("State/UT")


def build_master_2023(dfs: dict) -> pd.DataFrame:
    """
    Join categories_2023 + motives_2023 + women_2023 + children_2023 into one
    state-level 2023 analytical table (36 rows), on the verified-identical State/UT key.
    """
    cat = _prep_table(dfs["categories_2023"], "cat")
    mot = _prep_table(dfs["motives_2023"], "motive")
    wom = _prep_table(dfs["women_2023"], "women")
    chi = _prep_table(dfs["children_2023"], "child")

    master = cat.join([mot, wom, chi], how="inner")
    assert master.shape[0] == 36, f"Expected 36 states after join, got {master.shape[0]}"
    assert master.isnull().sum().sum() == 0, "Unexpected nulls introduced by 2023 join"
    return master.reset_index()


def get_leaf_category_columns(master: pd.DataFrame) -> list:
    """
    Return the cat__-prefixed columns that are independent LEAF categories (i.e. not
    one of the verified parent/subtotal columns).
    """
    parent_prefixed = {f"cat__{c}" for c in CATEGORIES_PARENT_TOTAL_COLS}
    return [c for c in master.columns if c.startswith("cat__") and c not in parent_prefixed]


def build_trend_table(trend_raw: pd.DataFrame) -> pd.DataFrame:
    """
    Clean the 2018-2022 trend table: drop aggregate rows, strip State/UT, ensure year
    columns are numeric. Ladakh's 2018/2019 values remain NaN (real structural gap).
    """
    d = clean_column_names(trend_raw)
    d = real_rows(d)
    cols_to_drop = [c for c in ["Sl. No.", "Categroy"] if c in d.columns]
    d = d.drop(columns=cols_to_drop)
    d["State/UT"] = d["State/UT"].str.strip()
    year_cols = ["2018", "2019", "2020", "2021", "2022"]
    for c in year_cols:
        d[c] = pd.to_numeric(d[c], errors="coerce")
    assert d.shape[0] == 36, f"Expected 36 states in trend table, got {d.shape[0]}"
    return d.reset_index(drop=True)


def add_engineered_features(master: pd.DataFrame) -> pd.DataFrame:
    """
    Add log-transformed and percentage-share derived features to the 2023 master table.
    """
    out = master.copy()
    grand_total_col = "cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)"
    leaf_cols = get_leaf_category_columns(out)

    out["log_total_cybercrime"] = np.log1p(out[grand_total_col])
    for c in leaf_cols:
        out[f"log__{c}"] = np.log1p(out[c])

    for c in leaf_cols:
        out[f"share__{c}"] = out[c] / out[grand_total_col]

    return out
