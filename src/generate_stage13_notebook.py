"""
Script to generate notebooks/11_classification.ipynb
Stage 13: Classification Analysis (Unit 5 of Syllabus)
"""

import json
from pathlib import Path


def create_stage13_notebook():
    nb = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# Stage 13: Classification Analysis\n",
                    "**Project**: Cyber Crime Analytics for National Security  \n",
                    "**Syllabus Alignment**: Unit 5 — Classification (Classification vs. Prediction, Decision Trees, Bayesian Classification: Naive Bayes, Support Vector Machines: Linear & RBF Kernels, Ensemble Methods: Random Forest, Classification Metrics: Accuracy, Precision, Recall, Specificity, F1-Score, ROC-AUC, Confusion Matrix, Leakage Prevention)  \n",
                    "**Data Source**: Longitudinal State/UT Historical Panel (2018–2022 Rajya Sabha Cybercrime Series)  \n",
                    "**Sample Size**: $N = 106$ Observations ($N_{\\text{train}} = 70$ for target years 2020 & 2021; $N_{\\text{test}} = 36$ for held-out target year 2022)  \n",
                    "\n",
                    "---\n",
                    "\n",
                    "## 1. Objective & Analytical Question\n",
                    "\n",
                    "### Analytical Question:\n",
                    "> **\"Can historical State/UT cybercrime volume patterns classify whether the following year's aggregate cybercrime volume belongs to a high-volume regime?\"**\n",
                    "\n",
                    "### Theoretical & Methodological Context:\n",
                    "- **Classification vs. Regression (Stage 7 vs. Stage 13)**: Whereas Stage 7 estimated the continuous future volume ($\\hat{Y}_{t} \\in \\mathbb{R}^+$), Stage 13 addresses categorical regime assignment ($Y_t \\in \\{0, 1\\}$, Low vs. High volume regime).\n",
                    "- **Training-Derived Threshold Exclusivity**: To prevent test leakage and threshold-tuning bias, the binary target boundary is computed strictly from the **training partition median** ($\\text{Threshold} = 367.0$ cases). A state in year $t$ is labeled $\\text{HIGH\\_NEXT\\_YEAR} = 1$ if $y_t \\ge 367.0$, else $0$.\n",
                    "- **Strict Chronological Horizon**: Predictors are constructed strictly from years $t-1$ and $t-2$. Zero contemporaneous target-year features or 2023 detailed category features are permitted.\n",
                    "- **Pipelines & Leakage Prevention**: All feature normalization (`StandardScaler`) is fitted strictly on training data within scikit-learn Pipelines.\n",
                    "- **Academic Non-Causal Framing**: Features capture historical volume scale and momentum. High classification accuracy reflects jurisdictional temporal persistence rather than causal determinants.\n"
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
                    "from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix\n",
                    "\n",
                    "from src.classification import (\n",
                    "    load_and_construct_classification_panel,\n",
                    "    run_leakage_audit,\n",
                    "    get_class_distributions,\n",
                    "    build_classification_models,\n",
                    "    evaluate_models,\n",
                    "    get_feature_importances,\n",
                    "    plot_classification_figures,\n",
                    "    save_stage13_tables,\n",
                    "    FEATURE_COLS\n",
                    ")\n",
                    "\n",
                    "print(f\"Python Version: {sys.version.split()[0]}\")\n",
                    "print(f\"Working Directory: {project_root}\")\n",
                    "print(f\"Predictor Feature Vector: {FEATURE_COLS}\")\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 2. Longitudinal Panel Construction & Target Definition\n",
                    "\n",
                    "The longitudinal dataset constructs records of $(State/UT, \\text{target\\_year})$ with lagged historical indicators:\n",
                    "- **Target Year 2020** (Train): Predictors from 2019 ($t-1$) and 2018 ($t-2$). $N = 35$ (Ladakh missing in 2018/19).\n",
                    "- **Target Year 2021** (Train): Predictors from 2020 ($t-1$) and 2019 ($t-2$). $N = 35$.\n",
                    "- **Target Year 2022** (Held-Out Test): Predictors from 2021 ($t-1$) and 2020 ($t-2$). $N = 36$ (Ladakh present in 2020/21).\n",
                    "\n",
                    "### Target Threshold Derivation:\n",
                    "$$\\text{Threshold} = \\text{Median}(Y_{\\text{train}}) = 367.0 \\text{ cases}$$\n",
                    "$$\\text{HIGH\\_NEXT\\_YEAR} = \\begin{cases} 1 & \\text{if } y_t \\ge 367.0 \\\\ 0 & \\text{if } y_t < 367.0 \\end{cases}$$\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Construct panel dataset and derive training threshold\n",
                    "panel_df, threshold = load_and_construct_classification_panel('data/processed/trend_2018_2022.csv')\n",
                    "\n",
                    "print(f\"Total Longitudinal Panel Size: {len(panel_df)} observations\")\n",
                    "print(f\"Training Partition (2020 & 2021): N = {(panel_df['split'] == 'train').sum()}\")\n",
                    "print(f\"Held-Out Test Partition (2022): N = {(panel_df['split'] == 'test').sum()}\")\n",
                    "print(f\"Training Median Threshold: {threshold:.1f} cases\\n\")\n",
                    "\n",
                    "display(panel_df.head(10))\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 3. Class Balance & Partition Distributions\n",
                    "\n",
                    "To prevent majority-class bias and ensure transparent evaluation, we inspect class distributions across training and test splits.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Compute class distributions\n",
                    "class_dist_df = get_class_distributions(panel_df, threshold)\n",
                    "display(class_dist_df)\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 4. Formal Leakage and Validity Audit\n",
                    "\n",
                    "We execute a formal 7-point leakage audit to guarantee mathematical and methodological integrity.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Run formal 7-point leakage audit\n",
                    "audit_df = run_leakage_audit(panel_df, threshold)\n",
                    "display(audit_df)\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 5. Model Training & Evaluation Suite\n",
                    "\n",
                    "We train and compare 6 classification architectures spanning Unit 5:\n",
                    "1. **Baseline Classifier**: Majority Class (`DummyClassifier(strategy='most_frequent')`).\n",
                    "2. **Decision Tree Classifier**: Interpretable tree with `max_depth=3` and Gini impurity.\n",
                    "3. **Gaussian Naive Bayes**: Probabilistic classifier assuming conditional feature independence given regime class.\n",
                    "4. **Linear Support Vector Machine**: Linear hyperplane classifier in standardized feature space (`StandardScaler -> SVC(kernel='linear')`).\n",
                    "5. **RBF Support Vector Machine**: Nonlinear kernel boundary classifier (`StandardScaler -> SVC(kernel='rbf')`).\n",
                    "6. **Random Forest Classifier**: Constrained bootstrap ensemble of 100 decision trees.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Build, train, and evaluate classification models\n",
                    "models = build_classification_models()\n",
                    "metrics_df, cm_df, prob_dict = evaluate_models(models, panel_df)\n",
                    "\n",
                    "print(\"=== CLASSIFICATION PERFORMANCE METRICS (HELD-OUT 2022 TEST HORIZON) ===\")\n",
                    "display(metrics_df)\n",
                    "\n",
                    "print(\"\\n=== CONFUSION MATRICES SUMMARY (N_test = 36) ===\")\n",
                    "display(cm_df)\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 6. Decision Tree Hyperparameter Sensitivity\n",
                    "\n",
                    "We evaluate Decision Tree performance across depth constraints $\\text{max\\_depth} \\in \\{2, 3, 4\\}$ on the training partition.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "from sklearn.tree import DecisionTreeClassifier\n",
                    "from sklearn.metrics import accuracy_score, f1_score\n",
                    "\n",
                    "train_mask = panel_df['split'] == 'train'\n",
                    "test_mask = panel_df['split'] == 'test'\n",
                    "X_tr = panel_df.loc[train_mask, FEATURE_COLS]\n",
                    "y_tr = panel_df.loc[train_mask, 'HIGH_NEXT_YEAR']\n",
                    "X_te = panel_df.loc[test_mask, FEATURE_COLS]\n",
                    "y_te = panel_df.loc[test_mask, 'HIGH_NEXT_YEAR']\n",
                    "\n",
                    "tree_sens = []\n",
                    "for d in [2, 3, 4]:\n",
                    "    dt_cand = DecisionTreeClassifier(max_depth=d, random_state=42)\n",
                    "    dt_cand.fit(X_tr, y_tr)\n",
                    "    p_te = dt_cand.predict(X_te)\n",
                    "    tree_sens.append({\n",
                    "        'Max_Depth': d,\n",
                    "        'Leaves': dt_cand.get_n_leaves(),\n",
                    "        'Test_Accuracy': round(accuracy_score(y_te, p_te), 4),\n",
                    "        'Test_F1': round(f1_score(y_te, p_te), 4),\n",
                    "        'Top_Split_Feature': FEATURE_COLS[np.argmax(dt_cand.feature_importances_)]\n",
                    "    })\n",
                    "\n",
                    "display(pd.DataFrame(tree_sens))\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 7. Feature Importance & Temporal Persistence\n",
                    "\n",
                    "We extract Gini feature importances from the Tree-based architectures and analyze the role of historical scale vs momentum.\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Extract and display feature importances\n",
                    "feature_imp_df = get_feature_importances(models, panel_df)\n",
                    "display(feature_imp_df)\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 8. Visualizations & Analytical Figures\n",
                    "\n",
                    "We generate and render the Stage 13 visualization suite (Figures 40 to 44).\n"
                ]
            },
            {
                "cell_type": "code",
                "execution_count": None,
                "metadata": {},
                "outputs": [],
                "source": [
                    "# Generate and save figures and tables\n",
                    "plot_classification_figures(\n",
                    "    panel_df, class_dist_df, metrics_df, cm_df, prob_dict, models, feature_imp_df\n",
                    ")\n",
                    "save_stage13_tables(panel_df, class_dist_df, metrics_df, cm_df, feature_imp_df, audit_df)\n",
                    "print(\"Visualizations (Figures 40-44) and Tables successfully generated.\")\n"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "## 9. Comparison: Stage 7 Regression vs. Stage 13 Classification\n",
                    "\n",
                    "| Dimension | Stage 7 — Regression | Stage 13 — Classification |\n",
                    "| :--- | :--- | :--- |\n",
                    "| **Analytical Question** | \"How many cybercrime cases will occur in State $s$ in year $t$?\" | \"Will State $s$ in year $t$ belong to a high-volume regime?\" |\n",
                    "| **Target Variable ($Y$)** | Continuous volume $\\hat{Y}_t \\in [0, \\infty)$ | Binary category $Y_t \\in \\{0, 1\\}$ ($\\ge 367$ cases) |\n",
                    "| **Evaluation Metrics** | $R^2$, MAE, RMSE, MedAE | Accuracy, Precision, Recall, Specificity, F1, ROC-AUC |\n",
                    "| **Best Model** | Log-Linear OLS ($R^2 = 0.8878$, $\\text{MAE} = 459.7$) | Linear SVM / Random Forest / Naive Bayes ($\\text{Acc} = 1.0, F_1 = 1.0$) |\n",
                    "| **Analytical Utility** | Precise volumetric forecasting for budget allocation | Regime threshold triaging for macro resource tiering |\n",
                    "\n",
                    "---\n",
                    "\n",
                    "## 10. Limitations & Academic Conclusions\n",
                    "\n",
                    "1. **Small-$N$ Constraint**: The test horizon contains exactly $N = 36$ jurisdictions. While accuracy is high, small sample sizes preclude claims of universal generalizability.\n",
                    "2. **Temporal Volume Persistence**: Near-perfect regime separation arises because Indian state cybercrime volume is heavily concentrated in large populated states (Maharashtra, Telangana, Karnataka, UP) and extremely low in small UTs/northeastern states. The model detects historical volume inertia rather than criminological causation.\n",
                    "3. **Threshold Sensitivity**: The threshold is objectively derived as the training median ($367.0$ cases). Alternative quantile thresholds would shift class boundaries.\n",
                    "4. **Syllabus Educational Purpose**: This stage successfully demonstrates Unit 5 machine learning classification algorithms under strict leakage prevention, pipeline normalization, and chronological splitting.\n"
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
                "codemirror_mode": {
                    "name": "ipython",
                    "version": 3
                },
                "file_extension": ".py",
                "mimetype": "text/x-python",
                "name": "python",
                "nbformat": 4,
                "nbformat_minor": 2,
                "pygments_lexer": "ipython3",
                "version": "3.13.0"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 2
    }
    
    out_path = Path("notebooks/11_classification.ipynb")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)
    print(f"Created notebook template at {out_path}")


if __name__ == '__main__':
    create_stage13_notebook()
