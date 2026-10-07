"""
Script to generate notebooks/13_advanced_clustering.ipynb
Stage 15: Advanced Clustering & Cluster Validation (Unit 6 of Syllabus)
"""

import json
from pathlib import Path


def create_stage15_notebook():
    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Stage 15: Advanced Clustering & Cluster Validation\n",
                    "**Project**: Cyber Crime Analytics for National Security  \n",
                    "**Syllabus Alignment**: Unit 6 — Advanced Clustering & Cluster Validation (Agglomerative Hierarchical Clustering with Ward Linkage, Gaussian Mixture Models with EM & AIC/BIC, DBSCAN Density Exploration, Multi-Criteria Internal Validation: Silhouette, Calinski-Harabasz, Davies-Bouldin, Label-Invariant Partition Agreement: ARI, NMI, Cluster Profile Robustness, Small-N Stability, and Tiny-Denominator Sensitivity Analysis)  \n",
                    "**Data Source**: Validated 2023 Cross-Sectional State/UT Crime Composition Matrix (`data/processed/master_state_2023.csv`)  \n",
                    "**Sample Size**: Primary $N = 36$ State/UT Jurisdictions; Sensitivity Analysis $N = 34$ Jurisdictions (excluding extreme small-denominator cases)  \n",
                    "\n",
                    "---\n",
                    "\n",
                    "## 1. Objective & Analytical Scope\n",
                    "\n",
                    "### Analytical Question:\n",
                    "> **\"Do alternative clustering paradigms (Hierarchical Ward Agglomerative Clustering and Probabilistic Gaussian Mixture Models) reproduce the 4-cluster cybercrime composition profiles established in Stage 6, and is K=4 mathematically robust under multi-criteria validation metrics?\"**\n",
                    "\n",
                    "### Analytical & Methodological Guardrails:\n",
                    "- **Frozen Stage 6 Baseline**: Stage 6 selected $K=4$ K-Means as an interpretable compromise based on 4 proportional features (`it_act_share`, `fraud_motive_share`, `extortion_motive_share`, `sexual_exploitation_motive_share`) with Silhouette = 0.3497.\n",
                    "- **Descriptive Profile Analysis**: Clusters represent compositional crime patterns (e.g. Higher IT Act / Higher Fraud Share Profile), NOT moral, safety, or policing priority rankings.\n",
                    "- **Volume Exclusion**: Total case volume is strictly excluded from distance/mixture space and examined only descriptively post-hoc.\n",
                    "- **Multi-Criteria Validation**: No single metric is treated as absolute ground truth. Silhouette, Calinski-Harabasz, Davies-Bouldin, and AIC/BIC are jointly evaluated.\n"
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
                    "from src.advanced_clustering import (\n",
                    "    CLUSTERING_FEATURES,\n",
                    "    CLUSTER_LABELS_K4,\n",
                    "    load_clustering_dataset,\n",
                    "    run_comprehensive_validation,\n",
                    "    run_stage15_clustering_suite,\n",
                    "    plot_stage15_figures,\n",
                    "    save_stage15_tables\n",
                    ")\n",
                    "\n",
                    "print(f\"[+] Advanced Clustering environment initialized. Project Root: {project_root}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Data & Feature Audit\n",
                    "\n",
                    "We load the validated 2023 master state cross-section ($N=36$). We extract the four normalized compositional features and standardize them using `StandardScaler`."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "raw_df, X_scaled, scaler = load_clustering_dataset('data/processed/master_state_2023.csv')\n",
                    "print(f\"[+] Dataset Loaded: {len(raw_df)} Jurisdictions.\")\n",
                    "print(f\"[+] Features extracted: {CLUSTERING_FEATURES}\")\n",
                    "print(f\"[+] Scaled Matrix Shape: {X_scaled.shape}, Mean: {X_scaled.mean(axis=0).round(4)}, Std: {X_scaled.std(axis=0).round(4)}\")\n",
                    "raw_df[['state_name', 'total_cases'] + CLUSTERING_FEATURES].head(10)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Multi-Criteria Cluster Validation across K in [2, 8]\n",
                    "\n",
                    "We systematically evaluate $K \\in [2, 8]$ across:\n",
                    "1. **K-Means (Reference)**: Minimizes within-cluster sum-of-squares (inertia).\n",
                    "2. **Agglomerative Hierarchical Clustering (Ward Linkage)**: Minimizes variance growth upon cluster mergers.\n",
                    "3. **Gaussian Mixture Model (GMM)**: Probabilistic generative mixture with full covariance and AIC/BIC penalized likelihood.\n",
                    "4. **DBSCAN Density Exploration**: Density-connected components across eps in [0.8, 1.5] and min_samples in [2, 3]."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "val_df = run_comprehensive_validation(X_scaled)\n",
                    "print(f\"[+] Evaluated {len(val_df)} configurations.\")\n",
                    "val_df"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 4. Method Comparison at Preferred Reference K=4\n",
                    "\n",
                    "We evaluate partition structures at $K=4$, measuring internal validity and label-invariant partition agreement (Adjusted Rand Index and Normalized Mutual Information)."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "val_df, algo_comp_df, assign_df, stability_df, profiles_df, agreement_df, sensitivity_df = run_stage15_clustering_suite(\n",
                    "    raw_df, X_scaled\n",
                    ")\n",
                    "\n",
                    "print(\"=== Algorithm Comparison (K=4) ===\")\n",
                    "display(algo_comp_df)\n",
                    "\n",
                    "print(\"\\n=== Partition Agreement (ARI & NMI at K=4) ===\")\n",
                    "display(agreement_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 5. Cluster Profiles & Compositional Summaries\n",
                    "\n",
                    "We examine the descriptive cluster profiles under the reference $K=4$ partition to understand the substantive cybercrime characteristics of each group."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "print(\"=== Descriptive Cluster Profiles (Reference K=4) ===\")\n",
                    "display(profiles_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 6. Jurisdiction-Level Stability Analysis\n",
                    "\n",
                    "We assess cross-algorithm assignment consistency for all 36 State/UT jurisdictions across K-Means, Agglomerative, and GMM."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "print(\"=== Cross-Method Jurisdiction Stability ===\")\n",
                    "display(stability_df.head(15))\n",
                    "\n",
                    "print(\"\\n=== Stability Summary Distribution ===\")\n",
                    "print(stability_df['stability_status'].value_counts())"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 7. Tiny-Denominator Sensitivity Analysis\n",
                    "\n",
                    "We evaluate whether jurisdictions with tiny denominators (e.g. $\\le 10$ total cases: Dadra & Nagar Haveli and Lakshadweep) distort the clustering structure. We compare full $N=36$ versus reduced $N=34$ without mutating the primary dataset."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "print(\"=== Tiny-Denominator Sensitivity Analysis ===\")\n",
                    "display(sensitivity_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 8. Export Deliverables: Tables and Figures 50–55\n",
                    "\n",
                    "We generate and persist all 7 required CSV tables and 6 figures (Figures 50–55)."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Save tables\n",
                    "save_stage15_tables(val_df, algo_comp_df, assign_df, stability_df, profiles_df, agreement_df, sensitivity_df)\n",
                    "\n",
                    "# Generate figures\n",
                    "plot_stage15_figures(val_df, algo_comp_df, assign_df, profiles_df, agreement_df, sensitivity_df)\n",
                    "print(\"[+] All Stage 15 tables and figures successfully generated.\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 9. Key Methodological Findings & Guardrails\n",
                    "\n",
                    "### Summary of Empirical Results:\n",
                    "1. **Baseline Reproduction**: Stage 15 reproduces the frozen Stage 6 K=4 partition exactly ($\\text{ARI} = 1.000$, $\\text{NMI} = 1.000$), preserving the identical cluster size multiset $[2, 7, 12, 15]$.\n",
                    "2. **Defensibility of K=4**: $K=4$ is retained as the reference solution because it provides a relatively strong and interpretable partition, preserves continuity with the frozen Stage 6 baseline, and avoids excessive fragmentation into very small clusters (as observed at $K=7$ and $K=8$ where multiple clusters contain only 1 or 2 jurisdictions).\n",
                    "3. **Algorithm Agreement**: Substantial agreement is observed between K-Means and GMM ($\\text{ARI} = 0.5884$, $\\text{NMI} = 0.6739$), and moderate agreement with Ward Agglomerative Clustering ($\\text{ARI} = 0.3691$, $\\text{NMI} = 0.5444$).\n",
                    "4. **DBSCAN Findings**: DBSCAN did not yield a comparably useful partition under the tested parameter ranges, producing substantial noise or very small numbers of clusters for this dataset ($N=36$, four standardized composition features).\n",
                    "5. **Jurisdiction Stability**: 22 jurisdictions (61.1%) exhibit high stability (identical cluster assignments across all 3 methods), 14 jurisdictions (38.9%) exhibit moderate stability (2/3 methods agree), and 0 jurisdictions are boundary cases.\n",
                    "6. **Small-Denominator Sensitivity**: Excluding the two extreme small-denominator jurisdictions ($N=34$) confirms a three-profile crime-composition structure within the reduced sensitivity sample with high cross-method consistency (KMeans vs. Agglomerative $\\text{ARI} = 0.5761$). The primary analysis strictly retains all $N=36$ jurisdictions.\n",
                    "\n",
                    "### Strict Non-Normative Guardrails:\n",
                    "- Cluster designations reflect **crime composition percentages** (e.g., Higher Fraud Share vs. Higher Extortion Share).\n",
                    "- Clusters do not represent moral rankings, crime danger levels, or policing adequacy ratings."
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
    
    out_path = Path("notebooks/13_advanced_clustering.ipynb")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"[+] Created {out_path}")


if __name__ == "__main__":
    create_stage15_notebook()
