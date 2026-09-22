-- ============================================================================
-- views.sql
-- Cyber Crime Analytics for National Security
-- Stage 3: Analytical Views & OLAP Abstractions
-- ============================================================================

-- ----------------------------------------------------------------------------
-- View 1: State Cyber Crime Summary (2023)
-- Aggregates leaf categories per state, compares with official Grand Total,
-- and summarizes broad legal act components and total motives.
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS vw_state_cybercrime_summary;
CREATE VIEW vw_state_cybercrime_summary AS
WITH leaf_summary AS (
    SELECT 
        f.state_id,
        SUM(f.cases) AS total_leaf_cases,
        SUM(CASE WHEN c.act_group = 'IT Act' THEN f.cases ELSE 0 END) AS it_act_cases,
        SUM(CASE WHEN c.act_group = 'IPC' THEN f.cases ELSE 0 END) AS ipc_cases,
        SUM(CASE WHEN c.act_group = 'SLL' THEN f.cases ELSE 0 END) AS sll_cases
    FROM fact_cybercrime_category_2023 f
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.is_leaf = 1
    GROUP BY f.state_id
),
official_total AS (
    SELECT 
        f.state_id,
        f.cases AS reported_grand_total
    FROM fact_cybercrime_category_2023 f
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.act_group = 'Grand Total'
),
motive_total AS (
    SELECT 
        f.state_id,
        f.motive_count AS total_motives_reported
    FROM fact_cybercrime_motive_2023 f
    JOIN dim_motive m ON f.motive_id = m.motive_id
    WHERE m.is_total = 1
)
SELECT 
    s.state_id,
    s.state_name,
    s.is_ut,
    ot.reported_grand_total,
    ls.total_leaf_cases,
    (ls.total_leaf_cases - ot.reported_grand_total) AS reconciliation_diff,
    ls.it_act_cases,
    ROUND(100.0 * ls.it_act_cases / NULLIF(ls.total_leaf_cases, 0), 2) AS it_act_share_pct,
    ls.ipc_cases,
    ROUND(100.0 * ls.ipc_cases / NULLIF(ls.total_leaf_cases, 0), 2) AS ipc_share_pct,
    ls.sll_cases,
    ROUND(100.0 * ls.sll_cases / NULLIF(ls.total_leaf_cases, 0), 2) AS sll_share_pct,
    mt.total_motives_reported
FROM dim_state s
LEFT JOIN leaf_summary ls ON s.state_id = ls.state_id
LEFT JOIN official_total ot ON s.state_id = ot.state_id
LEFT JOIN motive_total mt ON s.state_id = mt.state_id;

-- ----------------------------------------------------------------------------
-- View 2: Crime Category National Summary (2023)
-- National total cases, prevalence across states, and % share of national volume.
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS vw_category_cybercrime_summary;
CREATE VIEW vw_category_cybercrime_summary AS
WITH national_total AS (
    SELECT SUM(f.cases) AS india_total_leaf_cases
    FROM fact_cybercrime_category_2023 f
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.is_leaf = 1
)
SELECT 
    c.category_id,
    c.category_display_name,
    c.act_group,
    c.parent_category,
    c.is_leaf,
    c.section_reference,
    SUM(f.cases) AS national_cases,
    COUNT(CASE WHEN f.cases > 0 THEN 1 END) AS states_reporting_cases,
    ROUND(100.0 * SUM(f.cases) / (SELECT india_total_leaf_cases FROM national_total), 2) AS national_share_pct
FROM dim_crime_category c
JOIN fact_cybercrime_category_2023 f ON c.category_id = f.category_id
GROUP BY c.category_id, c.category_display_name, c.act_group, c.parent_category, c.is_leaf, c.section_reference;

-- ----------------------------------------------------------------------------
-- View 3: Act Group National Roll-Up (2023)
-- Roll-up of cybercrimes into high-level legal frameworks (IT Act vs IPC vs SLL).
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS vw_act_group_summary;
CREATE VIEW vw_act_group_summary AS
WITH national_total AS (
    SELECT SUM(f.cases) AS india_total_leaf_cases
    FROM fact_cybercrime_category_2023 f
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.is_leaf = 1
)
SELECT 
    c.act_group,
    COUNT(DISTINCT c.category_id) AS leaf_category_count,
    SUM(f.cases) AS total_cases,
    ROUND(100.0 * SUM(f.cases) / (SELECT india_total_leaf_cases FROM national_total), 2) AS share_pct
FROM dim_crime_category c
JOIN fact_cybercrime_category_2023 f ON c.category_id = f.category_id
WHERE c.is_leaf = 1
GROUP BY c.act_group;

-- ----------------------------------------------------------------------------
-- View 4: State-Category Denormalized Matrix (2023)
-- Ready for reporting, slicing, and Power BI visualization.
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS vw_state_category_analysis;
CREATE VIEW vw_state_category_analysis AS
SELECT 
    s.state_id,
    s.state_name,
    s.is_ut,
    y.year,
    c.category_id,
    c.category_display_name,
    c.act_group,
    c.parent_category,
    c.is_leaf,
    f.cases,
    sum_st.total_leaf_cases AS state_total_leaf_cases,
    ROUND(100.0 * f.cases / NULLIF(sum_st.total_leaf_cases, 0), 2) AS pct_of_state_total
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_year y ON f.year_id = y.year_id
JOIN dim_crime_category c ON f.category_id = c.category_id
JOIN (
    SELECT f2.state_id, SUM(f2.cases) AS total_leaf_cases
    FROM fact_cybercrime_category_2023 f2
    JOIN dim_crime_category c2 ON f2.category_id = c2.category_id
    WHERE c2.is_leaf = 1
    GROUP BY f2.state_id
) sum_st ON s.state_id = sum_st.state_id;

-- ----------------------------------------------------------------------------
-- View 5: Motive Summary (2023)
-- Distribution of cyber crime motives across India.
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS vw_motive_summary;
CREATE VIEW vw_motive_summary AS
WITH national_motive_total AS (
    SELECT SUM(f.motive_count) AS total_motives
    FROM fact_cybercrime_motive_2023 f
    JOIN dim_motive m ON f.motive_id = m.motive_id
    WHERE m.is_total = 0
)
SELECT 
    m.motive_id,
    m.motive_display_name,
    m.is_total,
    SUM(f.motive_count) AS national_motive_count,
    COUNT(CASE WHEN f.motive_count > 0 THEN 1 END) AS states_reporting,
    ROUND(100.0 * SUM(f.motive_count) / (SELECT total_motives FROM national_motive_total), 2) AS share_pct
FROM dim_motive m
JOIN fact_cybercrime_motive_2023 f ON m.motive_id = f.motive_id
GROUP BY m.motive_id, m.motive_display_name, m.is_total;

-- ----------------------------------------------------------------------------
-- View 6: Historical Trend Analysis (2018-2022) with YoY Growth
-- Uses SQLite window functions (LAG) to compute annual growth and changes.
-- ----------------------------------------------------------------------------
DROP VIEW IF EXISTS vw_historical_trend_growth;
CREATE VIEW vw_historical_trend_growth AS
WITH trend_with_lag AS (
    SELECT 
        s.state_id,
        s.state_name,
        s.is_ut,
        t.year,
        t.cases,
        LAG(t.cases, 1) OVER (PARTITION BY s.state_id ORDER BY t.year) AS prev_year_cases
    FROM fact_cybercrime_trend t
    JOIN dim_state s ON t.state_id = s.state_id
)
SELECT 
    state_id,
    state_name,
    is_ut,
    year,
    cases,
    prev_year_cases,
    (cases - prev_year_cases) AS yoy_case_change,
    ROUND(100.0 * (cases - prev_year_cases) / NULLIF(prev_year_cases, 0), 2) AS yoy_growth_pct
FROM trend_with_lag;
