"""
prediction.py
=============

Classification / regression / forecasting support for the Cyber Crime
Analytics project — Syllabus Unit 5 (Classification and Prediction).

Status: PLACEHOLDER. Conditional on the Dataset Validation Gate (see
PROJECT_PLAN.md):
- Classification requires a defensible, non-artificial target variable.
- Regression/forecasting requires sufficient numerical/temporal structure.

Do NOT report fabricated accuracy, R², or any other metric. Do NOT claim a
model "predicts accurately" or "proves" anything unless the evaluation
genuinely supports that language (see master project rules, Honesty About
Results).

If the dataset is temporal, care must be taken to avoid leakage: do not fit
scalers/encoders on the full dataset before splitting, and do not randomly
shuffle-split time-series data where temporal order matters.
"""

from typing import Optional

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    mean_absolute_error,
    mean_squared_error,
    r2_score,
)


def define_target(df: pd.DataFrame, target_column: str, task: str) -> pd.Series:
    """
    Validate and return the target variable for a classification or
    regression task.

    TODO: Implement once a real, defensible target column has been
    identified (see Dataset Validation Gate). `task` should be one of
    {"classification", "regression"}.

    Parameters
    ----------
    df : pd.DataFrame
    target_column : str
    task : str
        "classification" or "regression".

    Returns
    -------
    pd.Series
    """
    raise NotImplementedError(
        "define_target() is a placeholder pending identification of a "
        "real, defensible target variable."
    )


def split_features_target(
    df: pd.DataFrame,
    target_column: str,
    feature_columns: list[str],
    test_size: float = 0.2,
    random_state: int = 42,
    is_temporal: bool = False,
):
    """
    Split data into train/test sets.

    If is_temporal is True, this must perform a chronological split (train
    on earlier periods, test on later periods) rather than a random split,
    to avoid leaking future information into training.

    TODO: Implement the temporal-aware branch once the dataset's time
    structure is known.

    Parameters
    ----------
    df : pd.DataFrame
    target_column : str
    feature_columns : list of str
    test_size : float
    random_state : int
        Fixed seed for reproducibility (non-temporal case only).
    is_temporal : bool
        Whether the target/features involve a time dimension requiring
        chronological splitting.

    Returns
    -------
    tuple
        X_train, X_test, y_train, y_test
    """
    if is_temporal:
        raise NotImplementedError(
            "Temporal (chronological) train/test splitting is not yet "
            "implemented. Do not substitute a random split for time-series "
            "data — see PROJECT_PLAN.md (Avoid Data Leakage)."
        )
    X = df[feature_columns]
    y = df[target_column]
    return train_test_split(X, y, test_size=test_size, random_state=random_state)


def evaluate_classification(y_true, y_pred) -> dict:
    """
    Compute standard classification metrics.

    Safe to use as-is once real predictions exist.

    Returns
    -------
    dict
        accuracy, precision, recall, f1, confusion_matrix
    """
    return {
        "accuracy": accuracy_score(y_true, y_pred),
        "precision": precision_score(y_true, y_pred, average="weighted", zero_division=0),
        "recall": recall_score(y_true, y_pred, average="weighted", zero_division=0),
        "f1": f1_score(y_true, y_pred, average="weighted", zero_division=0),
        "confusion_matrix": confusion_matrix(y_true, y_pred),
    }


def evaluate_regression(y_true, y_pred) -> dict:
    """
    Compute standard regression metrics.

    Safe to use as-is once real predictions exist.

    Returns
    -------
    dict
        mae, mse, rmse, r2
    """
    mse = mean_squared_error(y_true, y_pred)
    return {
        "mae": mean_absolute_error(y_true, y_pred),
        "mse": mse,
        "rmse": np.sqrt(mse),
        "r2": r2_score(y_true, y_pred),
    }


def train_model(model, X_train, y_train):
    """
    Fit a given scikit-learn estimator on training data.

    Safe to use as-is. The specific model (Decision Tree, Linear Regression,
    SVM, etc.) is chosen by the caller once the task and dataset are known.

    Parameters
    ----------
    model : sklearn estimator
    X_train, y_train

    Returns
    -------
    Fitted estimator.
    """
    model.fit(X_train, y_train)
    return model
