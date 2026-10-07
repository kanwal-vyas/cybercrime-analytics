"""
Script to generate notebooks/08_advanced_preprocessing.ipynb
Stage 10: Advanced Data Preprocessing (Unit 2 of Syllabus)
"""

import json
from pathlib import Path

def create_stage10_notebook():
    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Stage 10: Advanced Data Preprocessing\n",
                    "**Project**: Cyber Crime Analytics for National Security  \n",
                    "**Syllabus Alignment**: Unit 2 — Data Preprocessing (Summarization, Transformation, Normalization/Scaling, Reduction, PCA, Discretization, Concept Hierarchies)  \n",
                    "**Data Source**: Validated 2023 NCRB Analytical State Feature Matrix (`eda_state_feature_matrix.csv`) & Master Dataset (`master_state_2023.csv`)  \n",
                    "**Sample Size**: $N = 36$ State/UT Cross-Sectional Observations (Year 2023)  \n",
                    "\n",
                    "---\n",
                    "\n",
                    "## 1. Objective & Analytical Scope\n",
                    "\n",
                    "### Purpose:\n",
                    "This stage implements a systematic, reproducible, and mathematically rigorous **Advanced Data Preprocessing pipeline** aligned with Unit 2 of the data mining curriculum. The preprocessing layer prepares standardized, transformed, reduced, discretized, and hierarchically organized representations to support downstream analytical tasks.\n",
                    "\n",
                    "### Key Preprocessing Dimensions Covered:\n",
                    "1. **Descriptive Summarization**: Extended five-number summaries, skewness, kurtosis, and zero-inflation analysis across 14 state-level features.\n",
                    "2. **Data Transformation**: $\\log_{1p}(x) = \\ln(1 + x)$ transformation for heavy-tailed counts, Z-score standardization ($z = (x - \\mu)/\\sigma$), and Min-Max scaling ($x' = (x - \\min)/( \\max - \\min)$).\n",
                    "3. **Data Reduction & PCA**: Unsupervised dimensionality reduction on standardized log-count and share features, scree analysis, and variance decomposition.\n",
                    "4. **Data Discretization**: Equal-width 3-bin discretization, quantile-based 3-tercile binning, and median binary partitioning.\n",
                    "5. **Concept Hierarchy Generation**: Geographic roll-up hierarchy (`India` $\\rightarrow$ `State/UT` $\\rightarrow$ `Jurisdiction`) and statutory crime taxonomy hierarchy (`All Cybercrimes` $\\rightarrow$ `Act Group` $\\rightarrow$ `Category` $\\rightarrow$ `Specific Offense`).\n",
                    "\n",
                    "### Methodological Guardrails & Small-$N$ Limitations:\n",
                    "- **Strictly Descriptive & Non-Causal**: Preprocessing does not infer causality or predict crime rates.\n",
                    "- **Zero Target Leakage**: Stage 10 does not construct or transform predictive targets.\n",
                    "- **Small-N Caution ($N = 36$)**: Statistical properties, PCA loadings, and bin boundaries reflect the 36 State/UT cross-section in 2023 and should be interpreted descriptively.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Setup paths and imports\n",
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
                    "# Import Stage 10 advanced preprocessing module\n",
                    "from src.advanced_preprocessing import (\n",
                    "    load_analytical_matrix,\n",
                    "    compute_descriptive_summary,\n",
                    "    apply_transformations,\n",
                    "    run_pca_analysis,\n",
                    "    run_discretization_analysis,\n",
                    "    build_concept_hierarchies,\n",
                    "    run_stage10_pipeline\n",
                    ")\n",
                    "\n",
                    "print(\"Stage 10 advanced preprocessing routines successfully imported.\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Load Analytical Feature Matrix ($N = 36$)\n",
                    "\n",
                    "We load the validated 2023 State/UT analytical feature matrix containing 10 volume counts and 4 proportion shares."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "df = load_analytical_matrix()\n",
                    "print(f\"Feature matrix loaded: {df.shape[0]} State/UT observations, {df.shape[1]} columns.\")\n",
                    "print(f\"Columns: {list(df.columns)}\")\n",
                    "df.head(10)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Part A: Descriptive Summarization & Distributional Diagnostics\n",
                    "\n",
                    "We calculate comprehensive statistical properties for all 14 features:\n",
                    "- **Central tendency**: Mean, Median\n",
                    "- **Dispersion**: Standard Deviation, Min, Q1, Q3, Max, IQR\n",
                    "- **Shape**: Skewness, Kurtosis\n",
                    "- **Sparsity**: Zero-count and Missing count"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "summary_df = compute_descriptive_summary(df)\n",
                    "pd.set_option('display.max_columns', None)\n",
                    "pd.set_option('display.width', 1000)\n",
                    "print(\"=== DESCRIPTIVE SUMMARIZATION OF 14 ANALYTICAL FEATURES (N = 36) ===\")\n",
                    "print(summary_df.to_string(index=False))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### Key Statistical Findings:\n",
                    "1. **Extreme Right-Skewness in Raw Counts**: `total_cases` (skewness = 2.75) and `motive_fraud` (skewness = 2.97) exhibit heavy positive tails driven by large jurisdictions (e.g., Telangana: 18,349 cases; Karnataka: 14,357 cases).\n",
                    "2. **Zero-Heavy Features**: Offenses such as `child_cases_total` (15 states with 0 cases) and `sec66c_identity_theft` (10 states with 0 cases) exhibit notable sparsity in smaller UTs.\n",
                    "3. **Bounded Share Distributions**: `it_act_share` (mean = 0.537, IQR = 0.540) and `fraud_motive_share` (mean = 0.380, IQR = 0.505) naturally span $[0, 1]$."
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 4. Part B: Data Transformation (Log, Z-Score, Min-Max)\n",
                    "\n",
                    "We apply and compare three classical transformations:\n",
                    "1. **Log1p Transformation**: $x_{log} = \\ln(1 + x)$ compresses order-of-magnitude count variations while handling zero-counts cleanly without numerical singularities.\n",
                    "2. **Z-Score Standardization**: $z = (x - \\mu) / \\sigma$ centers features to mean 0 and unit variance, essential for distance-based algorithms.\n",
                    "3. **Min-Max Normalization**: $x' = (x - \\min) / (\\max - \\min)$ maps values to $[0, 1]$."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "comp_df, transformed_matrix = apply_transformations(df)\n",
                    "print(\"=== SKEWNESS & DISPERSION IMPACT BEFORE VS AFTER TRANSFORMATION ===\")\n",
                    "print(comp_df.to_string(index=False))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### Methodological Note on Scale vs Shape:\n",
                    "- **Standardization changes scale, not distribution shape**: The skewness of standardized variables is mathematically identical to original skewness.\n",
                    "- **Log1p effectively compresses right tails**: For example, `total_cases` skewness drops from **+2.75** (raw) to **-0.65** (log1p), and `motive_fraud` drops from **+2.97** to **-0.08**."
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 5. Part C & D: Data Reduction & Principal Component Analysis (PCA)\n",
                    "\n",
                    "### Candidate Feature Selection:\n",
                    "To prevent part-whole mathematical collinearity from dominating the PCA decomposition, we select a representative feature set spanning scale and motive composition:\n",
                    "- `log_total_cases`, `log_it_act_cases`, `log_ipc_cases`\n",
                    "- `log_motive_fraud`, `log_motive_extortion`, `log_motive_sexual_exploitation`\n",
                    "- `it_act_share`, `fraud_motive_share`, `extortion_motive_share`, `sexual_exploitation_motive_share`"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "exp_var_df, loadings_df, pca_scores_df, pca_model, X_scaled = run_pca_analysis(df)\n",
                    "print(\"=== PCA EXPLAINED VARIANCE RATIO & CUMULATIVE VARIANCE ===\")\n",
                    "print(exp_var_df.to_string(index=False))\n",
                    "\n",
                    "print(\"\\n=== PCA COMPONENT LOADINGS (FIRST 5 PCS) ===\")\n",
                    "print(loadings_df[[\"feature\", \"PC1\", \"PC2\", \"PC3\", \"PC4\", \"PC5\"]].to_string(index=False))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### PCA Decomposition Interpretation:\n",
                    "- **PC1 (58.30% of Variance)**: Captures **Overall Cybercrime Scale & Volume**. All log-volume features have large positive loadings ($0.33$ to $0.38$) on PC1.\n",
                    "- **PC2 (17.38% of Variance)**: Captures **Statutory vs Exploitation Divergence**. Strong positive loading on `it_act_share` ($+0.49$) and negative loading on `sexual_exploitation_motive_share` ($-0.48$).\n",
                    "- **Cumulative Variance**: PC1 + PC2 explain **75.68%**, and 4 components reach **91.13%** ($>90\\%$ threshold)."
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 6. Part E: Data Discretization\n",
                    "\n",
                    "We implement and compare three discretization paradigms:\n",
                    "1. **Equal-Width (3 bins)**: `Low`, `Medium`, `High` across the continuous span.\n",
                    "2. **Quantile-Based (3 terciles)**: `T1_Low`, `T2_Medium`, `T3_High` allocating ~12 observations per bin.\n",
                    "3. **Median Split (2 bins)**: `Below_Median`, `Above_Median` aligned with Stage 5 association rule mining thresholds."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "disc_summary_df, discretized_df = run_discretization_analysis(df)\n",
                    "print(\"=== DISCRETIZATION SUMMARY & BIN DISTRIBUTIONS ===\")\n",
                    "print(disc_summary_df.to_string(index=False))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### Discretization Diagnostic Analysis:\n",
                    "- **Equal-Width Skew Vulnerability**: Because `total_cases` is heavily right-skewed, equal-width binning assigns 33 of 36 states into `Low` ($<6,117$), 1 to `Medium` (Maharashtra: 9,073), and 2 to `High` (Telangana, Karnataka). Equal-width binning is poor for heavily skewed count data.\n",
                    "- **Quantile Terciles Provide Uniform Support**: Quantile binning divides the 36 states into 12 `T1_Low`, 12 `T2_Medium`, and 12 `T3_High` observations, ensuring adequate cell counts for categorical analysis."
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 7. Part F: Multilevel Concept Hierarchies\n",
                    "\n",
                    "Concept hierarchies provide dimensional roll-up paths for aggregation across geographic and statutory crime levels."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "geo_hier, crime_hier, motive_hier = build_concept_hierarchies()\n",
                    "print(\"=== GEOGRAPHIC HIERARCHY SAMPLE (India -> State/UT -> Jurisdiction) ===\")\n",
                    "print(geo_hier.head(8).to_string(index=False))\n",
                    "\n",
                    "print(\"\\n=== CRIME CATEGORY HIERARCHY SAMPLE (All -> Act Group -> Category -> Offense) ===\")\n",
                    "print(crime_hier.head(8).to_string(index=False))\n",
                    "\n",
                    "print(\"\\n=== MOTIVE HIERARCHY SAMPLE (All -> Motive Group -> Specific Motive) ===\")\n",
                    "print(motive_hier.head(8).to_string(index=False))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 8. Part G: Visualizations & Pipeline Execution (Figures 28 to 32)\n",
                    "\n",
                    "We execute the full preprocessing artifact generation suite."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Run full pipeline and list generated output files\n",
                    "pipeline_outputs = run_stage10_pipeline()\n",
                    "print(\"=== GENERATED STAGE 10 OUTPUT FILES ===\")\n",
                    "for key, path in pipeline_outputs.items():\n",
                    "    p = Path(path)\n",
                    "    print(f\"  - {key:<30}: {p.name} ({p.stat().st_size:,} bytes)\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 9. Methodological Synthesis & Preprocessing Pipeline Artifacts\n",
                    "\n",
                    "### Summary of Artifacts Created:\n",
                    "1. **Statistical Summaries**:\n",
                    "   - `outputs/tables/stage10_feature_summary.csv`\n",
                    "   - `outputs/tables/stage10_transformation_comparison.csv`\n",
                    "   - `outputs/tables/stage10_transformed_matrix.csv`\n",
                    "2. **Dimensionality Reduction (PCA)**:\n",
                    "   - `outputs/tables/stage10_pca_explained_variance.csv`\n",
                    "   - `outputs/tables/stage10_pca_loadings.csv`\n",
                    "   - `outputs/tables/stage10_pca_scores.csv`\n",
                    "3. **Discretization & Categorization**:\n",
                    "   - `outputs/tables/stage10_discretization_summary.csv`\n",
                    "   - `outputs/tables/stage10_discretized_features.csv`\n",
                    "4. **Concept Hierarchies**:\n",
                    "   - `outputs/tables/stage10_geographic_hierarchy.csv`\n",
                    "   - `outputs/tables/stage10_crime_category_hierarchy.csv`\n",
                    "   - `outputs/tables/stage10_motive_hierarchy.csv`\n",
                    "5. **Figures**:\n",
                    "   - `outputs/figures/28_transform_skewness_comparison.png`\n",
                    "   - `outputs/figures/29_feature_scaling_comparison.png`\n",
                    "   - `outputs/figures/30_pca_scree_and_cumulative_variance.png`\n",
                    "   - `outputs/figures/31_pca_2d_projection.png`\n",
                    "   - `outputs/figures/32_discretization_distributions.png`\n",
                    "\n",
                    "### Small-N Analytical Limitations:\n",
                    "1. **Sample Size ($N = 36$)**: Statistical estimates (mean, standard deviation, PCA eigenvalues) are sample-specific cross-sectional summaries.\n",
                    "2. **Part-Whole Collinearities**: Subtotals (IT Act cases + IPC cases = Total cases) must be treated with domain care during feature reduction.\n",
                    "3. **Non-Causal Interpretability**: Principal components represent orthogonal variance dimensions in standardized space, not underlying criminological causal factors.\n"
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
    
    out_path = Path("notebooks/08_advanced_preprocessing.ipynb")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Generated notebook: {out_path}")

if __name__ == "__main__":
    create_stage10_notebook()
