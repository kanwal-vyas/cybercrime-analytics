"""
Script to generate notebooks/15_advanced_visualization.ipynb
Stage 17: Advanced Visualization & Power BI (10-Page Interactive Analytical Suite)
"""

import json
from pathlib import Path


def create_stage17_notebook():
    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Stage 17: Advanced Visualization & Power BI Layer\n",
                    "**Project**: Cyber Crime Analytics for National Security  \n",
                    "**Syllabus Alignment**: Comprehensive Project Synthesis & Visualization  \n",
                    "**Deliverables**: 10-Page Power BI Architecture, 28-Table Semantic Data Package, 25+ DAX Measures, and Validation Gate  \n",
                    "**Data Sources**: Validated 2023 Cross-Sectional Facts (`data/processed/master_state_2023.csv`) & Historical 2018–2022 Panel Facts (`data/processed/trend_2018_2022.csv`)  \n",
                    "\n",
                    "---\n",
                    "\n",
                    "## 1. Executive Architecture & Purpose\n",
                    "\n",
                    "Stage 17 integrates all analytical findings from **Stages 1 through 16** into a unified, transparent, and academically rigorous **10-Page Visual Analytics Suite**.\n",
                    "\n",
                    "```\n",
                    "========================================================================================\n",
                    "                      10-PAGE POWER BI DASHBOARD ARCHITECTURE\n",
                    "========================================================================================\n",
                    " [Page 1: Executive Overview] ──────► National KPIs (86,420 cases), Act Groups & Pareto\n",
                    " [Page 2: Geographic Analysis] ─────► 36 State/UT Rankings, Top 5 Concentration (73.45%)\n",
                    " [Page 3: Categories & Motives] ────► 40 Leaf Offenses, 18 Motives, Zero Double-Counting\n",
                    " [Page 4: Association Mining] ──────► FP-Growth & Apriori Rules (State-Level Demo)\n",
                    " [Page 5: Classification] ──────────► Regime Classification (DT, NB, SVM, RF on 2022 Test)\n",
                    " [Page 6: Regression & Forecasting] ► 1-Year Lag Forecasting (Log-Linear OLS R²=0.9000)\n",
                    " [Page 7: Cluster Profiling] ───────► K=4 Structural Profiles, Ward & DBSCAN Validation\n",
                    " [Page 8: Anomaly & Outlier Study] ─► Multi-Method Consensus (0–4), Dual-Space Analysis\n",
                    " [Page 9: Historical Panel Trends] ─► 2018–2022 Growth Trajectories (Isolated Series)\n",
                    " [Page 10: Methodology & Limits] ───► Star Schema Provenance, 6 Core Limitations & Guardrails\n",
                    "========================================================================================\n",
                    "```\n",
                    "\n",
                    "> **Runtime Environment Disclosure**: Power BI Desktop is a Windows desktop GUI application and is not executable via CLI in this headless runtime. In strict compliance with non-fabrication rules, no synthetic binary `.pbix` is generated. All underlying data, measures, models, layouts, and relationships are fully specified, verified, and reconciled against the master analytical database."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Environment setup and package imports\n",
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
                    "POWERBI_DATA = project_root / 'dashboard' / 'powerbi_data'\n",
                    "print(f\"[+] Advanced Visualization environment initialized. Power BI Data Path: {POWERBI_DATA}\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Page 1: Executive Overview & National 2023 KPIs\n",
                    "\n",
                    "We load the headline executive KPI table and verify national totals across legal frameworks, primary motives, and demographic subsets."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "kpi_df = pd.read_csv(POWERBI_DATA / 'kpi_executive_summary.csv')\n",
                    "print(\"=== Page 1: Executive KPI Summary ===\")\n",
                    "display(kpi_df)\n",
                    "\n",
                    "act_df = pd.read_csv(POWERBI_DATA / 'dim_act_group.csv')\n",
                    "print(\"\\n=== Page 1: Act Group Distribution ===\")\n",
                    "display(act_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Page 2: Geographic & State Analysis (Top 5 Concentration)\n",
                    "\n",
                    "We evaluate cross-sectional distributions across 36 States/UTs, highlighting that the Top 5 volume jurisdictions account for $73.45\\%$ ($63,472$ cases) of all registered cybercrimes."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "state_df = pd.read_csv(POWERBI_DATA / 'state_summary_2023.csv')\n",
                    "top5 = state_df.sort_values(by='total_cases', ascending=False).head(5)\n",
                    "top5['share_pct'] = (top5['total_cases'] / 86420 * 100).round(2)\n",
                    "print(\"=== Page 2: Top 5 High-Volume Jurisdictions ===\")\n",
                    "display(top5[['state_name', 'total_cases', 'share_pct', 'it_act_cases', 'ipc_cases', 'motive_fraud']])"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 4. Page 3: Offense Taxonomy & Motive Hierarchy\n",
                    "\n",
                    "We inspect the 40 independent leaf categories and 18 specific motives, ensuring zero double-counting of parent subtotals."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "cat_df = pd.read_csv(POWERBI_DATA / 'category_summary_2023.csv')\n",
                    "motive_df = pd.read_csv(POWERBI_DATA / 'motive_summary_2023.csv')\n",
                    "\n",
                    "print(\"=== Page 3: Top 10 Leaf Categories by Volume ===\")\n",
                    "display(cat_df[['category_rank', 'category_display_name', 'act_group', 'national_cases', 'national_share_pct', 'cumulative_share_pct']].head(10))\n",
                    "\n",
                    "print(\"\\n=== Page 3: Top 5 Primary Motives ===\")\n",
                    "display(motive_df.head(5))"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 5. Page 4 & 5: Pattern Mining & Supervised Classification Packages\n",
                    "\n",
                    "We verify the Stage 5/12 association rule mining extracts and Stage 13 supervised classification leaderboard on the held-out 2022 test set."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "rules_df = pd.read_csv(POWERBI_DATA / 'model_association_rules_key.csv')\n",
                    "print(\"=== Page 4: Top Association Rules (State-Level Demo) ===\")\n",
                    "display(rules_df[['rule_id', 'antecedent', 'consequent', 'support', 'confidence', 'lift']].head(6))\n",
                    "\n",
                    "cls_df = pd.read_csv(POWERBI_DATA / 'model_classification_comparison.csv')\n",
                    "cm_df = pd.read_csv(POWERBI_DATA / 'model_classification_confusion_matrices.csv')\n",
                    "print(\"\\n=== Page 5: Supervised Classification Leaderboard (Held-Out 2022 Test) ===\")\n",
                    "display(cls_df)\n",
                    "print(\"\\n=== Page 5: Confusion Matrices ===\")\n",
                    "display(cm_df)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 6. Page 6 & 7: Regression Forecasting & Cluster Profiling Packages\n",
                    "\n",
                    "We inspect the continuous forecasting leaderboard (Log-Linear OLS $R^2 = 0.9000$) and the K=4 structural cluster composition profiles."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "reg_df = pd.read_csv(POWERBI_DATA / 'model_prediction_metrics.csv')\n",
                    "print(\"=== Page 6: Predictive Regression Leaderboard (2022 Evaluation) ===\")\n",
                    "display(reg_df[['model_name', 'model_type', 'mae', 'rmse', 'r2', 'median_ae']])\n",
                    "\n",
                    "clust_prof = pd.read_csv(POWERBI_DATA / 'model_cluster_profiles.csv')\n",
                    "print(\"\\n=== Page 7: K=4 Cluster Composition Profiles ===\")\n",
                    "display(clust_prof)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 7. Page 8: Advanced Outlier & Anomaly Validation\n",
                    "\n",
                    "We examine multi-method consensus scoring ($0–4$), robust Mahalanobis distances ($\\chi^2_{14, 0.975} = 26.12$ reference screening threshold), and dual-space volume vs. composition separation."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "anom_df = pd.read_csv(POWERBI_DATA / 'model_outlier_consensus.csv')\n",
                    "print(\"=== Page 8: Consensus Anomaly Breakdown (Score >= 2) ===\")\n",
                    "display(anom_df[anom_df['consensus_score'] >= 2][['state_name', 'total_cases', 'consensus_score', 'consensus_classification']])\n",
                    "\n",
                    "vol_comp = pd.read_csv(POWERBI_DATA / 'model_outlier_volume_vs_composition.csv')\n",
                    "print(\"\\n=== Page 8: Dual-Space Anomaly Orientation Summary ===\")\n",
                    "display(vol_comp['anomaly_orientation'].value_counts())"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 8. Page 9 & 10: Historical Trends & Core Academic Limitations\n",
                    "\n",
                    "We verify the 2018–2022 historical growth series ($27,248 \\to 65,893$) and display all 6 core project limitations."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "trend_nat = pd.read_csv(POWERBI_DATA / 'trend_national_2018_2022.csv')\n",
                    "print(\"=== Page 9: 5-Year National Growth Trajectory (2018–2022) ===\")\n",
                    "display(trend_nat)\n",
                    "\n",
                    "limits_df = pd.read_csv(POWERBI_DATA / 'metadata_project_limitations.csv')\n",
                    "print(\"\\n=== Page 10: 6 Core Academic Limitations ===\")\n",
                    "for _, r in limits_df.iterrows():\n",
                    "    print(f\"[{r['limitation_id']}] {r['title']} ({r['scope']}):\")\n",
                    "    print(f\"    {r['description']}\\n\")"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 9. Stage 17 Quality Gate & Validation Execution\n",
                    "\n",
                    "We execute the formal Stage 17 automated validation suite (`src/validate_stage17.py`) to confirm 100% mathematical reconciliation and structural integrity."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "from src.validate_stage17 import validate_stage17\n",
                    "success = validate_stage17()\n",
                    "print(f\"\\n[+] Stage 17 Validation Status: {'PASSED (100%)' if success else 'FAILED'}\")"
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

    out_path = Path("notebooks/15_advanced_visualization.ipynb")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"[+] Created {out_path}")


if __name__ == "__main__":
    create_stage17_notebook()
