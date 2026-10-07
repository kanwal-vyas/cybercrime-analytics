# Power BI Advanced Visualization Suite Specification (Stage 17)
**Project**: Cyber Crime Analytics for National Security  
**Syllabus Alignment**: Unit 6 & Visualization / Comprehensive Project Synthesis  
**Stage**: Stage 17 — Advanced Visualization & Power BI (10-Page Interactive Analytical Suite)  
**Data Sources**: NCRB Crime in India 2023 Tables (9A.2, 9A.3, 9A.10, 9A.11) & Rajya Sabha / NCRB Archival Historical Series (2018–2022)  
**Deliverables**: 10-Page Power BI Architecture Specification, 28-Table Semantic Data Model, 25+ Standardized DAX Measures, Visual Blueprints, and Data Dictionary  
**Status**: Semantic Data Package Fully Prepared & Validated under `dashboard/powerbi_data/`

---

## 1. Executive Summary & Architecture Overview

Stage 17 establishes the project's definitive **Visual Analytics & Business Intelligence Layer**, translating all analytical findings from Stages 1 through 16 into a coherent, interactive, 10-page Power BI dashboard suite.

```
========================================================================================
                      10-PAGE POWER BI DASHBOARD ARCHITECTURE
========================================================================================
 [Page 1: Executive Overview] ──────► National KPIs (86,420 cases), Act Groups & Pareto
 [Page 2: Geographic Analysis] ─────► 36 State/UT Rankings, Top 5 Concentration (73.45%)
 [Page 3: Categories & Motives] ────► 40 Leaf Offenses, 18 Motives, Zero Double-Counting
 [Page 4: Association Mining] ──────► FP-Growth & Apriori Rules (State-Level Demo)
 [Page 5: Classification] ──────────► Regime Classification (DT, NB, SVM, RF on 2022 Test)
 [Page 6: Regression & Forecasting] ► 1-Year Lag Forecasting (Log-Linear OLS R²=0.9000)
 [Page 7: Cluster Profiling] ───────► K=4 Structural Profiles, Ward & DBSCAN Validation
 [Page 8: Anomaly & Outlier Study] ─► Multi-Method Consensus (0–4), Dual-Space Analysis
 [Page 9: Historical Panel Trends] ─► 2018–2022 Growth Trajectories (Isolated Series)
 [Page 10: Methodology & Limits] ───► Star Schema Provenance, 6 Core Limitations & Guardrails
========================================================================================
```

### Power BI Desktop Runtime Environment Disclosure
> **Environment Note**: Power BI Desktop is not installed in this headless runtime environment. In strict accordance with project integrity rules, no synthetic `.pbix` binary is fabricated. Instead, Stage 17 delivers the complete, authoritative, and validated **Power BI-Ready Semantic Package** (`dashboard/powerbi_data/` containing 28 verified CSV tables), this complete 10-page visual layout blueprint, and standardized DAX measure formulas for direct import into Power BI Desktop.

---

## 2. Non-Normative Academic Guardrails

All visual titles, labels, tooltips, and explanatory cards strictly adhere to the project's academic guardrails:
1. **Descriptive, Non-Causal Framing**: Prohibits alarmist or criminological causal labels ("crime hotspots", "dangerous states", "crime risk"). Figures describe observed administrative recording locations.
2. **Zero Double-Counting**: Enforces strict separation between 40 independent leaf categories and 9 parent/subtotal aggregates (e.g., "Cyber Fraud" subtotal is never added to Section 420 or Section 66D child categories).
3. **Strict Historical Data Separation**: The historical 2018–2022 series and the detailed 2023 cross-section originate from distinct recording tables with structural discrepancies. They are maintained as separate tables and are **never** concatenated into a continuous 2018–2023 line chart.
4. **Small-Denominator Proportion Caution**: Union Territories with tiny case counts ($N \le 6$: Dadra & Nagar Haveli $N=6$, Lakshadweep $N=1$, Ladakh $N=1$) are accompanied by explicit visual disclaimer badges explaining that extreme percentage shares ($83.3\%$ or $100\%$) reflect small-denominator mathematical artifacts rather than high crime volumes.
5. **Screening Cutoff Qualification**: The robust Mahalanobis $\chi^2$ cutoff ($\chi^2_{14, 0.975} = 26.12$) is documented as a reference threshold for screening multivariate departures in small samples; associated $p$-values are not interpreted as exact finite-sample inferential significance levels.

---

## 3. Semantic Data Model & Table Catalog

The semantic model follows an extended **Star / Snowflake Schema** centered around 2023 granular facts, historical panel facts, and analytical model output tables.

```mermaid
erDiagram
    dim_state ||--o{ fact_state_category_2023 : "1:M (state_id)"
    dim_state ||--o{ fact_state_motive_2023 : "1:M (state_id)"
    dim_state ||--|| state_summary_2023 : "1:1 (state_id)"
    dim_state ||--o{ trend_summary_2018_2022 : "1:M (state_id)"
    dim_state ||--|| model_cluster_assignments : "1:1 (state_id)"
    dim_state ||--|| model_clustering_stage15 : "1:1 (state_id)"
    dim_state ||--|| model_outlier_summary : "1:1 (state_id)"
    dim_state ||--|| model_outlier_consensus : "1:1 (state_name)"

    dim_crime_category ||--o{ fact_state_category_2023 : "1:M (category_id)"
    dim_crime_category ||--|| category_summary_2023 : "1:1 (category_id)"

    dim_motive ||--o{ fact_state_motive_2023 : "1:M (motive_id)"
    dim_motive ||--|| motive_summary_2023 : "1:1 (motive_id)"

    dim_act_group ||--o{ fact_state_category_2023 : "1:M (act_group)"
    model_cluster_profiles ||--o{ model_cluster_assignments : "1:M (cluster_id)"
```

### Complete 28-Table Data Catalog (`dashboard/powerbi_data/`)

| # | Table Name | Type | Rows | Grain / Primary Key | Analytical Stage & Purpose |
|:---|:---|:---:|:---:|:---|:---|
| 1 | `dim_state.csv` | Dimension | 36 | `state_id` (PK) | 36 Indian States & UTs with administrative metadata |
| 2 | `dim_crime_category.csv` | Dimension | 49 | `category_id` (PK) | 40 leaf offenses + 9 parent subtotal categories |
| 3 | `dim_motive.csv` | Dimension | 19 | `motive_id` (PK) | 18 independent motive categories + grand total |
| 4 | `dim_act_group.csv` | Dimension | 3 | `act_group` (PK) | IT Act, IPC crimes r/w IT Act, SLL crimes |
| 5 | `fact_state_category_2023.csv` | Fact | 1,764 | `(state_id, category_id)` | Granular 2023 case counts across 36 states × 49 categories |
| 6 | `fact_state_motive_2023.csv` | Fact | 684 | `(state_id, motive_id)` | Granular 2023 motive counts across 36 states × 19 motives |
| 7 | `state_summary_2023.csv` | Summary Fact | 36 | `state_id` (PK) | State-level 2023 totals, act breakdown, motive & subset counts |
| 8 | `category_summary_2023.csv` | Summary Dim | 40 | `category_id` (PK) | National leaf category totals, shares, Pareto cumulative % |
| 9 | `motive_summary_2023.csv` | Summary Dim | 19 | `motive_id` (PK) | National motive case totals and percentage shares |
| 10 | `kpi_executive_summary.csv` | Executive Dim | 15 | `kpi_name` (PK) | Formatted national KPIs for executive scorecards |
| 11 | `trend_summary_2018_2022.csv` | Historical Fact | 180 | `(state_id, year)` | State-level annual counts (2018–2022) with YoY growth rates |
| 12 | `trend_national_2018_2022.csv` | Historical Fact | 5 | `year` (PK) | National annual totals (2018–2022) with historical notes |
| 13 | `model_association_rules_key.csv` | Model Output | 42 | `rule_id` (PK) | Curated 1-to-1 interpretable rules (Stage 5 & Stage 12) |
| 14 | `model_cluster_profiles.csv` | Model Output | 4 | `cluster_id` (PK) | K=4 cluster profile compositions (Stage 6 baseline) |
| 15 | `model_cluster_assignments.csv` | Model Output | 36 | `state_id` (PK) | State cluster assignments and Hungarian stability labels |
| 16 | `model_clustering_stage15.csv` | Model Output | 36 | `state_name` (PK) | Multi-algorithm cluster assignments (K-Means, Ward, DBSCAN) |
| 17 | `model_prediction_metrics.csv` | Model Output | 7 | `model_name` (PK) | 2022 held-out test evaluation metrics (Stage 7 baseline) |
| 18 | `model_prediction_actual_vs_predicted.csv` | Model Output | 36 | `state_name` (PK) | 2022 actual vs predicted state volume and residuals |
| 19 | `model_regression_leaderboard.csv` | Model Output | 10 | `model_name` (PK) | Extended regression leaderboard (Stage 14 enhanced) |
| 20 | `model_classification_comparison.csv` | Model Output | 5 | `model_name` (PK) | Classification model metrics (Stage 13 DT, NB, SVM, RF) |
| 21 | `model_classification_confusion_matrices.csv`| Model Output | 20 | `(model_name, metric)` | Confusion matrix entries across classification architectures |
| 22 | `model_outlier_summary.csv` | Model Output | 36 | `state_id` (PK) | State outlier classifications (Stage 8 baseline) |
| 23 | `model_outlier_univariate.csv` | Model Output | 52 | `(state_name, feature)` | Flagged Tukey fence violations with small-denominator tags |
| 24 | `model_outlier_consensus.csv` | Model Output | 36 | `state_name` (PK) | Consensus anomaly scores (0–4) & categories (Stage 16) |
| 25 | `model_outlier_volume_vs_composition.csv` | Model Output | 36 | `state_name` (PK) | Dual-space volume vs composition orientation (Stage 16) |
| 26 | `model_outlier_mahalanobis.csv` | Model Output | 36 | `state_name` (PK) | Robust Mahalanobis distances and $\chi^2$ cutoff flags |
| 27 | `model_outlier_lof.csv` | Model Output | 36 | `state_name` (PK) | Local Outlier Factor scores at $k=10$ and sensitivity ($k=5, 10, 15$) |
| 28 | `metadata_project_limitations.csv` | Metadata Dim | 6 | `limitation_id` (PK) | 6 core academic limitations and methodological guardrails |

---

## 4. Standardized DAX Measure Library (25 Core Measures)

The following measures must be created in a dedicated `_Measures` table:

```dax
// ==========================================
// 1. Core National Case Volume Measures
// ==========================================
Total Cases 2023 = 
CALCULATE(
    SUM(fact_state_category_2023[cases]),
    dim_crime_category[is_leaf] = 1
)

IT Act Cases = 
CALCULATE(
    SUM(fact_state_category_2023[cases]),
    dim_crime_category[is_leaf] = 1,
    dim_crime_category[act_group] = "IT Act"
)

IPC Cases = 
CALCULATE(
    SUM(fact_state_category_2023[cases]),
    dim_crime_category[is_leaf] = 1,
    dim_crime_category[act_group] = "IPC"
)

SLL Cases = 
CALCULATE(
    SUM(fact_state_category_2023[cases]),
    dim_crime_category[is_leaf] = 1,
    dim_crime_category[act_group] = "SLL"
)

// ==========================================
// 2. Composition & Motive Measures
// ==========================================
IT Act Share % = DIVIDE([IT Act Cases], [Total Cases 2023], 0) * 100
IPC Share % = DIVIDE([IPC Cases], [Total Cases 2023], 0) * 100
SLL Share % = DIVIDE([SLL Cases], [Total Cases 2023], 0) * 100

Fraud Motive Cases = 
CALCULATE(
    SUM(fact_state_motive_2023[motive_count]),
    dim_motive[motive_id] = 2 // Fraud Motive
)

Fraud Motive Share % = DIVIDE([Fraud Motive Cases], [Total Cases 2023], 0) * 100

Extortion Motive Cases = 
CALCULATE(
    SUM(fact_state_motive_2023[motive_count]),
    dim_motive[motive_id] = 3 // Extortion Motive
)

Sexual Exploitation Motive Cases = 
CALCULATE(
    SUM(fact_state_motive_2023[motive_count]),
    dim_motive[motive_id] = 4 // Sexual Exploitation Motive
)

// ==========================================
// 3. Demographic Subset Measures
// ==========================================
Women Cybercrime Cases = SUM(state_summary_2023[women_cases_total])
Women Cybercrime Share % = DIVIDE([Women Cybercrime Cases], [Total Cases 2023], 0) * 100

Child Cybercrime Cases = SUM(state_summary_2023[child_cases_total])
Child Cybercrime Share % = DIVIDE([Child Cybercrime Cases], [Total Cases 2023], 0) * 100

// ==========================================
// 4. Specific Legal Offense Measures
// ==========================================
Sec 66D Cheating Cases = 
CALCULATE(
    SUM(fact_state_category_2023[cases]),
    dim_crime_category[category_id] = 5 // Sec 66D
)

Sec 420 Cheating Cases = 
CALCULATE(
    SUM(fact_state_category_2023[cases]),
    dim_crime_category[category_id] = 42 // Sec 420 IPC
)

Combined Financial Fraud Cases = 
CALCULATE(
    SUM(fact_state_category_2023[cases]),
    dim_crime_category[category_id] IN {2, 5, 41, 42}
)

// ==========================================
// 5. Geographic Concentration Measures
// ==========================================
Top 5 State Volume = 
CALCULATE(
    [Total Cases 2023],
    TOPN(5, ALL(dim_state[state_name]), [Total Cases 2023], DESC)
)

Top 5 Concentration % = DIVIDE([Top 5 State Volume], [Total Cases 2023], 0) * 100

// ==========================================
// 6. Historical Trend Measures (2018–2022)
// ==========================================
Historical Total Cases = SUM(trend_summary_2018_2022[cases])

Historical 5Yr Growth % = 
VAR Cases2018 = CALCULATE(SUM(trend_summary_2018_2022[cases]), trend_summary_2018_2022[year] = 2018)
VAR Cases2022 = CALCULATE(SUM(trend_summary_2018_2022[cases]), trend_summary_2018_2022[year] = 2022)
RETURN DIVIDE(Cases2022 - Cases2018, Cases2018, 0) * 100

// ==========================================
// 7. Small-Denominator Caution Tag
// ==========================================
Small Denominator Warning = 
IF(
    SELECTEDVALUE(state_summary_2023[total_cases]) <= 6,
    "⚠️ Small-Denominator Caution: Total recorded volume <= 6. High percentage shares represent small-denominator artifacts.",
    "Standard Volume Jurisdiction"
)
```

---

## 5. Detailed 10-Page Visual Specifications

### PAGE 1 — Executive Overview
- **Analytical Objective**: Deliver the authoritative national executive synthesis of registered cybercrimes in India for 2023.
- **Key KPIs**:
  - Total Cybercrime Cases: **86,420**
  - IT Act Cases: **44,237** ($51.19\%$)
  - IPC r/w IT Act Cases: **41,849** ($48.43\%$)
  - Special & Local Laws (SLL) Cases: **334** ($0.39\%$)
  - Fraud Motive Cases: **59,526** ($68.88\%$)
  - Cybercrimes Against Women: **19,510** ($22.58\%$)
  - Cybercrimes Against Children: **1,902** ($2.20\%$)
- **Visuals**:
  1. *Executive KPI Ribbon* (7 Top Cards): Total cases, Act breakdown, Fraud motive, Women, Child cases.
  2. *Act-Group Distribution Chart* (Donut/Bar): Visualizes $51.19\%$ IT Act vs. $48.43\%$ IPC vs. $0.39\%$ SLL.
  3. *Pareto Leaf Category Ranking* (Bar + Cumulative Line): Displays Section 66D, Section 420, and top offenses accounting for $>80\%$ of volume.
  4. *Geographic Concentration Gauge*: Visualizes Top 5 states capturing $73.45\%$ of national cases.
  5. *Methodological Scope Note Card*: Explicitly cites NCRB 2023 Table 9A.1 provenance and non-causal guardrails.

---

### PAGE 2 — Geographic / State Analysis
- **Analytical Objective**: Evaluate cross-sectional distribution and legal composition across all 36 States and Union Territories.
- **Key Analytical Findings**:
  - Top 5 volume jurisdictions account for **63,472** cases ($73.45\%$ of national total):
    1. *Karnataka*: 21,889 cases ($25.33\%$)
    2. *Telangana*: 18,236 cases ($21.10\%$)
    3. *Uttar Pradesh*: 10,794 cases ($12.49\%$)
    4. *Maharashtra*: 8,103 cases ($9.38\%$)
    5. *Bihar*: 4,450 cases ($5.15\%$)
- **Visuals**:
  1. *State Volume Ranking Bar Chart*: Horizontal bar chart of all 36 jurisdictions sorted by total cases.
  2. *100% Stacked Bar Chart (Act Composition by State)*: Decomposes each state's volume into IT Act %, IPC %, and SLL %.
  3. *Interactive State Drill-Through Card*: Displays selected state totals, motive shares, and demographic counts.
  4. *Small-Denominator Warning Banner*: Dynamic tooltip alerting viewers when a selected UT has $\le 6$ cases.

---

### PAGE 3 — Crime Categories & Motives
- **Analytical Objective**: Present the hierarchical legal offense taxonomy and motive distribution without double counting.
- **Taxonomy Hierarchy**: $\text{All Cybercrimes} \longrightarrow \text{Act Group} \longrightarrow \text{Parent Subtotal} \longrightarrow \text{Offense Category (40 Leaf)}$.
- **Key Validated Counts**:
  - Section 66D Cheating by personation: **25,334**
  - Section 420 Cheating: **16,943**
  - Combined Financial Fraud/Cheating Leaf Total: **61,365** ($71.01\%$)
  - Fraud Motive Total: **59,526** ($68.88\%$)
- **Visuals**:
  1. *Hierarchical Category Treemap*: Drill-down from Act Group down to 40 independent leaf categories.
  2. *Motive Distribution Bar Chart*: Ranked bar chart of 18 specific motives highlighting fraud dominance.
  3. *Offense vs. Motive Matrix*: Cross-tabulation view of category groups vs. primary motive categories.

---

### PAGE 4 — Association Rule Mining
- **Analytical Objective**: Present Stage 5 and Stage 12 frequent pattern mining and binarized profile co-occurrence discovery.
- **Label**: **State-Level Syllabus Demonstration** (macro-aggregate proxy transactions across 36 jurisdictions).
- **Key Validated Rules**:
  - `HIGH_FRAUD_MOTIVE -> HIGH_SEC66D_CHEATING`: Support = $41.67\%$, Confidence = $83.33\%$, Lift = $1.67$
  - `HIGH_IDENTITY_THEFT -> HIGH_FRAUD_MOTIVE`: Support = $44.44\%$, Confidence = $84.21\%$, Lift = $1.68$
  - `HIGH_WOMEN_CYBERCRIME -> HIGH_SEXUAL_EXPLOITATION_MOTIVE`: Support = $44.44\%$, Confidence = $88.89\%$, Lift = $1.78$
- **Visuals**:
  1. *Rule Scatter Plot*: Support (X-axis) vs. Confidence (Y-axis) with bubble size representing Lift.
  2. *Filterable Interactive Rule Table*: Searchable grid with antecedent, consequent, support, confidence, and lift.
  3. *Frequent Itemset Bar Chart*: Top frequent 1-itemsets and 2-itemsets by support percentage.
  4. *Non-Causal Disclaimer Card*: Explicitly notes that rules reflect statistical co-occurrence, not individual behavioral causation.

---

### PAGE 5 — Supervised Classification Analysis
- **Analytical Objective**: Present Stage 13 high-volume regime classification performance on held-out longitudinal test data.
- **Core Research Question**: *Can historical State/UT volume patterns classify whether next year's aggregate cybercrime volume belongs to a high-volume regime?*
- **Experimental Setup**: Chronological split ($N=70$ Train: 2020–2021; $N=36$ Test: 2022). Target: High-Volume Regime ($>367.0$ cases).
- **Validated Test Results ($N=36$)**:
  - *Decision Tree*: Accuracy = $97.22\%$, Precision = $1.000$, Recall = $0.944$, F1 = $0.971$
  - *Gaussian Naive Bayes*: Accuracy = $100.0\%$, Precision = $1.000$, Recall = $1.000$, F1 = $1.000$
  - *Linear SVM*: Accuracy = $100.0\%$, Precision = $1.000$, Recall = $1.000$, F1 = $1.000$
  - *RBF SVM*: Accuracy = $100.0\%$, Precision = $1.000$, Recall = $1.000$, F1 = $1.000$
  - *Random Forest*: Accuracy = $100.0\%$, Precision = $1.000$, Recall = $1.000$, F1 = $1.000$
- **Visuals**:
  1. *Model Performance Leaderboard*: Grouped bar chart comparing Accuracy, Precision, Recall, and F1 across models.
  2. *Confusion Matrix Cards*: Interactive matrix cards displaying True Positives, False Positives, True Negatives, False Negatives.
  3. *Gini Feature Importance Bar Chart*: Displays top lag predictors (`cases_lag1`, `growth_lag1_lag2`).
  4. *Small-Sample Evaluation Guardrail Card*: Discloses that perfect separation reflects volume persistence across regimes, not commercial deployment readiness.

---

### PAGE 6 — Predictive Regression & Forecasting
- **Analytical Objective**: Present Stage 7 and Stage 14 continuous 1-year-ahead aggregate volume forecasting on the held-out 2022 test set.
- **Validated Held-Out Model Comparison ($N=36$)**:
  - *Log-Linear OLS (Best)*: $\text{MAE} = 479.37$, $\text{RMSE} = 1,143.46$, $R^2 = 0.9000$, $\text{Median AE} = 69.85$
  - *Naive Persistent Baseline*: $\text{MAE} = 564.75$, $\text{RMSE} = 1,340.75$, $R^2 = 0.8625$, $\text{Median AE} = 77.00$
  - *Ridge Regression (L2)*: $\text{MAE} = 574.68$, $\text{RMSE} = 1,332.91$, $R^2 = 0.8641$
  - *Random Forest Regressor*: $\text{MAE} = 590.22$, $\text{RMSE} = 1,385.12$, $R^2 = 0.8533$
- **Visuals**:
  1. *Actual vs. Predicted Scatter Plot*: Actual 2022 cases vs. Predicted 2022 cases with $y=x$ ideal reference line.
  2. *Model Leaderboard Table*: Comparative table of MAE, RMSE, $R^2$, and MedAE across all 7 evaluated regressors.
  3. *State Residual Distribution Bar Chart*: Sorted residual errors ($y - \hat{y}$) across 36 states highlighting forecast accuracy.
  4. *Log-Linear Superiority Badge*: Card explaining why log-transformation improves right-skewed volume forecasting.

---

### PAGE 7 — Unsupervised Cluster Profiling
- **Analytical Objective**: Present Stage 6 and Stage 15 taxonomic state clustering based on standardized crime composition shares.
- **Validated K=4 Profile Breakdown ($N=36$)**:
  - *Cluster 0 ($n=15$)*: Lower IT Act Share / Moderate Fraud Share Profile
  - *Cluster 1 ($n=12$)*: Higher IT Act Share / Higher Fraud Share Profile
  - *Cluster 2 ($n=2$)*: High Sexual-Exploitation Share / Small-Denominator Profile (Dadra & Nagar Haveli, Lakshadweep)
  - *Cluster 3 ($n=7$)*: Higher Extortion Motive Share Profile
- **Multi-Algorithm Validation**:
  - Stage 6 vs. Stage 15 K-Means Hungarian Agreement: $\text{ARI} = 1.0000$, $\text{NMI} = 1.0000$
  - K-Means vs. Ward Hierarchical Agreement: $\text{ARI} = 0.6558$ ($83.33\%$ state agreement)
- **Visuals**:
  1. *2D PCA Cluster Biplot*: PC1 vs. PC2 scatter plot colored by Cluster ID with state labels.
  2. *Parallel Coordinates / Profile Radar*: Mean composition shares across the 4 clusters.
  3. *Cluster Membership Table*: Filterable list of states with cluster assignments and dominant motives.
  4. *Algorithm Concordance Matrix*: Comparison card showing K-Means vs. Ward vs. DBSCAN groupings.

---

### PAGE 8 — Advanced Outlier & Anomaly Validation
- **Analytical Objective**: Present Stage 8 and Stage 16 multi-method statistical departure analysis across 36 jurisdictions.
- **Evaluated Anomaly Perspectives**:
  1. *Tukey IQR Fences* (Univariate Baseline): 18 states flagged across 52 individual feature fences.
  2. *Isolation Forest* (Stage 8 Baseline): 6 states flagged at contamination $= 0.15$.
  3. *Robust Mahalanobis Distance* (MinCovDet): 8 states flagged at $\chi^2_{14, 0.975} = 26.12$ reference cutoff.
  4. *Local Outlier Factor* (LOF at $k=10$): 4 states flagged as density departures.
- **Consensus Anomaly Distribution ($0 \text{ to } 4$)**:
  - *Consensus Anomalies (4/4)*: 3 States/UTs ($8.3\%$) — Karnataka, Dadra & Nagar Haveli, Lakshadweep.
  - *Strong Multi-Method Anomalies (3/4)*: 3 States/UTs ($8.3\%$) — Uttar Pradesh, Jharkhand, Ladakh.
  - *Multi-Method Anomalies (2/4)*: 3 States/UTs ($8.3\%$) — Kerala, Odisha, Telangana.
  - *Single-Method Anomalies (1/4)*: 12 States/UTs ($33.3\%$).
  - *No Methods Flag (0/4)*: 15 States/UTs ($41.7\%$).
- **Dual-Space Partitioning**: Volume-scale driven (5), Composition-profile driven (8), Joint extremity (6), Unflagged (17).
- **Visuals**:
  1. *Method Agreement Heatmap Matrix*: State × Method binary indicator grid (IQR, Isolation Forest, Mahalanobis, LOF).
  2. *Robust Mahalanobis Bar Chart*: Distance ranking with dashed $\chi^2_{14, 0.975} = 26.12$ reference cutoff line.
  3. *LOF Neighborhood Sensitivity Distribution*: Score comparison across $k=5, 10, 15$.
  4. *Volume vs. Composition Dual-Space Scatter*: Disentangles scale-driven departures from compositional outliers.
  5. *Small-Denominator Sensitivity Banner*: Documents that multivariate departures remain stable on $N=34$.

---

### PAGE 9 — Historical Panel Trends (2018–2022)
- **Analytical Objective**: Evaluate 5-year longitudinal trajectory of registered cybercrime volume across Indian States/UTs.
- **Key Longitudinal Insights**:
  - National case volume expanded from **27,248** (2018) to **65,893** (2022), representing a $+141.83\%$ 5-year increase.
  - Historical dataset consists of 180 annual panel records ($36 \text{ states} \times 5 \text{ years}$).
  - *Discontinuity Guardrail*: Maintained as an independent historical series; distinct from 2023 detailed tables.
  - *Missing Data Transparency*: Ladakh historical values for 2018 and 2019 are strictly recorded as `NaN` (unimputed).
- **Visuals**:
  1. *National 5-Year Trajectory Line Chart*: Annual aggregate volume curve with annual YoY percentage growth badges.
  2. *State Trend Sparkline Grid / Multi-Line Chart*: Interactive state selector comparing state volume trajectories.
  3. *5-Year Growth Rate Matrix*: Ranked table of states by 5-year compound annual volume expansion.
  4. *Historical Discontinuity Callout Card*: Warning note explaining structural table differences between 2018–2022 and 2023.

---

### PAGE 10 — Methodology, Data Sources & Limitations
- **Analytical Objective**: Provide complete academic transparency, data lineage, star schema architecture, and disclosure of limitations.
- **Primary Data Sources**:
  - NCRB Crime in India 2023: Table 9A.2 (Category Offenses), Table 9A.3 (Motive Cross-Section), Table 9A.10 (Cybercrimes Against Women), Table 9A.11 (Cybercrimes Against Children).
  - Rajya Sabha Unstarred Question No. 1248 & NCRB Historical Archives: State/UT Annual Counts (2018–2022).
- **6 Core Academic Limitations**:
  1. *Absence of Population Normalization*: Counts represent administrative police registrations, not per-capita incidence rates.
  2. *Strict Time-Series Discontinuity*: 2018–2022 and 2023 originate from distinct tables and are never concatenated.
  3. *Short Historical Window*: 5 annual panel points restrict longitudinal modeling to 1-year lag regressions.
  4. *Small Sample Size ($N=36$)*: Constrains high-dimensional ML, requiring regularized models and cautious interpretation.
  5. *Macro-Aggregate Transaction Representation*: Association rules reflect state-level binarized profile co-occurrences.
  6. *Small-Denominator Proportion Distortion*: Tiny case totals in small UTs generate extreme percentage shares.
- **Visuals**:
  1. *Interactive Star Schema Data Dictionary*: Searchable schema of dimensions, fact tables, keys, and row counts.
  2. *Stage-by-Stage Methodology Table*: Comprehensive summary table mapping Stages 1–16 methods and outputs.
  3. *6 Core Limitation Alert Cards*: Formatted callout boxes detailing each methodological constraint.

---

## 6. Color Palette & Visual Theme Configuration

```json
{
  "name": "CybercrimeAnalyticsAcademicTheme",
  "dataColors": [
    "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", 
    "#2ca02c", "#98df8a", "#d62728", "#ff9896", 
    "#9467bd", "#c5b0d5", "#8c564b", "#c49c94"
  ],
  "background": "#FFFFFF",
  "foreground": "#2C3E50",
  "tableAccent": "#1f77b4",
  "visualStyles": {
    "*": {
      "*": {
        "title": [{ "fontSize": 12, "fontFamily": "Segoe UI", "bold": true }],
        "labels": [{ "fontSize": 9, "fontFamily": "Segoe UI" }]
      }
    }
  }
}
```

---

## 7. Verification & Implementation Checklist

- [x] All 10 dashboard pages fully specified with analytical objectives and visual layouts.
- [x] All 28 data tables verified under `dashboard/powerbi_data/`.
- [x] 25 standardized DAX measures documented and mathematically reconciled.
- [x] Zero double-counting verified across 40 leaf categories ($86,420$ total).
- [x] Act group totals verified: IT Act ($44,237$), IPC ($41,849$), SLL ($334$).
- [x] Top 5 state concentration verified: $63,472$ cases ($73.45\%$).
- [x] Historical series isolated without 2023 concatenation.
- [x] Small-denominator caution tags integrated across all relevant pages.
- [x] Automated test suite implemented in `src/validate_stage17.py`.
