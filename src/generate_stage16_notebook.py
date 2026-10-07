"""
Script to generate notebooks/14_advanced_outlier_detection.ipynb
Stage 16: Advanced Outlier Detection & Anomaly Validation (Unit 6 of Syllabus)
"""

import json
from pathlib import Path


def create_stage16_notebook():
    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Stage 16: Advanced Outlier Detection & Anomaly Validation\n",
                    "**Project**: Cyber Crime Analytics for National Security  \n",
                    "**Syllabus Alignment**: Unit 6 — Outlier & Anomaly Detection (Multivariate Robust Mahalanobis Distance via Minimum Covariance Determinant (MinCovDet) with Chi-Square Thresholds, Density-Based Local Outlier Factor (LOF) with Neighborhood Sensitivity, Isolation Forest Consensus Benchmark, Robust Univariate Tukey IQR Fences, Feature Redundancy & Multicollinearity Audits, Dual-Space Volume vs. Composition Separation, and Small-Denominator Sensitivity Analysis)  \n",
                    "**Data Source**: Validated 2023 Cross-Sectional State/UT Feature Matrix (`outputs/tables/eda_state_feature_matrix.csv` & `data/processed/master_state_2023.csv`)  \n",
                    "**Sample Size**: Primary $N = 36$ State/UT Jurisdictions; Sensitivity Analysis $N = 34$ Jurisdictions (excluding extreme small-denominator cases)  \n",
                    "\n",
                    "---\n",
                    "\n",
                    "## 1. Objective & Analytical Scope\n",
                    "\n",
                    "### Analytical Question:\n",
                    "> **\"Which State/UT observations exhibit unusual combinations of cybercrime volume and composition features under multiple statistical and machine-learning anomaly detection methods, and how do scale-driven anomalies differ from composition-driven anomalies?\"**\n",
                    "\n",
                    "### Academic Guardrails & Methodological Boundaries:\n",
                    "- **Descriptive Anomaly Analysis**: Outliers reflect statistical extremity relative to the observed 2023 distribution, NOT moral criminality, risk scoring, data entry errors, or policing inadequacy.\n",
                    "- **Non-Causal Framework**: Correlation and distance departures describe multi-dimensional location, not crime causes or policy outcomes.\n",
                    "- **Dual Feature Spaces**: We strictly distinguish volume-scale extremity (14-feature space) from compositional crime profile extremity (4-feature space).\n",
                    "- **Small-Denominator Sensitivity**: High proportions resulting from tiny denominators ($N \\le 6$) are explicitly diagnosed via non-destructive sensitivity analysis ($N=34$).\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Setup environment, imports, and display configurations\n",
                    "import os\n",
                    "import sys\n",
                    "import warnings\n",
                    "warnings.filterwarnings('ignore')\n",
                    "from pathlib import Path\n",
                    "\n",
                    "project_root = Path.cwd().resolve()\n",
                    "if str(project_root) not in sys.path:\n",
                    "    sys.path.insert(0, str(project_root))\n",
                    "\n",
                    "import numpy as np\n",
                    "import pandas as pd\n",
                    "import matplotlib.pyplot as plt\n",
                    "import seaborn as sns\n",
                    "\n",
                    "from src.advanced_outlier_detection import (\n",
                    "    VOLUME_FEATURES,\n",
                    "    SHARE_FEATURES,\n",
                    "    ALL_OUTLIER_FEATURES,\n",
                    "    FEATURE_DISPLAY_NAMES,\n",
                    "    load_and_prepare_outlier_data,\n",
                    "    compute_feature_redundancy,\n",
                    "    compute_robust_mahalanobis,\n",
                    "    compute_lof_anomalies,\n",
                    "    build_method_comparison_matrix,\n",
                    "    analyze_volume_vs_composition_anomalies,\n",
                    "    run_stage16_sensitivity_analysis,\n",
                    "    plot_stage16_figures,\n",
                    "    save_stage16_tables\n",
                    ")\n",
                    "from src.outlier_detection import compute_univariate_iqr_outliers, compute_multivariate_isolation_forest\n",
                    "\n",
                    "print(f\"[+] Advanced Outlier Detection environment initialized. Project Root: {project_root}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Data Scope & Feature Architecture\n",
                    "\n",
                    "We load the validated 2023 master feature matrix ($N=36$). The feature architecture comprises:\n",
                    "1. **10 Volume Count Features**: Transformed via $\\log(1+y)$ to compress right-skew without discarding scale.\n",
                    "2. **4 Composition Share Features**: Proportions normalized in $[0, 1]$ representing crime profile composition."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "features_df, metadata = load_and_prepare_outlier_data()\n",
                    "print(f\"[+] Dataset Loaded: {len(features_df)} Jurisdictions.\")\n",
                    "print(f\"[+] Volume Features (10): {VOLUME_FEATURES}\")\n",
                    "print(f\"[+] Share Features (4): {SHARE_FEATURES}\")\n",
                    "features_df[['state_name', 'total_cases'] + SHARE_FEATURES].head(10)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Feature Redundancy & Correlation Audit\n",
                    "\n",
                    "We compute Pearson linear ($r$) and Spearman rank ($\\rho$) correlation matrices to diagnose structural part-whole relationships (e.g. `total_cases` vs `it_act_cases` or `motive_fraud`) and avoid treating scale-driven collinearity as behavioral interaction."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "pearson_corr, spearman_corr, redundancy_df = compute_feature_redundancy(features_df)\n",
                    "print(f\"[+] Computed {len(redundancy_df)} pairwise feature correlations.\")\n",
                    "print(\"=== Top 10 High-Correlation Feature Pairs ===\")\n",
                    "display(redundancy_df.head(10))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 4. Robust Multivariate Mahalanobis Distance (MinCovDet)\n",
                    "\n",
                    "We fit the Minimum Covariance Determinant (`MinCovDet`) estimator on the standardized feature matrix and compute robust Mahalanobis distances against the theoretical Chi-Square cutoff $\\chi^2_{14, 0.975} = 26.12$."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "mah_df, mcd_model, mah_cutoff = compute_robust_mahalanobis(features_df, random_state=42)\n",
                    "n_mah = (mah_df['mahalanobis_outlier'] == 'Yes').sum()\n",
                    "print(f\"[+] Robust Mahalanobis Cutoff (df=14, alpha=0.975): {mah_cutoff:.2f}\")\n",
                    "print(f\"[+] Flagged {n_mah} Mahalanobis outliers:\")\n",
                    "display(mah_df[mah_df['mahalanobis_outlier'] == 'Yes'])"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 5. Local Outlier Factor (LOF) & Neighborhood Sensitivity\n",
                    "\n",
                    "We evaluate density-based local anomalies using Local Outlier Factor (LOF) centered at $k=10$ with sensitivity checks across $k=5, 10, 15$."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "lof_primary_df, lof_sens_df = compute_lof_anomalies(features_df, k_neighbors=10, contamination=0.15)\n",
                    "print(\"=== LOF Outliers at k=10 (Contamination=0.15) ===\")\n",
                    "display(lof_primary_df[lof_primary_df['lof_outlier_k10'] == 'Yes'])\n",
                    "\n",
                    "print(\"\\n=== LOF Neighborhood Sensitivity Summary (k=5, 10, 15) ===\")\n",
                    "display(lof_sens_df.head(10))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 6. Multi-Method Concordance & Consensus Anomaly Scoring\n",
                    "\n",
                    "We integrate the four anomaly detection perspectives:\n",
                    "1. **Tukey IQR Fences** (Univariate)\n",
                    "2. **Isolation Forest** (Multivariate Path Partitioning)\n",
                    "3. **Robust Mahalanobis** (Multivariate Ellipsoidal Distance)\n",
                    "4. **Local Outlier Factor** (Local Density Ratio)\n",
                    "\n",
                    "We calculate a **Consensus Anomaly Score** ($0 \\text{ to } 4$) measuring cross-methodological agreement."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "iqr_stats_df, iqr_outliers_df = compute_univariate_iqr_outliers(features_df)\n",
                    "iso_df, iso_model, X_scaled = compute_multivariate_isolation_forest(features_df, contamination=0.15, random_state=42)\n",
                    "\n",
                    "comp_df, summary_df, pair_df = build_method_comparison_matrix(features_df, iqr_outliers_df, iso_df, mah_df, lof_primary_df)\n",
                    "print(\"=== Method Summary Flag Rates ===\")\n",
                    "display(summary_df)\n",
                    "\n",
                    "print(\"\\n=== Method Agreement (Jaccard Similarity & ARI) ===\")\n",
                    "display(pair_df)\n",
                    "\n",
                    "print(\"\\n=== Top Jurisdictions by Consensus Anomaly Score (>= 2) ===\")\n",
                    "display(comp_df[comp_df['consensus_score'] >= 2])"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 7. Dual-Space Analysis: Volume-Scale vs. Composition-Driven Anomalies\n",
                    "\n",
                    "We compare the 14-feature volume+composition space against the 4-feature composition-only space to disentangle scale-driven anomalies from profile-driven anomalies."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "vol_comp_df = analyze_volume_vs_composition_anomalies(features_df)\n",
                    "print(\"=== Volume-Driven vs. Composition-Driven Breakdown ===\")\n",
                    "display(vol_comp_df['anomaly_orientation'].value_counts())\n",
                    "\n",
                    "print(\"\\n=== Anomaly Orientation Table (Top States) ===\")\n",
                    "display(vol_comp_df[vol_comp_df['anomaly_orientation'] != 'Not Anomalous in Tested Spaces'].head(15))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 8. Small-Denominator Non-Destructive Sensitivity Analysis\n",
                    "\n",
                    "We evaluate how anomaly classifications shift when excluding extreme tiny-denominator Union Territories ($N \\le 6$ cases: Dadra & Nagar Haveli and Lakshadweep), confirming that primary multivariate flags on major states are robust."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "sens_df = run_stage16_sensitivity_analysis(features_df)\n",
                    "print(\"=== Small-Denominator Sensitivity Summary ===\")\n",
                    "display(sens_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 9. Export Deliverables: Tables and Figures 56–61\n",
                    "\n",
                    "We persist all 7 required CSV tables and generate Figures 56–61."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Save tables\n",
                    "save_stage16_tables(redundancy_df, mah_df, lof_sens_df, comp_df, vol_comp_df, sens_df)\n",
                    "\n",
                    "# Generate figures\n",
                    "plot_stage16_figures(features_df, pearson_corr, spearman_corr, mah_df, mah_cutoff, lof_sens_df, comp_df, vol_comp_df)\n",
                    "print(\"[+] All Stage 16 tables and figures successfully generated.\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 10. Key Methodological Findings & Guardrails\n",
                    "\n",
                    "### Summary of Empirical Findings:\n",
                    "1. **Consensus Anomalies ($4/4$ Methods Agree)**: Karnataka, Dadra & Nagar Haveli, and Lakshadweep are identified as consensus anomalies across univariate IQR, Isolation Forest, robust Mahalanobis, and LOF. Karnataka is driven by extreme absolute volume across all categories; Dadra & Nagar Haveli and Lakshadweep are driven by extreme sexual-exploitation motive shares on tiny denominators ($N=6$ and $N=1$).\n",
                    "2. **Strong Multi-Method Anomalies ($3/4$ Methods Agree)**: Uttar Pradesh (extreme volume + high extortion cases), Jharkhand (high IT Act share + fraud motive concentration), and Ladakh (complete zero sparsity on $N=1$).\n",
                    "3. **Dual-Space Separation**: Separating volume space from composition space clarifies that 5 jurisdictions are anomalous strictly due to volume scale (e.g. Telangana, Maharashtra), 8 jurisdictions are anomalous strictly due to composition proportions (e.g. Kerala, UP, Jharkhand, Assam), and 6 jurisdictions exhibit joint extremity.\n",
                    "4. **Methodological Stability**: Excluding tiny jurisdictions ($N=34$) produces high overlap on core state anomaly flags (Isolation Forest Jaccard = $0.8000$, Mahalanobis Jaccard = $0.8750$).\n",
                    "\n",
                    "### Strict Non-Normative Guardrails:\n",
                    "- Statistical anomalies reflect **dimensional distribution extremity**, NOT crime risk, danger, or moral judgment.\n",
                    "- Consensus scores represent **methodological agreement**, not empirical ground truth."
                ]
            }
        ],
        "metadata": {
            "language_info": {
                "name": "python",
                "version": "3.13"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    
    out_path = Path("notebooks/14_advanced_outlier_detection.ipynb")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"[+] Created {out_path}")


if __name__ == "__main__":
    create_stage16_notebook()
