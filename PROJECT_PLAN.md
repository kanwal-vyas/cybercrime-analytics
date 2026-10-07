# PROJECT PLAN — Cyber Crime Analytics for National Security

## 0. Status

| Stage | Notebook | Status |
|---|---|---|
| 1. Data Understanding / Validation Gate | `01_data_understanding.ipynb` | **Done** |
| 2. Preprocessing | `02_preprocessing.ipynb` | **Done** |
| 3. SQL / OLAP | `03_sql_olap.ipynb` | **Done (FROZEN)** |
| 4. EDA | `03_eda.ipynb` | **Done (FROZEN)** |
| 5. Association Rules | `04_association_rules.ipynb` | **Done (FROZEN)** |
| 6. Clustering | `05_clustering.ipynb` | **Done (FROZEN)** | 7. Prediction | `06_prediction.ipynb` | **Done (FROZEN)** |
| 8. Outlier Detection | `07_outlier_detection.ipynb` | **Done** |
| 9. Power BI Dashboard | — | Not started |

## 1. Datasets

See `README.md` for the dataset table. In short: four NCRB 2023 tables that share an
identical 36-row State/UT key and can be merged into one 2023 master table
(`categories_2023`, `motives_2023`, `women_2023`, `children_2023`), plus one separate
2018–2022 trend table (`trend_2018_2022`) from a different source (a Rajya Sabha
parliamentary reply) that is **not** silently concatenated with the 2023 figures — see
`notebooks/01_data_understanding.ipynb` Phase 5 for the evidence of why.

## 2. Dataset Validation Gate — Decision Record

This is the binding, evidence-based go/no-go record established in Stage 1. Do not
revisit these verdicts without re-running the corresponding checks in notebook 01.

| Technique | Verdict | Basis |
|---|---|---|
| Data preprocessing | **GO** | Missing values, inconsistent aggregate-row labels, and messy headers all identified and understood |
| SQL / OLAP | **GO** | Clean 36-row join key; hierarchical category structure supports roll-up/drill-down |
| EDA | **GO** | Verified numeric columns, strong right-skew already characterized |
| Regression (cross-sectional, 2023) | **GO** | n=36 states, many numeric predictors, totals verified consistent |
| Forecasting (time series) | **NO-GO** as a real forecast | Only 5–6 annual points, from a source with a documented gap vs. 2023 NCRB figures; descriptive trend line only, explicitly caveated |
| K-Means clustering | **GO**, conditional | Requires scaling/log-transform + leaf-only (non-parent-total) features; PCA likely needed given feature count vs. n=36 |
| Outlier detection | **GO** | Real numeric features; must interpret outliers (e.g. Karnataka, Telangana) as plausible genuine high-volume states, not automatically as errors |
| Apriori / association rules | **GO**, marginal | No natural transaction log exists; defensible only via an explicit state-as-transaction / above-median-category-as-item representation, reported with a heavy small-n (36) caveat |
| Classification / SVM / Decision Tree | **CONDITIONAL** | No ground-truth label exists; only usable with a clearly labelled, leakage-checked *engineered* target — not a first-class technique for this dataset |
| Geographic analysis / Power BI | **GO** | Full, clean 36/36 State/UT coverage |

Full evidence for every row above is in `notebooks/01_data_understanding.ipynb`.

## 3. Syllabus Mapping

| Syllabus Unit | Concept | Where demonstrated in this project |
|---|---|---|
| Unit 1 | Data mining concepts / applications | Whole project — cybercrime analytics as applied data mining |
| Unit 2 | Preprocessing, cleaning, transformation | Stage 2 — header cleanup, aggregate-row removal, 2023 master-table join, feature engineering for clustering/classification |
| Unit 3 | Data warehouse / OLAP, star schema, roll-up/drill-down/slice/dice | Stage 3 — `sql/schema.sql`, `sql/views.sql`, `sql/analysis_queries.sql`, `notebooks/03_sql_olap.ipynb`, `data/database/cybercrime.db` |
| Unit 4 | Frequent itemsets, Apriori, support/confidence/lift | Stage 5 — state-as-transaction / above-median-category-as-item representation (marginal-but-defensible, see Validation Gate) |
| Unit 5 | Classification, regression, prediction | Stage 7 (`06_prediction.ipynb`, `src/prediction.py`) — temporal lag panel prediction with zero target leakage |
| Unit 6 | K-Means, cluster interpretation, outlier/anomaly detection | Stage 6/8 — K-Means on standardized composition features; IQR Tukey fences + Isolation Forest outlier detection |
| Visualization | Exploratory, geographic, dashboards | Stage 4 (`notebooks/03_eda.ipynb`, `src/eda.py`, `outputs/figures/`) and Stage 9 (Power BI: executive overview, geographic, category, trend pages) |

## 4. Phased Plan

### Stage 1 — Data Understanding (done)
Inventory, quality checks, cross-table alignment, arithmetic verification, syllabus
validation. Output: `notebooks/01_data_understanding.ipynb`, this document, `README.md`.

### Stage 2 — Preprocessing (done)
- Cleaned column headers for `women_2023`/`children_2023`.
- Joined `categories_2023` + `motives_2023` + `women_2023` + `children_2023` into `data/processed/master_state_2023.csv` (36 rows).
- Identified the 40 independent **leaf** category columns in `categories_2023` (of 49 total).
- Cleaned `trend_2018_2022.csv` separately (36 rows; Ladakh 2018/2019 left as `NaN`, not imputed).
- Added engineered features to `master_state_2023.csv`: `log1p` and `share__<col>` composition features.

### Stage 3 — SQL / OLAP (done)
- Built `data/database/cybercrime.db` (SQLite 3 with Star Schema, foreign keys enforced).
- 4 Dimensions (`dim_state`, `dim_year`, `dim_crime_category`, `dim_motive`), 3 Facts (`fact_cybercrime_category_2023`, `fact_cybercrime_motive_2023`, `fact_cybercrime_trend`).
- Operationalized analytical views and formal OLAP operations (Roll-Up, Drill-Down, Slice, Dice, Pivot).
- 100% mathematical reconciliation verified across all 36 States/UTs.

### Stage 4 — EDA (done)
- **Data Profiling:** 36 States/UTs $\times$ 164 columns in 2023 master table (0 missing values, 0 duplicate keys).
- **Geographic Distribution & Skewness:** Severe positive right-skewness (skewness = 3.14, mean = 2,400.6, median = 707.0). The top 5 states by volume (Karnataka: 21,889, Telangana: 18,236, Uttar Pradesh: 10,794, Maharashtra: 8,103, Bihar: 4,450) account for **73.45%** ($63,472 / 86,420$) of all national cybercrime cases in 2023.
- **Category Pareto Concentration:** 40 independent leaf categories analyzed without double-counting. Top 2 independent leaf categories: *Cheating by personation using computer resource (Sec.66D IT Act)* with 25,334 cases (29.31%) and *Cheating (Sec.420 IPC)* with 16,943 cases (19.61%), totaling 42,277 cases (48.92%). Including independent leaf fraud subcategories brings total financial cybercrimes to 61,365 cases (71.01%).
- **Legal Framework Analysis:** IT Act offences account for **51.19%** (44,237 cases), IPC crimes account for **48.79%** (42,166 cases), and SLL crimes account for **0.02%** (17 cases).
- **Motive Analysis:** Financial **Fraud** is the overwhelming motive classification, accounting for **68.88%** ($59,526 / 86,420$) of all motive-classified cybercrimes, followed by Extortion (5.81%), Sexual Exploitation (5.42%), and Personal Revenge (4.57%).
- **Special Subsets:** Analyzed cybercrimes against women ($19,510$ cases across 6 component categories) and children ($1,902$ cases across 6 component categories) as independent subset dimensions.
- **Correlation Structure:** Identified strong collinearity among total crime, fraud motive, and Sec.66D cheating ($r > 0.95$), reflecting shared-scale volume dominance and part-whole mathematical relationships.
- **Machine Learning Preparation:** Exported curated 13-feature non-redundant state matrix (`outputs/tables/eda_state_feature_matrix.csv`). Formulated candidate clustering and supervised classification questions while strictly enforcing the conditional regression rule (no regressing total cases on component category counts).
- **Visual & Tabular Outputs:** Generated 12 figures in `outputs/figures/` and 8 summary tables in `outputs/tables/`.

### Stage 5 — Association Rule Mining (done)
- **Methodological Position**: Explicitly established as **State-Level Association Rule Mining — Syllabus Demonstration** on 36 State/UT aggregate profiles ($n = 36$). No incident-level transaction claims; no causal claims.
- **Transaction Representation**: 36 binary transactions (1 row per State/UT) constructed over 8 non-redundant, volume-leakage-free items:
  1. `HIGH_FRAUD_MOTIVE` (Fraud Motive $\ge 119.5$ cases, 50.0% split)
  2. `HIGH_SEC66D_CHEATING` (Sec. 66D Personation Cheating $\ge 37.5$ cases, 50.0% split)
  3. `HIGH_IDENTITY_THEFT` (Sec. 66C Identity Theft $\ge 8.0$ cases, 52.8% split)
  4. `HIGH_IT_ACT_SHARE` (IT Act Share of total $\ge 68.75\%$, 50.0% split)
  5. `HIGH_EXTORTION_MOTIVE` (Extortion Motive $\ge 9.5$ cases, 50.0% split)
  6. `HIGH_SEXUAL_EXPLOITATION_MOTIVE` (Sexual Exploitation Motive $\ge 30.5$ cases, 50.0% split)
  7. `HIGH_WOMEN_CYBERCRIME` (Women Cybercrimes $\ge 131.0$ cases, 50.0% split)
  8. `HIGH_CHILD_CYBERCRIME` (Children Cybercrimes $\ge 12.0$ cases, 50.0% split)
- **Frequent Itemset Mining (Apriori)**: With $\text{min\_support} = 0.25$ ($\ge 9 / 36$ states), mined **129 frequent itemsets** (8 1-itemsets, 28 2-itemsets, 48 3-itemsets, 37 4-itemsets, 8 5-itemsets). Verified $\text{support\_count} / 36 = \text{support}$.
- **Association Rule Generation**: Mined and filtered rules with $\text{min\_confidence} = 0.60$ and $\text{lift} > 1.0$, producing **1,924 filtered association rules** across all itemset combinations, including **42 one-to-one pair rules** used for primary human-readable profile analysis.
- **Key Empirical Rule Findings (Statistically Neutral)**:
  - `HIGH_FRAUD_MOTIVE -> HIGH_SEC66D_CHEATING`: Support = $41.67\%$ ($15 / 36$ states), Confidence = $83.33\%$, Lift = $1.67$. (Reverse rule `HIGH_SEC66D_CHEATING -> HIGH_FRAUD_MOTIVE` also holds with Support = $41.67\%$, Confidence = $83.33\%$, Lift = $1.67$).
  - `HIGH_IDENTITY_THEFT -> HIGH_FRAUD_MOTIVE`: Support = $44.44\%$ ($16 / 36$ states), Confidence = $84.21\%$, Lift = $1.68$. (Reverse rule `HIGH_FRAUD_MOTIVE -> HIGH_IDENTITY_THEFT` has Support = $44.44\%$, Confidence = $88.89\%$, Lift = $1.68$).
  - `HIGH_WOMEN_CYBERCRIME -> HIGH_SEXUAL_EXPLOITATION_MOTIVE`: Support = $44.44\%$ ($16 / 36$ states), Confidence = $88.89\%$, Lift = $1.78$. (Reverse rule also holds: Support = $44.44\%$, Confidence = $88.89\%$, Lift = $1.78$).
  - `HIGH_WOMEN_CYBERCRIME -> HIGH_CHILD_CYBERCRIME`: Support = $44.44\%$ ($16 / 36$ states), Confidence = $88.89\%$, Lift = $1.78$.
  - `HIGH_IT_ACT_SHARE`: Under the selected median thresholds, `HIGH_IT_ACT_SHARE` does not produce a positive-lift association ($\text{Lift} > 1.0$) with the examined raw motive-count indicators.
- **Exported Tables & Figures**:
  - `outputs/tables/state_transaction_matrix.csv`
  - `outputs/tables/association_item_thresholds.csv`
  - `outputs/tables/frequent_itemsets.csv`
  - `outputs/tables/association_rules.csv`
  - `outputs/figures/13_apriori_itemset_support.png`
  - `outputs/figures/14_association_rules_scatter.png`
- **Reproducibility & Verification**: `src/association_rules.py` module and `notebooks/04_association_rules.ipynb` executed head-to-tail with 0 errors. All mathematical validation assertions passed in `src/validate_stage5.py`.
- **Methodological Limitations**: $N = 36$ aggregate state profiles. These patterns describe statistical co-occurrence among the selected State/UT-level indicators in the observed dataset. The analysis does not test causal mechanisms or external explanatory factors.

### Stage 6 — Clustering: State-Level Cybercrime Profile Grouping (Done / FROZEN)

- **Methodological Framing**: Applied to aggregate State/UT observations ($N = 36$) in the 2023 NCRB dataset. Clusters represent descriptive State/UT profile groups with similar cybercrime composition profiles. Clusters do not imply causality, intra-state homogeneity, or value judgments (not a "crime-risk ranking").
- **Distance Space Guardrail**: Total crime volume (`total_cases`), parent category totals, and sub-category counts were deliberately excluded from the clustering distance space to prevent state population scale / reporting volume from dominating Euclidean distances.
- **Clustering Features (4 Standardized Composition Shares)**:
  1. `it_act_share` (Proportion of state cybercrimes registered under the IT Act; range: 0.057 to 1.000, mean: 0.589)
  2. `fraud_motive_share` (Proportion of state motive profile classified as Financial Fraud; range: 0.000 to 0.887, mean: 0.490)
  3. `extortion_motive_share` (Proportion of state motive profile classified as Extortion; range: 0.000 to 0.286, mean: 0.042)
  4. `sexual_exploitation_motive_share` (Proportion of state motive profile classified as Sexual Exploitation; range: 0.000 to 1.000, mean: 0.158)
- **Feature Correlation**: Maximum pairwise $|r| = 0.533$ (between `fraud_motive_share` and `sexual_exploitation_motive_share`), confirming sufficient orthogonality across features.
- **Preprocessing**: `StandardScaler` applied across the 4 composition features.
- **Candidate K Evaluation ($K \in [2, 8]$)**:
  - $K=2$: Inertia = $106.97$, Silhouette = $0.2557$ (Sizes: {13, 23})
  - $K=3$: Inertia = $76.35$, Silhouette = $0.2635$ (Sizes: {18, 16, 2})
  - **$K=4$ (Selected Compromise)**: Inertia = $49.68$, Silhouette = **$0.3497$** (Sizes: {15, 12, 7, 2}; 1 cluster with $n \le 2$)
  - $K=5$: Inertia = $37.49$, Silhouette = $0.3632$ (Sizes: {11, 9, 7, 7, 2}; 1 cluster with $n \le 2$)
  - $K=6$: Inertia = $30.44$, Silhouette = $0.3449$ (Sizes: {8, 7, 7, 7, 5, 2})
  - $K=7$: Inertia = $24.81$, Silhouette = $0.3688$ (Sizes: {8, 7, 6, 6, 5, 2, 2}; 2 clusters with $n \le 2$)
  - $K=8$: Inertia = $20.08$, Silhouette = $0.3771$ (Sizes: {8, 6, 6, 5, 4, 3, 2, 2}; 2 clusters with $n \le 2$, 3 with $n \le 3$)
- **Selected K Justification ($K = 4$)**:
  - Retained and documented as an **interpretable compromise** between cluster separation, elbow structure, and cluster fragmentation.
  - Clear elbow inflection (34.9% inertia reduction from $K=3$ to $K=4$).
  - Substantial silhouette score step-up ($+32.7\%$ over $K=3$).
  - Higher-K alternatives ($K=5, 7, 8$) were evaluated; while they produce marginally higher silhouette scores, they introduce additional micro-clusters ($n \le 2$) and over-fragment the small sample of 36 jurisdictions without adding distinct profile interpretations.
- **Cluster Profiles ($K = 4$)**:
  - **Cluster 0 ($n = 15$, $41.67\%$)**: *Lower IT Act Share / Moderate Fraud Share Profile* (Low IT Act share mean $32.67\%$, moderate Fraud motive mean $44.42\%$, low Extortion mean $2.76\%$, moderate Sexual Exploitation mean $11.03\%$). [State/UT Members: Maharashtra, Telangana, Bihar, Andhra Pradesh, Gujarat, MP, Rajasthan, Delhi, West Bengal, Odisha, Chhattisgarh, Haryana, Manipur, Ladakh, A&N Islands].
  - **Cluster 1 ($n = 12$, $33.33\%$)**: *Higher IT Act Share / Higher Fraud Share Profile* (High IT Act share mean $88.68\%$, high Fraud motive mean $71.61\%$, low Extortion mean $1.94\%$, moderate Sexual Exploitation mean $10.53\%$). [State/UT Members: Karnataka, Tamil Nadu, Jharkhand, Goa, HP, Arunachal Pradesh, Mizoram, Nagaland, Meghalaya, Tripura, J&K, Puducherry].
  - **Cluster 2 ($n = 2$, $5.56\%$)**: *High Sexual-Exploitation Share / Small-Denominator Profile* ($100.00\%$ IT Act share, $91.67\%$ Sexual Exploitation motive mean, $0.00\%$ Fraud motive). [State/UT Members: Dadra & Nagar Haveli and Daman & Diu (6 total cases), Lakshadweep (1 total case)]. *Caution: High share is driven by tiny denominators ($N=6$ and $N=1$), not high crime volume. Not a high-volume or high-crime cluster.*
  - **Cluster 3 ($n = 7$, $19.44\%$)**: *Higher Extortion Motive Share Profile* (High IT Act share mean $74.40\%$, moderate Fraud mean $33.25\%$, elevated Extortion motive mean $12.54\%$, $\sim 3\times$ national average). [State/UT Members: UP, Assam, Punjab, Kerala, Uttarakhand, Sikkim, Chandigarh].
- **Membership Stability & Sensitivity Diagnostics (Hungarian Label Alignment)**:
  1. *Feature Ablation Check (3-Feature K=4 vs Primary 4-Feature K=4)*: After optimal Hungarian alignment, **27 / 36 (75.0%)** of State/UT observations retain identical cluster profile assignments (9 states reassigned: Chhattisgarh, Haryana, Manipur, Rajasthan, Tamil Nadu, West Bengal, Andaman and Nicobar Islands, Delhi, Ladakh). This quantifies that the substantive three-profile structure is retained without solely depending on the sexual exploitation feature, while boundary shifts (~25%) are transparently documented.
  2. *Sample Exclusion Check ($N = 34$ vs Primary $N = 36$)*: Excluding the 2 small-denominator UTs and running Hungarian alignment yields **26 / 34 (76.5%)** agreement across common jurisdictions (8 reassigned: Chhattisgarh, Manipur, Meghalaya, Rajasthan, Tripura, Andaman and Nicobar Islands, Chandigarh, J&K), demonstrating that the broad 4-group structure persists when tiny jurisdictions are omitted.
- **2D PCA Visualization Aid**: PC1 (41.5% variance) and PC2 (27.7% variance) capture $69.1\%$ cumulative variance for 2D visualization aid.
- **Exported Tables & Figures**:
  - `outputs/tables/clustering_evaluation.csv`
  - `outputs/tables/clustering_sensitivity_analysis.csv`
  - `outputs/tables/clustering_membership_stability.csv`
  - `outputs/tables/cluster_assignments_2023.csv`
  - `outputs/tables/cluster_profiles_2023.csv`
  - `outputs/figures/15_clustering_elbow.png`
  - `outputs/figures/16_clustering_silhouette.png`
  - `outputs/figures/17_cluster_sizes.png`
  - `outputs/figures/18_cluster_feature_profiles.png`
  - `outputs/figures/19_cluster_projection.png`
- **Reproducibility & Verification**: `src/clustering.py` module and `notebooks/05_clustering.ipynb` executed head-to-tail with 0 errors. All 7 test suites in `src/validate_stage6.py` passed.

### Stage 7 — Prediction: State-Level Cybercrime Volume Prediction (Done / FROZEN)
- **Analytical Problem Formulation**: Predicts 1-year ahead aggregate State/UT cybercrime volume using historical longitudinal lag features from preceding years ($t-1$ and $t-2$).
- **Zero-Leakage Protocol**:
  - **No Tautology**: Avoids regressing total cases on contemporaneous category/motive components.
  - **Chronological Split**: The training target years (2020 and 2021, $N_{\text{train}} = 70$) precede the held-out test year (2022, $N_{\text{test}} = 36$), preventing target-year lookahead. No `(state_name, target_year)` observation appears in both partitions; states may recur across years because this is a longitudinal panel design.
  - **Automated Audit**: 5 automated leakage checks (`LEAK-01` to `LEAK-05`) verified and passed in `prediction_leakage_audit.csv`.
- **Evaluated Models & Performance (Held-Out 2022 Test Set)**:
  - *Naive Persistent Baseline ($y_{t-1}$)*: MAE = $564.75$ cases, RMSE = $1,340.75$, $R^2 = 0.8625$, Median AE = $61.50$.
  - *Historical 2-Year Moving Average*: MAE = $563.04$ cases, RMSE = $1,523.73$, $R^2 = 0.8224$, Median AE = $57.00$.
  - *Linear Regression (OLS, Raw)*: MAE = $776.08$ cases, RMSE = $1,680.13$, $R^2 = 0.7840$, Median AE = $205.07$.
  - *Ridge Regression (L2 Regularized)*: MAE = $776.08$ cases, RMSE = $1,680.13$, $R^2 = 0.7840$, Median AE = $205.07$.
  - *Log-Linear Regression (Log OLS - Top Performer)*: **MAE = $479.37$ cases**, **RMSE = $1,143.46$**, **$R^2 = 0.9000$**, Median AE = $69.85$.
  - *Decision Tree Regressor (depth=3)*: MAE = $608.42$ cases, RMSE = $1,571.47$, $R^2 = 0.8111$, Median AE = $100.86$.
  - *Random Forest Regressor (depth=3)*: MAE = $582.24$ cases, RMSE = $1,559.55$, $R^2 = 0.8139$, Median AE = $58.47$.
- **Key Analytical Findings**:
  - The strong performance of the Naive Persistent baseline indicates substantial temporal persistence in observed state-level cybercrime case volumes ($R^2 = 0.8625$).
  - Log-Linear regression achieves the lowest error and highest variance explained by stabilizing variance across extreme volume ranges (high-volume hubs vs small UTs).
  - High absolute residual errors are concentrated in states with large year-over-year volume changes (Telangana, Karnataka, Assam).
  - Annual changes may reflect changes in reporting, registration, enforcement, or other underlying conditions; the available data do not allow these factors to be separated from changes in observed case volume.
- **Exported Tables & Figures**:
  - `outputs/tables/prediction_dataset.csv`
  - `outputs/tables/prediction_results.csv`
  - `outputs/tables/prediction_actual_vs_predicted.csv`
  - `outputs/tables/prediction_leakage_audit.csv`
  - `outputs/figures/20_prediction_actual_vs_predicted.png`
  - `outputs/figures/21_prediction_model_comparison.png`
  - `outputs/figures/22_prediction_residuals_by_state.png`
  - `outputs/figures/23_historical_trajectory_forecast.png`
  - `outputs/models/` (5 serialized model artifacts)
- **Reproducibility & Verification**: `src/prediction.py` module and `notebooks/06_prediction.ipynb` executed head-to-tail with 0 errors. All 6 validation suites in `src/validate_stage7.py` passed.

### Stage 8 — Outlier Detection: Descriptive Extreme Observation Analysis (Done)
- **Methodological Purpose**: Identifies State/UT observations that are statistically unusual relative to the observed 2023 distribution ($N = 36$). Confined to descriptive statistical extremity; does not imply criminality, risk scoring, or recording errors.
- **Analytical Features (14 Dimensions)**:
  - *10 Volume Features (Count Scale)*: `total_cases`, `it_act_cases`, `ipc_cases`, `motive_fraud`, `motive_extortion`, `motive_sexual_exploitation`, `sec66d_cheating_personation`, `sec66c_identity_theft`, `women_cases_total`, `child_cases_total`.
  - *4 Composition Features (Share Scale)*: `it_act_share`, `fraud_motive_share`, `extortion_motive_share`, `sexual_exploitation_motive_share`.
- **Primary Method (Tukey IQR Fences)**:
  - Calculates $Q_1$, $Q_3$, $\text{IQR} = Q_3 - Q_1$, and fences $[Q_1 - 1.5\text{IQR}, Q_3 + 1.5\text{IQR}]$.
  - Detected 52 total univariate fence violation occurrences across 18 distinct jurisdictions (18 jurisdictions have 0 flags).
  - Key Volume Outliers: Total cases upper fence = $5,804.75$; 4 State/UT observations exceed this upper fence: Karnataka (21,889), Telangana (18,236), UP (10,794), and Maharashtra (8,103).
- **Secondary Method (Multivariate Isolation Forest)**:
  - Applied to $\log(1+y)$ transformed counts and standardized shares ($\text{contamination} = 0.15, \text{random\_state} = 42$) to prevent volume scale domination.
  - Flagged 6 multivariate outliers: Karnataka (extreme overall volume), Kerala (high extortion share + child cybercrimes), UP (high extortion count + IT Act volume), Dadra & Nagar Haveli (small-denominator share), Lakshadweep (small-denominator share), Ladakh (extreme zero sparsity on $N=1$).
- **State-Level Classification Synthesis (36 States/UTs)**:
  - *No detected outlier*: **18 States/UTs (50.0%)** (e.g., Delhi, Haryana, MP, Odisha, Punjab, West Bengal).
  - *Univariate outlier only*: **12 States/UTs (33.3%)** (e.g., Maharashtra, Telangana, Tamil Nadu, Rajasthan, Bihar, Gujarat, Jharkhand, Assam, Chhattisgarh, Uttarakhand, Chandigarh, Andhra Pradesh).
  - *Both (Univariate & Multivariate)*: **5 States/UTs (13.9%)** (Karnataka, Uttar Pradesh, Kerala, Dadra and Nagar Haveli and Daman and Diu, Lakshadweep).
  - *Multivariate outlier only*: **1 State/UT (2.8%)** (Ladakh).
- **Small-Denominator Caution**: Proportions in Dadra & Nagar Haveli ($83.33\%$) and Lakshadweep ($100.00\%$) exceed the upper fence ($44.52\%$) due entirely to tiny denominators ($N=6$ and $N=1$), **not high crime volume**.
- **Exported Tables & Figures**:
  - `outputs/tables/outlier_feature_statistics.csv`
  - `outputs/tables/outlier_univariate_results.csv`
  - `outputs/tables/outlier_multivariate_results.csv`
  - `outputs/tables/outlier_state_summary.csv`
  - `outputs/figures/24_outlier_iqr_boxplots.png`
  - `outputs/figures/25_outlier_flags_by_feature.png`
  - `outputs/figures/26_outlier_state_summary.png`
  - `outputs/figures/27_outlier_multivariate_projection.png`
- **Reproducibility & Verification**: `src/outlier_detection.py` module and `notebooks/07_outlier_detection.ipynb` executed head-to-tail with 0 errors. All 6 validation suites in `src/validate_stage8.py` passed.

### Stage 9 — Power BI Dashboard Integration & Semantic Data Package (Done)
- **Integration Architecture**: Serves as the interactive visualization and synthesis layer for Stages 1 through 8. Built strictly from validated SQLite database views (`sql/views.sql`), processed tables, and Stage 4–8 analytical output tables. No unverified calculations or raw modifications are performed.
- **Semantic Data Model (`dashboard/powerbi_data/`)**:
  - Star / Snowflake schema with 3 core dimension tables (`dim_state`, `dim_crime_category`, `dim_motive`), 1 roll-up dimension (`dim_act_group`), 2 granular fact tables (`fact_state_category_2023`, `fact_state_motive_2023`), and 14 pre-aggregated analytical model and summary tables.
  - Zero historical contamination: Historical 2018–2022 series and 2023 detailed cross-section are isolated into separate tables (`trend_summary_2018_2022.csv`, `trend_national_2018_2022.csv`).
- **Standardized DAX Measure Library**: Contains 11 verified DAX measures (`Total Cases 2023`, `IT Act Cases`, `IPC Cases`, `SLL Cases`, `IT Act Share %`, `IPC Share %`, `Fraud Motive Cases`, `Fraud Motive Share %`, `Women Cybercrime Cases`, `Children Cybercrime Cases`, `State Count`).
- **6-Page Dashboard Architecture (`dashboard/POWERBI_SPECIFICATION.md`)**:
  1. *Executive Overview*: High-level national scale briefing (86,420 total cases, 59,526 fraud motive cases, 19,510 women cases, 1,902 child cases), legal act breakdown (IT Act 51.19%, IPC 48.43%, SLL 0.39%), state volume ranking (top states: Karnataka 21,889, Telangana 18,236).
  2. *Geographic / State Analysis*: Interactive jurisdictional exploration across all 36 States/UTs, State vs UT toggle slicer, and dynamic multi-metric jurisdictional profile card.
  3. *Crime Categories & Motives*: 40 independent leaf categories with Pareto cumulative volume curve (top 2 categories account for 48.92% of national cases), 18-motive distribution showing financial fraud dominance (68.88%).
  4. *Analytical Models*: Separated modular sections for Stage 5 Principal Association Rules (co-occurrence disclaimer), Stage 6 K-Means Cluster Profiles (4 composition groups), and Stage 8 Outlier Detection (Tukey IQR + Isolation Forest with small-denominator caution for tiny UTs).
  5. *Historical Trend & Prediction*: National 2018–2022 trajectory (27,248 to 65,893 cases) with prominent historical separation banner; 7-model performance leaderboard on held-out 2022 test set highlighting Log-Linear regression ($\text{MAE} = 479.37$, $R^2 = 0.9000$).
  6. *Data Sources & Methodological Limitations*: Comprehensive data provenance, analytical methodology matrix, and the 6 core academic guardrails.
- **Exported Deliverables**:
  - `dashboard/powerbi_data/` (20 validated CSV extracts)
  - `dashboard/POWERBI_SPECIFICATION.md` (Complete 6-page visual architecture, DAX library, ERD, and Power BI Desktop assembly guide)
- **Reproducibility & Verification**: `src/dashboard_prep.py` pipeline and `src/validate_stage9.py` test suite executed successfully with 100% pass rate across all 6 validation suites.


## 5. Known Data Limitations (carry through every later stage)

1. No population data → all figures are raw case counts, not per-capita rates.
2. `trend_2018_2022` and `categories_2023` differ in 2022 vs. 2023 totals for several
   states — treat as two distinct series, not one continuous line.
3. Only 5–6 annual points nationally → no reliable time-series forecasting.
4. n=36 states/UTs → small-sample caution for every ML technique (clustering, Apriori,
   any classification).
5. No case-level/incident-level data → Apriori requires a proxy transaction
   representation, explicitly labelled as such.
6. Karnataka/Telangana/UP/Maharashtra dominate raw totals → must be scaled/log-transformed before
   distance-based methods (clustering, outlier detection), and must not be mislabelled
   as data errors when flagged as outliers.
