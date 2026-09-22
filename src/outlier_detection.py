"""
outlier_detection.py
=====================

Outlier / anomaly detection support for the Cyber Crime Analytics project —
Syllabus Unit 6 (Clustering and Outlier Detection).

Status: PLACEHOLDER. Conditional on the Dataset Validation Gate (see
PROJECT_PLAN.md): requires sufficient observations and appropriate feature
structure to identify meaningful anomalies rather than noise.

An outlier is not automatically an error. Once real outliers are found, they
must be investigated (not just flagged), and any explanation offered for why
an observation is unusual must be supported by evidence — never asserted
without it (see master project rules, Outlier Interpretation).
"""

from typing import Optional

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


def detect_outliers_iqr(df: pd.DataFrame, column: str, k: float = 1.5) -> pd.Series:
    """
    Flag outliers in a single numeric column using the IQR method.

    Safe to use as-is once a real numeric column is supplied.

    Parameters
    ----------
    df : pd.DataFrame
    column : str
        Numeric column to check.
    k : float
        IQR multiplier (1.5 = standard, 3.0 = "extreme" outliers).

    Returns
    -------
    pd.Series (bool)
        True where the value in `column` is an outlier.
    """
    q1 = df[column].quantile(0.25)
    q3 = df[column].quantile(0.75)
    iqr = q3 - q1
    lower_bound = q1 - k * iqr
    upper_bound = q3 + k * iqr
    return (df[column] < lower_bound) | (df[column] > upper_bound)


def detect_outliers_zscore(df: pd.DataFrame, column: str, threshold: float = 3.0) -> pd.Series:
    """
    Flag outliers in a single numeric column using the Z-score method.

    Safe to use as-is once a real numeric column is supplied.

    Parameters
    ----------
    df : pd.DataFrame
    column : str
        Numeric column to check.
    threshold : float
        Absolute Z-score above which a value is flagged as an outlier.

    Returns
    -------
    pd.Series (bool)
    """
    mean = df[column].mean()
    std = df[column].std()
    if std == 0 or np.isnan(std):
        return pd.Series(False, index=df.index)
    z_scores = (df[column] - mean) / std
    return z_scores.abs() > threshold


def detect_outliers_isolation_forest(
    df: pd.DataFrame,
    feature_columns: list[str],
    contamination: float = "auto",
    random_state: int = 42,
) -> pd.Series:
    """
    Flag multivariate outliers using Isolation Forest.

    TODO: Confirm feature_columns are meaningful and appropriately scaled
    once the real dataset's numeric features are known. `contamination`
    should be chosen deliberately, not left at an arbitrary guess, once the
    expected proportion of anomalies (if any) is discussed.

    Parameters
    ----------
    df : pd.DataFrame
    feature_columns : list of str
    contamination : float or "auto"
        Expected proportion of outliers.
    random_state : int
        Fixed seed for reproducibility.

    Returns
    -------
    pd.Series (bool)
        True where the observation is flagged as an outlier.
    """
    model = IsolationForest(contamination=contamination, random_state=random_state)
    predictions = model.fit_predict(df[feature_columns])
    return pd.Series(predictions == -1, index=df.index)


def summarize_outliers(df: pd.DataFrame, outlier_mask: pd.Series, context_columns: Optional[list[str]] = None) -> pd.DataFrame:
    """
    Return the flagged outlier rows with relevant context columns for
    manual investigation.

    Safe to use as-is once a real outlier_mask is available. Investigation
    of *why* each flagged row is unusual must be done separately, based on
    evidence, and documented in the notebook rather than asserted here.

    Parameters
    ----------
    df : pd.DataFrame
    outlier_mask : pd.Series (bool)
    context_columns : list of str, optional
        Columns to include for interpretability (e.g., state, year,
        category). Defaults to all columns.

    Returns
    -------
    pd.DataFrame
    """
    subset = df[context_columns] if context_columns else df
    return subset[outlier_mask].copy()
