# Power BI Interactive Dashboard Layer

**Project**: Cyber Crime Analytics for National Security  
**Stages**: Stage 9 (Semantic Data Package) & Stage 17 (10-Page Advanced Visualization Suite)  
**Deliverables**: 28-Table Semantic Data Package, 10-Page Dashboard Blueprint, DAX Measure Library, and Data Dictionary  

---

## 1. Overview & Purpose

This directory contains the complete **Power BI Visual Analytics & Dashboard Package** for the `cybercrime-analytics` project. It transforms all validated analytical findings from Stages 1 through 16 into a coherent, interactive, 10-page business intelligence suite.

### 10-Page Dashboard Architecture
1. **Page 1 — Executive Overview**: National 2023 headline metrics ($86,420$ cases), legal Act Groups, motive breakdown, and Pareto category distribution.
2. **Page 2 — Geographic / State Analysis**: Volume ranking across 36 States/UTs, Top 5 state concentration ($73.45\%$), and Act composition.
3. **Page 3 — Crime Categories & Motives**: Hierarchical offense treemap (40 leaf categories), Section 66D ($25,334$), Section 420 ($16,943$), fraud motive ($59,526$), and zero double-counting enforcement.
4. **Page 4 — Association Rule Mining**: FP-Growth & Apriori rules, support/confidence/lift scatter, and state-level proxy transaction interpretation.
5. **Page 5 — Supervised Classification**: Decision Tree ($97.22\%$), Naive Bayes ($100\%$), Linear/RBF SVM ($100\%$), and Random Forest ($100\%$) high-volume regime classification on held-out 2022 test data.
6. **Page 6 — Predictive Regression & Forecasting**: Log-Linear OLS ($R^2=0.9000$, $\text{MAE}=479.37$) vs. Naive Baseline ($R^2=0.8625$, $\text{MAE}=564.75$), residual distributions, and actual vs. predicted curves.
7. **Page 7 — Unsupervised Cluster Profiling**: K=4 taxonomic profiles ($n=15, 12, 2, 7$), 2D PCA cluster biplot, Hungarian stability ($\text{ARI}=1.000$), and Ward hierarchical comparison.
8. **Page 8 — Advanced Outlier & Anomaly Validation**: Multi-method anomaly matrix (Tukey IQR, Isolation Forest, Robust Mahalanobis with $\chi^2$ cutoff, LOF), consensus scoring ($0–4$), dual-space volume vs. composition separation, and small-denominator sensitivity.
9. **Page 9 — Historical Panel Trends (2018–2022)**: 5-year longitudinal growth trajectories ($27,248 \to 65,893$ cases), state sparklines, separate series isolation, and missing data disclosure for Ladakh.
10. **Page 10 — Methodology, Data Sources & Limitations**: Full NCRB data lineage, star schema data dictionary, and explicit disclosure of the 6 core academic limitations.

---

## 2. Directory Structure

```
dashboard/
├── README.md                           # This guide & implementation documentation
├── POWERBI_SPECIFICATION.md            # Stage 9 6-page core semantic model specification
├── POWERBI_STAGE17_SPECIFICATION.md    # Stage 17 comprehensive 10-page visual architecture
└── powerbi_data/                       # Validated CSV extract data package (28 tables)
    ├── dim_state.csv                   # 36 States/UTs dimension
    ├── dim_crime_category.csv          # 49 categories (40 leaf + 9 parent)
    ├── dim_motive.csv                  # 19 motives (18 specific + total)
    ├── dim_act_group.csv               # 3 legal Act Groups
    ├── fact_state_category_2023.csv    # 1,764 category fact tuples
    ├── fact_state_motive_2023.csv      # 684 motive fact tuples
    ├── state_summary_2023.csv          # 36 state aggregate summaries
    ├── category_summary_2023.csv       # 40 leaf category national summaries
    ├── motive_summary_2023.csv         # 19 national motive summaries
    ├── kpi_executive_summary.csv       # 15 headline executive KPIs
    ├── trend_summary_2018_2022.csv     # 180 state-year historical panel rows
    ├── trend_national_2018_2022.csv    # 5 national annual historical totals
    ├── model_association_rules_key.csv # 42 curated association rules
    ├── model_cluster_profiles.csv      # K=4 composition profile definitions
    ├── model_cluster_assignments.csv   # 36 state K-Means cluster assignments
    ├── model_clustering_stage15.csv    # Multi-algorithm cluster assignments
    ├── model_prediction_metrics.csv    # 7 regression model evaluation metrics
    ├── model_prediction_actual_vs_predicted.csv # 36 state 2022 predictions
    ├── model_regression_leaderboard.csv # Extended 10-model regression leaderboard
    ├── model_classification_comparison.csv # Classification accuracy, precision, recall, F1
    ├── model_classification_confusion_matrices.csv # Classification confusion matrices
    ├── model_outlier_summary.csv       # Baseline outlier classifications
    ├── model_outlier_univariate.csv    # 52 Tukey fence violations
    ├── model_outlier_consensus.csv     # Consensus anomaly scores (0-4)
    ├── model_outlier_volume_vs_composition.csv # Dual-space anomaly orientations
    ├── model_outlier_mahalanobis.csv   # Robust Mahalanobis distances and flags
    ├── model_outlier_lof.csv           # LOF scores and neighborhood sensitivity
    └── metadata_project_limitations.csv # 6 core academic limitations
```

---

## 3. Step-by-Step Instructions to Build Dashboard in Power BI Desktop

To build and view the complete interactive 10-page dashboard in Power BI Desktop:

### Step 1: Import Data Tables
1. Open **Microsoft Power BI Desktop**.
2. Click **Get Data** $\to$ **Text/CSV**.
3. Select all 28 CSV files from the `dashboard/powerbi_data/` directory.
4. Ensure all columns load with correct data types (integers for case counts, decimals for shares/metrics, text for identifiers and names).

### Step 2: Establish Model Relationships
Navigate to the **Model View** and verify/create the following 1-to-Many single-directional relationships:
- `dim_state[state_id]` $\longrightarrow$ `fact_state_category_2023[state_id]`
- `dim_state[state_id]` $\longrightarrow$ `fact_state_motive_2023[state_id]`
- `dim_state[state_id]` $\longrightarrow$ `state_summary_2023[state_id]`
- `dim_state[state_id]` $\longrightarrow$ `trend_summary_2018_2022[state_id]`
- `dim_state[state_id]` $\longrightarrow$ `model_cluster_assignments[state_id]`
- `dim_crime_category[category_id]` $\longrightarrow$ `fact_state_category_2023[category_id]`
- `dim_motive[motive_id]` $\longrightarrow$ `fact_state_motive_2023[motive_id]`
- `dim_act_group[act_group]` $\longrightarrow$ `fact_state_category_2023[act_group]`
- `model_cluster_profiles[cluster_id]` $\longrightarrow$ `model_cluster_assignments[cluster_id]`

### Step 3: Create DAX Measures Table
1. Click **Enter Data**, name the table `_Measures`.
2. Copy and paste the 25 standardized DAX formulas provided in Section 4 of [`POWERBI_STAGE17_SPECIFICATION.md`](./POWERBI_STAGE17_SPECIFICATION.md).

### Step 4: Build the 10 Dashboard Pages
Follow the detailed visual blueprint, chart configurations, and layout grids specified for Pages 1 through 10 in Section 5 of [`POWERBI_STAGE17_SPECIFICATION.md`](./POWERBI_STAGE17_SPECIFICATION.md).

---

## 4. Runtime Environment & Validation Disclosure

- **Power BI Desktop Environment Status**: Power BI Desktop is a Windows desktop GUI application and is not executable via CLI automation in this headless Python runtime.
- **Academic Integrity Compliance**: In strict compliance with non-fabrication rules, no synthetic binary `.pbix` is generated. All underlying data, measures, models, layouts, and relationships are fully specified, verified, and reconciled against the master analytical database.
- **Automated Verification**: Run `python src/validate_stage17.py` to verify the mathematical reconciliation and structural integrity of the entire visualization data package.
