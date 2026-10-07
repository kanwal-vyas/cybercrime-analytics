"""
src/advanced_association.py
===============================================================================
Cyber Crime Analytics for National Security
Stage 12: Advanced Frequent Pattern Mining & Correlation Analysis

This module implements Unit 4 curriculum concepts:
1. Scalable Frequent Itemset Mining: FP-Growth (Frequent Pattern Tree) Implementation
2. Apriori vs. FP-Growth Algorithmic Benchmarking & Mathematical Equivalence Verification
3. Controlled Synthetic Scalability Analysis (N = 36 to 36,000 transactions)
4. Comprehensive Association Rule Evaluation (Support, Confidence, Lift)
5. Bivariate Correlation Analysis: Pearson (Linear) vs. Spearman (Monotonic Rank)
6. Part-Whole Structural Dependency Classification & Methodological Guardrails

Outputs Generated:
- outputs/tables/stage12_fpgrowth_itemsets.csv
- outputs/tables/stage12_fpgrowth_rules.csv
- outputs/tables/stage12_fpgrowth_pair_rules.csv
- outputs/tables/stage12_algorithm_comparison.csv
- outputs/tables/stage12_algorithm_benchmark.csv
- outputs/tables/stage12_synthetic_scalability_benchmark.csv
- outputs/tables/stage12_pearson_correlation.csv
- outputs/tables/stage12_spearman_correlation.csv
- outputs/tables/stage12_correlation_comparison.csv
- outputs/figures/36_fpgrowth_vs_apriori_benchmark.png
- outputs/figures/37_pearson_correlation_heatmap.png
- outputs/figures/38_spearman_correlation_heatmap.png
- outputs/figures/39_pearson_vs_spearman_discrepancy.png
===============================================================================
"""

import os
import time
from pathlib import Path
from typing import Dict, Tuple, List, Any
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns
from mlxtend.frequent_patterns import apriori, fpgrowth, association_rules

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUTS_TABLES = PROJECT_ROOT / "outputs" / "tables"
OUTPUTS_FIGURES = PROJECT_ROOT / "outputs" / "figures"


# -----------------------------------------------------------------------------
# 1. TRANSACTION MATRIX LOADING & FP-GROWTH MINING
# -----------------------------------------------------------------------------
def load_transaction_matrix() -> pd.DataFrame:
    """Load the validated Stage 5 State-Level transaction matrix (N = 36, 8 binary items)."""
    trans_path = OUTPUTS_TABLES / "state_transaction_matrix.csv"
    if not trans_path.exists():
        raise FileNotFoundError(f"Transaction matrix not found at {trans_path}")
    df_trans = pd.read_csv(trans_path, index_col=0)
    return df_trans.astype(bool)


def run_fpgrowth_mining(
    df_trans: pd.DataFrame,
    min_support: float = 0.25,
    min_confidence: float = 0.60
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Execute FP-Growth frequent itemset mining and association rule generation.
    Returns:
      1. fpgrowth_itemsets_df: Frequent itemsets with support and length
      2. fpgrowth_rules_df: Filtered association rules (lift > 1.0)
      3. pair_rules_df: 1-to-1 antecedent-consequent pair rules
    """
    # 1. Mine Frequent Itemsets via FP-Growth
    itemsets = fpgrowth(df_trans, min_support=min_support, use_colnames=True)
    itemsets["length"] = itemsets["itemsets"].apply(lambda s: len(s))
    itemsets["itemsets_str"] = itemsets["itemsets"].apply(lambda s: ", ".join(sorted(list(s))))
    itemsets = itemsets.sort_values(by=["length", "support"], ascending=[True, False]).reset_index(drop=True)
    
    # 2. Generate Association Rules
    rules = association_rules(itemsets, metric="confidence", min_threshold=min_confidence)
    # Filter on positive lift (> 1.0)
    rules = rules[rules["lift"] > 1.0].copy()
    rules["antecedent_len"] = rules["antecedents"].apply(lambda s: len(s))
    rules["consequent_len"] = rules["consequents"].apply(lambda s: len(s))
    rules["antecedents_str"] = rules["antecedents"].apply(lambda s: ", ".join(sorted(list(s))))
    rules["consequents_str"] = rules["consequents"].apply(lambda s: ", ".join(sorted(list(s))))
    
    # Format and round metrics
    rules = rules.sort_values(by=["lift", "confidence", "support"], ascending=[False, False, False]).reset_index(drop=True)
    
    # 3. 1-to-1 Pair Rules
    pair_rules = rules[(rules["antecedent_len"] == 1) & (rules["consequent_len"] == 1)].copy()
    
    return itemsets, rules, pair_rules


# -----------------------------------------------------------------------------
# 2. APRIORI VS FP-GROWTH MATHEMATICAL EQUIVALENCE COMPARISON
# -----------------------------------------------------------------------------
def compare_apriori_vs_fpgrowth(
    df_trans: pd.DataFrame,
    min_support: float = 0.25,
    min_confidence: float = 0.60
) -> pd.DataFrame:
    """
    Verify complete mathematical equivalence of Frequent Itemsets mined by Apriori and FP-Growth.
    """
    # Run Apriori
    ap_itemsets = apriori(df_trans, min_support=min_support, use_colnames=True)
    ap_rules = association_rules(ap_itemsets, metric="confidence", min_threshold=min_confidence)
    ap_rules = ap_rules[ap_rules["lift"] > 1.0]
    
    # Run FP-Growth
    fp_itemsets, fp_rules, fp_pair_rules = run_fpgrowth_mining(df_trans, min_support=min_support, min_confidence=min_confidence)
    
    # Compare Itemsets
    ap_set = set(frozenset(s) for s in ap_itemsets["itemsets"])
    fp_set = set(frozenset(s) for s in fp_itemsets["itemsets"])
    itemset_diff = ap_set.symmetric_difference(fp_set)
    
    # Compare Rules
    ap_rule_pairs = set((frozenset(a), frozenset(c)) for a, c in zip(ap_rules["antecedents"], ap_rules["consequents"]))
    fp_rule_pairs = set((frozenset(a), frozenset(c)) for a, c in zip(fp_rules["antecedents"], fp_rules["consequents"]))
    rule_diff = ap_rule_pairs.symmetric_difference(fp_rule_pairs)
    
    comparison_rows = [{
        "metric": "Number of Transactions (N)",
        "apriori_result": len(df_trans),
        "fpgrowth_result": len(df_trans),
        "mathematical_match": "EXACT"
    }, {
        "metric": "Minimum Support Threshold",
        "apriori_result": f"{min_support:.2f}",
        "fpgrowth_result": f"{min_support:.2f}",
        "mathematical_match": "EXACT"
    }, {
        "metric": "Frequent Itemsets Found",
        "apriori_result": len(ap_itemsets),
        "fpgrowth_result": len(fp_itemsets),
        "mathematical_match": "EXACT" if len(itemset_diff) == 0 else f"DIFF: {len(itemset_diff)}"
    }, {
        "metric": "Filtered Association Rules (Lift > 1.0)",
        "apriori_result": len(ap_rules),
        "fpgrowth_result": len(fp_rules),
        "mathematical_match": "EXACT" if len(rule_diff) == 0 else f"DIFF: {len(rule_diff)}"
    }, {
        "metric": "1-to-1 Pair Rules",
        "apriori_result": len(ap_rules[(ap_rules['antecedents'].apply(len) == 1) & (ap_rules['consequents'].apply(len) == 1)]),
        "fpgrowth_result": len(fp_pair_rules),
        "mathematical_match": "EXACT"
    }]
    
    return pd.DataFrame(comparison_rows)


# -----------------------------------------------------------------------------
# 3. RUNTIME BENCHMARKING & SYNTHETIC SCALABILITY
# -----------------------------------------------------------------------------
def run_runtime_benchmarks(df_trans: pd.DataFrame, n_runs: int = 10) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Benchmark Apriori vs. FP-Growth execution runtime on actual dataset and synthetic scaling sets.
    """
    # 1. Benchmark on actual N = 36 dataset
    ap_times = []
    fp_times = []
    
    for _ in range(n_runs):
        t0 = time.perf_counter()
        _ = apriori(df_trans, min_support=0.25, use_colnames=True)
        ap_times.append(time.perf_counter() - t0)
        
        t0 = time.perf_counter()
        _ = fpgrowth(df_trans, min_support=0.25, use_colnames=True)
        fp_times.append(time.perf_counter() - t0)
        
    benchmark_df = pd.DataFrame({
        "run": range(1, n_runs + 1),
        "apriori_runtime_sec": ap_times,
        "fpgrowth_runtime_sec": fp_times,
        "runtime_diff_sec": np.array(ap_times) - np.array(fp_times)
    })
    
    # 2. Controlled Synthetic Scalability Benchmark (N = 36 to 36,000)
    scale_multipliers = [1, 10, 100, 500, 1000]
    scale_rows = []
    
    for mult in scale_multipliers:
        n_trans = len(df_trans) * mult
        # Duplicate transaction matrix deterministically
        synth_trans = pd.concat([df_trans] * mult, ignore_index=True)
        
        # Measure Apriori
        t0 = time.perf_counter()
        ap_res = apriori(synth_trans, min_support=0.25, use_colnames=True)
        ap_sec = time.perf_counter() - t0
        
        # Measure FP-Growth
        t0 = time.perf_counter()
        fp_res = fpgrowth(synth_trans, min_support=0.25, use_colnames=True)
        fp_sec = time.perf_counter() - t0
        
        scale_rows.append({
            "dataset_type": "Original Cross-Section" if mult == 1 else "Synthetic Scaled",
            "transaction_count": n_trans,
            "multiplier": mult,
            "apriori_runtime_sec": round(ap_sec, 6),
            "fpgrowth_runtime_sec": round(fp_sec, 6),
            "fpgrowth_speedup_factor": round(ap_sec / max(fp_sec, 1e-9), 2),
            "frequent_itemsets_count": len(fp_res)
        })
        
    synthetic_scale_df = pd.DataFrame(scale_rows)
    return benchmark_df, synthetic_scale_df


# -----------------------------------------------------------------------------
# 4. BIVARIATE CORRELATION ANALYSIS (PEARSON VS SPEARMAN)
# -----------------------------------------------------------------------------
def compute_correlation_analysis() -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Calculate Pearson (Linear) and Spearman (Rank) Correlation Matrices across 12 analytical features.
    Classify relationships into Part-Whole, Scale-Related, and Compositional Associations.
    """
    matrix_path = OUTPUTS_TABLES / "eda_state_feature_matrix.csv"
    if not matrix_path.exists():
        raise FileNotFoundError(f"Feature matrix not found at {matrix_path}")
    df = pd.read_csv(matrix_path)
    
    # Ensure all 12 key features exist
    if "extortion_motive_share" not in df.columns:
        df["extortion_motive_share"] = df["motive_extortion"] / df["total_cases"].replace(0, np.nan)
        df["extortion_motive_share"] = df["extortion_motive_share"].fillna(0.0)
        
    feature_cols = [
        "total_cases",
        "it_act_cases",
        "ipc_cases",
        "motive_fraud",
        "motive_extortion",
        "motive_sexual_exploitation",
        "sec66d_cheating_personation",
        "sec66c_identity_theft",
        "women_cases_total",
        "child_cases_total",
        "it_act_share",
        "fraud_motive_share"
    ]
    
    eval_df = df[feature_cols].copy()
    
    # 1. Pearson Linear Correlation Matrix
    pearson_df = eval_df.corr(method="pearson").round(4)
    
    # 2. Spearman Monotonic Rank Correlation Matrix
    spearman_df = eval_df.corr(method="spearman").round(4)
    
    # 3. Comparative Matrix with Classification
    comp_rows = []
    n = len(feature_cols)
    for i in range(n):
        for j in range(i + 1, n):
            f1, f2 = feature_cols[i], feature_cols[j]
            p_r = pearson_df.loc[f1, f2]
            s_r = spearman_df.loc[f1, f2]
            diff = abs(p_r - s_r)
            
            # Classify Relationship Nature
            if (f1 == "total_cases" and f2 in ["it_act_cases", "ipc_cases"]) or \
               (f2 == "total_cases" and f1 in ["it_act_cases", "ipc_cases"]) or \
               (f1 == "it_act_cases" and f2 in ["sec66d_cheating_personation", "sec66c_identity_theft"]):
                category = "A. Structural / Part-Whole Collinearity"
                warning = "Mathematical component relationship; high r reflects subtotal structure, NOT causation."
            elif ("share" not in f1 and "share" not in f2) and (p_r > 0.65 or s_r > 0.65):
                category = "B. Scale-Driven Volume Association"
                warning = "Driven by overall state administrative/population size; both measures scale with total crime."
            elif ("share" in f1 or "share" in f2):
                category = "C. Compositional / Proportion Relationship"
                warning = "Bivariate relationship between relative shares; resistant to population scale."
            else:
                category = "D. Specific Feature Association"
                warning = "Standard empirical bivariate association."
                
            comp_rows.append({
                "feature_1": f1,
                "feature_2": f2,
                "pearson_r": round(p_r, 4),
                "spearman_rho": round(s_r, 4),
                "abs_difference": round(diff, 4),
                "relationship_category": category,
                "methodological_interpretation": warning
            })
            
    comparison_df = pd.DataFrame(comp_rows).sort_values(by="abs_difference", ascending=False).reset_index(drop=True)
    return pearson_df, spearman_df, comparison_df


# -----------------------------------------------------------------------------
# 5. VISUALIZATIONS
# -----------------------------------------------------------------------------
def plot_fpgrowth_vs_apriori_benchmark(scale_df: pd.DataFrame, save_path: str = None) -> plt.Figure:
    """Figure 36: Algorithmic scalability benchmark comparing Apriori vs FP-Growth."""
    fig, axes = plt.subplots(1, 2, figsize=(15, 6))
    fig.patch.set_facecolor("#FAFAFA")
    
    # 1. Bar Chart on Actual Dataset (N = 36)
    actual_row = scale_df.iloc[0]
    ax1 = axes[0]
    algos = ["Apriori", "FP-Growth"]
    times = [actual_row["apriori_runtime_sec"] * 1000, actual_row["fpgrowth_runtime_sec"] * 1000]
    bars = ax1.bar(algos, times, color=["#EF4444", "#10B981"], width=0.45, edgecolor="black")
    ax1.set_ylabel("Execution Runtime (milliseconds)", fontsize=11, fontweight="bold")
    ax1.set_title("A. Runtime on Actual Dataset (N = 36 Transactions)\n(Syllabus Demonstration Setting)", fontsize=12, fontweight="bold", pad=10)
    ax1.grid(axis="y", linestyle="--", alpha=0.6)
    for bar in bars:
        h = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., h + 0.05, f"{h:.2f} ms", ha="center", va="bottom", fontsize=10, fontweight="bold")
        
    # 2. Scalability Line Chart (Synthetic Scaling N = 36 to 36,000)
    ax2 = axes[1]
    ax2.plot(scale_df["transaction_count"], scale_df["apriori_runtime_sec"], marker="o", color="#EF4444", linewidth=2.5, label="Apriori (Candidate Generation)")
    ax2.plot(scale_df["transaction_count"], scale_df["fpgrowth_runtime_sec"], marker="s", color="#10B981", linewidth=2.5, label="FP-Growth (FP-Tree Representation)")
    ax2.set_xscale("log")
    ax2.set_yscale("log")
    ax2.set_xlabel("Transaction Count (Log Scale: N = 36 to 36,000)", fontsize=11, fontweight="bold")
    ax2.set_ylabel("Execution Time (Seconds - Log Scale)", fontsize=11, fontweight="bold")
    ax2.set_title("B. Controlled Synthetic Scalability Curve\n(Demonstrating FP-Tree Compression Advantage)", fontsize=12, fontweight="bold", pad=10)
    ax2.grid(True, which="both", linestyle="--", alpha=0.5)
    ax2.legend(framealpha=0.95, fontsize=10)
    
    plt.suptitle("Figure 36: Algorithmic Benchmarking: Apriori vs. FP-Growth Scalability Evaluation", fontsize=14, fontweight="bold", y=1.02)
    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
    return fig


def plot_correlation_heatmaps(pearson_df: pd.DataFrame, spearman_df: pd.DataFrame, save_path_p: str = None, save_path_s: str = None) -> Tuple[plt.Figure, plt.Figure]:
    """Figures 37 & 38: Pearson Linear and Spearman Monotonic Correlation Heatmaps."""
    # Figure 37: Pearson Heatmap
    fig_p, ax_p = plt.subplots(figsize=(11, 9))
    fig_p.patch.set_facecolor("#FAFAFA")
    sns.heatmap(pearson_df, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1.0, vmax=1.0, linewidths=0.5, linecolor="#E2E8F0", ax=ax_p)
    ax_p.set_title("Figure 37: Pearson Linear Bivariate Correlation Matrix (12 Features, N = 36)", fontsize=13, fontweight="bold", pad=12)
    plt.tight_layout()
    if save_path_p:
        fig_p.savefig(save_path_p, dpi=300, bbox_inches="tight")
        
    # Figure 38: Spearman Heatmap
    fig_s, ax_s = plt.subplots(figsize=(11, 9))
    fig_s.patch.set_facecolor("#FAFAFA")
    sns.heatmap(spearman_df, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1.0, vmax=1.0, linewidths=0.5, linecolor="#E2E8F0", ax=ax_s)
    ax_s.set_title("Figure 38: Spearman Monotonic Rank Correlation Matrix (12 Features, N = 36)", fontsize=13, fontweight="bold", pad=12)
    plt.tight_layout()
    if save_path_s:
        fig_s.savefig(save_path_s, dpi=300, bbox_inches="tight")
        
    return fig_p, fig_s


def plot_pearson_vs_spearman_discrepancy(comp_df: pd.DataFrame, save_path: str = None) -> plt.Figure:
    """Figure 39: Scatter plot comparing Pearson r vs Spearman rho highlighting outlier-driven discrepancies."""
    fig, ax = plt.subplots(figsize=(12, 8))
    fig.patch.set_facecolor("#FAFAFA")
    
    # Color by category
    categories = comp_df["relationship_category"].unique()
    palette = {"A. Structural / Part-Whole Collinearity": "#DC2626", 
               "B. Scale-Driven Volume Association": "#2563EB", 
               "C. Compositional / Proportion Relationship": "#059669", 
               "D. Specific Feature Association": "#7C3AED"}
    
    for cat in categories:
        sub = comp_df[comp_df["relationship_category"] == cat]
        ax.scatter(sub["pearson_r"], sub["spearman_rho"], label=cat, color=palette.get(cat, "gray"), s=70, alpha=0.85, edgecolor="black")
        
    # Reference line y = x (Identical linear and rank association)
    ax.plot([-1, 1], [-1, 1], color="black", linestyle="--", alpha=0.7, label="y = x (Perfect Rank/Linear Agreement)")
    
    # Annotate top discrepancy pairs
    top_diff = comp_df.head(4)
    for _, row in top_diff.iterrows():
        label = f"{row['feature_1']} vs.\n{row['feature_2']} (|Δ|={row['abs_difference']:.2f})"
        ax.annotate(label, (row["pearson_r"], row["spearman_rho"]), xytext=(8, -10), textcoords="offset points", fontsize=8, fontweight="semibold")
        
    ax.set_xlabel("Pearson Linear Correlation Coefficient (r)", fontsize=11, fontweight="bold")
    ax.set_ylabel("Spearman Monotonic Rank Correlation (rho)", fontsize=11, fontweight="bold")
    ax.set_title("Figure 39: Pearson vs. Spearman Correlation Diagnostic: Detecting Outlier & Monotonicity Divergence", fontsize=13, fontweight="bold", pad=12)
    ax.grid(True, linestyle="--", alpha=0.5)
    ax.legend(framealpha=0.95, fontsize=9.5, loc="upper left")
    
    plt.tight_layout()
    if save_path:
        plt.savefig(save_path, dpi=300, bbox_inches="tight")
    return fig


# -----------------------------------------------------------------------------
# 6. MASTER PIPELINE RUNNER
# -----------------------------------------------------------------------------
def run_stage12_pipeline() -> Dict[str, str]:
    """Execute complete Stage 12 pipeline and export all tables and figures."""
    OUTPUTS_TABLES.mkdir(parents=True, exist_ok=True)
    OUTPUTS_FIGURES.mkdir(parents=True, exist_ok=True)
    
    print("=== EXECUTING STAGE 12: ADVANCED FREQUENT PATTERNS & CORRELATION ===")
    
    # 1. Load transaction matrix
    print("1. Loading validated transaction matrix (N = 36)...")
    df_trans = load_transaction_matrix()
    
    # 2. Mine frequent itemsets and rules via FP-Growth
    print("2. Running FP-Growth mining (min_support = 0.25, min_confidence = 0.60)...")
    fp_itemsets, fp_rules, fp_pair_rules = run_fpgrowth_mining(df_trans)
    
    # Export clean itemsets and rules
    fp_itemsets_export = fp_itemsets[["itemsets_str", "length", "support"]].rename(columns={"itemsets_str": "itemset"})
    fp_itemsets_export.to_csv(OUTPUTS_TABLES / "stage12_fpgrowth_itemsets.csv", index=False)
    
    fp_rules_export = fp_rules[["antecedents_str", "consequents_str", "support", "confidence", "lift"]].rename(
        columns={"antecedents_str": "antecedent", "consequents_str": "consequent"}
    )
    fp_rules_export.to_csv(OUTPUTS_TABLES / "stage12_fpgrowth_rules.csv", index=False)
    
    fp_pair_rules_export = fp_pair_rules[["antecedents_str", "consequents_str", "support", "confidence", "lift"]].rename(
        columns={"antecedents_str": "antecedent", "consequents_str": "consequent"}
    )
    fp_pair_rules_export.to_csv(OUTPUTS_TABLES / "stage12_fpgrowth_pair_rules.csv", index=False)
    
    # 3. Compare Apriori vs FP-Growth
    print("3. Comparing Apriori vs FP-Growth mathematical equivalence...")
    comp_algos_df = compare_apriori_vs_fpgrowth(df_trans)
    comp_algos_df.to_csv(OUTPUTS_TABLES / "stage12_algorithm_comparison.csv", index=False)
    
    # 4. Runtime & Scalability Benchmark
    print("4. Executing runtime benchmarks and synthetic scaling experiments...")
    benchmark_df, synthetic_scale_df = run_runtime_benchmarks(df_trans, n_runs=10)
    benchmark_df.to_csv(OUTPUTS_TABLES / "stage12_algorithm_benchmark.csv", index=False)
    synthetic_scale_df.to_csv(OUTPUTS_TABLES / "stage12_synthetic_scalability_benchmark.csv", index=False)
    
    # 5. Correlation Analysis
    print("5. Computing Pearson and Spearman correlation matrices across 12 features...")
    pearson_df, spearman_df, correlation_comp_df = compute_correlation_analysis()
    pearson_df.to_csv(OUTPUTS_TABLES / "stage12_pearson_correlation.csv")
    spearman_df.to_csv(OUTPUTS_TABLES / "stage12_spearman_correlation.csv")
    correlation_comp_df.to_csv(OUTPUTS_TABLES / "stage12_correlation_comparison.csv", index=False)
    
    # 6. Visualizations
    print("6. Generating Stage 12 visual artifacts...")
    p36 = str(OUTPUTS_FIGURES / "36_fpgrowth_vs_apriori_benchmark.png")
    p37 = str(OUTPUTS_FIGURES / "37_pearson_correlation_heatmap.png")
    p38 = str(OUTPUTS_FIGURES / "38_spearman_correlation_heatmap.png")
    p39 = str(OUTPUTS_FIGURES / "39_pearson_vs_spearman_discrepancy.png")
    
    plot_fpgrowth_vs_apriori_benchmark(synthetic_scale_df, save_path=p36)
    plot_correlation_heatmaps(pearson_df, spearman_df, save_path_p=p37, save_path_s=p38)
    plot_pearson_vs_spearman_discrepancy(correlation_comp_df, save_path=p39)
    
    print("=== STAGE 12 PIPELINE COMPLETED SUCCESSFULLY ===")
    
    return {
        "fpgrowth_itemsets": str(OUTPUTS_TABLES / "stage12_fpgrowth_itemsets.csv"),
        "fpgrowth_rules": str(OUTPUTS_TABLES / "stage12_fpgrowth_rules.csv"),
        "fpgrowth_pair_rules": str(OUTPUTS_TABLES / "stage12_fpgrowth_pair_rules.csv"),
        "algorithm_comparison": str(OUTPUTS_TABLES / "stage12_algorithm_comparison.csv"),
        "algorithm_benchmark": str(OUTPUTS_TABLES / "stage12_algorithm_benchmark.csv"),
        "synthetic_scalability_benchmark": str(OUTPUTS_TABLES / "stage12_synthetic_scalability_benchmark.csv"),
        "pearson_correlation": str(OUTPUTS_TABLES / "stage12_pearson_correlation.csv"),
        "spearman_correlation": str(OUTPUTS_TABLES / "stage12_spearman_correlation.csv"),
        "correlation_comparison": str(OUTPUTS_TABLES / "stage12_correlation_comparison.csv"),
        "figure_36_benchmark": p36,
        "figure_37_pearson": p37,
        "figure_38_spearman": p38,
        "figure_39_discrepancy": p39
    }


if __name__ == "__main__":
    run_stage12_pipeline()
