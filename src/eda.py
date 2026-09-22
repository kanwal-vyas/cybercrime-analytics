"""
eda.py
======
Reusable exploratory data analysis, statistical profiling, feature matrix
curation, and visualization functions for the Cyber Crime Analytics project.

All functions operate strictly on validated datasets without modifying raw data.
Visualizations are styled for academic clarity with explicit labels, units, and titles.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

PROJECT_ROOT = Path(__file__).resolve().parents[1]
FIGURES_DIR = PROJECT_ROOT / "outputs" / "figures"
TABLES_DIR = PROJECT_ROOT / "outputs" / "tables"

# Setup high quality visualization style
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams["font.family"] = "sans-serif"
plt.rcParams["font.sans-serif"] = ["DejaVu Sans", "Arial", "Helvetica"]
plt.rcParams["axes.titlesize"] = 14
plt.rcParams["axes.labelsize"] = 12
plt.rcParams["figure.titlesize"] = 16


def _save_or_show(fig: plt.Figure, filename: Optional[str] = None) -> None:
    """Internal helper: save a figure to outputs/figures/ and close."""
    if filename:
        FIGURES_DIR.mkdir(parents=True, exist_ok=True)
        fig.savefig(FIGURES_DIR / filename, bbox_inches="tight", dpi=300)
    plt.close(fig)


def save_table(df: pd.DataFrame, filename: str) -> None:
    """Save a DataFrame to outputs/tables/."""
    TABLES_DIR.mkdir(parents=True, exist_ok=True)
    df.to_csv(TABLES_DIR / filename, index=False)


def compute_dataset_profile(df: pd.DataFrame) -> pd.DataFrame:
    """
    Produce summary profiling for DataFrame columns: data types, non-null counts,
    missing count & %, unique counts, and sample values.
    """
    profile = pd.DataFrame({
        "column": df.columns,
        "dtype": [str(df[c].dtype) for c in df.columns],
        "non_null_count": [int(df[c].notnull().sum()) for c in df.columns],
        "missing_count": [int(df[c].isnull().sum()) for c in df.columns],
        "missing_pct": [round(df[c].isnull().sum() / len(df) * 100, 2) for c in df.columns],
        "unique_values": [int(df[c].nunique()) for c in df.columns]
    })
    return profile


def compute_distribution_statistics(series: pd.Series, name: str = "Series") -> Dict[str, float]:
    """
    Compute comprehensive parametric and non-parametric distribution statistics:
    Mean, Std, Median, IQR, Min, Max, Q25, Q75, Skewness, Kurtosis.
    """
    clean = series.dropna()
    q25 = float(clean.quantile(0.25))
    q75 = float(clean.quantile(0.75))
    return {
        "variable": name,
        "count": int(len(clean)),
        "mean": float(clean.mean()),
        "std_dev": float(clean.std()),
        "median": float(clean.median()),
        "min": float(clean.min()),
        "max": float(clean.max()),
        "q25": q25,
        "q75": q75,
        "iqr": float(q75 - q25),
        "skewness": float(clean.skew()),
        "kurtosis": float(clean.kurt())
    }


def plot_state_total_ranking(
    df: pd.DataFrame,
    state_col: str = "State/UT",
    val_col: str = "cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)",
    filename: Optional[str] = "01_state_total_ranking.png"
) -> None:
    """Horizontal bar chart ranking all 36 States/UTs by total cybercrime volume in 2023."""
    sorted_df = df.sort_values(val_col, ascending=True)
    fig, ax = plt.subplots(figsize=(10, 12))
    bars = ax.barh(sorted_df[state_col], sorted_df[val_col], color="#2b5c8f", alpha=0.85, edgecolor="#1c3b5e")
    
    # Add data labels to top 5
    for bar in bars[-5:]:
        width = bar.get_width()
        ax.text(width + 250, bar.get_y() + bar.get_height()/2, f"{int(width):,}", 
                va="center", ha="left", fontsize=9, fontweight="bold", color="#1c3b5e")
        
    ax.set_title("Total Cyber Crime Incidents by State/UT (NCRB 2023)", pad=15, fontweight="bold")
    ax.set_xlabel("Number of Registered Cyber Crime Cases (2023)")
    ax.set_ylabel("State / Union Territory")
    ax.set_xlim(0, max(df[val_col]) * 1.1)
    fig.tight_layout()
    _save_or_show(fig, filename)


def plot_state_distribution_skewness(
    series: pd.Series,
    filename: Optional[str] = "02_state_distribution_skewness.png"
) -> None:
    """Combined Histogram with KDE and Boxplot showing distribution and heavy right-skew."""
    fig, (ax_box, ax_hist) = plt.subplots(2, 1, figsize=(10, 7), sharex=True, gridspec_kw={"height_ratios": [0.3, 0.7]})
    
    # Boxplot
    sns.boxplot(x=series, ax=ax_box, color="#4a90e2", flierprops={"marker": "o", "markerfacecolor": "#d9534f", "markersize": 7})
    ax_box.set(xlabel="")
    ax_box.set_title("State-Level Cybercrime Distribution: Severe Right-Skewness", pad=10, fontweight="bold")
    
    # Histogram + KDE
    sns.histplot(series, kde=True, ax=ax_hist, color="#2b5c8f", bins=15, edgecolor="white", alpha=0.7)
    mean_val = series.mean()
    median_val = series.median()
    ax_hist.axvline(mean_val, color="#d9534f", linestyle="--", linewidth=2, label=f"Mean: {mean_val:,.1f}")
    ax_hist.axvline(median_val, color="#28a745", linestyle="-", linewidth=2, label=f"Median: {median_val:,.1f}")
    
    ax_hist.set_xlabel("State Cyber Crime Case Volume (2023)")
    ax_hist.set_ylabel("Number of States/UTs")
    ax_hist.legend(loc="upper right", frameon=True)
    
    fig.tight_layout()
    _save_or_show(fig, filename)


def plot_category_concentration(
    category_summary_df: pd.DataFrame,
    top_n: int = 15,
    filename_bar: str = "03_category_concentration_top15.png",
    filename_pareto: str = "04_category_pareto_curve.png"
) -> None:
    """Generate Top N categories bar chart and cumulative Pareto curve."""
    leaf_df = category_summary_df[category_summary_df["is_leaf"] == 1].sort_values("national_cases", ascending=False).reset_index(drop=True)
    top_df = leaf_df.head(top_n).sort_values("national_cases", ascending=True)
    
    # 1. Bar chart of Top N Leaf Categories
    fig, ax = plt.subplots(figsize=(11, 8))
    bars = ax.barh(top_df["category_display_name"], top_df["national_cases"], color="#347474", alpha=0.85, edgecolor="#234e4e")
    for bar in bars[-5:]:
        w = bar.get_width()
        ax.text(w + 300, bar.get_y() + bar.get_height()/2, f"{int(w):,}", va="center", ha="left", fontsize=9, fontweight="bold")
    
    ax.set_title(f"Top {top_n} Independent Crime Categories by National Volume (2023)", pad=15, fontweight="bold")
    ax.set_xlabel("Total Registered Cases Across India")
    ax.set_ylabel("Crime Category")
    ax.set_xlim(0, max(top_df["national_cases"]) * 1.15)
    fig.tight_layout()
    _save_or_show(fig, filename_bar)

    # 2. Pareto Cumulative Distribution
    leaf_df["cum_cases"] = leaf_df["national_cases"].cumsum()
    leaf_df["cum_pct"] = leaf_df["cum_cases"] / leaf_df["national_cases"].sum() * 100
    
    fig, ax1 = plt.subplots(figsize=(10, 6))
    x = range(1, len(leaf_df) + 1)
    ax1.bar(x, leaf_df["national_cases"], color="#709fb0", alpha=0.7, label="Cases per Category")
    ax1.set_xlabel("Crime Categories Ranked by Volume (1 to 40)")
    ax1.set_ylabel("Cases per Category", color="#2b5c8f")
    ax1.set_xlim(0, len(leaf_df) + 1)
    
    ax2 = ax1.twinx()
    ax2.plot(x, leaf_df["cum_pct"], color="#d9534f", marker="o", markersize=4, linewidth=2, label="Cumulative Share %")
    ax2.axhline(80, color="#d9534f", linestyle=":", alpha=0.7, label="80% Threshold")
    ax2.set_ylabel("Cumulative National Share (%)", color="#d9534f")
    ax2.set_ylim(0, 105)
    
    # 80% mark
    top_80_count = int((leaf_df["cum_pct"] <= 80).sum()) + 1
    ax2.annotate(f"Top {top_80_count} categories account for ~80% of all cases", 
                 xy=(top_80_count, 80), xytext=(top_80_count + 3, 65),
                 arrowprops=dict(facecolor="#d9534f", shrink=0.05, width=1.5, headwidth=6),
                 fontweight="bold", color="#d9534f")
    
    plt.title("Crime Category Concentration: Pareto Cumulative Distribution", pad=15, fontweight="bold")
    fig.tight_layout()
    _save_or_show(fig, filename_pareto)


def plot_act_group_analysis(
    act_summary_df: pd.DataFrame,
    master_df: pd.DataFrame,
    filename_nat: str = "05_act_group_national.png",
    filename_state: str = "06_state_act_composition.png"
) -> None:
    """Generate National Act Group share and State-wise Act Group composition stacked bar chart."""
    # 1. National Breakdown Bar Chart
    fig, ax = plt.subplots(figsize=(8, 5))
    colors = ["#2b5c8f", "#d9534f", "#f0ad4e"]
    bars = ax.bar(act_summary_df["act_group"], act_summary_df["total_cases"], color=colors, alpha=0.85, edgecolor="black")
    for bar in bars:
        h = bar.get_height()
        pct = (h / act_summary_df["total_cases"].sum()) * 100
        ax.text(bar.get_x() + bar.get_width()/2, h + 800, f"{int(h):,} ({pct:.1f}%)", ha="center", va="bottom", fontweight="bold")
    
    ax.set_title("National Cyber Crime Volume by Legal Act Framework (2023)", pad=15, fontweight="bold")
    ax.set_ylabel("National Total Cases")
    ax.set_ylim(0, max(act_summary_df["total_cases"]) * 1.18)
    fig.tight_layout()
    _save_or_show(fig, filename_nat)

    # 2. State-Wise Stacked Composition (Top 12 States)
    grand_col = "cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)"
    top12_states = master_df.sort_values(grand_col, ascending=False).head(12)
    
    it_col = "cat__Total Offences under I.T. Act"
    ipc_col = "cat__Total Offences under IPC"
    sll_col = "cat__Total Offences under SLL"
    
    comp_df = pd.DataFrame({
        "State/UT": top12_states["State/UT"],
        "IT Act %": top12_states[it_col] / top12_states[grand_col] * 100,
        "IPC %": top12_states[ipc_col] / top12_states[grand_col] * 100,
        "SLL %": top12_states[sll_col] / top12_states[grand_col] * 100
    }).set_index("State/UT")
    
    fig, ax = plt.subplots(figsize=(11, 7))
    comp_df.plot(kind="barh", stacked=True, color=["#2b5c8f", "#d9534f", "#f0ad4e"], ax=ax, edgecolor="black", alpha=0.85)
    ax.set_title("Act Group Legal Composition Across Top 12 Cyber Crime States (2023)", pad=15, fontweight="bold")
    ax.set_xlabel("Percentage Share of State Total Cybercrime (%)")
    ax.set_xlim(0, 100)
    ax.legend(title="Legal Framework", loc="lower right", frameon=True)
    fig.tight_layout()
    _save_or_show(fig, filename_state)


def plot_motive_analysis(
    motive_summary_df: pd.DataFrame,
    master_df: pd.DataFrame,
    filename_dist: str = "07_motive_distribution.png",
    filename_heatmap: str = "08_state_motive_heatmap.png"
) -> None:
    """Generate National Motive Distribution and Top States x Major Motives Heatmap."""
    ind_motives = motive_summary_df[motive_summary_df["is_total"] == 0].sort_values("national_motive_count", ascending=True)
    
    # 1. Horizontal bar chart
    fig, ax = plt.subplots(figsize=(10, 8))
    bars = ax.barh(ind_motives["motive_display_name"], ind_motives["national_motive_count"], color="#4a7c59", alpha=0.85, edgecolor="#2d4d36")
    for bar in bars[-4:]:
        w = bar.get_width()
        pct = (w / ind_motives["national_motive_count"].sum()) * 100
        ax.text(w + 500, bar.get_y() + bar.get_height()/2, f"{int(w):,} ({pct:.1f}%)", va="center", ha="left", fontsize=9, fontweight="bold")
        
    ax.set_title("Distribution of Cyber Crime Motives in India (NCRB 2023)", pad=15, fontweight="bold")
    ax.set_xlabel("National Motive Incidents Count")
    ax.set_xlim(0, max(ind_motives["national_motive_count"]) * 1.18)
    fig.tight_layout()
    _save_or_show(fig, filename_dist)

    # 2. State x Top Motives Heatmap (Top 10 States x Top 6 Motives)
    top_motive_cols = [
        "motive__Fraud", "motive__Extortion", "motive__Sexual Exploitation",
        "motive__Personal Revenge", "motive__Causing Disrepute", "motive__Others"
    ]
    grand_col = "cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)"
    top10_df = master_df.sort_values(grand_col, ascending=False).head(10).set_index("State/UT")
    heatmap_data = top10_df[top_motive_cols].rename(columns=lambda c: c.replace("motive__", ""))
    
    fig, ax = plt.subplots(figsize=(10, 7))
    sns.heatmap(heatmap_data, annot=True, fmt="d", cmap="YlGnBu", cbar_kws={"label": "Reported Cases"}, ax=ax)
    ax.set_title("Major Motives Breakdown Across Top 10 Cyber Crime States (2023)", pad=15, fontweight="bold")
    ax.set_xlabel("Cyber Crime Motive")
    ax.set_ylabel("State / UT")
    fig.tight_layout()
    _save_or_show(fig, filename_heatmap)


def plot_special_subsets(
    master_df: pd.DataFrame,
    filename: str = "09_women_children_subsets.png"
) -> None:
    """Analyze women and children cybercrime subsets as independent dimensions."""
    grand_col = "cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)"
    
    w_tot_col = "women__Total Cyber Crimes against Women"
    c_tot_col = "child__Total Cyber Crimes against Children"
    
    w_series = master_df[w_tot_col]
    c_series = master_df[c_tot_col]
    
    plot_df = pd.DataFrame({
        "State/UT": master_df["State/UT"],
        "Total Cybercrime": master_df[grand_col],
        "Women Cybercrime": w_series,
        "Children Cybercrime": c_series
    })
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
    
    # Top 8 States for Women
    top_w = plot_df.sort_values("Women Cybercrime", ascending=False).head(8).sort_values("Women Cybercrime", ascending=True)
    ax1.barh(top_w["State/UT"], top_w["Women Cybercrime"], color="#b05d76", alpha=0.85, edgecolor="#6e3345")
    ax1.set_title("Top States: Cybercrimes Against Women (2023)", pad=12, fontweight="bold")
    ax1.set_xlabel("Reported Cases")
    
    # Top 8 States for Children
    top_c = plot_df.sort_values("Children Cybercrime", ascending=False).head(8).sort_values("Children Cybercrime", ascending=True)
    ax2.barh(top_c["State/UT"], top_c["Children Cybercrime"], color="#e08963", alpha=0.85, edgecolor="#8f4a2b")
    ax2.set_title("Top States: Cybercrimes Against Children (2023)", pad=12, fontweight="bold")
    ax2.set_xlabel("Reported Cases")
    
    fig.tight_layout()
    _save_or_show(fig, filename)


def plot_correlation_matrix(
    feature_df: pd.DataFrame,
    filename: str = "10_correlation_heatmap.png"
) -> pd.DataFrame:
    """Plot correlation heatmap on non-redundant numerical features."""
    corr = feature_df.corr()
    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1, center=0, 
                linewidths=0.5, cbar_kws={"label": "Pearson Correlation (r)"}, ax=ax)
    ax.set_title("Correlation Matrix of Key Cyber Crime Variables (n=36 States)", pad=15, fontweight="bold")
    fig.tight_layout()
    _save_or_show(fig, filename)
    return corr


def plot_historical_trends(
    trend_df: pd.DataFrame,
    filename_nat: str = "11_historical_national_trend.png",
    filename_states: str = "12_historical_states_trend.png"
) -> None:
    """Plot national historical trend and selected state trajectories (2018-2022)."""
    years = ["2018", "2019", "2020", "2021", "2022"]
    nat_series = trend_df[years].sum(axis=0)
    
    # 1. National Trend Line
    fig, ax = plt.subplots(figsize=(9, 5))
    ax.plot(years, nat_series.values, marker="o", color="#1f4e79", linewidth=2.5, markersize=8)
    for y, val in zip(years, nat_series.values):
        ax.text(y, val + 1500, f"{int(val):,}", ha="center", va="bottom", fontweight="bold", color="#1f4e79")
        
    ax.set_title("National Cyber Crime Trend in India (2018–2022 Rajya Sabha Series)", pad=15, fontweight="bold")
    ax.set_xlabel("Year")
    ax.set_ylabel("Total Registered Cases (All India)")
    ax.set_ylim(min(nat_series) * 0.8, max(nat_series) * 1.15)
    fig.tight_layout()
    _save_or_show(fig, filename_nat)

    # 2. Selected Representative States
    selected_states = ["Karnataka", "Maharashtra", "Telangana", "Uttar Pradesh", "Assam"]
    sel_df = trend_df[trend_df["State/UT"].isin(selected_states)].set_index("State/UT")[years].T
    
    fig, ax = plt.subplots(figsize=(10, 6))
    for state in selected_states:
        if state in sel_df.columns:
            ax.plot(years, sel_df[state], marker="s", linewidth=2, label=state)
            
    ax.set_title("Historical Cybercrime Trajectories for Selected High-Volume States", pad=15, fontweight="bold")
    ax.set_xlabel("Year")
    ax.set_ylabel("Registered Cybercrime Cases")
    ax.legend(title="State/UT", loc="upper left", frameon=True)
    fig.tight_layout()
    _save_or_show(fig, filename_states)


def build_state_feature_matrix(master_df: pd.DataFrame) -> pd.DataFrame:
    """
    Curates a clean, non-redundant state-level feature matrix for downstream
    unsupervised learning (Clustering & Outlier Detection).
    
    Features selected:
    - total_cases: Overall volume
    - it_act_cases: Volume under IT Act
    - ipc_cases: Volume under IPC
    - motive_fraud: Dominant motive count
    - motive_extortion: Violent/coercive motive count
    - motive_sexual_exploitation: Morals/harassment motive count
    - sec66d_cheating_personation: Top financial cheating leaf category
    - sec66c_identity_theft: Identity theft leaf category
    - women_cases_total: Vulnerable victim subset (Women) - Table 9A.10 Total
    - child_cases_total: Vulnerable victim subset (Children) - Table 9A.11 Total
    - it_act_share: Proportion of IT Act in state crime profile
    - fraud_motive_share: Proportion of fraud in state motive profile
    """
    grand_col = "cat__Total Cyber Crimes (IT Act + IPC r/w IT Act + SLL r/w IT Act)"
    it_col = "cat__Total Offences under I.T. Act"
    ipc_col = "cat__Total Offences under IPC"
    
    # Specific leaf categories
    sec66d_col = "cat__A. Offences under I.T. Act - Computer Related Offences - D) Cheating by personation by using computer resource (Sec.66D) -"
    sec66c_col = "cat__A. Offences under I.T. Act - Computer Related Offences - C) Identity Theft (Sec.66C)"
    
    # Motives
    m_fraud = "motive__Fraud"
    m_extort = "motive__Extortion"
    m_sex = "motive__Sexual Exploitation"
    m_total = "motive__Total"
    
    # Subsets (official total columns without double-counting)
    w_tot_col = "women__Total Cyber Crimes against Women"
    c_tot_col = "child__Total Cyber Crimes against Children"
    
    matrix = pd.DataFrame({
        "state_name": master_df["State/UT"],
        "total_cases": master_df[grand_col],
        "it_act_cases": master_df[it_col],
        "ipc_cases": master_df[ipc_col],
        "motive_fraud": master_df[m_fraud],
        "motive_extortion": master_df[m_extort],
        "motive_sexual_exploitation": master_df[m_sex],
        "sec66d_cheating_personation": master_df[sec66d_col],
        "sec66c_identity_theft": master_df[sec66c_col],
        "women_cases_total": master_df[w_tot_col],
        "child_cases_total": master_df[c_tot_col],
        "it_act_share": master_df[it_col] / master_df[grand_col],
        "fraud_motive_share": master_df[m_fraud] / master_df[m_total]
    })
    
    return matrix
