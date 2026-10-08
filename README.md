# Cyber Crime Analytics for National Security

An undergraduate **Data Analytics & Visualization / Data Mining** laboratory and analytical workstation analyzing publicly available Indian cybercrime data across time, geography, statutory crime categories, and recorded motives.

> **Final Project Status: Stages 1–29 Complete, Validated, Audited, and Frozen.**  
> All core analytical pipelines, SQLite database warehouse, machine learning models, Power BI semantic packages, FastAPI data presentation services, and React/Vite UI analytics workstation pages are fully integrated, validated, audited, and frozen. See [`PROJECT_FINAL_AUDIT.md`](./PROJECT_FINAL_AUDIT.md) and [`PROJECT_PLAN.md`](./PROJECT_PLAN.md) for full audit reports and gate verifications.

---

## 1. Project Overview & Primary Objective

This project applies a complete data analytics, data mining, and machine learning lifecycle to publicly available Indian cybercrime data. It is structured as an integrated **cyber intelligence analytics laboratory**, answering descriptive and exploratory questions:

- **Volume & Geographic Burden**: How registered cybercrime cases are distributed across 36 Indian States and Union Territories.
- **Crime Category Structure**: How the 40 statutory leaf offenses (under IT Act, IPC, and SLL) compose national and state-level cybercrime portfolios.
- **Motive Distribution**: How the 18 recorded crime motives (dominated by Fraud at 68.88%) profile criminal intent.
- **Historical Trajectories**: How State/UT registered volumes evolved longitudinally from 2018 to 2022 (tracking growth from 27,248 to 65,893 cases).
- **Predictive Regimes**: How historical panel lags estimate short-term volume and high-volume state regimes on held-out test data.
- **Compositional Clustering**: How States/UTs group into 4 distinct proportional composition profiles ($K=4$).
- **Frequent Itemset Patterns**: Which crime categories co-occur above median thresholds across jurisdictions (42 pairwise association rules).
- **Multivariate Anomalies**: Which observations depart statistically from typical feature structures under multiple screening algorithms.
- **Academic Transparency**: Full disclosure of data provenance, star schema data dictionaries, validation checkpoints, and core limitations.

---

## 2. System Architecture & End-to-End Flow

```
RAW SOURCES (data/raw/)
  ├── NCRB Crime in India 2023 (Tables 9A.2, 9A.3, 9A.10, 9A.11)
  └── Rajya Sabha Unstarred Question No. 226 (2018–2022 Panel)
         │
         ▼
DATA VALIDATION & PREPROCESSING (src/, notebooks/)
  ├── Strict schema normalization & non-destructive cleaning
  └── Separation of 2018–2022 panel and 2023 cross-section
         │
         ▼
SQLITE STAR SCHEMA WAREHOUSE (data/database/cybercrime.db)
  ├── 4 Dimensions: dim_state, dim_year, dim_crime_category, dim_motive
  └── 3 Facts: fact_cybercrime_category_2023, fact_cybercrime_motive_2023, fact_cybercrime_trend
         │
         ▼
FROZEN ANALYTICAL CORE (Stages 1–18)
  ├── EDA, OLAP & Cuboid Lattices (Stages 4, 11)
  ├── Association Rules & Frequent Patterns (Stages 5, 12)
  ├── Unsupervised K-Means & Advanced Clustering (Stages 6, 15)
  ├── Supervised Regression & Classification (Stages 7, 13, 14)
  ├── Multi-Method Outlier & Anomaly Screening (Stages 8, 16)
  └── Power BI 28-Table Semantic Package (Stage 17)
         │
         ▼
FASTAPI DATA PRESENTATION LAYER (backend/)
  ├── Read-only REST service exposing validated models & metadata
  └── Endpoints: /api/health, /api/summary, /api/states, /api/categories,
      /api/motives, /api/trend, /api/models/*
         │
         ▼
REACT / VITE ANALYTICS WORKSTATION (frontend/)
  └── 7 Integrated Pages: / (Overview), /explore, /trends, /models,
      /patterns, /anomalies, /methodology
```

---

## 3. Web Workstation Application Routes

The React/Vite analytics workstation exposes seven integrated analytical views:

| Route | Page Name | Analytical Focus |
|---|---|---|
| `/` | **Executive Overview** | Authoritative national synthesis across 86,420 registered cases, top-5 state concentration (73.45%), Pareto crime categories, motive distribution, and longitudinal growth summary. |
| `/explore` | **Geographic & Crime Explorer** | Interactive multi-dimensional filtering across 36 States/UTs, 40 statutory leaf offenses, and 18 recorded motives with state-level profile comparisons. |
| `/trends` | **Historical Analytics** | 2018–2022 longitudinal series across 180 warehouse tuples, year-over-year growth trajectories, state-specific trajectories, and explicit separation of Ladakh missing values. |
| `/models` | **Machine Learning Analytics** | Empirical supervised regression (Log-Linear OLS $R^2=0.9000$) and classification (Featured Decision Tree depth 3, $97.22\%$ accuracy) on 2022 held-out test data. |
| `/patterns` | **Patterns & Clustering** | 42 pairwise association rules (Apriori/FP-Growth) and 4 composition-based K-Means clusters (Silhouette $= 0.3497$) with volume-excluded feature spaces. |
| `/anomalies` | **Anomaly & Outlier Analytics** | Multi-method descriptive statistical screening (IQR, Isolation Forest, LOF, Robust Mahalanobis) and volume vs. composition dual-space analysis. |
| `/methodology` | **Methodology & Data Explorer** | Complete academic data provenance, star schema data dictionaries, 11 validation gates, live metadata explorer, and full disclosure of the 9 core limitations. |

---

## 4. Repository Structure

```
cybercrime-analytics/
├── data/
│   ├── raw/                # Untouched official government source CSVs (immutable)
│   ├── processed/          # Cleaned, standardized, analysis-ready datasets
│   └── database/           # SQLite analytical warehouse (cybercrime.db)
├── notebooks/              # 16 Jupyter notebooks documenting Stages 1–17
├── src/                    # Reusable Python modules backing analytics & validation
│   ├── preprocessing.py
│   ├── eda.py
│   ├── association_rules.py
│   ├── clustering.py
│   ├── prediction.py
│   ├── outlier_detection.py
│   └── validate_stage*.py  # Automated regression validation gates (Stages 5–20)
├── sql/                    # Star schema DDL, analytical queries, and analytical views
├── outputs/
│   ├── figures/            # Generated analytical figures and diagnostic plots
│   ├── models/             # Serialized model artifacts and metrics
│   └── tables/             # Output result tables and summaries
├── dashboard/
│   ├── powerbi_data/       # 28 validated CSV tables for Power BI semantic model
│   ├── POWERBI_SPECIFICATION.md
│   └── API_SPECIFICATION.md
├── backend/                # FastAPI REST API presentation layer (Stage 20)
│   ├── app/
│   │   ├── main.py         # FastAPI application entrypoint & route handlers
│   │   ├── models.py       # Pydantic schema definitions
│   │   └── services.py     # SQLite data loader & analytical model artifact service
│   ├── tests/              # Pytest test suite (11 unit tests)
│   └── requirements.txt
├── frontend/               # React 19 + Vite analytics workstation UI (Stages 19, 21–28)
│   ├── src/
│   │   ├── components/     # Layout, UI primitives, data tables, and chart containers
│   │   ├── pages/          # 7 integrated workstation page views
│   │   ├── services/       # API client service
│   │   └── styles/         # CSS design tokens & analytical workstation theme
│   ├── package.json
│   └── vite.config.js
├── requirements.txt        # Core Python analytical dependencies
├── PROJECT_PLAN.md         # Authoritative 29-stage roadmap & validation records
├── PROJECT_FINAL_AUDIT.md  # Comprehensive repository-wide audit report
└── README.md
```

---

## 5. Local Setup & Quickstart Guide

### Prerequisites
- Python 3.10+ (Python 3.13 recommended)
- Node.js 18+ & npm
- Git

### 1. Clone & Set Up Backend Environment
```bash
# Clone the repository
git clone https://github.com/kanwal-vyas/cybercrime-analytics.git
cd cybercrime-analytics

# Create and activate Python virtual environment
python -m venv .venv
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate

# Install analytical and backend dependencies
pip install -r requirements.txt
pip install -r backend/requirements.txt
```

### 2. Start the FastAPI Backend Service
```bash
# Launch FastAPI server on http://localhost:8000
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Verify the backend is live at: `http://localhost:8000/api/health`

### 3. Set Up & Launch the Frontend Workstation
```bash
# Open a new terminal in the frontend directory
cd frontend

# Install Node dependencies
npm install

# (Optional) Copy example environment configuration
cp .env.example .env

# Launch the Vite development server
npm run dev
```
Open your browser at: `http://localhost:5173/`

---

## 6. Testing & Validation Commands

The repository maintains an automated validation framework. Run the full test suite:

```bash
# 1. Backend Unit Tests
pytest backend/tests -v

# 2. FastAPI Data Layer Validation Gate
python src/validate_stage20.py

# 3. Full Analytical Regression Suite (Stages 5–18)
python src/validate_stage5.py
python src/validate_stage6.py
python src/validate_stage7.py
python src/validate_stage8.py
python src/validate_stage9.py
python src/validate_stage10.py
python src/validate_stage11.py
python src/validate_stage12.py
python src/validate_stage13.py
python src/validate_stage14.py
python src/validate_stage15.py
python src/validate_stage16.py
python src/validate_stage17.py
python src/validate_stage18.py

# 4. Frontend Lint & Production Build
cd frontend
npm run lint
npm run build
```

---

## 7. Authoritative Analytical Benchmarks (Frozen)

All metrics displayed across the API and UI are verified against the frozen analytical artifacts:

- **2023 Detailed Universe**: 86,420 registered cases across 36 States/UTs, 40 leaf offenses, and 18 specific motives.
- **Act Group Breakdown**: IT Act = 44,237 (51.19%), IPC r/w IT Act = 41,849 (48.43%), SLL = 334 (0.39%).
- **Geographic Concentration**: Top 5 States (Telangana, Karnataka, Uttar Pradesh, Maharashtra, Gujarat) account for 63,472 cases (73.45%).
- **Longitudinal Growth**: National cases grew from 27,248 (2018) to 65,893 (2022), representing a $+141.83\%$ increase.
- **Supervised Regression (Stage 7/14)**: Log-Linear OLS on 2022 held-out test data achieves $MAE = 479.37$, $RMSE = 1143.46$, $R^2 = 0.9000$, and $Median AE = 69.85$.
- **Supervised Classification (Stage 13)**: Featured Interpretable Decision Tree ($d=3$) achieves $Accuracy = 0.9722$, $F1 = 0.9744$, $ROC-AUC = 0.9750$; Gaussian NB, Linear SVM, RBF SVM, and Random Forest achieve $1.0000$ test accuracy.
- **Unsupervised Clustering (Stage 6/15)**: K-Means ($K=4$, StandardScaler, seed=42) produces a silhouette score of $0.3497$ across volume-excluded proportional features.
- **Association Rule Mining (Stage 5/12)**: 129 frequent itemsets, 1,924 filtered rules, and 42 pairwise rules mined across $N=36$ median-split binary indicators ($Supp \ge 0.25, Conf \ge 0.60, Lift > 1.0$).
- **Multi-Method Outlier Screening (Stage 8/16)**: Robust Mahalanobis (8/36 with $\chi^2(14, 0.975) = 26.119$ reference cutoff), Isolation Forest (6/36), LOF (4/36 at $k=10$), and Tukey IQR (18/36 jurisdictions, 52 feature violations).

---

## 8. Academic Limitations & Interpretation Boundaries

1. **Registered Volume vs. True Incidence**: Registered crime figures reflect cases officially recorded by law enforcement; unobserved or unreported cybercrime ("dark figure") is not captured.
2. **Reporting & Institutional Variation**: Cross-state differences reflect a mix of underlying incidence, public reporting awareness, digital penetration, and institutional police registration practices; aggregate data cannot isolate these mechanisms.
3. **Cross-Sectional 2023 Design**: Detailed category and motive analyses are cross-sectional and cannot establish temporal causality, intervention effectiveness, or policy impact.
4. **Historical Source Separation**: The 2018–2022 panel (Rajya Sabha) and 2023 cross-section (NCRB) originate from separate sources and are intentionally analyzed independently.
5. **Small Denominator Sensitivity**: Union Territories with very small annual totals (Ladakh = 1, Lakshadweep = 1, DNHDD = 6) generate volatile percentage shares and should be interpreted cautiously.
6. **Predictive Model Scope**: Machine learning regressions and classifications provide empirical baseline benchmarks on held-out historical data; they are not deployment-grade operational policing risk scores.
7. **Association Rule Scope**: Mined rules describe cross-sectional state-level co-occurrence above medians; they do not imply causal links or criminal transitions.
8. **Cluster Interpretations**: Clusters characterize descriptive similarity in specific proportional composition spaces; they do not represent normative performance tiers or threat rankings.
9. **Outlier Screening Framing**: Outlier flags reflect statistical departures from chosen feature spaces. $\chi^2$ cutoffs serve as descriptive screening references rather than formal finite-sample p-values.

---

## 9. License & Academic Attribution

This project is developed strictly for academic and educational research purposes utilizing publicly available data published by the National Crime Records Bureau (NCRB), Ministry of Home Affairs, Government of India, and Rajya Sabha official parliamentary proceedings.
