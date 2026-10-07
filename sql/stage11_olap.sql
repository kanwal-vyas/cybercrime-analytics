-- ============================================================================
-- sql/stage11_olap.sql
-- Cyber Crime Analytics for National Security
-- Stage 11: Advanced OLAP & Multidimensional Data Cube Analysis
-- ============================================================================

-- Enforce foreign keys
PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. BASE CUBOIDS
-- ----------------------------------------------------------------------------

-- 1.1 Primary Base Cuboid: State × Leaf Category (2023)
-- Grain: One row per State/UT (36) and Leaf Category (40) = 1,440 tuples
SELECT 
    s.state_id,
    s.state_name,
    s.is_ut,
    c.category_id,
    c.category_display_name,
    c.act_group,
    c.parent_category,
    f.cases
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
ORDER BY s.state_id, c.category_id;


-- ----------------------------------------------------------------------------
-- 2. ROLL-UP OPERATIONS (Dimension Hierarchy Traversal)
-- ----------------------------------------------------------------------------

-- 2.1 Roll-Up Cuboid: State × Act Group (2023)
-- Aggregates 40 leaf categories into 3 Act Groups per State/UT = 108 tuples
SELECT 
    s.state_id,
    s.state_name,
    s.is_ut,
    c.act_group,
    COUNT(DISTINCT c.category_id) AS leaf_categories_count,
    SUM(f.cases) AS total_cases
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY s.state_id, s.state_name, s.is_ut, c.act_group
ORDER BY s.state_id, c.act_group;

-- 2.2 Roll-Up Cuboid: National × Act Group (2023)
-- Roll-up across all 36 States/UTs to National Act Group totals = 3 tuples
WITH national_total AS (
    SELECT SUM(f.cases) AS grand_total_cases
    FROM fact_cybercrime_category_2023 f
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.is_leaf = 1
)
SELECT 
    c.act_group,
    COUNT(DISTINCT c.category_id) AS leaf_categories_count,
    SUM(f.cases) AS total_cases,
    ROUND(100.0 * SUM(f.cases) / (SELECT grand_total_cases FROM national_total), 2) AS national_share_pct
FROM fact_cybercrime_category_2023 f
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY c.act_group
ORDER BY total_cases DESC;

-- 2.3 Roll-Up Cuboid: Administrative Type (State vs UT) × Act Group (2023)
-- Aggregates 36 jurisdictions into 2 Admin Types × 3 Act Groups = 6 tuples
WITH national_total AS (
    SELECT SUM(f.cases) AS grand_total_cases
    FROM fact_cybercrime_category_2023 f
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.is_leaf = 1
)
SELECT 
    CASE WHEN s.is_ut = 1 THEN 'Union Territory (8)' ELSE 'State (28)' END AS admin_type,
    c.act_group,
    COUNT(DISTINCT s.state_id) AS jurisdictions_count,
    SUM(f.cases) AS total_cases,
    ROUND(100.0 * SUM(f.cases) / (SELECT grand_total_cases FROM national_total), 2) AS national_share_pct
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY s.is_ut, c.act_group
ORDER BY s.is_ut ASC, total_cases DESC;


-- ----------------------------------------------------------------------------
-- 3. DRILL-DOWN OPERATIONS (Decomposition along Hierarchy)
-- ----------------------------------------------------------------------------

-- 3.1 Drill-Down: National Total -> IT Act -> Section 66D Personation -> State/UT Decomposition
SELECT 
    s.state_name,
    s.is_ut,
    c.act_group,
    c.category_display_name,
    c.section_reference,
    f.cases,
    ROUND(100.0 * f.cases / SUM(f.cases) OVER (), 2) AS pct_of_category_national
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.category_raw_name = 'Cheating by personation by using computer resource (Section 66D)'
ORDER BY f.cases DESC;


-- ----------------------------------------------------------------------------
-- 4. SLICE OPERATIONS (Single Dimension Restriction)
-- ----------------------------------------------------------------------------

-- 4.1 Slice 1: Act Group = 'IT Act'
SELECT 
    s.state_name,
    SUM(f.cases) AS it_act_cases
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1 AND c.act_group = 'IT Act'
GROUP BY s.state_name
ORDER BY it_act_cases DESC;

-- 4.2 Slice 2: Administrative Type = 'Union Territory' (is_ut = 1)
SELECT 
    s.state_name,
    c.act_group,
    SUM(f.cases) AS cases
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1 AND s.is_ut = 1
GROUP BY s.state_name, c.act_group
ORDER BY s.state_name, c.act_group;


-- ----------------------------------------------------------------------------
-- 5. DICE OPERATIONS (Multi-Dimensional Sub-Cube Extraction)
-- ----------------------------------------------------------------------------

-- 5.1 Dice: Top 5 Volume States × Major Act Groups ('IT Act', 'IPC')
WITH top_states AS (
    SELECT s.state_id, s.state_name
    FROM fact_cybercrime_category_2023 f
    JOIN dim_state s ON f.state_id = s.state_id
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.is_leaf = 1
    GROUP BY s.state_id, s.state_name
    ORDER BY SUM(f.cases) DESC
    LIMIT 5
)
SELECT 
    ts.state_name,
    c.act_group,
    SUM(f.cases) AS cases
FROM fact_cybercrime_category_2023 f
JOIN top_states ts ON f.state_id = ts.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1 AND c.act_group IN ('IT Act', 'IPC')
GROUP BY ts.state_name, c.act_group
ORDER BY ts.state_name, c.act_group;


-- ----------------------------------------------------------------------------
-- 6. PIVOT (Cross-Tabulation: State/UT × Act Groups)
-- ----------------------------------------------------------------------------

SELECT 
    s.state_id,
    s.state_name,
    s.is_ut,
    SUM(CASE WHEN c.act_group = 'IT Act' THEN f.cases ELSE 0 END) AS it_act_cases,
    SUM(CASE WHEN c.act_group = 'IPC' THEN f.cases ELSE 0 END) AS ipc_cases,
    SUM(CASE WHEN c.act_group = 'SLL' THEN f.cases ELSE 0 END) AS sll_cases,
    SUM(f.cases) AS total_leaf_cases
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY s.state_id, s.state_name, s.is_ut
ORDER BY total_leaf_cases DESC;


-- ----------------------------------------------------------------------------
-- 7. ATTRIBUTE-ORIENTED INDUCTION (AOI)
-- ----------------------------------------------------------------------------

-- Generalizes Base Relation (1,440 tuples) to Higher Concept Levels:
-- State/UT -> Admin Type ('State (28)' vs 'Union Territory (8)')
-- Crime Category (40 leaves) -> Act Group ('IT Act', 'IPC', 'SLL')
-- Result: 6 generalized concept tuples with support measures
WITH aoi_base AS (
    SELECT 
        CASE WHEN s.is_ut = 1 THEN 'Union Territory' ELSE 'State' END AS generalized_admin_type,
        c.act_group AS generalized_act_group,
        f.cases
    FROM fact_cybercrime_category_2023 f
    JOIN dim_state s ON f.state_id = s.state_id
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.is_leaf = 1
),
national_agg AS (
    SELECT SUM(cases) AS total_cases_sum FROM aoi_base
)
SELECT 
    generalized_admin_type,
    generalized_act_group,
    COUNT(*) AS underlying_leaf_records_count,
    SUM(cases) AS aggregated_cases,
    ROUND(AVG(cases), 2) AS mean_cases_per_leaf_record,
    ROUND(100.0 * SUM(cases) / (SELECT total_cases_sum FROM national_agg), 2) AS national_share_pct
FROM aoi_base
GROUP BY generalized_admin_type, generalized_act_group
ORDER BY generalized_admin_type, aggregated_cases DESC;


-- ----------------------------------------------------------------------------
-- 8. ICEBERG CUBOID (Selective Materialization Optimization)
-- ----------------------------------------------------------------------------

-- Prunes low-measure tuples, keeping only State × Category tuples with >= 1,000 cases
SELECT 
    s.state_name,
    c.act_group,
    c.category_display_name,
    f.cases,
    ROUND(100.0 * f.cases / 86420.0, 2) AS pct_of_national_total
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1 AND f.cases >= 1000
ORDER BY f.cases DESC;
