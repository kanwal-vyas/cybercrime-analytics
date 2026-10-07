"""
Script to generate notebooks/07_outlier_detection.ipynb
"""

import json
from pathlib import Path

def create_outlier_notebook():
    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Stage 8: Descriptive Outlier Detection Analysis\n",
                    "**Project**: Cyber Crime Analytics for National Security  \n",
                    "**Data Source**: National Crime Records Bureau (NCRB) 2023 Master Dataset (`master_state_2023.csv`) & EDA Matrix (`eda_state_feature_matrix.csv`)  \n",
                    "**Methodological Position**: Descriptive Statistical Identification of Extreme State/UT Observations ($N = 36$)\n",
                    "\n",
                    "---\n",
                    "\n",
                    "## 1. Objective & Analytical Scope\n",
                    "\n",
                    "### Analytical Purpose:\n",
                    "The objective of this stage is to identify and characterize **statistically extreme State/UT observations** relative to the distribution of cybercrime volume, category concentrations, and motive shares in the validated 2023 NCRB dataset.\n",
                    "\n",
                    "### Critical Methodological Guardrails:\n",
                    "1. **Statistical, Not Causal or Value Judgments**: This is an exploratory and descriptive analysis. Outliers are **statistical anomalies relative to the observed cross-sectional distribution**. They do **not** represent criminality rankings, risk scores, or proof that a state is \"more dangerous\".\n",
                    "2. **Plausible High-Volume Observations vs. Data Errors**: Extreme counts in major population/technology jurisdictions (e.g., Karnataka, Telangana, Uttar Pradesh, Maharashtra) represent genuine high reporting volume, **not data entry errors**.\n",
                    "3. **Small-Denominator Caution**: In small Union Territories with tiny total case counts ($N \\le 10$), extreme motive proportions (e.g., 100% sexual exploitation motive in Lakshadweep on $N=1$) are driven by small denominators, **not high crime volume**.\n",
                    "4. **Dual Perspective (Univariate & Multivariate)**: We evaluate both dimension-specific statistical extremity (Tukey IQR fences) and joint multi-dimensional isolation (Isolation Forest on log-transformed counts + shares).\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Setup environment, paths, and imports\n",
                    "import os\n",
                    "import sys\n",
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
                    "# Import Stage 8 outlier detection module routines\n",
                    "from src.outlier_detection import (\n",
                    "    load_and_prepare_outlier_data,\n",
                    "    compute_univariate_iqr_outliers,\n",
                    "    compute_multivariate_isolation_forest,\n",
                    "    build_state_outlier_summary,\n",
                    "    plot_outlier_iqr_boxplots,\n",
                    "    plot_outlier_flags_by_feature,\n",
                    "    plot_outlier_state_summary,\n",
                    "    plot_outlier_multivariate_projection,\n",
                    "    export_outlier_outputs,\n",
                    "    VOLUME_FEATURES,\n",
                    "    SHARE_FEATURES,\n",
                    "    ALL_OUTLIER_FEATURES,\n",
                    "    FEATURE_DISPLAY_NAMES\n",
                    ")\n",
                    "\n",
                    "print(f\"Working Directory: {project_root}\")\n",
                    "print(\"Stage 8 Outlier Detection module loaded successfully.\")\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "---\n",
                    "## Section B — Feature Selection & Distribution Inspection\n",
                    "\n",
                    "We analyze 14 non-redundant, domain-specific indicators spanning two analytical dimensions:\n",
                    "1. **Volume Dimensions (10 Count Features)**: `total_cases`, `it_act_cases`, `ipc_cases`, `motive_fraud`, `motive_extortion`, `motive_sexual_exploitation`, `sec66d_cheating_personation`, `sec66c_identity_theft`, `women_cases_total`, `child_cases_total`.\n",
                    "2. **Composition Dimensions (4 Share Features)**: `it_act_share`, `fraud_motive_share`, `extortion_motive_share`, `sexual_exploitation_motive_share`.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Load 2023 dataset and prepare analytical features\n",
                    "eda_path = project_root / 'outputs' / 'tables' / 'eda_state_feature_matrix.csv'\n",
                    "master_path = project_root / 'data' / 'processed' / 'master_state_2023.csv'\n",
                    "cluster_path = project_root / 'outputs' / 'tables' / 'cluster_assignments_2023.csv'\n",
                    "\n",
                    "features_df, metadata = load_and_prepare_outlier_data(eda_path, master_path, cluster_path)\n",
                    "print(f\"Prepared Outlier Feature Matrix: {features_df.shape[0]} States/UTs x {len(ALL_OUTLIER_FEATURES)} Features\")\n",
                    "display(features_df.head())\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "---\n",
                    "## Section C — Primary Univariate Outlier Methodology (Tukey IQR Fences)\n",
                    "\n",
                    "### Tukey IQR Fence Definition:\n",
                    "For each feature $X$:\n",
                    "- $Q_1 = 25\\text{th percentile}$, $Q_3 = 75\\text{th percentile}$\n",
                    "- $\\text{IQR} = Q_3 - Q_1$\n",
                    "- $\\text{Lower Fence} = Q_1 - 1.5 \\times \\text{IQR}$\n",
                    "- $\\text{Upper Fence} = Q_3 + 1.5 \\times \\text{IQR}$\n",
                    "\n",
                    "Observations with $x_i > \\text{Upper Fence}$ are flagged as **High Outliers**; observations with $x_i < \\text{Lower Fence}$ are flagged as **Low Outliers**.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Compute univariate IQR statistics and identify fence violations\n",
                    "feature_stats_df, univariate_outliers_df = compute_univariate_iqr_outliers(features_df, ALL_OUTLIER_FEATURES)\n",
                    "\n",
                    "print(\"--- Feature Distribution & Tukey IQR Fences Summary ---\")\n",
                    "display(feature_stats_df[['feature_display', 'feature_type', 'q1', 'median', 'q3', 'iqr', 'upper_fence', 'skewness', 'total_outlier_count', 'flagged_states']])\n",
                    "\n",
                    "print(f\"\\n--- Detailed Univariate Fence Violations (Total Occurrences: {len(univariate_outliers_df)}) ---\")\n",
                    "display(univariate_outliers_df.head(15))\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "---\n",
                    "## Section D — Multivariate Outlier Analysis (Isolation Forest)\n",
                    "\n",
                    "To evaluate joint multi-dimensional extremity without raw volume scale domination:\n",
                    "1. Count features are transformed using $\\log(1 + y)$ to stabilize variance and mitigate extreme right-skew.\n",
                    "2. Transformed counts and composition shares are standardized with `StandardScaler`.\n",
                    "3. An **Isolation Forest** ensemble ($contamination = 0.15, \\text{random\\_state} = 42$) isolates anomalous multi-dimensional profile combinations.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Fit Isolation Forest and compute anomaly scores\n",
                    "multivariate_df, iso_model, X_scaled = compute_multivariate_isolation_forest(features_df, contamination=0.15, random_state=42)\n",
                    "\n",
                    "print(\"--- Isolation Forest Multivariate Outliers (Top 10 Ranked by Anomaly Score) ---\")\n",
                    "display(multivariate_df.head(10))\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "---\n",
                    "## Section E — State-Level Outlier Synthesis & Aggregation\n",
                    "\n",
                    "We synthesize univariate and multivariate results into four descriptive classifications:\n",
                    "1. **`Both`**: Flagged by both univariate Tukey fences and multivariate Isolation Forest ($n = 5$).\n",
                    "2. **`Univariate outlier`**: Flagged along one or more single dimensions, but not isolated multivariately ($n = 12$).\n",
                    "3. **`Multivariate outlier`**: Flagged multivariately due to sparse joint profile combinations (Ladakh, $n = 1$).\n",
                    "4. **`No detected outlier`**: Within expected distribution ranges across all evaluated features ($n = 18$).\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Build unified state outlier summary table\n",
                    "summary_df = build_state_outlier_summary(features_df, univariate_outliers_df, multivariate_df, metadata)\n",
                    "\n",
                    "print(\"--- Overall State/UT Outlier Classification Breakdown ---\")\n",
                    "print(summary_df['outlier_classification'].value_counts())\n",
                    "\n",
                    "print(\"\\n--- State/UT Outlier Summary Table (All 36 Jurisdictions) ---\")\n",
                    "display(summary_df[['state_name', 'total_cases', 'univariate_flags_count', 'isolation_forest_outlier',\n",
                    "                    'outlier_classification', 'small_denominator_flag', 'stage6_cluster_label',\n",
                    "                    'flagged_features']])\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "---\n",
                    "## Section F — Diagnostic Visualizations\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Figure 24: IQR Boxplots\n",
                    "fig_boxplots = plot_outlier_iqr_boxplots(\n",
                    "    features_df,\n",
                    "    save_path=str(project_root / 'outputs' / 'figures' / '24_outlier_iqr_boxplots.png')\n",
                    ")\n",
                    "plt.show()\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Figure 25: Outlier Counts by Feature\n",
                    "fig_flags = plot_outlier_flags_by_feature(\n",
                    "    feature_stats_df,\n",
                    "    save_path=str(project_root / 'outputs' / 'figures' / '25_outlier_flags_by_feature.png')\n",
                    ")\n",
                    "plt.show()\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Figure 26: State/UT Summary Chart\n",
                    "fig_state_summary = plot_outlier_state_summary(\n",
                    "    summary_df,\n",
                    "    save_path=str(project_root / 'outputs' / 'figures' / '26_outlier_state_summary.png')\n",
                    ")\n",
                    "plt.show()\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Figure 27: Multivariate 2D PCA Outlier Projection\n",
                    "fig_multi_proj = plot_outlier_multivariate_projection(\n",
                    "    X_scaled,\n",
                    "    summary_df,\n",
                    "    save_path=str(project_root / 'outputs' / 'figures' / '27_outlier_multivariate_projection.png')\n",
                    ")\n",
                    "plt.show()\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "---\n",
                    "## Section G — Analytical Interpretation & Methodological Findings\n",
                    "\n",
                    "### 1. High-Volume Scale Observations:\n",
                    "- **Karnataka (21,889 cases)**, **Telangana (18,236 cases)**, **Uttar Pradesh (10,794 cases)**, and **Maharashtra (8,103 cases)** consistently exceed the upper IQR fence ($5,804.75$ cases) for total cybercrime.\n",
                    "- These 4 State/UT observations exceed this upper fence, reflecting high reporting volume rather than recording errors.\n",
                    "\n",
                    "### 2. Dimension-Specific Volume Outliers:\n",
                    "- **Extortion Motive Outliers**: Uttar Pradesh ($1,020$ cases, fence: $307.9$), Kerala ($590$ cases), and Karnataka ($437$ cases).\n",
                    "- **Identity Theft Outliers (Sec. 66C)**: Karnataka ($2,411$ cases), Uttar Pradesh ($486$ cases), Jharkhand ($479$ cases), Maharashtra ($474$ cases), and Gujarat ($254$ cases, fence: $196.5$).\n",
                    "- **Cybercrimes Against Children**: Kerala ($443$ cases, fence: $94.4$), Karnataka ($363$ cases), Rajasthan ($306$ cases), and Chhattisgarh ($193$ cases).\n",
                    "\n",
                    "### 3. Small-Denominator Caution (Share Outliers):\n",
                    "- **Dadra and Nagar Haveli and Daman and Diu** ($83.33\\%$ sexual exploitation share) and **Lakshadweep** ($100.00\\%$ sexual exploitation share) exceed the upper Tukey fence ($44.52\\%$).\n",
                    "- **Critical Analytical Context**: These proportions are driven entirely by **tiny denominators** ($N = 6$ total cases and $N = 1$ total case respectively), **not high absolute crime volume**.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Export Tables for Downstream Reporting & Power BI\n",
                    "exported_paths = export_outlier_outputs(\n",
                    "    feature_stats_df=feature_stats_df,\n",
                    "    univariate_outliers_df=univariate_outliers_df,\n",
                    "    multivariate_df=multivariate_df,\n",
                    "    summary_df=summary_df,\n",
                    "    output_dir=str(project_root / 'outputs' / 'tables')\n",
                    ")\n",
                    "\n",
                    "print(\"Exported Stage 8 Outlier Output Files:\")\n",
                    "for k, v in exported_paths.items():\n",
                    "    p = Path(v)\n",
                    "    print(f\"  - {k:<25}: {p.name} ({p.stat().st_size:,} bytes)\")\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "---\n",
                    "## Section H — Methodological Limitations & Analytical Boundaries\n",
                    "\n",
                    "### Explicit Constraints:\n",
                    "1. **Descriptive, Non-Causal Nature**: Outlier detection identifies observations that are statistically unusual relative to the observed distribution. It does not explain causal socio-economic mechanisms or assess criminality.\n",
                    "2. **Cross-Sectional Scope ($N = 36$)**: Outliers are defined relative to the 36 aggregate State/UT observations in the 2023 NCRB dataset.\n",
                    "3. **Reporting & Registration Practices**: Variations in observed volume may reflect differences in police registration practices, specialized cyber cells, and public reporting portals across jurisdictions.\n"
                ]
            }
        ],
        "metadata": {
            "kernelspec": {
                "display_name": "Python 3",
                "language": "python",
                "name": "python3"
            },
            "language_info": {
                "name": "python",
                "version": "3.13.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 5
    }
    
    nb_path = Path('notebooks/07_outlier_detection.ipynb')
    with open(nb_path, 'w', encoding='utf-8') as f:
        json.dump(nb, f, indent=2)
    print(f"Generated {nb_path.name} successfully.")

if __name__ == '__main__':
    create_outlier_notebook()
