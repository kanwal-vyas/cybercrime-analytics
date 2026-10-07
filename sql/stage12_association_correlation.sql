-- ============================================================================
-- sql/stage12_association_correlation.sql
-- Cyber Crime Analytics for National Security
-- Stage 12: Advanced Frequent Pattern Mining & Correlation Analysis
-- ============================================================================

-- Enforce foreign keys
PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. EXTRACT ANALYTICAL FEATURE MATRIX FOR CORRELATION ANALYSIS
-- ----------------------------------------------------------------------------
-- Extracts 10 volume counts and statutory shares for Pearson / Spearman correlation
SELECT 
    s.state_id,
    s.state_name,
    s.is_ut,
    -- Volume Counts
    SUM(f.cases) AS total_cases,
    SUM(CASE WHEN c.act_group = 'IT Act' THEN f.cases ELSE 0 END) AS it_act_cases,
    SUM(CASE WHEN c.act_group = 'IPC' THEN f.cases ELSE 0 END) AS ipc_cases,
    SUM(CASE WHEN c.category_raw_name LIKE '%Section 66D%' THEN f.cases ELSE 0 END) AS sec66d_cheating_personation,
    SUM(CASE WHEN c.category_raw_name LIKE '%Section 66C%' THEN f.cases ELSE 0 END) AS sec66c_identity_theft,
    -- Composition Shares
    ROUND(1.0 * SUM(CASE WHEN c.act_group = 'IT Act' THEN f.cases ELSE 0 END) / NULLIF(SUM(f.cases), 0), 4) AS it_act_share
FROM fact_cybercrime_category_2023 f
JOIN dim_state s ON f.state_id = s.state_id
JOIN dim_crime_category c ON f.category_id = c.category_id
WHERE c.is_leaf = 1
GROUP BY s.state_id, s.state_name, s.is_ut
ORDER BY total_cases DESC;


-- ----------------------------------------------------------------------------
-- 2. TRANSACTION ITEM FREQUENCY AUDIT (MEDIAN SPLIT SUPPORTS)
-- ----------------------------------------------------------------------------
-- Validates transaction item support counts across the 36 State/UT transactions
WITH state_metrics AS (
    SELECT 
        s.state_id,
        s.state_name,
        SUM(f.cases) AS total_cases,
        SUM(CASE WHEN c.act_group = 'IT Act' THEN f.cases ELSE 0 END) AS it_act_cases,
        SUM(CASE WHEN c.category_raw_name LIKE '%Section 66D%' THEN f.cases ELSE 0 END) AS sec66d_cases
    FROM fact_cybercrime_category_2023 f
    JOIN dim_state s ON f.state_id = s.state_id
    JOIN dim_crime_category c ON f.category_id = c.category_id
    WHERE c.is_leaf = 1
    GROUP BY s.state_id, s.state_name
)
SELECT 
    COUNT(*) AS total_transactions,
    SUM(CASE WHEN it_act_cases >= 193.5 THEN 1 ELSE 0 END) AS high_it_act_transactions,
    SUM(CASE WHEN sec66d_cases >= 37.5 THEN 1 ELSE 0 END) AS high_sec66d_transactions
FROM state_metrics;
