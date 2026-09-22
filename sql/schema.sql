-- ============================================================================
-- schema.sql
-- Cyber Crime Analytics for National Security
-- Stage 3: Data Warehouse & OLAP Schema
-- ============================================================================

-- Enforce SQLite foreign key constraints
PRAGMA foreign_keys = ON;

-- ----------------------------------------------------------------------------
-- 1. DIMENSION TABLES
-- ----------------------------------------------------------------------------

-- Dimension: Geographic States and Union Territories of India
DROP TABLE IF EXISTS dim_state;
CREATE TABLE dim_state (
    state_id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_name TEXT NOT NULL UNIQUE,
    is_ut INTEGER NOT NULL CHECK (is_ut IN (0, 1)) DEFAULT 0
);

-- Dimension: Temporal Years
DROP TABLE IF EXISTS dim_year;
CREATE TABLE dim_year (
    year_id INTEGER PRIMARY KEY AUTOINCREMENT,
    year INTEGER NOT NULL UNIQUE
);

-- Dimension: Crime Categories with hierarchical metadata and leaf flags
DROP TABLE IF EXISTS dim_crime_category;
CREATE TABLE dim_crime_category (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_raw_name TEXT NOT NULL UNIQUE,
    category_display_name TEXT NOT NULL,
    act_group TEXT NOT NULL CHECK (act_group IN ('IT Act', 'IPC', 'SLL', 'Grand Total')),
    parent_category TEXT,
    is_leaf INTEGER NOT NULL CHECK (is_leaf IN (0, 1)) DEFAULT 1,
    section_reference TEXT
);

-- Dimension: Cyber Crime Motives (Table 9A.3)
DROP TABLE IF EXISTS dim_motive;
CREATE TABLE dim_motive (
    motive_id INTEGER PRIMARY KEY AUTOINCREMENT,
    motive_raw_name TEXT NOT NULL UNIQUE,
    motive_display_name TEXT NOT NULL,
    is_total INTEGER NOT NULL CHECK (is_total IN (0, 1)) DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- 2. FACT TABLES
-- ----------------------------------------------------------------------------

-- Fact: 2023 State-wise Cyber Crime by Crime Category (Table 9A.2)
-- Grain: One observation per (State/UT, Year, Crime Category)
DROP TABLE IF EXISTS fact_cybercrime_category_2023;
CREATE TABLE fact_cybercrime_category_2023 (
    fact_id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    year_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    cases INTEGER NOT NULL CHECK (cases >= 0),
    FOREIGN KEY (state_id) REFERENCES dim_state (state_id) ON DELETE RESTRICT,
    FOREIGN KEY (year_id) REFERENCES dim_year (year_id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES dim_crime_category (category_id) ON DELETE RESTRICT,
    UNIQUE (state_id, year_id, category_id)
);

-- Fact: 2023 State-wise Cyber Crime Motives (Table 9A.3)
-- Grain: One observation per (State/UT, Year, Motive)
DROP TABLE IF EXISTS fact_cybercrime_motive_2023;
CREATE TABLE fact_cybercrime_motive_2023 (
    fact_id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    year_id INTEGER NOT NULL,
    motive_id INTEGER NOT NULL,
    motive_count INTEGER NOT NULL CHECK (motive_count >= 0),
    FOREIGN KEY (state_id) REFERENCES dim_state (state_id) ON DELETE RESTRICT,
    FOREIGN KEY (year_id) REFERENCES dim_year (year_id) ON DELETE RESTRICT,
    FOREIGN KEY (motive_id) REFERENCES dim_motive (motive_id) ON DELETE RESTRICT,
    UNIQUE (state_id, year_id, motive_id)
);

-- Fact: Historical Cyber Crime Trend 2018-2022 (Rajya Sabha Dataset)
-- Grain: One observation per (State/UT, Year)
-- Note: Ladakh 2018/2019 are NULL (structural gap prior to UT formation)
DROP TABLE IF EXISTS fact_cybercrime_trend;
CREATE TABLE fact_cybercrime_trend (
    fact_id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER NOT NULL,
    year INTEGER NOT NULL,
    cases INTEGER CHECK (cases >= 0 OR cases IS NULL),
    FOREIGN KEY (state_id) REFERENCES dim_state (state_id) ON DELETE RESTRICT,
    UNIQUE (state_id, year)
);

-- ----------------------------------------------------------------------------
-- 3. INDEXES FOR QUERY OPTIMIZATION
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_fact_cat_state ON fact_cybercrime_category_2023 (state_id);
CREATE INDEX IF NOT EXISTS idx_fact_cat_category ON fact_cybercrime_category_2023 (category_id);
CREATE INDEX IF NOT EXISTS idx_fact_motive_state ON fact_cybercrime_motive_2023 (state_id);
CREATE INDEX IF NOT EXISTS idx_fact_motive_motive ON fact_cybercrime_motive_2023 (motive_id);
CREATE INDEX IF NOT EXISTS idx_fact_trend_state_year ON fact_cybercrime_trend (state_id, year);
