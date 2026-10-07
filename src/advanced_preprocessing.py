"""
src/advanced_preprocessing.py
===============================================================================
Cyber Crime Analytics for National Security
Stage 10: Advanced Data Preprocessing

This module implements Unit 2 curriculum concepts:
1. Systematic Descriptive Summarization & Distribution Profiling
2. Multi-Scale Data Transformations (Log1p, MinMax, Z-score Standardization)
3. Transformation Skewness & Dispersion Impact Comparison
4. Data Reduction & Principal Component Analysis (PCA) with Scree / Loadings
5. Data Discretization (Equal-Width, Quantile Terciles, Median Binary Splits)
6. Multilevel Concept Hierarchy Generation (Geographic, Legal Category, Motive)

Primary Input:
- outputs/tables/eda_state_feature_matrix.csv (N = 36 States/UTs)
- data/database/cybercrime.db (Dimension tables and hierarchies)

Outputs Generated:
- outputs/tables/stage10_feature_summary.csv
- outputs/tables/stage10_transformation_comparison.csv
- outputs/tables/stage10_transformed_matrix.csv
- outputs/tables/stage10_pca_explained_variance.csv
- outputs/tables/stage10_pca_loadings.csv
- outputs/tables/stage10_pca_scores.csv
- outputs/tables/stage10_discretization_summary.csv
- outputs/tables/stage10_discretized_features.csv
- outputs/tables/stage10_geographic_hierarchy.csv
- outputs/tables/stage10_crime_category_hierarchy.csv
- outputs/tables/stage10_motive_hierarchy.csv
- outputs/figures/28_transform_skewness_comparison.png
- outputs/figures/29_feature_scaling_comparison.png
- outputs/figures/30_pca_scree_and_cumulative_variance.png
- outputs/figures/31_pca_2d_projection.png
- outputs/figures/32_discretization_distributions.png
===============================================================================
"""

import os
import sqlite3
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.decomposition import PCA

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUTS_TABLES = PROJECT_ROOT / "outputs" / "tables"
OUTPUTS_FIGURES = PROJECT_ROOT / "outputs" / "figures"
DATA_DB = PROJECT_ROOT / "data" / "database" / "cybercrime.db"


def load_analytical_matrix() -> pd.DataFrame:
    """Load the validated 2023 analytical feature matrix."""
    eda_matrix_path = OUTPUTS_TABLES / "eda_state_feature_matrix.csv"
    if not eda_matrix_path.exists():
        raise FileNotFoundError(f"Feature matrix not found at {eda_matrix_path}")
    
    df = pd.read_csv(eda_matrix_path)
    
    # Enrich with additional established shares if not present
    if "extortion_motive_share" not in df.columns:
        df["extortion_motive_share"] = df["motive_extortion"] / df["total_cases"].replace(0, np.nan)
        df["extortion_motive_share"] = df["extortion_motive_share"].fillna(0.0)
    if "sexual_exploitation_motive_share" not in df.columns:
        df["sexual_exploitation_motive_share"] = df["motive_sexual_exploitation"] / df["total_cases"].replace(0, np.nan)
        df["sexual_exploitation_motive_share"] = df["sexual_exploitation_motive_share"].fillna(0.0)
        
    return df


# -----------------------------------------------------------------------------
# PART A: DESCRIPTIVE SUMMARIZATION
# -----------------------------------------------------------------------------
def compute_descriptive_summary(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate comprehensive descriptive statistical metrics for all numerical features."""
    num_cols = [c for c in df.columns if c != "state_name"]
    summary_rows = []
    
    for col in num_cols:
        series = df[col].dropna()
        cnt = len(series)
        missing_cnt = df[col].isna().sum()
        mean_val = series.mean()
        std_val = series.std()
        min_val = series.min()
        q1_val = series.quantile(0.25)
        med_val = series.median()
        q3_val = series.quantile(0.75)
        max_val = series.max()
        iqr_val = q3_val - q1_val
        skew_val = series.skew()
        kurt_val = series.kurtosis()
        zero_cnt = (series == 0).sum()
        zero_pct = (zero_cnt / cnt) * 100.0
        
        feat_type = "Share / Proportion" if "share" in col else "Volume Count"
        
        summary_rows.append({
            "feature": col,
            "feature_type": feat_type,
            "count": cnt,
            "missing_count": missing_cnt,
            "mean": round(mean_val, 4),
            "std": round(std_val, 4),
            "min": round(min_val, 4),
            "q1": round(q1_val, 4),
            "median": round(med_val, 4),
            "q3": round(q3_val, 4),
            "max": round(max_val, 4),
            "iqr": round(iqr_val, 4),
            "skewness": round(skew_val, 4),
            "kurtosis": round(kurt_val, 4),
            "zero_count": zero_cnt,
            "zero_pct": round(zero_pct, 2)
        })
        
    summary_df = pd.DataFrame(summary_rows)
    return summary_df


# -----------------------------------------------------------------------------
# PART B: DATA TRANSFORMATIONS & COMPARISON
# -----------------------------------------------------------------------------
def apply_transformations(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Apply Log1p, Z-score Standardization, and Min-Max scaling.
    Returns:
      1. comparison_df: skewness and dispersion comparison table
      2. transformed_matrix: full multi-representation transformed DataFrame
    """
    num_cols = [c for c in df.columns if c != "state_name"]
    count_cols = [c for c in num_cols if "share" not in c]
    share_cols = [c for c in num_cols if "share" in c]
    
    transformed_matrix = df[["state_name"]].copy()
    
    # 1. Log1p transformation for non-negative counts
    for c in count_cols:
        transformed_matrix[f"raw__{c}"] = df[c]
        transformed_matrix[f"log1p__{c}"] = np.log1p(df[c])
        
    for c in share_cols:
        transformed_matrix[f"raw__{c}"] = df[c]

    # 2. Z-Score Standardization
    scaler_z = StandardScaler()
    z_raw = scaler_z.fit_transform(df[num_cols])
    for idx, c in enumerate(num_cols):
        transformed_matrix[f"zscore__{c}"] = z_raw[:, idx]

    # Standardized Log counts + Standardized shares
    log_and_share_cols = [f"log1p__{c}" for c in count_cols] + [f"raw__{c}" for c in share_cols]
    scaler_z_log = StandardScaler()
    z_log = scaler_z_log.fit_transform(transformed_matrix[log_and_share_cols])
    for idx, c in enumerate(log_and_share_cols):
        clean_name = c.replace("raw__", "").replace("log1p__", "log_")
        transformed_matrix[f"zlog__{clean_name}"] = z_log[:, idx]

    # 3. Min-Max Normalization
    scaler_minmax = MinMaxScaler()
    minmax_raw = scaler_minmax.fit_transform(df[num_cols])
    for idx, c in enumerate(num_cols):
        transformed_matrix[f"minmax__{c}"] = minmax_raw[:, idx]

    # Skewness and Dispersion Impact Comparison Table
    comp_rows = []
    for c in num_cols:
        orig_s = df[c]
        z_s = transformed_matrix[f"zscore__{c}"]
        mm_s = transformed_matrix[f"minmax__{c}"]
        
        has_log = c in count_cols
        log_skew = transformed_matrix[f"log1p__{c}"].skew() if has_log else np.nan
        log_mean = transformed_matrix[f"log1p__{c}"].mean() if has_log else np.nan
        log_std = transformed_matrix[f"log1p__{c}"].std() if has_log else np.nan
        
        comp_rows.append({
            "feature": c,
            "feature_type": "Volume Count" if "share" not in c else "Composition Share",
            "original_mean": round(orig_s.mean(), 2),
            "original_std": round(orig_s.std(), 2),
            "original_skewness": round(orig_s.skew(), 3),
            "log1p_mean": round(log_mean, 2) if has_log else "-",
            "log1p_std": round(log_std, 2) if has_log else "-",
            "log1p_skewness": round(log_skew, 3) if has_log else "-",
            "zscore_mean": round(z_s.mean(), 4),
            "zscore_std": round(z_s.std(), 4),
            "zscore_skewness": round(z_s.skew(), 3),
            "minmax_min": round(mm_s.min(), 4),
            "minmax_max": round(mm_s.max(), 4),
            "minmax_skewness": round(mm_s.skew(), 3)
        })
        
    comparison_df = pd.DataFrame(comp_rows)
    return comparison_df, transformed_matrix


# -----------------------------------------------------------------------------
# PART C & D: DATA REDUCTION & PRINCIPAL COMPONENT ANALYSIS (PCA)
# -----------------------------------------------------------------------------
def run_pca_analysis(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, PCA, np.ndarray]:
    """
    Perform Principal Component Analysis on standardized log-counts + shares.
    Returns:
      1. explained_variance_df: Scree & cumulative variance metrics
      2. loadings_df: PC eigenvectors / factor loadings
      3. pca_scores_df: 36 State projected PC coordinates
      4. pca_model: fitted scikit-learn PCA object
      5. X_scaled: scaled input matrix
    """
    count_cols = [c for c in df.columns if c != "state_name" and "share" not in c]
    share_cols = [c for c in df.columns if "share" in c]
    
    # Feature set: log1p on heavy count distributions + raw continuous shares
    X_features = pd.DataFrame()
    for c in count_cols:
        X_features[f"log_{c}"] = np.log1p(df[c])
    for c in share_cols:
        X_features[c] = df[c]
        
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_features)
    
    n_components = min(X_scaled.shape[0], X_scaled.shape[1])
    pca = PCA(n_components=n_components, random_state=42)
    scores = pca.fit_transform(X_scaled)
    
    # 1. Explained Variance Table
    var_exp = pca.explained_variance_ratio_
    cum_var_exp = np.cumsum(var_exp)
    singular_vals = pca.singular_values_
    
    exp_var_rows = []
    for i in range(n_components):
        exp_var_rows.append({
            "component": f"PC{i+1}",
            "eigenvalue": round(singular_vals[i]**2 / (len(df) - 1), 4),
            "explained_variance_ratio": round(var_exp[i], 4),
            "explained_variance_pct": round(var_exp[i] * 100.0, 2),
            "cumulative_variance_ratio": round(cum_var_exp[i], 4),
            "cumulative_variance_pct": round(cum_var_exp[i] * 100.0, 2)
        })
    explained_variance_df = pd.DataFrame(exp_var_rows)
    
    # 2. PCA Loadings Table (Correlation between variables and PCs)
    # Loadings = Components * sqrt(explained_variance)
    loadings = pca.components_.T * np.sqrt(pca.explained_variance_)
    loadings_df = pd.DataFrame(
        loadings,
        index=X_features.columns,
        columns=[f"PC{i+1}" for i in range(n_components)]
    ).reset_index().rename(columns={"index": "feature"})
    
    # 3. PCA Scores Table (Coordinates for each State/UT)
    pca_scores_df = pd.DataFrame(
        scores[:, :6],
        columns=[f"PC{i+1}" for i in range(6)]
    )
    pca_scores_df.insert(0, "state_name", df["state_name"].values)
    
    return explained_variance_df, loadings_df, pca_scores_df, pca, X_scaled


# -----------------------------------------------------------------------------
# PART E: DATA DISCRETIZATION
# -----------------------------------------------------------------------------
def run_discretization_analysis(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Perform Equal-Width, Quantile Tercile, and Median Discretizations on selected features.
    Returns:
      1. discretization_summary_df: Summary of bin ranges and frequency distributions
      2. discretized_df: State/UT dataset with discrete categorical features
    """
    target_cols = ["total_cases", "it_act_share", "fraud_motive_share", "motive_extortion"]
    discretized_df = df[["state_name"]].copy()
    summary_rows = []
    
    for col in target_cols:
        series = df[col]
        
        # 1. Equal-Width Discretization (3 Bins: Low, Medium, High)
        ew_labels = ["Low", "Medium", "High"]
        ew_bins, ew_edges = pd.cut(series, bins=3, labels=ew_labels, retbins=True, include_lowest=True)
        discretized_df[f"{col}__equal_width_3bin"] = ew_bins
        
        ew_counts = ew_bins.value_counts()[ew_labels].to_dict()
        for i, lbl in enumerate(ew_labels):
            summary_rows.append({
                "feature": col,
                "discretization_method": "Equal-Width (3 Bins)",
                "bin_label": lbl,
                "bin_range": f"[{ew_edges[i]:.2f}, {ew_edges[i+1]:.2f}]",
                "count": ew_counts[lbl],
                "percentage": round((ew_counts[lbl] / len(df)) * 100.0, 2)
            })
            
        # 2. Quantile-Based Discretization (3 Terciles: T1_Low, T2_Medium, T3_High)
        q_labels = ["T1_Low", "T2_Medium", "T3_High"]
        q_bins, q_edges = pd.qcut(series, q=3, labels=q_labels, retbins=True, duplicates="drop")
        discretized_df[f"{col}__quantile_3tercile"] = q_bins
        
        q_counts = q_bins.value_counts().to_dict()
        for i in range(len(q_edges) - 1):
            lbl = q_labels[i] if i < len(q_labels) else f"T{i+1}"
            cnt = q_counts.get(lbl, 0)
            summary_rows.append({
                "feature": col,
                "discretization_method": "Quantile-Based (Terciles)",
                "bin_label": lbl,
                "bin_range": f"[{q_edges[i]:.2f}, {q_edges[i+1]:.2f}]",
                "count": cnt,
                "percentage": round((cnt / len(df)) * 100.0, 2)
            })
            
        # 3. Median-Based Binary Split (Aligned with Stage 5 Apriori)
        med_val = series.median()
        med_labels = ["Below_Median", "Above_Median"]
        med_bins = pd.cut(series, bins=[-np.inf, med_val, np.inf], labels=med_labels)
        discretized_df[f"{col}__median_binary"] = med_bins
        
        med_counts = med_bins.value_counts()[med_labels].to_dict()
        summary_rows.append({
            "feature": col,
            "discretization_method": "Median Binary Split",
            "bin_label": "Below_Median",
            "bin_range": f"<= {med_val:.2f}",
            "count": med_counts["Below_Median"],
            "percentage": round((med_counts["Below_Median"] / len(df)) * 100.0, 2)
        })
        summary_rows.append({
            "feature": col,
            "discretization_method": "Median Binary Split",
            "bin_label": "Above_Median",
            "bin_range": f"> {med_val:.2f}",
            "count": med_counts["Above_Median"],
            "percentage": round((med_counts["Above_Median"] / len(df)) * 100.0, 2)
        })
        
    discretization_summary_df = pd.DataFrame(summary_rows)
    return discretization_summary_df, discretized_df


# -----------------------------------------------------------------------------
# PART F: CONCEPT HIERARCHY GENERATION
# -----------------------------------------------------------------------------
def build_concept_hierarchies() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Extract and structure the 3 core concept hierarchies:
      1. Geographic Hierarchy (National -> State/UT -> Jurisdiction -> state_id)
      2. Crime Category Taxonomy (All -> Act Group -> Parent -> Leaf Category)
      3. Crime Motive Taxonomy (All -> Motive Group -> Specific Motive)
    """
    conn = sqlite3.connect(DATA_DB)
    
    # 1. Geographic Hierarchy
    dim_state = pd.read_sql_query("SELECT state_id, state_name, is_ut FROM dim_state ORDER BY state_id;", conn)
    dim_state["level_0_national"] = "India"
    dim_state["level_1_admin_type"] = dim_state["is_ut"].map({0: "State (28)", 1: "Union Territory (8)"})
    dim_state["level_2_jurisdiction"] = dim_state["state_name"]
    dim_state["level_3_state_id"] = dim_state["state_id"]
    geo_hierarchy = dim_state[[
        "level_0_national", "level_1_admin_type", "level_2_jurisdiction", "level_3_state_id", "is_ut"
    ]].rename(columns={"level_2_jurisdiction": "state_name"})
    
    # 2. Crime Category Hierarchy
    dim_cat = pd.read_sql_query(
        "SELECT category_id, category_display_name, act_group, parent_category, is_leaf, section_reference FROM dim_crime_category ORDER BY category_id;",
        conn
    )
    dim_cat["level_0_domain"] = "All Cybercrimes"
    dim_cat["level_1_act_group"] = dim_cat["act_group"]
    dim_cat["level_2_parent"] = dim_cat["parent_category"].fillna(dim_cat["act_group"])
    dim_cat["level_3_category_name"] = dim_cat["category_display_name"]
    dim_cat["level_4_category_id"] = dim_cat["category_id"]
    cat_hierarchy = dim_cat[[
        "level_0_domain", "level_1_act_group", "level_2_parent", "level_3_category_name", 
        "level_4_category_id", "is_leaf", "section_reference"
    ]]
    
    # 3. Crime Motive Hierarchy
    dim_motive = pd.read_sql_query(
        "SELECT motive_id, motive_display_name, is_total FROM dim_motive ORDER BY motive_id;",
        conn
    )
    
    def assign_motive_group(name: str, is_tot: int) -> str:
        if is_tot == 1:
            return "Total"
        if name in ["Fraud", "Financial Gain", "Illegal Gain"]:
            return "Financial & Economic Motives"
        elif name in ["Extortion", "Blackmail"]:
            return "Extortion & Coercion Motives"
        elif name in ["Sexual Exploitation", "Defamation/ Morphing", "Cyber Stalking"]:
            return "Interpersonal & Sexual Exploitation"
        elif name in ["Personal Revenge", "Anger", "Prank"]:
            return "Vindictive & Emotional Motives"
        elif name in ["Disrupt Public Services", "Terrorism", "Political"]:
            return "Security & Disruption Motives"
        else:
            return "Other / Miscellaneous Motives"
            
    dim_motive["level_0_domain"] = "All Motives"
    dim_motive["level_1_motive_group"] = dim_motive.apply(
        lambda r: assign_motive_group(r["motive_display_name"], r["is_total"]), axis=1
    )
    dim_motive["level_2_motive_name"] = dim_motive["motive_display_name"]
    dim_motive["level_3_motive_id"] = dim_motive["motive_id"]
    motive_hierarchy = dim_motive[[
        "level_0_domain", "level_1_motive_group", "level_2_motive_name", "level_3_motive_id", "is_total"
    ]]
    
    conn.close()
    return geo_hierarchy, cat_hierarchy, motive_hierarchy


# -----------------------------------------------------------------------------
# PART G: VISUALIZATIONS
# -----------------------------------------------------------------------------
def plot_transform_skewness_comparison(df: pd.DataFrame, save_path: str = None) -> plt.Figure:
    """Figure 28: Density & histogram comparison of Raw vs Log1p for key count features."""
    target_cols = ["total_cases", "it_act_cases", "motive_fraud", "motive_extortion"]
    
    fig, axes = plt.subplots(4, 2, figsize=(14, 16))
    fig.patch.set_facecolor("#FAFAFA")
    
    for i, col in enumerate(target_cols):
        raw_vals = df[col]
        log_vals = np.log1p(raw_vals)
        
        # Raw distribution
        ax_raw = axes[i, 0]
        sns.histplot(raw_vals, kde=True, ax=ax_raw, color="#2563EB", bins=15, edgecolor="white")
        ax_raw.set_title(f"Raw: {col} (Skewness = {raw_vals.skew():.2f})", fontsize=11, fontweight="bold", pad=8)
        ax_raw.set_xlabel("Observed Case Volume", fontsize=9)
        ax_raw.set_ylabel("State/UT Count", fontsize=9)
        ax_raw.grid(True, linestyle="--", alpha=0.5)
        
        # Log1p distribution
        ax_log = axes[i, 1]
        sns.histplot(log_vals, kde=True, ax=ax_log, color="#059669", bins=15, edgecolor="white")
        ax_log.set_title(f"Log1p: log(1 + {col}) (Skewness = {log_vals.skew():.2f})", fontsize=11, fontweight="bold", pad=8)
        ax_log.set_xlabel("Log-Transformed Scale", fontsize=9)
        ax_log.set_ylabel("State/UT Count", fontsize=9)
        ax_log.grid(True, linestyle="--", alpha=0.5)
        
    plt.suptitle("Figure 28: Effect of Log1p Transformation on Skewed Case Volume Distributions (N = 36)", 
                 fontsize=14, fontweight="bold", y=0.99)
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
    return fig


def plot_feature_scaling_comparison(df: pd.DataFrame, save_path: str = None) -> plt.Figure:
    """Figure 29: Boxplot comparison across Raw, Min-Max Normalized, and Z-Score Standardized features."""
    eval_cols = ["total_cases", "motive_fraud", "women_cases_total", "it_act_share", "fraud_motive_share"]
    
    scaler_z = StandardScaler()
    scaler_mm = MinMaxScaler()
    
    z_df = pd.DataFrame(scaler_z.fit_transform(df[eval_cols]), columns=eval_cols)
    mm_df = pd.DataFrame(scaler_mm.fit_transform(df[eval_cols]), columns=eval_cols)
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    fig.patch.set_facecolor("#FAFAFA")
    
    # 1. Raw Boxplots
    sns.boxplot(data=df[eval_cols], ax=axes[0], palette="Blues", orient="h")
    axes[0].set_title("A. Raw Unscaled Features\n(Dominated by Total Volume Scale)", fontsize=11, fontweight="bold")
    axes[0].set_xlabel("Raw Numerical Value", fontsize=10)
    axes[0].grid(True, linestyle="--", alpha=0.5)
    
    # 2. Min-Max Boxplots
    sns.boxplot(data=mm_df, ax=axes[1], palette="Greens", orient="h")
    axes[1].set_title("B. Min-Max Normalized Features\n(Bounded to [0, 1] Range)", fontsize=11, fontweight="bold")
    axes[1].set_xlabel("Normalized Value [0, 1]", fontsize=10)
    axes[1].set_xlim(-0.05, 1.05)
    axes[1].grid(True, linestyle="--", alpha=0.5)
    
    # 3. Z-Score Boxplots
    sns.boxplot(data=z_df, ax=axes[2], palette="Purples", orient="h")
    axes[2].set_title("C. Z-Score Standardized Features\n(Zero Mean, Unit Variance: N(0, 1))", fontsize=11, fontweight="bold")
    axes[2].set_xlabel("Standardized Value (Standard Deviations)", fontsize=10)
    axes[2].grid(True, linestyle="--", alpha=0.5)
    
    plt.suptitle("Figure 29: Multi-Scale Feature Transformation & Standardization Comparison (N = 36)", 
                 fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
    return fig


def plot_pca_scree_and_variance(exp_var_df: pd.DataFrame, save_path: str = None) -> plt.Figure:
    """Figure 30: PCA Scree plot and cumulative explained variance step curve."""
    fig, ax1 = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor("#FAFAFA")
    
    x = range(1, len(exp_var_df) + 1)
    bars = ax1.bar(x, exp_var_df["explained_variance_pct"], color="#3B82F6", alpha=0.8, edgecolor="black", label="Individual Variance %")
    ax1.set_xlabel("Principal Component Index", fontsize=11, fontweight="bold", labelpad=8)
    ax1.set_ylabel("Individual Explained Variance (%)", color="#1E40AF", fontsize=11, fontweight="bold")
    ax1.tick_params(axis="y", labelcolor="#1E40AF")
    ax1.set_xticks(x)
    ax1.set_xticklabels([f"PC{i}" for i in x])
    
    # Cumulative variance on secondary axis
    ax2 = ax1.twinx()
    line = ax2.plot(x, exp_var_df["cumulative_variance_pct"], color="#DC2626", marker="o", linewidth=2.5, label="Cumulative Variance %")
    ax2.set_ylabel("Cumulative Explained Variance (%)", color="#991B1B", fontsize=11, fontweight="bold")
    ax2.tick_params(axis="y", labelcolor="#991B1B")
    ax2.set_ylim(0, 105)
    
    # Threshold reference lines
    ax2.axhline(80, color="#D97706", linestyle="--", alpha=0.8, label="80% Threshold")
    ax2.axhline(90, color="#059669", linestyle="--", alpha=0.8, label="90% Threshold")
    
    # Add value annotations on bars
    for bar in bars:
        h = bar.get_height()
        if h >= 3.0:
            ax1.text(bar.get_x() + bar.get_width()/2., h + 0.5, f"{h:.1f}%", ha="center", va="bottom", fontsize=8)
            
    # Combine legends
    lines, labels = ax1.get_legend_handles_labels()
    lines2, labels2 = ax2.get_legend_handles_labels()
    ax1.legend(lines + lines2, labels + labels2, loc="center right", framealpha=0.9)
    
    plt.title("Figure 30: PCA Scree Plot & Cumulative Explained Variance (Standardized Log-Count + Share Space)", 
              fontsize=12, fontweight="bold", pad=12)
    plt.tight_layout()
    
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
    return fig


def plot_pca_2d_projection(scores_df: pd.DataFrame, exp_var_df: pd.DataFrame, save_path: str = None) -> plt.Figure:
    """Figure 31: 2D PCA projection scatter of PC1 vs PC2 with state annotations."""
    pc1_pct = exp_var_df.loc[exp_var_df["component"] == "PC1", "explained_variance_pct"].values[0]
    pc2_pct = exp_var_df.loc[exp_var_df["component"] == "PC2", "explained_variance_pct"].values[0]
    
    fig, ax = plt.subplots(figsize=(12, 8))
    fig.patch.set_facecolor("#FAFAFA")
    
    scatter = ax.scatter(scores_df["PC1"], scores_df["PC2"], c="#2563EB", s=90, alpha=0.85, edgecolor="white", linewidth=1.5)
    
    ax.axhline(0, color="gray", linestyle="--", alpha=0.5)
    ax.axvline(0, color="gray", linestyle="--", alpha=0.5)
    
    # Label prominent states
    for _, row in scores_df.iterrows():
        s_name = row["state_name"]
        x, y = row["PC1"], row["PC2"]
        if abs(x) > 2.0 or abs(y) > 1.8 or s_name in ["Karnataka", "Telangana", "Uttar Pradesh", "Maharashtra", "Kerala", "Lakshadweep", "Ladakh"]:
            ax.annotate(s_name, (x, y), xytext=(5, 5), textcoords="offset points", fontsize=8.5, fontweight="semibold")
            
    ax.set_xlabel(f"Principal Component 1 ({pc1_pct:.1f}% Variance Explained)", fontsize=11, fontweight="bold")
    ax.set_ylabel(f"Principal Component 2 ({pc2_pct:.1f}% Variance Explained)", fontsize=11, fontweight="bold")
    ax.set_title(f"Figure 31: 2D PCA Dimensionality Reduction Projection (Cumulative Variance = {pc1_pct + pc2_pct:.1f}%)", 
                 fontsize=13, fontweight="bold", pad=12)
    ax.grid(True, linestyle="--", alpha=0.5)
    
    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
    return fig


def plot_discretization_distributions(disc_summary_df: pd.DataFrame, save_path: str = None) -> plt.Figure:
    """Figure 32: Barchart visualizing frequency distributions across discretization schemes."""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.patch.set_facecolor("#FAFAFA")
    
    feats = ["total_cases", "it_act_share", "fraud_motive_share", "motive_extortion"]
    
    for idx, f in enumerate(feats):
        ax = axes[idx // 2, idx % 2]
        sub = disc_summary_df[disc_summary_df["feature"] == f]
        
        methods = sub["discretization_method"].unique()
        palette = {"Equal-Width (3 Bins)": "#3B82F6", "Quantile-Based (Terciles)": "#10B981", "Median Binary Split": "#8B5CF6"}
        
        sns.barplot(data=sub, x="bin_label", y="count", hue="discretization_method", ax=ax, palette=palette, edgecolor="black")
        ax.set_title(f"Feature: {f}", fontsize=11, fontweight="bold")
        ax.set_xlabel("Discretized Bin Label", fontsize=9)
        ax.set_ylabel("State/UT Count (N=36)", fontsize=9)
        ax.set_ylim(0, 36)
        ax.grid(True, linestyle="--", alpha=0.5)
        ax.legend(title="Method", fontsize=8, title_fontsize=8)
        
    plt.suptitle("Figure 32: Comparison of Discretization Methods (Equal-Width vs. Quantile vs. Median Split)", 
                 fontsize=13, fontweight="bold", y=0.99)
    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
    return fig


# -----------------------------------------------------------------------------
# MAIN PIPELINE EXECUTION
# -----------------------------------------------------------------------------
def run_stage10_pipeline():
    """Execute the complete Stage 10 Advanced Preprocessing workflow."""
    print("=== EXECUTING STAGE 10: ADVANCED DATA PREPROCESSING ===")
    OUTPUTS_TABLES.mkdir(parents=True, exist_ok=True)
    OUTPUTS_FIGURES.mkdir(parents=True, exist_ok=True)
    
    # 1. Load Data
    print("1. Loading analytical feature matrix...")
    df = load_analytical_matrix()
    print(f"   Loaded {len(df)} State/UT observations with {df.shape[1]} features.")
    
    # 2. Descriptive Summarization
    print("2. Generating descriptive statistical summary...")
    summary_df = compute_descriptive_summary(df)
    summary_df.to_csv(OUTPUTS_TABLES / "stage10_feature_summary.csv", index=False)
    
    # 3. Transformations & Comparisons
    print("3. Applying transformations (Log1p, Min-Max, Z-score)...")
    comparison_df, transformed_matrix = apply_transformations(df)
    comparison_df.to_csv(OUTPUTS_TABLES / "stage10_transformation_comparison.csv", index=False)
    transformed_matrix.to_csv(OUTPUTS_TABLES / "stage10_transformed_matrix.csv", index=False)
    
    # 4. PCA Dimensionality Reduction
    print("4. Executing Principal Component Analysis (PCA)...")
    exp_var_df, loadings_df, pca_scores_df, pca_model, X_scaled = run_pca_analysis(df)
    exp_var_df.to_csv(OUTPUTS_TABLES / "stage10_pca_explained_variance.csv", index=False)
    loadings_df.to_csv(OUTPUTS_TABLES / "stage10_pca_loadings.csv", index=False)
    pca_scores_df.to_csv(OUTPUTS_TABLES / "stage10_pca_scores.csv", index=False)
    
    # 5. Discretization
    print("5. Generating discretized features & bin summaries...")
    disc_summary_df, discretized_df = run_discretization_analysis(df)
    disc_summary_df.to_csv(OUTPUTS_TABLES / "stage10_discretization_summary.csv", index=False)
    discretized_df.to_csv(OUTPUTS_TABLES / "stage10_discretized_features.csv", index=False)
    
    # 6. Concept Hierarchies
    print("6. Extracting multilevel concept hierarchies...")
    geo_h, cat_h, motive_h = build_concept_hierarchies()
    geo_h.to_csv(OUTPUTS_TABLES / "stage10_geographic_hierarchy.csv", index=False)
    cat_h.to_csv(OUTPUTS_TABLES / "stage10_crime_category_hierarchy.csv", index=False)
    motive_h.to_csv(OUTPUTS_TABLES / "stage10_motive_hierarchy.csv", index=False)
    
    # 7. Visualizations
    print("7. Generating Stage 10 visual artifacts...")
    p28 = str(OUTPUTS_FIGURES / "28_transform_skewness_comparison.png")
    p29 = str(OUTPUTS_FIGURES / "29_feature_scaling_comparison.png")
    p30 = str(OUTPUTS_FIGURES / "30_pca_scree_and_cumulative_variance.png")
    p31 = str(OUTPUTS_FIGURES / "31_pca_2d_projection.png")
    p32 = str(OUTPUTS_FIGURES / "32_discretization_distributions.png")

    plot_transform_skewness_comparison(df, save_path=p28)
    plot_feature_scaling_comparison(df, save_path=p29)
    plot_pca_scree_and_variance(exp_var_df, save_path=p30)
    plot_pca_2d_projection(pca_scores_df, exp_var_df, save_path=p31)
    plot_discretization_distributions(disc_summary_df, save_path=p32)
    
    print("=== STAGE 10 PREPROCESSING PIPELINE COMPLETED SUCCESSFULLY ===")

    return {
        "feature_summary": str(OUTPUTS_TABLES / "stage10_feature_summary.csv"),
        "transformation_comparison": str(OUTPUTS_TABLES / "stage10_transformation_comparison.csv"),
        "transformed_matrix": str(OUTPUTS_TABLES / "stage10_transformed_matrix.csv"),
        "pca_explained_variance": str(OUTPUTS_TABLES / "stage10_pca_explained_variance.csv"),
        "pca_loadings": str(OUTPUTS_TABLES / "stage10_pca_loadings.csv"),
        "pca_scores": str(OUTPUTS_TABLES / "stage10_pca_scores.csv"),
        "discretization_summary": str(OUTPUTS_TABLES / "stage10_discretization_summary.csv"),
        "discretized_features": str(OUTPUTS_TABLES / "stage10_discretized_features.csv"),
        "geographic_hierarchy": str(OUTPUTS_TABLES / "stage10_geographic_hierarchy.csv"),
        "crime_category_hierarchy": str(OUTPUTS_TABLES / "stage10_crime_category_hierarchy.csv"),
        "motive_hierarchy": str(OUTPUTS_TABLES / "stage10_motive_hierarchy.csv"),
        "figure_28_skewness": p28,
        "figure_29_scaling": p29,
        "figure_30_pca_scree": p30,
        "figure_31_pca_2d": p31,
        "figure_32_discretization": p32
    }


if __name__ == "__main__":
    run_stage10_pipeline()

