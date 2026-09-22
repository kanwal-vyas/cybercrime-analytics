"""
clustering.py
=============

Clustering support for the Cyber Crime Analytics project — Syllabus Unit 6
(Clustering and Outlier Detection).

Status: PLACEHOLDER. Conditional on the Dataset Validation Gate (see
PROJECT_PLAN.md): K-Means requires meaningful numerical features describing
the entities being clustered (e.g., states/regions). Do not cluster on
identifiers, or on features chosen arbitrarily.

Do NOT auto-label clusters "High/Medium/Low Risk". Cluster labels must be
descriptive and derived from the actual cluster characteristics once
computed (e.g., "Cluster 1 — high case volume, high growth"), per the
master project rules.
"""

from typing import Optional

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score


def select_clustering_features(df: pd.DataFrame, feature_columns: list[str]) -> pd.DataFrame:
    """
    Select and validate the numerical features to be used for clustering.

    TODO: Implement once real candidate features are known. Should check for
    missing values and non-numeric columns and raise a clear error rather
    than silently coercing data.

    Parameters
    ----------
    df : pd.DataFrame
    feature_columns : list of str
        Candidate numeric columns to use for clustering.

    Returns
    -------
    pd.DataFrame
        Subset of df restricted to the validated feature columns.
    """
    raise NotImplementedError(
        "select_clustering_features() is a placeholder pending "
        "identification of real, meaningful numeric features."
    )


def scale_features(df: pd.DataFrame) -> tuple[np.ndarray, StandardScaler]:
    """
    Scale features prior to K-Means (mean 0, unit variance).

    Safe to use as-is once a validated feature DataFrame is available.

    Parameters
    ----------
    df : pd.DataFrame
        Numeric feature DataFrame (e.g., output of select_clustering_features).

    Returns
    -------
    tuple(np.ndarray, StandardScaler)
        Scaled feature array and the fitted scaler (for reuse/inverse
        transform if needed).
    """
    scaler = StandardScaler()
    scaled = scaler.fit_transform(df)
    return scaled, scaler


def choose_k_via_silhouette(
    scaled_features: np.ndarray,
    k_range: range = range(2, 8),
    random_state: int = 42,
) -> pd.DataFrame:
    """
    Evaluate candidate values of k using silhouette score to help choose a
    defensible number of clusters.

    Safe to use as-is once scaled features are available.

    Parameters
    ----------
    scaled_features : np.ndarray
    k_range : range
        Candidate values of k to evaluate.
    random_state : int
        Fixed seed for reproducibility.

    Returns
    -------
    pd.DataFrame
        Columns: ['k', 'silhouette_score'].
    """
    results = []
    for k in k_range:
        if k >= len(scaled_features):
            continue
        model = KMeans(n_clusters=k, random_state=random_state, n_init=10)
        labels = model.fit_predict(scaled_features)
        score = silhouette_score(scaled_features, labels)
        results.append({"k": k, "silhouette_score": score})
    return pd.DataFrame(results)


def run_kmeans(
    scaled_features: np.ndarray,
    n_clusters: int,
    random_state: int = 42,
) -> tuple[np.ndarray, KMeans]:
    """
    Fit K-Means with a chosen (justified) number of clusters.

    Safe to use as-is once n_clusters has been chosen based on
    choose_k_via_silhouette() and analytical judgment.

    Parameters
    ----------
    scaled_features : np.ndarray
    n_clusters : int
        Should be chosen based on evaluation, not an arbitrary default.
    random_state : int
        Fixed seed for reproducibility.

    Returns
    -------
    tuple(np.ndarray, KMeans)
        Cluster labels and the fitted model.
    """
    model = KMeans(n_clusters=n_clusters, random_state=random_state, n_init=10)
    labels = model.fit_predict(scaled_features)
    return labels, model


def profile_clusters(df: pd.DataFrame, cluster_labels: np.ndarray, feature_columns: list[str]) -> pd.DataFrame:
    """
    Compute per-cluster summary statistics to support interpretation and
    descriptive (non-arbitrary) labeling.

    TODO: Use output of this function to write descriptive cluster labels
    based on actual characteristics — do not default to "High/Medium/Low
    Risk" without justification.

    Parameters
    ----------
    df : pd.DataFrame
    cluster_labels : np.ndarray
    feature_columns : list of str

    Returns
    -------
    pd.DataFrame
        Mean feature values per cluster, plus cluster size.
    """
    profile_df = df[feature_columns].copy()
    profile_df["cluster"] = cluster_labels
    summary = profile_df.groupby("cluster").agg(["mean", "count"])
    return summary
