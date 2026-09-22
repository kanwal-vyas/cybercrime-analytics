-- ============================================================================
-- analysis_queries.sql
-- Cyber Crime Analytics for National Security
-- Stage 3: Analytical SQL Queries & OLAP Demonstrations
-- ============================================================================

-- ============================================================================
-- SECTION 1: BASIC AGGREGATIONS & RANKINGS
-- ============================================================================

-- 1.1 Top 10 States/UTs by Total Cyber Crime Burden (2023)
SELECT 
    s.state_name,
    s.is_ut,
    SUM(f.cases) AS total_cases,
    ROUND(100.0 * SUM(f.cases) / (
        SELECT SUM(f2.cases) 
        FROM fact_cybercrime_category_2023 f2 
        JOIN dim_crime_category c2 ON f2.category_id = c2.category_id 
        WHERE c2.is_leaf = 1
    ), 2) AS national_share_pct
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY s.state_id, s.state_name, s.is_ut
ORDER BY total_cases DESC
LIMIT 10;

-- 1.2 Top 10 Crime Categories by National Volume (2023)
SELECT 
    c.category_display_name,
    c.act_group,
    SUM(f.cases) AS total_cases,
    COUNT(CASE WHEN f.cases > 0 THEN 1 END) AS states_with_cases
FROM fact_cybercrime_category_2023 f
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY c.category_id, c.category_display_name, c.act_group
ORDER BY total_cases DESC
LIMIT 10;

-- 1.3 Distribution of Motives Across India (2023)
SELECT 
    m.motive_display_name,
    SUM(f.motive_count) AS total_motives,
    ROUND(100.0 * SUM(f.motive_count) / (
        SELECT SUM(f2.motive_count) 
        FROM fact_cybercrime_motive_2023 f2 
        JOIN dim_motive m2 ON f2.motive_id = m2.motive_id 
        WHERE m2.is_total = 0
    ), 2) AS share_pct
FROM fact_cybercrime_motive_2023 f
JOIN dim_motive m ON f.motive_id = m.motive_id
WHERE m.is_total = 0
GROUP BY m.motive_id, m.motive_display_name
ORDER BY total_motives DESC;


-- ============================================================================
-- SECTION 2: FILTERING WITH WHERE, HAVING, AND COMPLEX JOINS
-- ============================================================================

-- 2.1 States with High Cybercrime Burden (> 2,000 cases in 2023) using HAVING
SELECT 
    s.state_name,
    SUM(f.cases) AS total_leaf_cases,
    COUNT(DISTINCT CASE WHEN f.cases > 0 THEN f.category_id END) AS distinct_crime_types_active
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY s.state_id, s.state_name
HAVING SUM(f.cases) > 2000
ORDER BY total_leaf_cases DESC;

-- 2.2 Ransomware Incidents by State (Multi-table JOIN with targeted filter)
SELECT 
    s.state_name,
    c.category_display_name,
    c.section_reference,
    f.cases AS ransomware_cases
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.category_display_name LIKE '%Ransom-ware%'
  AND f.cases > 0
ORDER BY f.cases DESC;


-- ============================================================================
-- SECTION 3: OLAP DEMONSTRATION
-- (Note: Specific dimension values such as state, motive, or crime groups
-- in this section are demonstration parameters selected to illustrate OLAP capabilities)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 3.1 ROLL-UP Operation:
-- Aggregation up the dimensional hierarchy:
-- Leaf Category -> Act Group -> National Grand Total
-- ----------------------------------------------------------------------------
-- Level 1: Legal Act Group Roll-Up
SELECT 
    c.act_group,
    COUNT(DISTINCT c.category_id) AS leaf_categories_count,
    SUM(f.cases) AS total_cases,
    ROUND(100.0 * SUM(f.cases) / (
        SELECT SUM(f_all.cases) 
        FROM fact_cybercrime_category_2023 f_all 
        JOIN dim_crime_category c_all ON f_all.category_id = c_all.category_id 
        WHERE c_all.is_leaf = 1
    ), 2) AS act_share_pct
FROM fact_cybercrime_category_2023 f
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY c.act_group
ORDER BY total_cases DESC;

-- Level 2: State vs UT Roll-Up
SELECT 
    CASE WHEN s.is_ut = 1 THEN 'Union Territory' ELSE 'State' END AS administrative_type,
    COUNT(DISTINCT s.state_id) AS entity_count,
    SUM(f.cases) AS total_cases,
    ROUND(AVG(state_totals.total_cases), 2) AS avg_cases_per_entity
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
JOIN (
    SELECT f2.state_id, SUM(f2.cases) AS total_cases
    FROM fact_cybercrime_category_2023 f2
    JOIN dim_crime_category c2 ON f2.category_id = c2.category_id
    WHERE c2.is_leaf = 1
    GROUP BY f2.state_id
) state_totals ON s.state_id = state_totals.state_id
WHERE c.is_leaf = 1
GROUP BY s.is_ut;

-- ----------------------------------------------------------------------------
-- 3.2 DRILL-DOWN Operation (Demonstration Selection: State = 'Telangana'):
-- Navigating from state-level totals down to specific crime categories and sections.
-- ----------------------------------------------------------------------------
SELECT 
    s.state_name,
    c.act_group,
    c.category_display_name,
    c.section_reference,
    f.cases,
    ROUND(100.0 * f.cases / NULLIF(state_act.act_total, 0), 2) AS pct_of_state_it_act
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
JOIN (
    SELECT f3.state_id, SUM(f3.cases) AS act_total
    FROM fact_cybercrime_category_2023 f3
    JOIN dim_crime_category c3 ON f3.category_id = c3.category_id
    WHERE c3.is_leaf = 1 AND c3.act_group = 'IT Act'
    GROUP BY f3.state_id
) state_act ON s.state_id = state_act.state_id
WHERE s.state_name = 'Telangana' 
  AND c.act_group = 'IT Act' 
  AND c.is_leaf = 1
ORDER BY f.cases DESC;

-- ----------------------------------------------------------------------------
-- 3.3 SLICE Operation (Demonstration Selection: Motive = 'Fraud'):
-- Fixing one dimension to a single coordinate.
-- ----------------------------------------------------------------------------
SELECT 
    s.state_name,
    m.motive_display_name,
    f.motive_count AS fraud_motive_cases,
    ROUND(100.0 * f.motive_count / (
        SELECT SUM(f_fr.motive_count) 
        FROM fact_cybercrime_motive_2023 f_fr 
        JOIN dim_motive m_fr ON f_fr.motive_id = m_fr.motive_id 
        WHERE m_fr.motive_raw_name = 'motive__Fraud'
    ), 2) AS share_of_national_fraud
FROM fact_cybercrime_motive_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_motive m ON f.motive_id = m.motive_id
WHERE m.motive_raw_name = 'motive__Fraud'
ORDER BY f.motive_count DESC
LIMIT 10;

-- ----------------------------------------------------------------------------
-- 3.4 DICE Operation (Multi-Dimensional Sub-Cube):
-- Sub-cube defined across:
-- Dimension 1 (State): Dynamically computed Top 4 States by 2023 volume
-- Dimension 2 (Crime Categories): Major Financial / Fraud Categories
-- Dimension 3 (Time): Year 2023
-- ----------------------------------------------------------------------------
WITH top_4_states AS (
    SELECT f_sub.state_id
    FROM fact_cybercrime_category_2023 f_sub
    JOIN dim_crime_category c_sub ON f_sub.category_id = c_sub.category_id
    WHERE c_sub.is_leaf = 1
    GROUP BY f_sub.state_id
    ORDER BY SUM(f_sub.cases) DESC
    LIMIT 4
)
SELECT 
    s.state_name,
    c.category_display_name,
    f.cases
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
JOIN top_4_states t4 ON s.state_id = t4.state_id
WHERE (
    c.category_display_name LIKE '%Fraud%'
    OR c.category_display_name LIKE '%Cheating%'
    OR c.category_display_name LIKE '%Identity Theft%'
)
AND c.is_leaf = 1
ORDER BY s.state_name, f.cases DESC;

-- ----------------------------------------------------------------------------
-- 3.5 PIVOT / Cross-Tabulation (State x Act Group Composition)
-- ----------------------------------------------------------------------------
SELECT 
    s.state_name,
    SUM(CASE WHEN c.act_group = 'IT Act' THEN f.cases ELSE 0 END) AS it_act_cases,
    SUM(CASE WHEN c.act_group = 'IPC' THEN f.cases ELSE 0 END) AS ipc_cases,
    SUM(CASE WHEN c.act_group = 'SLL' THEN f.cases ELSE 0 END) AS sll_cases,
    SUM(f.cases) AS total_leaf_cases,
    ROUND(100.0 * SUM(CASE WHEN c.act_group = 'IT Act' THEN f.cases ELSE 0 END) / NULLIF(SUM(f.cases), 0), 1) AS it_act_pct,
    ROUND(100.0 * SUM(CASE WHEN c.act_group = 'IPC' THEN f.cases ELSE 0 END) / NULLIF(SUM(f.cases), 0), 1) AS ipc_pct,
    ROUND(100.0 * SUM(CASE WHEN c.act_group = 'SLL' THEN f.cases ELSE 0 END) / NULLIF(SUM(f.cases), 0), 1) AS sll_pct
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY s.state_id, s.state_name
ORDER BY total_leaf_cases DESC;
