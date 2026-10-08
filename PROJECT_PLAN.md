# PROJECT PLAN — Cyber Crime Analytics for National Security

## 0. Status

| Stage | Focus / Deliverable | Notebook / Script / Artifact | Status |
|---|---|---|---|
| 1. Data Understanding / Validation Gate | Source Data Inventory & Go/No-Go Gate | `01_data_understanding.ipynb` | **Done (FROZEN)** |
| 2. Preprocessing | Clean Master State Cross-Section & Features | `02_preprocessing.ipynb` | **Done (FROZEN)** |
| 3. SQL / OLAP | Star Schema Warehouse & Analytical Views | `03_sql_olap.ipynb`, `cybercrime.db` | **Done (FROZEN)** |
| 4. EDA | Distribution, Pareto, Motives & Subsets | `03_eda.ipynb` | **Done (FROZEN)** |
| 5. Association Rules | State-Level Syllabus Demonstration (Apriori) | `04_association_rules.ipynb` | **Done (FROZEN)** |
| 6. Clustering | K-Means Composition Profiles ($K=4$) | `05_clustering.ipynb` | **Done (FROZEN)** |
| 7. Prediction | Temporal Lag Panel Regression (Log-Linear) | `06_prediction.ipynb` | **Done (FROZEN)** |
| 8. Outlier Detection | Descriptive Tukey IQR & Isolation Forest | `07_outlier_detection.ipynb` | **Done (FROZEN)** |
| 9. Power BI Dashboard | Semantic Data Package & 6-Page Spec | `POWERBI_SPECIFICATION.md` | **Done (FROZEN)** |
| 10. Advanced Data Preprocessing | Summarization, Reduction, Discretization | `08_advanced_preprocessing.ipynb` | **Done (FROZEN)** |
| 11. Advanced OLAP & Data Cube | Multidimensional Cubes & AOI | `09_advanced_olap_cube.ipynb` | **Done (FROZEN)** |
| 12. Advanced Frequent Patterns | FP-Growth vs Apriori, Correlation | `10_advanced_frequent_patterns.ipynb` | **Done (FROZEN)** |
| 13. Classification Analysis | Decision Tree, Naive Bayes, SVM, RF | `11_classification.ipynb` | **Done (FROZEN)** |
| 14. Regression & Prediction Enhancement | Polynomial, Ridge, Trees vs Log-Linear | `12_regression_enhancement.ipynb`| **Done (FROZEN)** |
| 15. Advanced Clustering & Validation | Hierarchical Ward, GMM, DBSCAN, ARI/NMI| `13_advanced_clustering.ipynb` | **Done (FROZEN)** |
| 16. Advanced Outlier & Anomaly Validation| Robust Mahalanobis, LOF, Dual-Space | `14_advanced_outlier_detection.ipynb`| **Done (FROZEN)** |
| 17. Advanced Visualization & Power BI | 10-Page Visual Architecture & 28 Tables| `15_advanced_visualization.ipynb` | **Done (FROZEN)** |
| 18. Final Integration, Audit & Readiness | Full Repository & Academic Audit Gate | `PROJECT_FINAL_AUDIT.md`, `src/validate_stage18.py` | **Done (FROZEN)** |
| 19. UI Architecture & Foundation | React + Vite Scaffold, Layout & Design | `frontend/` | **Done (FROZEN)** |
| 20. Backend / API Layer | FastAPI REST Endpoints & Data Access | `backend/` | **Done (FROZEN)** |
| 21. Executive Dashboard | National KPIs & High-Level Visuals | Frontend Page | **Done (FROZEN)** |
| 22. Geographic & Crime Explorer | State/UT & Offense Interactive Explorer | Frontend Page | **Done (FROZEN)** |
| 23. Historical Analytics | 2018–2022 Longitudinal Trend View | Frontend Page | **Done (FROZEN)** |
| 24. Machine Learning Analytics UI | Supervised Models & Regression UI | Frontend Page | **Done (FROZEN)** |
| 25. Association Rules & Clustering UI | Apriori/FP-Growth & K-Means Clusters | Frontend Page | **Done (FROZEN)** |
| 26. Anomaly & Outlier UI | Multi-Method Anomaly Exploration UI | Frontend Page | **Done (FROZEN)** |
| 27. Methodology & Data Explorer | Transparent Academic Data & Limitations | Frontend Page | **Done (FROZEN)** |
| 28. UI Integration & UX Polish | Responsive Design, Navigation & Polish | Full Frontend App | **Done (FROZEN)** |
| 29. Final UI QA & Deployment Readiness | End-to-End Build, Test & Deployment | Production App | *Planned (Not Started)* |

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

## 3. Comprehensive Syllabus Coverage Matrix

The following matrix maps the complete semester Data Mining & Analytics syllabus (Units 1 through 6) to the project stages. All techniques are explicitly categorized as **Completed / Frozen** (Stages 1–9) or **Planned / Not Yet Implemented** (Stages 10–20).

| Unit | Syllabus Concept / Topic | Project Stage Mapping | Implementation Status | Methodological Description |
|---|---|---|---|---|
| **Unit 1** | Data mining concepts & applications | Stages 1–20 | **Core Framework** | Real-world cybercrime analytics for national security context |
| **Unit 1** | Data mining functionalities | Stages 4–18 | **Implemented & Planned** | Characterization, discrimination, association, classification, clustering, outlier analysis |
| **Unit 1** | Issues & challenges in data mining | Stages 1, 19 | **Active Protocol** | Small-N constraints, absence of per-capita data, macro-level transaction limits, leakage audits |
| **Unit 2** | Data summarization & distribution | Stage 10 | **Done (FROZEN)** | Comprehensive descriptive stats, skewness, kurtosis, zero counts, dispersion across 14 features |
| **Unit 2** | Data cleaning & quality checks | Stage 2 + 10 | **Done (FROZEN)** | Header cleanup, missing values, zero-imputation audit, duplicate detection |
| **Unit 2** | Data integration | Stage 2 + 10 | **Done (FROZEN)** | Cross-table joining (categories, motives, women, children), key reconciliation |
| **Unit 2** | Data transformation | Stage 10 | **Done (FROZEN)** | Min-Max scaling, Z-score standardization, Log1p count transformations with skewness reduction |
| **Unit 2** | Data reduction | Stage 10 | **Done (FROZEN)** | Feature selection, variance analysis, PCA dimensionality reduction (>90% variance in 4 PCs) |
| **Unit 2** | Data discretization | Stage 10 | **Done (FROZEN)** | Binning continuous counts/shares (Equal-width, Quantile terciles, Median splits) |
| **Unit 2** | Concept hierarchy generation | Stage 10 | **Done (FROZEN)** | Structural schema hierarchies (India $\rightarrow$ State/UT; Legal Act $\rightarrow$ Category; Motive taxonomy) |
| **Unit 3** | Multidimensional data model | Stage 3 + 11 | **Done (FROZEN)** | Star schema dimensions (`dim_state`, `dim_year`, `dim_crime_category`, `dim_motive`) & cuboid lattice |
| **Unit 3** | Data warehouse architecture | Stage 3 | **Done (FROZEN)** | SQLite 3 relational warehouse (`data/database/cybercrime.db`) with foreign keys |
| **Unit 3** | OLAP operations | Stage 3 + 11 | **Done (FROZEN)** | Roll-Up, Drill-Down, Slice, Dice, Pivot across SQL and Python (`sql/stage11_olap.sql`, `src/advanced_olap.py`) |
| **Unit 3** | Data cube aggregation | Stage 11 | **Done (FROZEN)** | Base and roll-up cuboid materialization, Iceberg cuboid selective pruning ($\ge 1,000$ cases) |
| **Unit 3** | Attribute-oriented induction (AOI) | Stage 11 | **Done (FROZEN)** | Semantic attribute generalization ($1,440 \rightarrow 6$ concept tuples, $99.58\%$ reduction) |
| **Unit 4** | Frequent itemset mining | Stage 5 + 12 | **Done (FROZEN)** | Mining frequent co-occurring profile itemsets (Apriori & FP-Growth) |
| **Unit 4** | Apriori algorithm | Stage 5 | **Done (FROZEN)** | 129 frequent itemsets, 1,924 filtered rules at $\text{supp} \ge 0.25, \text{conf} \ge 0.60$ |
| **Unit 4** | FP-Growth algorithm | Stage 12 | **Done (FROZEN)** | FP-Tree mining, 100% itemset/rule mathematical equivalence & scalability benchmarks |
| **Unit 4** | Association rule evaluation | Stage 5 + 12 | **Done (FROZEN)** | Support, Confidence, Lift, directionality asymmetry & non-causal evaluation |
| **Unit 4** | Correlation analysis | Stage 12 | **Done (FROZEN)** | Pearson linear ($r$) & Spearman monotonic ($\rho$) matrices, part-whole classifications |
| **Unit 5** | Decision Tree classification | Stage 13 | **Done (FROZEN)** | Tree-based classification on leak-free longitudinal panel target (depth=3, Acc=0.9722) |
| **Unit 5** | Bayesian classification | Stage 13 | **Done (FROZEN)** | Gaussian Naive Bayes classifier on lagged volume regime features (Acc=1.000, F1=1.000) |
| **Unit 5** | Support Vector Machines (SVM) | Stage 13 | **Done (FROZEN)** | Linear & RBF kernel Support Vector Classifiers with standard scaling pipelines (Acc=1.000) |
| **Unit 5** | Ensemble classification methods | Stage 13 | **Done (FROZEN)** | Random Forest classifier with constrained depth & Gini feature importance (Acc=1.000) |
| **Unit 5** | Linear & regularized regression | Stage 7 + 14 | **Done (FROZEN)** | OLS, Ridge (L2), Polynomial, Log-Linear panel regression (Validated baseline: $R^2=0.9000$) |
| **Unit 5** | Non-linear regression | Stage 14 | **Done (FROZEN)** | Polynomial features, decision trees, random forests, and gradient boosting on historical lags |
| **Unit 6** | Partitioning clustering (K-Means) | Stage 6 + 15 | **Done (FROZEN)** | Standardized 4-feature composition profiles ($K=4$), Elbow & Silhouette analysis |
| **Unit 6** | Hierarchical clustering | Stage 15 | **Done (FROZEN)** | Agglomerative hierarchical clustering with Ward linkage, multi-K validation ($K \in [2, 8]$) |
| **Unit 6** | Density-based clustering (DBSCAN) | Stage 15 | **Done (FROZEN)** | DBSCAN density exploration across $\varepsilon \in [0.8, 1.5]$ and $\text{min\_samples} \in [2, 3]$ |
| **Unit 6** | Dimensionality reduction / PCA | Stages 6, 10, 15 | **Done (FROZEN)** | 2D PCA cluster projection, scree analysis, variance explanation |
| **Unit 6** | Outlier & anomaly detection | Stage 8 + 16 | **Done (FROZEN)** | Descriptive Tukey IQR fences (14 features) + Multivariate Isolation Forest ($c=0.15$) + Robust Mahalanobis (MinCovDet) + Local Outlier Factor (LOF) |
| **Viz** | Visualization & Dashboards | Stages 4, 9, 17 | **Done (FROZEN)** | 12 EDA figures, 6-Page & 10-Page Power BI semantic packages (28 tables), 25+ DAX measures, interactive layouts |

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
- **Legal Framework Analysis:** IT Act offences account for **51.19%** (44,237 cases across 18 leaf categories), IPC crimes account for **48.43%** (41,849 cases across 17 leaf categories), and SLL crimes account for **0.39%** (334 cases across 5 leaf categories).
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

### Stage 9 — Power BI Dashboard Integration & Semantic Data Package (Done / FROZEN)
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

---

### Stage 10 — Advanced Data Preprocessing (Done / FROZEN)
- **Purpose**: Implements a complete, syllabus-aligned Unit 2 preprocessing suite spanning descriptive summarization, multi-scale transformations, dimensionality reduction (PCA), continuous feature discretization, and multilevel concept hierarchy extraction.
- **Analytical Matrix**: 14 features across 36 States/UTs in 2023 (10 volume count variables, 4 composition share variables) from `outputs/tables/eda_state_feature_matrix.csv`.
- **Part A — Descriptive Summarization & Distributional Profiling**:
  - Computed 15 statistical metrics per feature: count ($N=36$), missing ($0$), mean, standard deviation, min, $Q_1$, median, $Q_3$, max, IQR, skewness, kurtosis, zero-count, zero-percentage, and variable type.
  - Highlighted extreme right-skew in volume counts (`total_cases` skewness = $2.75$, `motive_fraud` skewness = $2.97$) and zero-inflation in sparse offenses (`child_cases_total` zero in 15 jurisdictions, `sec66c_identity_theft` zero in 10 jurisdictions).
- **Part B — Data Transformations & Comparative Impact**:
  - *Log1p Transformation*: Applied $x_{\log} = \ln(1 + x)$ to all 10 non-negative count features. Effectively mitigated extreme right skew without numerical singularities (`total_cases` skewness reduced from $+2.75$ to $-0.65$; `motive_fraud` reduced from $+2.97$ to $-0.08$).
  - *Z-Score Standardization*: $z = (x - \mu) / \sigma$ centering all features to mean $0.0$ and standard deviation $1.0$. Verified mathematically that standardization shifts scale while preserving underlying distributional shape/skewness.
  - *Min-Max Normalization*: $x' = (x - \min) / (\max - \min)$ rescaling values to $[0.0, 1.0]$ bounds.
- **Part C & D — Data Reduction & Principal Component Analysis (PCA)**:
  - Standardized feature set composed of 10 log-transformed count features and 4 raw continuous proportions.
  - *Explained Variance Decomposition*:
    - **PC1 (58.30% of Variance)**: Captures general **Cybercrime Volume & Administrative Scale** (high positive loadings $0.33$ to $0.38$ across all volume measures).
    - **PC2 (17.38% of Variance)**: Captures **Statutory vs Exploitation Divergence** (strong positive loading $+0.49$ on `it_act_share` vs negative loading $-0.48$ on `sexual_exploitation_motive_share`).
    - **PC3 (9.84%)** and **PC4 (5.50%)**: Capture specific motive variations (extortion and IPC proportions).
    - **Cumulative Variance**: First 2 PCs capture **$75.68\%$** of variance; 4 components explain **$91.01\%$** ($>90\%$ threshold).
- **Part E — Data Discretization Schemes**:
  - *Equal-Width (3 Bins)*: Low, Medium, High. Highlighted extreme imbalance vulnerability on right-skewed counts (assigns 33/36 states to Low, 1 to Medium, 2 to High for `total_cases`).
  - *Quantile-Based (3 Terciles)*: T1_Low, T2_Medium, T3_High. Uniformly partitions the 36 jurisdictions into exactly 12 states per tercile.
  - *Median Binary Split*: Below_Median vs Above_Median (18 states each), aligning directly with Stage 5 Apriori transaction items.
- **Part F — Multilevel Concept Hierarchies**:
  - *Geographic Hierarchy*: `National (India)` $\rightarrow$ `Admin Type (28 States / 8 UTs)` $\rightarrow$ `Jurisdiction (36 States/UTs)` $\rightarrow$ `state_id`.
  - *Crime Category Hierarchy*: `All Cybercrimes` $\rightarrow$ `Act Group (IT Act, IPC, SLL, Grand Total)` $\rightarrow$ `Parent Category` $\rightarrow$ `Offense Category (49 rows)`.
  - *Crime Motive Hierarchy*: `All Motives` $\rightarrow$ `Motive Group (6 substantive clusters + Total)` $\rightarrow$ `Specific Motive (19 rows)`.
- **Exported Deliverables**:
  - `outputs/tables/stage10_feature_summary.csv`
  - `outputs/tables/stage10_transformation_comparison.csv`
  - `outputs/tables/stage10_transformed_matrix.csv`
  - `outputs/tables/stage10_pca_explained_variance.csv`
  - `outputs/tables/stage10_pca_loadings.csv`
  - `outputs/tables/stage10_pca_scores.csv`
  - `outputs/tables/stage10_discretization_summary.csv`
  - `outputs/tables/stage10_discretized_features.csv`
  - `outputs/tables/stage10_geographic_hierarchy.csv`
  - `outputs/tables/stage10_crime_category_hierarchy.csv`
  - `outputs/tables/stage10_motive_hierarchy.csv`
  - `outputs/figures/28_transform_skewness_comparison.png`
  - `outputs/figures/29_feature_scaling_comparison.png`
  - `outputs/figures/30_pca_scree_and_cumulative_variance.png`
  - `outputs/figures/31_pca_2d_projection.png`
  - `outputs/figures/32_discretization_distributions.png`
  - `notebooks/08_advanced_preprocessing.ipynb`
- **Methodological Limitations ($N = 36$)**:
  - Sample size is strictly cross-sectional ($N=36$ State/UT aggregates); PCA loadings and principal components represent descriptive directions of sample variance, not causal criminological factors.
  - Discretization boundaries and terciles reflect this specific 2023 distribution.
  - Correlation-based reduction accounts for structural part-whole dependencies (e.g. IT Act + IPC = Total).
- **Reproducibility & Verification**: `src/advanced_preprocessing.py`, `src/generate_stage10_notebook.py`, and `notebooks/08_advanced_preprocessing.ipynb` executed head-to-tail with 0 errors. All 7 test suites in `src/validate_stage10.py` passed with 100% success.

---

### Stage 11 — Advanced OLAP & Data Cube Analysis (Done / FROZEN)
- **Purpose**: Implements a comprehensive, syllabus-aligned Unit 3 multidimensional data cube and OLAP analysis layer extending the foundational warehouse from Stage 3.
- **Dimensional Fact Grain Audit & Cube Architecture**:
  - `fact_cybercrime_category_2023`: 1,764 rows ($36 \text{ States} \times 49 \text{ Categories}$). Filtered on $40$ leaf categories (`is_leaf = 1`) to avoid double-counting subtotals ($1,440$ base tuples, sum = $86,420$ cases).
  - `fact_cybercrime_motive_2023`: 684 rows ($36 \text{ States} \times 19 \text{ Motives}$). Filtered on $18$ specific motives (`is_total = 0`), sum = $86,420$ motives.
  - `fact_cybercrime_trend`: 180 rows ($36 \text{ States} \times 5 \text{ Years (2018–2022)}$).
  - **Explicit Fact Separation**: Maintained separate compatible cubes ($\text{Cube}_{\text{Category}}$, $\text{Cube}_{\text{Motive}}$, $\text{Cube}_{\text{Trend}}$) because category and motive dimensions are not cross-tabulated at the micro-incident level by NCRB.
- **Base & Pre-Materialized Cuboid Layer**:
  - *Base Cuboid ($\text{State} \times \text{Leaf Category}$)*: 1,440 tuples across 36 jurisdictions and 40 leaf offenses ($86,420$ cases).
  - *Roll-Up Cuboid ($\text{State} \times \text{Act Group}$)*: 108 tuples across 36 jurisdictions and 3 legal act groups.
  - *National Cuboid ($\text{National} \times \text{Leaf Category}$)*: 40 tuples showing nationwide totals and shares.
  - *National Act Group Cuboid ($\text{National} \times \text{Act Group}$)*:
    - **IT Act**: $44,237$ cases ($51.19\%$, 18 leaf categories)
    - **IPC Crimes r/w IT Act**: $41,849$ cases ($48.43\%$, 17 leaf categories)
    - **SLL Crimes r/w IT Act**: $334$ cases ($0.39\%$, 5 leaf categories)
    - **Grand Total**: $86,420$ cases ($100.0\%$)
  - *Administrative Roll-Up Cuboid ($\text{Admin Type} \times \text{Act Group}$)*:
    - **State (28)**: $85,603$ cases ($99.05\%$)
    - **Union Territory (8)**: $817$ cases ($0.95\%$)
- **Core OLAP Operations Suite**:
  - **Roll-Up**: Traversal from 40 leaf categories $\rightarrow$ 3 Act Groups $\rightarrow$ National Total ($86,420$ cases).
  - **Drill-Down**: Decomposed national top offense (Section 66D Personation: $24,028$ cases) down to state-level distributions (Telangana: $8,367$; Karnataka: $6,438$; Maharashtra: $1,940$; UP: $1,542$).
  - **Slice**: Single-dimensional filtering on `Act Group = 'IT Act'` ($44,237$ cases) and `is_ut = 1` ($817$ cases).
  - **Dice**: Multi-dimensional sub-cube extraction spanning $\{\text{Top 5 Volume States}\} \times \{\text{IT Act}, \text{IPC}\}$, isolating 10 distinct sub-cube cells.
  - **Pivot**: Cross-tabulation matrix of 36 States/UTs $\times$ 3 Act Groups with complete row-wise and column-wise reconciliation.
- **Attribute-Oriented Induction (AOI)**:
  - Compressed the 1,440 base tuples into **6 generalized concept tuples** ($2 \text{ Admin Types} \times 3 \text{ Act Groups}$) via concept hierarchies, achieving a **$99.58\%$ reduction in tuple cardinality**.
  - Contrasted OLAP (multidimensional navigation) with AOI (semantic rule and concept induction).
- **Efficient Cube Computation & Iceberg Cuboids**:
  - Demonstrated selective cuboid materialization by applying an analytical threshold $\text{cases} \ge 1,000$ to the base State $\times$ Category table.
  - **Iceberg Pruning Efficiency**: Retaining only **16 tuples ($1.11\%$ of the base cuboid)** captures **$54,848$ cases ($63.47\%$ of national cybercrime volume)**.
- **Exported Deliverables**:
  - `sql/stage11_olap.sql` (Comprehensive SQL queries)
  - `src/advanced_olap.py` (Reusable Python OLAP module)
  - `outputs/tables/stage11_cube_state_category.csv`
  - `outputs/tables/stage11_cube_state_act_group.csv`
  - `outputs/tables/stage11_cube_national_category.csv`
  - `outputs/tables/stage11_cube_national_act_group.csv`
  - `outputs/tables/stage11_cube_admin_act_group.csv`
  - `outputs/tables/stage11_pivot_state_act_group.csv`
  - `outputs/tables/stage11_aoi_generalized_relation.csv`
  - `outputs/tables/stage11_iceberg_state_category.csv`
  - `outputs/tables/stage11_cube_motive_summary.csv`
  - `outputs/figures/33_olap_concept_lattice_hierarchy.png`
  - `outputs/figures/34_state_act_group_heatmap.png`
  - `outputs/figures/35_cube_rollup_act_group_breakdown.png`
  - `notebooks/09_advanced_olap_cube.ipynb`
- **Methodological Limitations**:
  - Observational unit is aggregate State/UT reporting volumes, not individual incident micro-logs.
  - Cube aggregations and roll-ups are descriptive; they do not establish causation or socio-economic risk factors.
- **Reproducibility & Verification**: `src/advanced_olap.py`, `src/generate_stage11_notebook.py`, and `notebooks/09_advanced_olap_cube.ipynb` executed head-to-tail with 0 errors. All 8 test suites in `src/validate_stage11.py` passed with 100% success.

---

### Stage 12 — Advanced Frequent Pattern Mining & Correlation Analysis (Done / FROZEN)
- **Purpose**: Implements a rigorous, syllabus-aligned Unit 4 frequent pattern mining and bivariate correlation analysis suite extending Stage 5.
- **Transaction Representation ($N = 36$)**: Reuses the validated Stage 5 State-Level binary transaction matrix (36 State/UT observations, 8 median-thresholded items).
- **FP-Growth Algorithm & Mathematical Equivalence**:
  - Implemented FP-Growth mining using an FP-Tree (Frequent Pattern Tree) structure, extracting patterns without candidate generation ($s_{\min} = 0.25, c_{\min} = 0.60, \text{lift} > 1.0$).
  - **100% Set Equivalence with Apriori**: Both algorithms discovered the **exact same 129 frequent itemsets** and the **exact same 1,924 filtered association rules** (including 42 1-to-1 pair rules).
  - Key Rules Re-Verified:
    - `HIGH_FRAUD_MOTIVE -> HIGH_SEC66D_CHEATING`: Support = $41.67\%$, Confidence = $83.33\%$, Lift = $1.67$.
    - `HIGH_IDENTITY_THEFT -> HIGH_FRAUD_MOTIVE`: Support = $44.44\%$, Confidence = $84.21\%$, Lift = $1.68$.
    - `HIGH_WOMEN_CYBERCRIME -> HIGH_SEXUAL_EXPLOITATION_MOTIVE`: Support = $44.44\%$, Confidence = $88.89\%$, Lift = $1.78$.
- **Runtime Benchmarking & Scalability Analysis**:
  - *Actual Dataset ($N = 36$)*: Execution runtimes for both algorithms are on the millisecond scale ($\approx 1.0\text{–}3.0\text{ ms}$), reflecting small-$N$ transaction size.
  - *Controlled Synthetic Scalability ($N = 36$ to $36,000$)*: Multiplied transactions to benchmark scaling curves; verified that FP-Growth avoids candidate generation explosion and scales linearly with transaction count.
- **Bivariate Correlation Analysis (Pearson $r$ vs. Spearman $\rho$)**:
  - Evaluated 66 unique bivariate pairs across 12 analytical dimensions.
  - *Part-Whole Structural Collinearity Warnings (Category A)*:
    - `total_cases` vs `it_act_cases`: $r = 0.9631, \rho = 0.9669$.
    - `total_cases` vs `ipc_cases`: $r = 0.9416, \rho = 0.9168$.
    - `it_act_cases` vs `sec66d_cheating_personation`: $r = 0.9666, \rho = 0.8872$.
    - *Methodological Warning*: These correlations arise mathematically from part-whole subtotal definitions, **not empirical behavioral causation**.
  - *Scale-Driven Volume Associations (Category B)*: Separate offense categories exhibit high positive linear correlation ($r \approx 0.65\text{–}0.85$) due to shared administrative/population scale.
  - *Compositional / Share Relationships (Category C)*: Scale-invariant proportions show moderate, meaningful correlation (e.g. `it_act_share` vs `fraud_motive_share`: $r = 0.5235, \rho = 0.5097$).
  - *Discrepancy Diagnostics*: Discrepancies ($|r - \rho| \ge 0.15$) pinpoint pairs sensitive to heavy volume outliers (e.g. Karnataka, Telangana).
- **Association vs. Correlation Distinction**:
  - *Association Rules*: Discrete, asymmetric conditional probabilities ($P(B|A)$) describing co-occurrence of high-level state profile items.
  - *Correlation Analysis*: Continuous, symmetric covariance ($r \in [-1, 1]$) across full numerical distributions.
- **Exported Deliverables**:
  - `sql/stage12_association_correlation.sql`
  - `src/advanced_association.py`
  - `outputs/tables/stage12_fpgrowth_itemsets.csv`
  - `outputs/tables/stage12_fpgrowth_rules.csv`
  - `outputs/tables/stage12_fpgrowth_pair_rules.csv`
  - `outputs/tables/stage12_algorithm_comparison.csv`
  - `outputs/tables/stage12_algorithm_benchmark.csv`
  - `outputs/tables/stage12_synthetic_scalability_benchmark.csv`
  - `outputs/tables/stage12_pearson_correlation.csv`
  - `outputs/tables/stage12_spearman_correlation.csv`
  - `outputs/tables/stage12_correlation_comparison.csv`
  - `outputs/figures/36_fpgrowth_vs_apriori_benchmark.png`
  - `outputs/figures/37_pearson_correlation_heatmap.png`
  - `outputs/figures/38_spearman_correlation_heatmap.png`
  - `outputs/figures/39_pearson_vs_spearman_discrepancy.png`
  - `notebooks/10_advanced_frequent_patterns.ipynb`
- **Methodological Limitations**:
  - Transactions represent $N=36$ macro-level State/UT jurisdictions, not individual criminal incidents.
  - Association rules and correlation metrics are strictly descriptive cross-sectional summaries; neither proves causation.
- **Reproducibility & Verification**: `src/advanced_association.py`, `src/generate_stage12_notebook.py`, and `notebooks/10_advanced_frequent_patterns.ipynb` executed head-to-tail with 0 errors. All 8 test suites in `src/validate_stage12.py` passed with 100% success.

---

### Stage 13 — Classification Analysis (Done / FROZEN)
- **Purpose**: Implement a rigorous, leak-free supervised classification workflow for Unit 5 to classify whether a State/UT belongs to a high-volume cybercrime regime in the following year.
- **Analytical Problem Formulation**:
  - Longitudinal panel dataset: 2018–2022 Rajya Sabha State/UT series ($N = 106$ observations).
  - **Target Definition**: Next-year high-volume regime indicator:
    $$\text{HIGH\_NEXT\_YEAR} = \begin{cases} 1 & \text{if } y_t \ge 367.0 \text{ cases} \\ 0 & \text{if } y_t < 367.0 \text{ cases} \end{cases}$$
  - **Threshold Derivation**: Derived strictly from the **training partition median** ($\text{Median}(Y_{\text{train}}) = 367.0$ cases across 70 observations in target years 2020 and 2021). Zero held-out test data used to define or tune the target boundary.
  - **Partition Class Balance**:
    - *Training Partition (2020–2021, $N_{\text{train}} = 70$)*: Exactly 35 Low (50.0%) and 35 High (50.0%) observations.
    - *Held-Out Test Partition (2022, $N_{\text{test}} = 36$)*: 16 Low (44.4%) and 20 High (55.6%) observations.
- **Feature Matrix (Historical Lag Features Only)**:
  - $\text{Lag}_1$ volume ($y_{t-1}$), $\text{Lag}_2$ volume ($y_{t-2}$), 1-year volume change ($\text{lag\_diff} = y_{t-1} - y_{t-2}$), YoY growth rate ($\text{lag\_growth\_rate}$), $\log(1+\text{lag}_1)$, $\log(1+\text{lag}_2)$.
  - **Zero Leakage**: No contemporaneous category/motive features, no 2023 sectional attributes, and no future target information.
  - **StandardScaler Pipelines**: All feature scaling fitted strictly on training observations within scikit-learn Pipelines.
- **Formal Leakage Audit**: All 7 checks PASSED (`stage13_leakage_audit.csv`): Target Leakage Prevention, Temporal Horizon Independence, 2023 Feature Exclusion, Threshold Training Exclusivity, Chronological Split Integrity, Observation Tuple Uniqueness, and Longitudinal Panel Structure.
- **Evaluated Supervised Classifiers (Held-Out 2022 Test Horizon, $N=36$)**:
  1. *Baseline (Most Frequent Class)*: Accuracy = $44.44\%$, Balanced Acc = $50.00\%$, Precision = $0.00\%$, Recall = $0.00\%$, Specificity = $100.0\%$, F1-Score = $0.0000$, ROC-AUC = $0.5000$.
  2. *Decision Tree (depth=3)*: Accuracy = $97.22\%$, Balanced Acc = $97.50\%$, Precision = $100.0\%$, Recall = $95.00\%$, Specificity = $100.0\%$, F1-Score = $0.9744$, ROC-AUC = $0.9750$ (1 false negative: 16 TN, 0 FP, 1 FN, 19 TP).
  3. *Gaussian Naive Bayes*: Accuracy = $100.0\%$, Balanced Acc = $100.0\%$, Precision = $100.0\%$, Recall = $100.0\%$, Specificity = $100.0\%$, F1-Score = $1.0000$, ROC-AUC = $1.0000$ (16 TN, 0 FP, 0 FN, 20 TP).
  4. *Linear SVM (StandardScaler Pipeline)*: Accuracy = $100.0\%$, Balanced Acc = $100.0\%$, Precision = $100.0\%$, Recall = $100.0\%$, Specificity = $100.0\%$, F1-Score = $1.0000$, ROC-AUC = $1.0000$ (16 TN, 0 FP, 0 FN, 20 TP).
  5. *RBF SVM (StandardScaler Pipeline)*: Accuracy = $100.0\%$, Balanced Acc = $100.0\%$, Precision = $100.0\%$, Recall = $100.0\%$, Specificity = $100.0\%$, F1-Score = $1.0000$, ROC-AUC = $1.0000$ (16 TN, 0 FP, 0 FN, 20 TP).
  6. *Random Forest (100 Trees, max_depth=3)*: Accuracy = $100.0\%$, Balanced Acc = $100.0\%$, Precision = $100.0\%$, Recall = $100.0\%$, Specificity = $100.0\%$, F1-Score = $1.0000$, ROC-AUC = $1.0000$ (16 TN, 0 FP, 0 FN, 20 TP).
- **Feature Importance & Non-Causal Interpretation**:
  - Decision Tree: $\log(1+\text{lag}_1)$ accounts for $94.44\%$ Gini importance; $\log(1+\text{lag}_2)$ accounts for $5.56\%$.
  - Random Forest: $\log(1+\text{lag}_1)$ ($27.14\%$), $\log(1+\text{lag}_2)$ ($25.42\%$), $\text{lag}_2$ ($23.72\%$), $\text{lag}_1$ ($21.26\%$).
  - *Methodological Warning*: Near-perfect regime classification reflects **strong temporal scale persistence** across Indian jurisdictions rather than causal determinants.
- **Comparison with Stage 7 Regression**:
  - Stage 7: Predicts continuous volume ($\hat{Y}_t \in \mathbb{R}^+$, Log-Linear $R^2 = 0.9000$, $\text{MAE} = 479.4$).
  - Stage 13: Predicts discrete regime boundary ($Y_t \in \{0, 1\}$, Accuracy = $1.000$, F1 = $1.0000$).
- **Exported Deliverables**:
  - `src/classification.py`
  - `src/generate_stage13_notebook.py`
  - `src/validate_stage13.py`
  - `notebooks/11_classification.ipynb`
  - `outputs/tables/stage13_classification_dataset.csv`
  - `outputs/tables/stage13_class_distribution.csv`
  - `outputs/tables/stage13_model_comparison.csv`
  - `outputs/tables/stage13_confusion_matrices.csv`
  - `outputs/tables/stage13_feature_importance.csv`
  - `outputs/tables/stage13_leakage_audit.csv`
  - `outputs/figures/40_classification_class_distributions.png`
  - `outputs/figures/41_classification_model_performance_comparison.png`
  - `outputs/figures/42_classification_confusion_matrices.png`
  - `outputs/figures/43_classification_roc_curves.png`
  - `outputs/figures/44_classification_decision_tree_and_feature_importance.png`
- **Methodological Limitations**:
  - Test sample is bounded to $N = 36$ State/UT jurisdictions.
  - Classification models historical volume scale and momentum; does not capture socio-economic causation, dark figures of unrecorded crime, or law enforcement staffing changes.
- **Reproducibility & Verification**: `src/classification.py`, `src/generate_stage13_notebook.py`, and `notebooks/11_classification.ipynb` executed head-to-tail with 0 errors. All 8 test suites in `src/validate_stage13.py` passed with 100% success.

---

### Stage 14 — Regression & Prediction Enhancement (Done / FROZEN)
- **Purpose**: Deepen Unit 5 predictive modeling by evaluating non-linear polynomial expansions, decision trees, random forests, and gradient boosting against the validated Stage 7 baseline under strict zero-leakage chronological forecasting.
- **Analytical Problem Formulation**:
  - Target: Aggregate State/UT cybercrime volume in year $t$ ($N=106$ observations).
  - Chronological Partition: Train on 2020–2021 target years ($N_{\text{train}} = 70$), test on held-out 2022 ($N_{\text{test}} = 36$).
  - Predictors: Historical lagged features strictly preceding the target year (`lag_1`, `lag_2`, `lag_diff`, `lag_growth_rate`, `log_lag_1`, `log_lag_2`). Zero 2023 sectional attributes.
  - Evaluation Horizon: The 2022 test partition ($N=36$) serves strictly as the **final held-out evaluation horizon**. Post-hoc comparison evaluates out-of-sample behavior without test-set tuning or model-selection leakage.
- **Evaluated Regression Architectures & Leaderboard (Held-Out 2022 Test Horizon)**:
  1. *Log-Linear OLS (Stage 7 Validated Benchmark)*: **$\text{MAE} = 479.37$ cases**, **$\text{RMSE} = 1,143.46$**, **$R^2 = 0.9000$**, $\text{Median AE} = 69.85$ (Residual Skewness = $0.6472$).
  2. *Historical 2-Year Moving Average*: $\text{MAE} = 563.04$ cases, $\text{RMSE} = 1,523.73$, $R^2 = 0.8224$, $\text{Median AE} = 57.00$.
  3. *Naive Persistent Lag-1*: $\text{MAE} = 564.75$ cases, $\text{RMSE} = 1,340.75$, $R^2 = 0.8625$, $\text{Median AE} = 61.50$.
  4. *Random Forest Regressor (Raw Target, depth=3)*: $\text{MAE} = 593.18$ cases, $\text{RMSE} = 1,565.92$, $R^2 = 0.8124$, $\text{Median AE} = 89.53$.
  5. *Decision Tree Regressor (depth=3)*: $\text{MAE} = 608.42$ cases, $\text{RMSE} = 1,571.47$, $R^2 = 0.8111$, $\text{Median AE} = 100.86$.
  6. *Log-Polynomial Degree 2 (Ridge, $\alpha=1.0$)*: $\text{MAE} = 621.24$ cases, $\text{RMSE} = 1,465.82$, $R^2 = 0.8356$, $\text{Median AE} = 48.02$.
  7. *Log-Polynomial Degree 2 (OLS)*: $\text{MAE} = 643.44$ cases, $\text{RMSE} = 1,520.52$, $R^2 = 0.8231$, $\text{Median AE} = 47.42$.
  8. *Random Forest Regressor (Log Target)*: $\text{MAE} = 663.24$ cases, $\text{RMSE} = 1,679.41$, $R^2 = 0.7842$, $\text{Median AE} = 108.31$.
  9. *Gradient Boosting Regressor (Raw, depth=2)*: $\text{MAE} = 728.33$ cases, $\text{RMSE} = 1,732.42$, $R^2 = 0.7704$, $\text{Median AE} = 197.17$.
  10. *Linear Regression (OLS Raw)*: $\text{MAE} = 776.08$ cases, $\text{RMSE} = 1,680.13$, $R^2 = 0.7840$, $\text{Median AE} = 205.07$.
  11. *Ridge Regression (Raw, $\alpha=1.0$)*: $\text{MAE} = 776.08$ cases, $\text{RMSE} = 1,680.13$, $R^2 = 0.7840$, $\text{Median AE} = 205.07$.
  12. *Polynomial Degree 2 (Ridge, $\alpha=100.0$)*: $\text{MAE} = 778.94$ cases, $\text{RMSE} = 1,802.94$, $R^2 = 0.7513$, $\text{Median AE} = 92.06$.
  13. *Polynomial Degree 2 (OLS Raw)*: $\text{MAE} = 778.96$ cases, $\text{RMSE} = 1,802.97$, $R^2 = 0.7513$, $\text{Median AE} = 92.08$.
  14. *Gradient Boosting Regressor (Log Target, depth=2)*: $\text{MAE} = 870.96$ cases, $\text{RMSE} = 2,230.54$, $R^2 = 0.6194$, $\text{Median AE} = 105.32$.
- **Complexity vs. Performance Analysis (Occam's Razor)**:
  - *Core Finding*: **On the held-out 2022 evaluation horizon, the tested polynomial and tree-based nonlinear models did not outperform the simpler Log-Linear OLS benchmark. This suggests that additional nonlinear complexity did not provide an observed predictive advantage under the available historical data.**
  - *Scale Dynamics*: The logarithmic transformation $\log(1+y)$ compresses the multi-order numerical scale without adding free parameters. On $N_{\text{train}} = 70$, polynomial cross-terms increase estimation variance on held-out years, while tree step-functions cannot extrapolate continuous growth smoothly.
  - *Residual Diagnostics*: The Log-Linear model produced lower residual dispersion ($\text{Std} = 1,136.75$) and lower residual skewness ($0.6472$) than the tested nonlinear alternatives. Residual variability remains influenced by high-volume jurisdictions.
- **State-Level Test Error Findings ($N_{\text{test}} = 36$)**:
  - *Telangana*: The 2022 observed value ($15,297$) was substantially higher than the preceding-year value ($10,303$), resulting in an underprediction of $4,684.81$ cases.
  - *Assam*: The 2022 observed value ($1,733$) was substantially lower than the preceding-year value ($4,846$), resulting in an overprediction of $3,997.48$ cases.
  - *Uttar Pradesh*: The 2022 observed value ($10,117$) was higher than the preceding-year value ($8,829$), resulting in an underprediction of $2,355.17$ cases.
  - Median absolute error across all 36 jurisdictions is $69.85$ cases.
- **Comparison with Stage 13 Classification**:
  - Stage 13 classifies macro categorical regime ($Y_t \in \{0, 1\}$; Accuracy = $100\%$).
  - Stage 14 estimates continuous volume magnitude ($\hat{Y}_t \in \mathbb{R}^+$; Log-Linear $R^2 = 0.9000$). Potential use: estimating future aggregate volume for exploratory planning and analytical comparison.
- **Exported Deliverables**:
  - `src/regression_enhancement.py`
  - `src/generate_stage14_notebook.py`
  - `src/validate_stage14.py`
  - `notebooks/12_regression_enhancement.ipynb`
  - `outputs/tables/stage14_model_comparison.csv`
  - `outputs/tables/stage14_test_predictions.csv`
  - `outputs/tables/stage14_error_analysis.csv`
  - `outputs/tables/stage14_residual_summary.csv`
  - `outputs/tables/stage14_model_selection.csv`
  - `outputs/figures/45_regression_model_performance_comparison.png`
  - `outputs/figures/46_regression_actual_vs_predicted_comparison.png`
  - `outputs/figures/47_regression_residual_diagnostics.png`
  - `outputs/figures/48_regression_state_error_breakdown.png`
  - `outputs/figures/49_regression_complexity_vs_performance.png`
- **Methodological Limitations**:
  - Limited historical horizon: only 5 annual points (2018–2022, $N=106$ panel observations).
  - Small evaluation sample: single held-out test year with $N = 36$ jurisdictions.
  - Jurisdictions recur as repeated longitudinal panel units across years.
  - Aggregate case totals do not capture incident-level behavior.
  - Models capture temporal volume persistence rather than causal determinants.
  - Performance on the 2022 horizon may not generalize to future years.
- **Reproducibility & Verification**: `src/regression_enhancement.py`, `src/generate_stage14_notebook.py`, and `notebooks/12_regression_enhancement.ipynb` executed head-to-tail with 0 errors. All 6 test suites in `src/validate_stage14.py` passed with 100% success.

---

### Stage 15 — Advanced Clustering & Cluster Validation (Done / FROZEN)
- **Methodological Purpose**: Assess the robustness and interpretability of State/UT cybercrime profile clusters across alternative clustering paradigms (Hierarchical Agglomerative Clustering with Ward linkage, Gaussian Mixture Models with AIC/BIC, and exploratory DBSCAN) using multi-criteria validation measures.
- **Strict Methodological Guardrails**:
  - Purely descriptive compositional analysis (proportions: `it_act_share`, `fraud_motive_share`, `extortion_motive_share`, `sexual_exploitation_motive_share`).
  - Total case volume strictly excluded from distance/mixture space; examined only post-hoc.
  - Non-normative profile labels (e.g. Higher IT Act / Higher Fraud Share Profile), strictly avoiding moral, danger, or policing prioritization language.
- **Frozen Stage 6 Reference Baseline ($K=4$ K-Means Reproduction)**:
  - $N=36$ State/UT observations, `StandardScaler` normalization, `random_state=42`, `n_init=10`.
  - Stage 15 reproduces the frozen Stage 6 K=4 partition exactly up to arbitrary cluster-label permutation ($\text{ARI} = 1.000$, $\text{NMI} = 1.000$), preserving the identical cluster size multiset $[2, 7, 12, 15]$ (Cluster 0: 15 states, Cluster 1: 12 states, Cluster 2: 2 states, Cluster 3: 7 states).
  - Reference Silhouette = $0.3497$, Calinski-Harabasz = $20.25$, Davies-Bouldin = $0.8849$.
- **Evaluated Algorithms & Validation Metrics ($K \in [2, 8]$)**:
  - *K-Means (Reference)*: Silhouette: K=2 (0.2557), K=3 (0.2635), K=4 (0.3497), K=5 (0.3632), K=6 (0.3449), K=7 (0.3688), K=8 (0.3771).
  - *Agglomerative (Ward Linkage)*: Silhouette: K=2 (0.2662), K=3 (0.2929), K=4 (0.2905), K=5 (0.3082), K=6 (0.3242), K=7 (0.3341), K=8 (0.3421).
  - *Gaussian Mixture (GMM)*: Silhouette: K=2 (0.2195), K=3 (0.2929), K=4 (0.3391), K=5 (0.3541), K=6 (0.3255), K=7 (0.3384), K=8 (0.3308). AIC/BIC optimal at K=2 (AIC=281.82, BIC=335.66), with K=4 (AIC=304.06, BIC=397.49).
  - *DBSCAN*: Evaluated across $\varepsilon \in [0.8, 1.5]$ and $\text{min\_samples} \in [2, 3]$. DBSCAN did not yield a comparably useful partition under the tested parameter ranges, producing substantial noise (5 to 29 noise observations) or very small numbers of clusters for this dataset ($N=36$, four standardized composition features).
  - *Reference K=4 Justification*: $K=4$ is retained as the reference solution because it provides a relatively strong and interpretable partition, preserves continuity with the frozen Stage 6 baseline, and avoids excessive fragmentation into very small clusters (as observed at $K=7$ and $K=8$ where multiple clusters contain only 1 or 2 jurisdictions).
- **Partition Agreement at Preferred $K=4$**:
  - *K-Means vs. GMM*: $\text{ARI} = 0.5884$, $\text{NMI} = 0.6739$ (Substantial partition alignment).
  - *K-Means vs. Agglomerative (Ward)*: $\text{ARI} = 0.3691$, $\text{NMI} = 0.5444$ (Moderate-to-strong partition overlap).
  - *Agglomerative vs. GMM*: $\text{ARI} = 0.2271$, $\text{NMI} = 0.4624$.
- **Jurisdiction-Level Stability ($N=36$)**:
  - *Highly Stable (3/3 methods agree)*: 22 States/UTs ($61.1\%$) (e.g. Arunachal Pradesh, Assam, Goa, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, MP, Mizoram, Nagaland, Rajasthan, Sikkim, UP, Uttarakhand, West Bengal, Chandigarh, Dadra & Nagar Haveli, Delhi, Ladakh, Lakshadweep, Puducherry).
  - *Moderately Stable (2/3 methods agree)*: 14 States/UTs ($38.9\%$) (e.g. Andhra Pradesh, Bihar, Chhattisgarh, Gujarat, Maharashtra, Manipur, Meghalaya, Odisha, Punjab, Tamil Nadu, Telangana, Tripura, Andaman & Nicobar, Jammu & Kashmir).
  - *Boundary Cases (0/3 agreement)*: 0 States/UTs ($0.0\%$).
- **Tiny-Denominator Sensitivity Analysis ($N=36$ vs. $N=34$)**:
  - Dadra & Nagar Haveli ($N=6$ cases) and Lakshadweep ($N=1$ case) form Cluster 2 in Stage 6 with extreme sexual-exploitation motive shares ($83.3\%$ and $100.0\%$).
  - Sensitivity analysis excluding jurisdictions with $\le 10$ total cases ($N=34$):
    - At $K=3$ on $N=34$: KMeans Silhouette = $0.2828$, Agglomerative Silhouette = $0.2690$, GMM Silhouette = $0.2676$.
    - KMeans vs. Agglomerative agreement increases to $\text{ARI} = 0.5761$.
    - Confirms a three-profile crime-composition structure within the reduced sensitivity sample, while Cluster 2 on full $N=36$ is an artifact of tiny-denominator percentages. The primary analysis strictly retains all $N=36$.
- **Exported Deliverables**:
  - `src/advanced_clustering.py`
  - `src/generate_stage15_notebook.py`
  - `src/validate_stage15.py`
  - `notebooks/13_advanced_clustering.ipynb`
  - `outputs/tables/stage15_cluster_validation.csv`
  - `outputs/tables/stage15_algorithm_comparison.csv`
  - `outputs/tables/stage15_cluster_assignments.csv`
  - `outputs/tables/stage15_cluster_profiles.csv`
  - `outputs/tables/stage15_cluster_agreement.csv`
  - `outputs/tables/stage15_cluster_stability.csv`
  - `outputs/tables/stage15_tiny_denominator_sensitivity.csv`
  - `outputs/figures/50_cluster_validation_comparison_across_k.png`
  - `outputs/figures/51_algorithm_comparison_preferred_k.png`
  - `outputs/figures/52_pca_cluster_visualization.png`
  - `outputs/figures/53_cluster_profile_comparison.png`
  - `outputs/figures/54_stage6_vs_alternative_clustering_agreement.png`
  - `outputs/figures/55_tiny_denominator_sensitivity_analysis.png`
- **Methodological Limitations**:
  - Small sample size ($N=36$ State/UT jurisdictions).
  - Cross-sectional 2023 snapshot; does not model longitudinal cluster migration.
  - Proportions can be sensitive to small denominators.
  - Internal cluster validation metrics evaluate geometric separation, not real-world validity.
- **Reproducibility & Verification**: `src/advanced_clustering.py`, `src/generate_stage15_notebook.py`, and `notebooks/13_advanced_clustering.ipynb` executed head-to-tail with 0 errors. All 7 test suites in `src/validate_stage15.py` passed with 100% success. Frozen stages 5–14 regression test passed completely.

---

### Stage 16 — Advanced Outlier Detection & Anomaly Validation (Done / FROZEN)
- **Methodological Purpose**: Extend the descriptive outlier analysis from Stage 8 into a rigorous multivariate anomaly detection and validation study across 36 State/UT jurisdictions using multiple statistical and machine learning perspectives.
- **Strict Methodological Guardrails**:
  - Outliers reflect statistical extremity under defined mathematical metrics, NOT criminality, risk scoring, data errors, or policing effectiveness.
  - Non-causal framework: distance departures describe multi-dimensional location, not crime causes or policy outcomes.
  - Dual feature spaces: strictly separates volume-scale extremity (14-feature space) from compositional profile extremity (4-feature space).
- **Methods Evaluated**:
  1. *Robust Multivariate Mahalanobis Distance*: `MinCovDet` estimator with Chi-Square reference cutoff ($\chi^2_{14, 0.975} = 26.12$). The $\chi^2$ cutoff is used as a reference threshold for screening robust Mahalanobis distances in the small-sample multivariate setting; the associated p-values should not be interpreted as exact finite-sample inferential significance levels. Flagged 8 jurisdictions (Karnataka, Dadra & Nagar Haveli, Uttar Pradesh, Lakshadweep, Jharkhand, Kerala, Ladakh, Odisha).
  2. *Local Outlier Factor (LOF)*: Density-based local anomalies centered at $k=10$ with sensitivity across $k=5, 10, 15$. Flagged 4 jurisdictions at $k=10, c=0.15$ (Karnataka, Dadra & Nagar Haveli, Lakshadweep, Telangana).
  3. *Isolation Forest (Stage 8 Baseline Reference)*: $c=0.15, \text{random\_state}=42$. Flagged 6 jurisdictions (Karnataka, Telangana, Uttar Pradesh, Dadra & Nagar Haveli, Lakshadweep, Ladakh).
  4. *Tukey IQR Fences (Stage 8 Baseline Reference)*: Flagged 18 jurisdictions across 52 individual fence violations.
- **Method Agreement & Consensus Anomaly Scoring ($0 \text{ to } 4$)**:
  - *Consensus Anomalies (4/4 Methods Agree)*: 3 States/UTs ($8.3\%$) — Karnataka, Dadra & Nagar Haveli, Lakshadweep.
  - *Strong Multi-Method Anomalies (3/4 Methods Agree)*: 3 States/UTs ($8.3\%$) — Uttar Pradesh, Jharkhand, Ladakh.
  - *Multi-Method Anomalies (2/4 Methods Agree)*: 3 States/UTs ($8.3\%$) — Kerala, Odisha, Telangana.
  - *Single-Method Anomalies (1/4 Methods Agree)*: 12 States/UTs ($33.3\%$) — Andaman & Nicobar, Andhra Pradesh, Arunachal Pradesh, Assam, Bihar, Goa, Gujarat, Haryana, Maharashtra, Nagaland, Puducherry, Sikkim.
  - *No Methods Flag (0/4 Methods Agree)*: 15 States/UTs ($41.7\%$) — Chandigarh, Chhattisgarh, Delhi, Himachal Pradesh, Jammu & Kashmir, Madhya Pradesh, Manipur, Meghalaya, Mizoram, Punjab, Rajasthan, Tamil Nadu, Tripura, Uttarakhand, West Bengal.
- **Dual-Space Volume vs. Composition Separation**:
  - *Volume-Scale Driven Only*: 5 jurisdictions (Maharashtra, Telangana, Andhra Pradesh, Bihar, Haryana).
  - *Composition-Profile Driven Only*: 8 jurisdictions (Andaman & Nicobar, Arunachal Pradesh, Goa, Gujarat, Nagaland, Puducherry, Sikkim, Ladakh).
  - *Both Volume & Composition Anomalous*: 6 jurisdictions (Karnataka, Uttar Pradesh, Jharkhand, Kerala, Odisha, Dadra & Nagar Haveli).
  - *Not Anomalous in Tested Spaces*: 17 jurisdictions.
- **Small-Denominator Sensitivity Analysis ($N=36$ vs. $N=34$)**:
  - The sensitivity analysis shows that the identified substantive state-level multivariate departures remain stable after excluding the two tiny-denominator jurisdictions ($N \le 6$ cases: Dadra & Nagar Haveli and Lakshadweep; Isolation Forest Jaccard overlap = $0.8000$, Robust Mahalanobis Jaccard overlap = $0.8750$), indicating that these findings are not driven solely by those small-denominator observations.
  - The primary analytical dataset strictly retains all $N=36$ jurisdictions.
- **Exported Deliverables**:
  - `src/advanced_outlier_detection.py`
  - `src/generate_stage16_notebook.py`
  - `src/validate_stage16.py`
  - `notebooks/14_advanced_outlier_detection.ipynb`
  - `outputs/tables/stage16_feature_redundancy.csv`
  - `outputs/tables/stage16_mahalanobis_scores.csv`
  - `outputs/tables/stage16_lof_scores.csv`
  - `outputs/tables/stage16_method_comparison.csv`
  - `outputs/tables/stage16_consensus_anomalies.csv`
  - `outputs/tables/stage16_volume_vs_composition.csv`
  - `outputs/tables/stage16_sensitivity.csv`
  - `outputs/figures/56_feature_redundancy_correlation_heatmap.png`
  - `outputs/figures/57_robust_mahalanobis_distances.png`
  - `outputs/figures/58_lof_anomaly_scores.png`
  - `outputs/figures/59_anomaly_method_agreement_consensus.png`
  - `outputs/figures/60_volume_vs_composition_anomalies.png`
  - `outputs/figures/61_pca_anomaly_visualization.png`
- **Methodological Limitations**:
  - Small sample size ($N=36$ State/UT jurisdictions).
  - Several features are mathematically related to total volume (part-whole redundancy).
  - Statistical anomalies evaluate distance from distribution medians, not real-world ground truth.
  - Consensus scores measure methodological consistency, not empirical risk.
- **Reproducibility & Verification**: `src/advanced_outlier_detection.py`, `src/generate_stage16_notebook.py`, and `notebooks/14_advanced_outlier_detection.ipynb` executed head-to-tail with 0 errors. All 11 test suites in `src/validate_stage16.py` passed with 100% success. Frozen stages 5–15 regression test passed completely.

---

### Stage 17 — Advanced Visualization & Power BI (10-Page Suite) (Done / FROZEN)
- **Methodological Purpose**: Translate all validated analytical findings from Stages 1 through 16 into a coherent, interactive, 10-page Power BI dashboard architecture and semantic data package.
- **Power BI Runtime Environment Disclosure**:
  - Power BI Desktop is a Windows desktop GUI application and is not executable via CLI automation in this headless runtime.
  - In strict adherence to academic integrity, no synthetic binary `.pbix` is fabricated.
  - Stage 17 delivers the complete, authoritative semantic data package (28 validated CSV tables under `dashboard/powerbi_data/`), full 10-page visual blueprints, 25+ standardized DAX measures, and automated mathematical validation.
- **10-Page Visual Suite Structure**:
  - **Page 1 — Executive Overview**: National 2023 totals ($86,420$), Act Groups (IT Act: $44,237$ / $51.19\%$, IPC: $41,849$ / $48.43\%$, SLL: $334$ / $0.39\%$), Motives (Fraud: $59,526$), Demographics (Women: $19,510$, Child: $1,902$), Pareto offense ranking.
  - **Page 2 — Geographic / State Analysis**: 36-state ranking, Top 5 concentration ($63,472$ / $73.45\%$: Karnataka 21,889, Telangana 18,236, UP 10,794, Maharashtra 8,103, Bihar 4,450), 100% stacked Act breakdown, dynamic state drill-through.
  - **Page 3 — Crime Structure & Pareto**: 40 leaf categories (Sum = $86,420$), Sec 66D ($25,334$), Sec 420 ($16,943$), Combined financial fraud ($61,365$), Motive Fraud ($59,526$), hierarchical treemap, zero double-counting enforcement.
  - **Page 4 — Association Pattern Mining**: Stage 5 & 12 FP-Growth & Apriori rules, support/confidence/lift scatter, State-Level Syllabus Demonstration framing.
  - **Page 5 — Supervised Classification**: Stage 13 high-volume regime classification on 2022 held-out test data (Decision Tree $97.22\%$, Gaussian NB $100\%$, Linear SVM $100\%$, RBF SVM $100\%$, Random Forest $100\%$), 5 confusion matrix cards, Gini feature importance.
  - **Page 6 — Regression & Prediction**: Stage 7 & 14 1-year-ahead continuous forecasting on 2022 test data (Log-Linear OLS $R^2=0.9000$, $\text{MAE}=479.37$ vs. Naive Baseline $R^2=0.8625$, $\text{MAE}=564.75$), residual distributions, leaderboard table.
  - **Page 7 — Comparative Clustering**: Stage 6 & 15 K=4 composition profiles ($n=15, 12, 2, 7$), 2D PCA cluster biplot, Hungarian stability ($\text{ARI}=1.000$, $\text{NMI}=1.000$), Ward hierarchical concordance.
  - **Page 8 — Anomaly & Outlier Detection**: Stage 8 & 16 multi-method matrix (Tukey IQR, Isolation Forest, Robust Mahalanobis with $\chi^2$ cutoff, LOF), consensus scores ($0–4$), dual-space volume vs. composition separation, small-denominator sensitivity stability on $N=34$.
  - **Page 9 — Historical Panel Trends**: 2018–2022 longitudinal panel ($27,248 \to 65,893$ cases), state sparklines, separate series isolation, missing data disclosure for Ladakh.
  - **Page 10 — Methodology & Limitations**: Star schema provenance, 28-table data dictionary, pipeline methodology table, 6 core academic limitations cards.
- **Exported Deliverables**:
  - `dashboard/POWERBI_STAGE17_SPECIFICATION.md`
  - `dashboard/README.md`
  - `dashboard/powerbi_data/` (28 validated CSV tables)
  - `src/dashboard_prep.py`
  - `src/validate_stage17.py`
  - `src/generate_stage17_notebook.py`
  - `notebooks/15_advanced_visualization.ipynb`
- **Reproducibility & Verification**: `src/dashboard_prep.py`, `src/generate_stage17_notebook.py`, and `notebooks/15_advanced_visualization.ipynb` executed head-to-tail with 0 errors. All 12 test suites in `src/validate_stage17.py` passed with 100% success. Frozen stages 5–16 regression test passed completely.

---

### Stage 18 — Final Integration, Audit & Project Readiness (Done / FROZEN)
- **Methodological Purpose**: Comprehensive repository-wide audit, quality gate, and readiness verification across all 17 previous stages.
- **Audit Results & Key Verifications**:
  - *Data Integrity*: 5 raw source tables verified untouched with exact shapes; master 2023 dataset ($N=36$, 164 columns) verified with 0 negatives and 0 nulls.
  - *National Reconciliation*: 100% agreement on all national totals (Total: $86,420$, IT Act: $44,237$, IPC: $41,849$, SLL: $334$, Fraud motive: $59,526$, Women: $19,510$, Child: $1,902$, Top 5 concentration: $63,472$ / $73.45\%$, Sec 66D: $25,334$, Sec 420: $16,943$).
  - *Historical Panel*: 2018–2022 panel verified ($27,248 \to 65,893$, $+141.83\%$), isolated from 2023 detailed cross-section, Ladakh missingness preserved as `NaN`.
  - *Leakage Safeguards*: Zero contemporaneous total-from-part regressions; strict chronological train/test split on 2022 evaluation set ($N_{\text{train}}=70$, $N_{\text{test}}=36$).
  - *Analytical Model Alignment*: Stage 5/12 Association rules, Stage 6/15 Clusters, Stage 7/14 Regressors, Stage 13 Classifiers, Stage 8/16 Outliers verified.
  - *Power BI Semantic Package*: 28 validated CSV extract tables in `dashboard/powerbi_data/`, complete 10-page architecture specification, 25+ DAX measures.
  - *Academic Guardrails*: Strict non-normative framing, non-causal descriptions, small-denominator caution tags, and full disclosure of the 6 core limitations.
- **Exported Deliverables**:
  - `PROJECT_FINAL_AUDIT.md`
  - `src/validate_stage18.py`
- **Validation Gate**: 14 automated validation suites (`validate_stage5.py` through `validate_stage18.py`) executed with 114/114 tests passed (100% success rate, 0 regressions).

---

---

# UI Engineering Track — Stages 19–29

Stages 1–18 constitute the completed and frozen analytical/data-mining pipeline. Stages 19–29 constitute a separate user-interface and application engineering track that consumes the validated outputs of Stages 1–18 without modifying their analytical logic.

```text
Stages 1–18
Analytical / Data Mining Pipeline
                ↓
        Validated Data & Models
                ↓
Stages 19–29
User Interface / Application Layer
```

The UI track is a **presentation and application layer**, not a replacement for the validated analytical pipeline.

---

### UI Track Core Principles

1. **Frozen Analytical Core**: Stages 1–18 remain the authoritative analytical source.
2. **UI Consumes, Not Redefines**: The UI consumes validated outputs (CSVs, SQLite database, serialized models) and exposes them through standard APIs and components.
3. **No Analytical Duplication**: No competing implementations of the project's analytical methods are created inside the frontend.
4. **Reproducibility**: The exact same underlying validated values appear regardless of whether data are viewed through notebooks, SQL, CSV outputs, Power BI package, or web UI.
5. **Academic Transparency**: The UI prominently exposes methodological constraints, missingness, and data limitations rather than obscuring them.
6. **No Causal Overinterpretation**: Visualizations and copy strictly adhere to non-causal, descriptive, and statistical association interpretations.

---

### UI Architecture Diagram

```text
Stages 1–18 (Frozen Analytical Core)
                 │
                 ▼
     Validated Analytical Outputs
     (CSVs, SQLite DB, Serialized Models)
                 │
                 ├──────────────────────────────► Stage 20: Backend API (FastAPI)
                 │                                        │
                 ▼                                        ▼
Stage 19: UI Foundation (React + Vite) ─────────► Interactive UI Modules (Stages 21–27)
                                                          │
                 ┌────────────────────────────────────────┼────────────────────────────────────────┐
                 ▼                                        ▼                                        ▼
      Executive & Geographic                  Machine Learning & Pattern                   Methodology & Data
       Explorers (Stages 21–23)                Analytics (Stages 24–26)                    Explorer (Stage 27)
                                                          │
                                                          ▼
                                            Stage 28: UI Integration & UX Polish
                                                          │
                                                          ▼
                                            Stage 29: Final UI QA & Deployment
```

---

### Stage 19 — UI Architecture & Foundation *(Complete / Frozen)*
- **Purpose**: Establish the frontend architecture, visual foundation, and component library.
- **Planned Scope**:
  - React + Vite frontend scaffold and directory structure
  - Application routing and layout shell (sidebar, header, content area)
  - Unified design system: dark/light theme tokens, typography, spacing, surface hierarchy
  - Reusable foundational components: Metric Cards, Data Tables, Chart Containers, Filter Controls
  - UI State Handling: Loading skeletons, error boundaries, empty states, responsive layouts
  - Frontend build configuration and API client contracts
- **Critical Constraint**: Stage 19 establishes architectural foundation only; full dashboard pages are implemented in subsequent stages.
- **Status**: **Complete / Frozen** (Commit `67d64e1`)

---

### Stage 20 — Backend / API Layer *(Complete / Frozen)*
- **Purpose**: Create a clean FastAPI service exposing already-validated project datasets, warehouse tables, and model outputs to the frontend.
- **Planned Scope**:
  - FastAPI modular application structure with CORS configuration
  - Validated data access layer reading `data/processed/`, `dashboard/powerbi_data/`, `outputs/tables/`, and `cybercrime.db`
  - RESTful API endpoints:
    - `/api/summary`: National 2023 totals, Act Group sums, vulnerability subsets
    - `/api/states`: 36 State/UT cross-sectional metrics, category shares, motive distributions
    - `/api/categories`: 49 crime categories with leaf vs. parent/subtotal taxonomy
    - `/api/motives`: 18 specific motives and volume rankings
    - `/api/trend`: 2018–2022 historical panel with explicit missing-value handling
    - `/api/models/classification`: Model comparisons, confusion matrices, evaluation metrics
    - `/api/models/regression`: OLS/Log-Linear/Tree metrics, actual vs. predicted, residuals
    - `/api/models/association`: Apriori/FP-Growth itemsets, filtered rules (support, confidence, lift)
    - `/api/models/clustering`: K=4 composition clusters, Hungarian stability, PCA coordinates
    - `/api/models/outliers`: Consensus anomaly scores ($0–4$), Mahalanobis, LOF, Isolation Forest, IQR
  - Pydantic response schemas ensuring strict data type validation
- **Critical Rule**: The API consumes existing validated outputs and must never independently recalculate or alter analytical results.
- **Status**: **Complete / Frozen** (Commits `c9f065f`, `a40e8e5`, `3312fde`)

---

### Stage 21 — Executive Dashboard *(Complete / Frozen)*
- **Purpose**: Build the high-level national overview dashboard communicating primary cybercrime volume, legal classification, and geographic concentration.
- **Planned Scope**:
  - Top-level National KPI Cards: Total Cases ($86,420$), IT Act ($44,237$), IPC ($41,849$), SLL ($334$), Fraud Motive ($59,526$), Women ($19,510$), Children ($1,902$)
  - Top 5 State Concentration Visual ($63,472$ cases / $73.45\%$ share: Karnataka, Telangana, UP, Maharashtra, Bihar)
  - Legal Act Group Donut/Bar breakdown and Financial Fraud dominance callout ($61,365$ cases / $71.01\%$)
  - Top Leaf Categories ranking (Sec. 66D Personation: $25,334$; Sec. 420 Cheating: $16,943$)
  - Executive summary cards and cross-navigation links to detailed analytical modules
- **Status**: **Complete / Frozen** (Commits `027cb89`, `cd39d21`)

---

### Stage 22 — Geographic & Crime Explorer *(Complete / Frozen)*
- **Purpose**: Provide interactive exploration of the 2023 State/UT cross-section, legal categories, and motive distributions.
- **Planned Scope**:
  - Interactive State/UT selector and comparative side-by-side profiling
  - Granular Category Explorer with strict leaf vs. parent/subtotal hierarchy navigation
  - Motive Breakdown explorer comparing financial fraud, extortion, sexual exploitation, and personal revenge
  - Interactive multi-criteria sorting, column filtering, and drill-down tables
  - State composition share visualizer (IT Act share, IPC share, Fraud share, Extortion share)
- **Status**: **Complete / Frozen** (Commit `5b1107e`)

---

### Stage 23 — Historical Analytics *(Complete / Frozen)*
- **Purpose**: Interactive interface for longitudinal panel trend analysis across 2018–2022.
- **Planned Scope**:
  - National 5-year growth trajectory visualization ($27,248 \to 65,893$, $+141.83\%$)
  - State-level historical time-series selector with multi-state trend comparison
  - Year-over-year growth rates, compound expansion metrics, and state trajectory rankings
  - Explicit historical series isolation notice (independent from 2023 detailed cross-section)
  - Transparent Ladakh historical missingness disclosure (`NaN` for 2018/2019 without synthetic imputation)
- **Status**: **Complete / Frozen** (Commits `82c4454`, `62c0434`)

---

### Stage 24 — Machine Learning Analytics UI *(Complete / Frozen)*
- **Purpose**: Interactive presentation of validated supervised classification and predictive regression models.
- **Planned Scope**:
  - **Supervised Classification Explorer**:
    - Model performance leaderboard (Decision Tree: $97.22\%$; Naive Bayes, SVM, Random Forest: $100\%$)
    - Confusion matrices, Precision, Recall, F1-Score, and ROC-AUC visualizations
    - Chronological evaluation split explanation ($N_{\text{train}}=70$, $N_{\text{test}}=36$ on 2022 held-out panel)
    - Prominent academic disclaimer: perfect classification metrics reflect high temporal volume persistence, not commercial deployment readiness
  - **Predictive Regression Explorer**:
    - 10-model regression comparison leaderboard
    - Superiority of Log-Linear OLS ($\text{MAE}=479.37$, $\text{RMSE}=1,143.46$, $R^2=0.9000$, $\text{MedAE}=69.85$) over Linear OLS, Ridge, Polynomials, and Ensemble regressors
    - Actual vs. Predicted scatter plots with $y=x$ reference line
    - Residual distribution histograms and log-scale variance stabilization diagnostics
- **Status**: **Complete / Frozen** (Stage 24 Implementation)

---

### Stage 25 — Association Rules & Clustering UI *(Complete / Frozen)*
- **Purpose**: Interactive exploration of unsupervised pattern mining, Apriori/FP-Growth association rules, and K-Means composition clusters.
- **Planned Scope**:
  - **Association Rule Explorer**:
    - 129 frequent itemsets and 1,924 association rules with interactive Support, Confidence, and Lift sliders
    - Rule visualization: Antecedent $\implies$ Consequent network graph / scatter plot
    - Prominent label: **State-Level Syllabus Demonstration** (macro-aggregate profile co-occurrences, not individual case logs)
    - Key highlighted rule: $\text{HIGH\_FRAUD\_MOTIVE} \implies \text{HIGH\_SEC66D\_CHEATING}$ ($\text{lift}=1.67$)
  - **Cluster Analysis Explorer**:
    - K-Means 4-Profile Composition Taxonomy ($K=4$, $\text{Silhouette}=0.3497$):
      - Cluster 0 ($n=15$): Moderate Fraud / Mixed IPC-IT Baseline
      - Cluster 1 ($n=12$): Fraud & Cyber Cheating Dominant
      - Cluster 2 ($n=2$): High Sexual-Exploitation Share / Small-Denominator Profile (Dadra & Nagar Haveli, Lakshadweep)
      - Cluster 3 ($n=7$): Extortion & Non-Fraud Motivation
    - Interactive 2D PCA cluster projection scatter plot
    - State membership selector, profile characteristic radar/bar charts, and tiny-denominator cautionary tags
- **Status**: **Complete / Frozen** (Stage 25 Implementation)

---

### Stage 26 — Anomaly & Outlier UI *(Planned / Not Started)*
- **Purpose**: Multidimensional anomaly detection interface visualizing statistical departures across univariate and multivariate methods.
- **Planned Scope**:
  - Multi-method anomaly matrix: Tukey IQR fences, Isolation Forest ($c=0.15$), Robust Mahalanobis (MinCovDet with $\chi^2$ screening cutoff), and Local Outlier Factor (LOF, $k=10$)
  - Consensus Anomaly Score visualizer ($0$ to $4$ methods agreeing) highlighting 3 consensus states (Karnataka, Dadra & Nagar Haveli, Lakshadweep)
  - Dual-Space Separation view: Absolute Volume Extremes (Karnataka, Telangana, UP) vs. Compositional Extremes (Dadra & Nagar Haveli, Lakshadweep)
  - Non-destructive Small-Denominator Sensitivity Analysis toggle ($N=36$ vs. $N=34$ excluding tiny UTs)
  - Strict non-normative academic terminology: departures represent statistical extremity in feature space, not criminological "hotspots" or "risk"
- **Status**: **Planned / Not Started**

---

### Stage 27 — Methodology & Data Explorer *(Planned / Not Started)*
- **Purpose**: Full academic transparency interface providing data provenance, star schema dictionaries, algorithm documentation, and limitation disclosures.
- **Planned Scope**:
  - Source Data Provenance: NCRB Crime in India (Tables 9A.2, 9A.3, 9A.10, 9A.11) and Rajya Sabha archival records
  - Relational Schema Explorer: Interactive Star Schema diagram (`dim_state`, `dim_crime_category`, `dim_motive`, `dim_year`, and fact tables)
  - End-to-End Pipeline Architecture: Visual representation of Stages 1–18 analytical lifecycle
  - Prominent 6 Core Methodological Limitations view:
    1. Absence of population normalization (administrative volume, not per-capita rate) and reporting behavior variability
    2. Historical series discontinuity (2018–2022 vs. 2023)
    3. Short longitudinal window (5 annual points)
    4. Small sample size ($N=36$ cross-section)
    5. Macro-aggregate transaction proxies (syllabus demonstration)
    6. Small-denominator percentage distortion in tiny UTs
  - Reference link to Power BI 28-table semantic package and data dictionary
- **Status**: **Planned / Not Started**

---

### Stage 28 — UI Integration & UX Polish *(Planned / Not Started)*
- **Purpose**: Integrate all modular UI components into a responsive, accessible, and polished single-page application.
- **Planned Scope**:
  - Unified global header, collapsible sidebar navigation, breadcrumbs, and deep-linking
  - Theme toggle (Dark / Light mode) with high-contrast accessibility compliance
  - Cross-module filter synchronization and persistent user selection state
  - Seamless transitions, responsive layouts for desktop and tablet screens
  - Reusable chart formatting, consistent tooltips, number formatting (Indian and International numbering systems)
  - Performance optimization: Lazy loading of heavy chart views, optimized bundle size
- **Status**: **Planned / Not Started**

---

### Stage 29 — Final UI QA & Deployment Readiness *(Planned / Not Started)*
- **Purpose**: Comprehensive end-to-end quality assurance, data reconciliation audit, and production deployment packaging.
- **Planned Scope**:
  - End-to-end automated UI component testing and API endpoint integration test suite
  - Strict UI data reconciliation audit against authoritative outputs ($86,420$ national total check)
  - Cross-browser compatibility and responsive layout validation
  - Production build optimization (Vite production bundle + FastAPI Uvicorn ASGI server)
  - Containerization / deployment configuration (Docker, environment files, setup scripts)
  - Final UI user guide and academic presentation walkthrough documentation
- **Status**: **Planned / Not Started**

---

## 5. Known Data Limitations (carry through every stage)

1. **Absence of Population Normalization & Reporting Variability**: All figures are raw reported police case counts from NCRB Table 9A.1. Without state census population normalization, figures represent absolute administrative volume, not per-capita crime rates. Differences in registered volume may reflect a combination of underlying incidence, reporting behavior, public awareness, and institutional registration practices; the available aggregate data cannot isolate these factors.
2. **Strict Time-Series Discontinuity (2018–2022 vs. 2023)**: The historical 2018–2022 series (Rajya Sabha archival data) and the 2023 detailed NCRB dataset originate from distinct recording tables with structural discrepancies. They are maintained as separate series and must never be concatenated into a continuous 2018–2023 line.
3. **Short Historical Window**: Only 5 annual data points exist nationally (2018–2022). Classical ARIMA/deep time-series forecasting is statistically unjustifiable; longitudinal analysis is restricted to 1-year panel lag regression.
4. **Small Cross-Sectional Sample ($N = 36$)**: High-dimensional machine learning is constrained by the 36-state sample size. All techniques require strict degrees-of-freedom management, regularized parameters, and conservative interpretation.
5. **Macro-Aggregate Transaction Representation**: NCRB publishes macro-level state aggregates, not incident-level crime logs. Apriori and FP-Growth association rules operate on binarized state-level profile co-occurrences as a syllabus demonstration, not individual case-level basket linkages.
6. **Small-Denominator Proportion Distortion**: Union Territories with very small case counts (e.g., Ladakh = 1 case, Lakshadweep = 1 case, and Dadra and Nagar Haveli and Daman and Diu = 6 cases) can produce extreme percentage swings; these observations are explicitly flagged and examined through sensitivity analyses.

---

## 6. Project Philosophy & Priority Ordering

This project prioritizes rigorous methodological integrity over uncritical algorithmic complexity. Every technique must answer a defined analytical question and must be supported by the available data.

### Methodological Priority Hierarchy:
$$\text{Data Validity} \longrightarrow \text{Analytical Correctness} \longrightarrow \text{Academic Defensibility} \longrightarrow \text{Syllabus Alignment}$$
$$\longrightarrow \text{Reproducibility} \longrightarrow \text{Interpretability} \longrightarrow \text{Simplicity} \longrightarrow \text{Presentation Quality}$$
$$\longrightarrow \text{Sophistication (only when justified)}$$

**Core Guiding Rule**:
> *The project will not add algorithms solely to increase the number of techniques. Each technique must answer a defined analytical question and must be supported by the available data.*

