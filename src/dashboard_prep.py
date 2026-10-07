"""
src/dashboard_prep.py
===============================================================================
Cyber Crime Analytics for National Security
Stage 9: Power BI Dashboard Data Preparation & Semantic Modeling

This module prepares, structures, and validates the complete dashboard-ready
data package under `dashboard/powerbi_data/`. All extracts are derived strictly
from validated SQLite database views (`sql/views.sql`), processed tables, and
Stage 4–8 analytical outputs.

Outputs Generated:
- dim_state.csv
- dim_crime_category.csv
- dim_motive.csv
- dim_act_group.csv
- kpi_executive_summary.csv
- fact_state_category_2023.csv
- fact_state_motive_2023.csv
- state_summary_2023.csv
- category_summary_2023.csv
- motive_summary_2023.csv
- model_association_rules_key.csv
- model_cluster_profiles.csv
- model_cluster_assignments.csv
- model_outlier_summary.csv
- model_outlier_univariate.csv
- trend_summary_2018_2022.csv
- trend_national_2018_2022.csv
- model_prediction_metrics.csv
- model_prediction_actual_vs_predicted.csv
- metadata_project_limitations.csv
===============================================================================
"""

import os
import sqlite3
from pathlib import Path
import pandas as pd
import numpy as np

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PROCESSED = PROJECT_ROOT / "data" / "processed"
DATA_DB = PROJECT_ROOT / "data" / "database" / "cybercrime.db"
OUTPUTS_TABLES = PROJECT_ROOT / "outputs" / "tables"
POWERBI_DATA = PROJECT_ROOT / "dashboard" / "powerbi_data"


def get_db_connection() -> sqlite3.Connection:
    """Connect to the verified SQLite database."""
    if not DATA_DB.exists():
        raise FileNotFoundError(f"Database not found at {DATA_DB}. Run db_builder.py first.")
    return sqlite3.connect(DATA_DB)


def prepare_powerbi_package():
    """Extract and write all validated Power BI data tables."""
    POWERBI_DATA.mkdir(parents=True, exist_ok=True)
    conn = get_db_connection()

    print("--- Preparing Power BI Dashboard Data Package ---")

    # 1. Dimension Tables
    print("1. Exporting Dimension Tables...")
    dim_state = pd.read_sql_query("SELECT state_id, state_name, is_ut FROM dim_state ORDER BY state_id;", conn)
    dim_state.to_csv(POWERBI_DATA / "dim_state.csv", index=False)

    dim_crime_cat = pd.read_sql_query(
        "SELECT category_id, category_display_name, act_group, parent_category, is_leaf, section_reference FROM dim_crime_category ORDER BY category_id;",
        conn
    )
    dim_crime_cat.to_csv(POWERBI_DATA / "dim_crime_category.csv", index=False)

    dim_motive = pd.read_sql_query(
        "SELECT motive_id, motive_display_name, is_total FROM dim_motive ORDER BY motive_id;",
        conn
    )
    dim_motive.to_csv(POWERBI_DATA / "dim_motive.csv", index=False)

    dim_act_group = pd.read_sql_query(
        "SELECT act_group, leaf_category_count, total_cases, share_pct FROM vw_act_group_summary ORDER BY total_cases DESC;",
        conn
    )
    dim_act_group.to_csv(POWERBI_DATA / "dim_act_group.csv", index=False)

    # 2. Fact Tables
    print("2. Exporting Fact Tables...")
    fact_state_category = pd.read_sql_query(
        """
        SELECT 
            f.state_id,
            s.state_name,
            s.is_ut,
            f.year_id,
            2023 AS year,
            f.category_id,
            c.category_display_name,
            c.act_group,
            c.is_leaf,
            f.cases
        FROM fact_cybercrime_category_2023 f
        JOIN dim_state s ON f.state_id = s.state_id
        JOIN dim_crime_category c ON f.category_id = c.category_id
        ORDER BY f.state_id, f.category_id;
        """,
        conn
    )
    fact_state_category.to_csv(POWERBI_DATA / "fact_state_category_2023.csv", index=False)

    fact_state_motive = pd.read_sql_query(
        """
        SELECT 
            f.state_id,
            s.state_name,
            s.is_ut,
            f.year_id,
            2023 AS year,
            f.motive_id,
            m.motive_display_name,
            m.is_total,
            f.motive_count
        FROM fact_cybercrime_motive_2023 f
        JOIN dim_state s ON f.state_id = s.state_id
        JOIN dim_motive m ON f.motive_id = m.motive_id
        ORDER BY f.state_id, f.motive_id;
        """,
        conn
    )
    fact_state_motive.to_csv(POWERBI_DATA / "fact_state_motive_2023.csv", index=False)

    # 3. Aggregated 2023 Summary Tables
    print("3. Exporting 2023 Analytical Summary Tables...")
    state_summary = pd.read_sql_query(
        """
        SELECT 
            s.state_id,
            s.state_name,
            s.is_ut,
            s.total_leaf_cases AS total_cases,
            s.reported_grand_total,
            s.it_act_cases,
            s.it_act_share_pct,
            s.ipc_cases,
            s.ipc_share_pct,
            s.sll_cases,
            s.sll_share_pct,
            s.total_motives_reported,
            RANK() OVER (ORDER BY s.total_leaf_cases DESC) AS national_rank
        FROM vw_state_cybercrime_summary s
        ORDER BY s.total_leaf_cases DESC;
        """,
        conn
    )
    
    # Merge fraud motive, women cases, children cases from eda_state_feature_matrix.csv
    eda_mat = pd.read_csv(OUTPUTS_TABLES / "eda_state_feature_matrix.csv")
    state_summary = state_summary.merge(
        eda_mat[["state_name", "motive_fraud", "fraud_motive_share", "women_cases_total", "child_cases_total"]],
        on="state_name",
        how="left"
    )
    state_summary.to_csv(POWERBI_DATA / "state_summary_2023.csv", index=False)

    # Category Summary with Pareto analysis
    cat_summary = pd.read_sql_query(
        """
        SELECT 
            category_id,
            category_display_name,
            act_group,
            parent_category,
            is_leaf,
            section_reference,
            national_cases,
            states_reporting_cases,
            national_share_pct
        FROM vw_category_cybercrime_summary
        WHERE is_leaf = 1
        ORDER BY national_cases DESC;
        """,
        conn
    )
    cat_summary["cumulative_cases"] = cat_summary["national_cases"].cumsum()
    cat_summary["cumulative_share_pct"] = (100.0 * cat_summary["cumulative_cases"] / cat_summary["national_cases"].sum()).round(2)
    cat_summary["category_rank"] = range(1, len(cat_summary) + 1)
    cat_summary.to_csv(POWERBI_DATA / "category_summary_2023.csv", index=False)

    # Motive Summary
    motive_summary = pd.read_sql_query(
        """
        SELECT 
            motive_id,
            motive_display_name,
            is_total,
            national_motive_count,
            states_reporting,
            share_pct
        FROM vw_motive_summary
        ORDER BY is_total ASC, national_motive_count DESC;
        """,
        conn
    )
    motive_summary.to_csv(POWERBI_DATA / "motive_summary_2023.csv", index=False)

    # 4. Historical Series (2018–2022) — Explicitly Isolated
    print("4. Exporting Historical Trend Series (2018–2022)...")
    trend_summary = pd.read_sql_query(
        """
        SELECT 
            state_id,
            state_name,
            is_ut,
            year,
            cases,
            prev_year_cases,
            yoy_case_change,
            yoy_growth_pct
        FROM vw_historical_trend_growth
        ORDER BY state_id, year;
        """,
        conn
    )
    trend_summary.to_csv(POWERBI_DATA / "trend_summary_2018_2022.csv", index=False)

    trend_national = trend_summary.groupby("year")["cases"].sum().reset_index()
    trend_national.columns = ["year", "national_total_cases"]
    trend_national["prev_year_cases"] = trend_national["national_total_cases"].shift(1)
    trend_national["yoy_growth_pct"] = (
        100.0 * (trend_national["national_total_cases"] - trend_national["prev_year_cases"]) / trend_national["prev_year_cases"]
    ).round(2)
    trend_national["series_note"] = "Historical NCRB/Rajya Sabha Series (2018-2022) - Maintained separately from 2023 NCRB dataset"
    trend_national.to_csv(POWERBI_DATA / "trend_national_2018_2022.csv", index=False)

    # 5. Analytical Models Outputs (Stages 5, 6, 7, 8)
    print("5. Exporting Analytical Model Outputs...")

    # Stage 5: Principal Association Rules (Curated 1-to-1 interpretable rules)
    rules_df = pd.read_csv(OUTPUTS_TABLES / "association_rules.csv")
    key_rules = rules_df[
        (rules_df["ant_len"] == 1) & 
        (rules_df["con_len"] == 1) & 
        (rules_df["lift"] > 1.0)
    ].sort_values(by=["lift", "confidence"], ascending=False).reset_index(drop=True)
    key_rules["rule_id"] = [f"R-{i+1:02d}" for i in range(len(key_rules))]
    key_rules = key_rules[[
        "rule_id", "antecedent_str", "consequent_str", "support", "confidence", "lift", "conviction"
    ]]
    key_rules.columns = ["rule_id", "antecedent", "consequent", "support", "confidence", "lift", "conviction"]
    key_rules["methodology_note"] = "State-level association demonstration (N=36); co-occurrence, not causation."
    key_rules.to_csv(POWERBI_DATA / "model_association_rules_key.csv", index=False)

    # Stage 6: Clustering Profiles & Assignments
    cluster_profiles = pd.read_csv(OUTPUTS_TABLES / "cluster_profiles_2023.csv")
    cluster_profiles.to_csv(POWERBI_DATA / "model_cluster_profiles.csv", index=False)

    cluster_assignments = pd.read_csv(OUTPUTS_TABLES / "cluster_assignments_2023.csv")
    cluster_assignments.to_csv(POWERBI_DATA / "model_cluster_assignments.csv", index=False)

    # Stage 7: Prediction Performance & State Predictions
    pred_results = pd.read_csv(OUTPUTS_TABLES / "prediction_results.csv")
    pred_results.to_csv(POWERBI_DATA / "model_prediction_metrics.csv", index=False)

    pred_actual_vs_pred = pd.read_csv(OUTPUTS_TABLES / "prediction_actual_vs_predicted.csv")
    pred_actual_vs_pred["test_year"] = 2022
    pred_actual_vs_pred.to_csv(POWERBI_DATA / "model_prediction_actual_vs_predicted.csv", index=False)

    # Stage 8: Outlier Detection Summary & Univariate Fence Records
    outlier_summary = pd.read_csv(OUTPUTS_TABLES / "outlier_state_summary.csv")
    outlier_summary.to_csv(POWERBI_DATA / "model_outlier_summary.csv", index=False)

    outlier_univariate = pd.read_csv(OUTPUTS_TABLES / "outlier_univariate_results.csv")
    # Add small denominator caution tag
    outlier_univariate["is_small_denominator_artifact"] = outlier_univariate["state_name"].isin(
        ["Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep", "Ladakh"]
    ) & outlier_univariate["feature"].str.contains("share")
    outlier_univariate.to_csv(POWERBI_DATA / "model_outlier_univariate.csv", index=False)

    # 6. Executive KPI Summary Table
    print("6. Generating Executive KPI Summary Table...")
    kpi_df = pd.DataFrame([
        {
            "kpi_name": "Total 2023 Cybercrime Cases",
            "kpi_value_num": 86420,
            "kpi_value_str": "86,420",
            "kpi_unit": "Cases",
            "category": "Volume",
            "source_stage": "Stage 3 & 4"
        },
        {
            "kpi_name": "Total States & UTs Evaluated",
            "kpi_value_num": 36,
            "kpi_value_str": "36",
            "kpi_unit": "Jurisdictions",
            "category": "Scope",
            "source_stage": "Stage 2"
        },
        {
            "kpi_name": "IT Act Cases",
            "kpi_value_num": 44237,
            "kpi_value_str": "44,237",
            "kpi_unit": "Cases",
            "category": "Legal Framework",
            "source_stage": "Stage 3"
        },
        {
            "kpi_name": "IT Act Share",
            "kpi_value_num": 51.19,
            "kpi_value_str": "51.19%",
            "kpi_unit": "Percentage",
            "category": "Legal Framework",
            "source_stage": "Stage 3"
        },
        {
            "kpi_name": "IPC Crimes r/w IT Act Cases",
            "kpi_value_num": 41849,
            "kpi_value_str": "41,849",
            "kpi_unit": "Cases",
            "category": "Legal Framework",
            "source_stage": "Stage 3"
        },
        {
            "kpi_name": "IPC Crimes r/w IT Act Share",
            "kpi_value_num": 48.43,
            "kpi_value_str": "48.43%",
            "kpi_unit": "Percentage",
            "category": "Legal Framework",
            "source_stage": "Stage 3"
        },
        {
            "kpi_name": "Special & Local Laws (SLL) Cases",
            "kpi_value_num": 334,
            "kpi_value_str": "334",
            "kpi_unit": "Cases",
            "category": "Legal Framework",
            "source_stage": "Stage 3"
        },
        {
            "kpi_name": "Fraud Motive Cases",
            "kpi_value_num": 59526,
            "kpi_value_str": "59,526",
            "kpi_unit": "Cases",
            "category": "Motive",
            "source_stage": "Stage 3 & 4"
        },
        {
            "kpi_name": "Fraud Motive Share",
            "kpi_value_num": 68.88,
            "kpi_value_str": "68.88%",
            "kpi_unit": "Percentage",
            "category": "Motive",
            "source_stage": "Stage 3 & 4"
        },
        {
            "kpi_name": "Cybercrimes Against Women",
            "kpi_value_num": 19510,
            "kpi_value_str": "19,510",
            "kpi_unit": "Cases",
            "category": "Demographic Subset",
            "source_stage": "Stage 4"
        },
        {
            "kpi_name": "Cybercrimes Against Children",
            "kpi_value_num": 1902,
            "kpi_value_str": "1,902",
            "kpi_unit": "Cases",
            "category": "Demographic Subset",
            "source_stage": "Stage 4"
        },
        {
            "kpi_name": "Top Case Volume State (Karnataka)",
            "kpi_value_num": 21889,
            "kpi_value_str": "21,889 (25.33%)",
            "kpi_unit": "Cases",
            "category": "Geographic Volume",
            "source_stage": "Stage 4"
        },
        {
            "kpi_name": "Top Predictor Model (Log-Linear R²)",
            "kpi_value_num": 0.9000,
            "kpi_value_str": "0.9000 (MAE: 479.37)",
            "kpi_unit": "R² Score",
            "category": "Predictive Modeling",
            "source_stage": "Stage 7"
        },
        {
            "kpi_name": "Distinct Cluster Profiles",
            "kpi_value_num": 4,
            "kpi_value_str": "4 Profiles (K=4)",
            "kpi_unit": "Clusters",
            "category": "Unsupervised Grouping",
            "source_stage": "Stage 6"
        },
        {
            "kpi_name": "Multivariate Outlier Observations",
            "kpi_value_num": 6,
            "kpi_value_str": "6 States/UTs",
            "kpi_unit": "Jurisdictions",
            "category": "Outlier Detection",
            "source_stage": "Stage 8"
        }
    ])
    kpi_df.to_csv(POWERBI_DATA / "kpi_executive_summary.csv", index=False)

    # 7. Metadata & Limitations Table
    print("7. Exporting Project Metadata & Limitations Table...")
    limitations_df = pd.DataFrame([
        {
            "limitation_id": "LIM-01",
            "title": "Absence of Population Normalization",
            "scope": "Geographic & Volume Comparisons",
            "description": "All figures represent raw reported police case counts from NCRB Table 9A.1. No state population data are included; counts cannot be interpreted as per-capita incidence rates or crime risk scores."
        },
        {
            "limitation_id": "LIM-02",
            "title": "Strict Time-Series Discontinuity (2018–2022 vs 2023)",
            "scope": "Temporal Trend Analysis",
            "description": "Historical 2018–2022 series (Rajya Sabha unstarred question / NCRB archival) and 2023 detailed dataset originate from distinct recording tables with discrepancies. They are maintained as separate series and must never be concatenated into a continuous 2018–2023 line."
        },
        {
            "limitation_id": "LIM-03",
            "title": "Short Historical Horizon",
            "scope": "Time Series & Forecasting",
            "description": "Only 5 historical annual cross-sections exist nationally. Classical ARIMA/time-series forecasting is statistically unjustifiable; longitudinal analysis is restricted to 1-year panel lag regression."
        },
        {
            "limitation_id": "LIM-04",
            "title": "Small Cross-Sectional Sample (N = 36)",
            "scope": "Machine Learning & Statistical Generalization",
            "description": "With 36 State/UT observations, high-dimensional machine learning is constrained. K-Means, regression, and outlier detection require strict degrees-of-freedom management, regularization, and non-causal interpretation."
        },
        {
            "limitation_id": "LIM-05",
            "title": "Aggregate Proxy Transaction Representation",
            "scope": "Association Rule Mining (Stage 5)",
            "description": "NCRB publishes macro-level state aggregates, not incident-level crime logs. Apriori association rules operate on binarized state-level profile co-occurrences as a syllabus demonstration, not case-level basket linkages."
        },
        {
            "limitation_id": "LIM-06",
            "title": "Small-Denominator Proportion Distortion",
            "scope": "Clustering & Outlier Detection",
            "description": "In small Union Territories (Dadra & Nagar Haveli N=6, Lakshadweep N=1, Ladakh N=1), proportions can reach extreme values (83.3% or 100%) due entirely to tiny denominators rather than high crime volume."
        }
    ])
    limitations_df.to_csv(POWERBI_DATA / "metadata_project_limitations.csv", index=False)

    conn.close()
    print(f"[SUCCESS] Exported all 18 Power BI tables to {POWERBI_DATA}.")


if __name__ == "__main__":
    prepare_powerbi_package()
