"""
src
===

Reusable Python modules for the Cyber Crime Analytics for National Security
project. Each module corresponds to one stage of the analytics pipeline
described in README.md and PROJECT_PLAN.md.

Modules:
    data_loader        - Loading raw/processed data and DB connections.
    preprocessing       - Cleaning and transformation functions.
    eda                 - Exploratory analysis and visualization helpers.
    association_rules   - Apriori-based frequent pattern mining (conditional).
    clustering           - K-Means clustering support (conditional).
    prediction           - Classification/regression support (conditional).
    outlier_detection     - Outlier/anomaly detection support (conditional).

All modules are currently placeholders pending the Dataset Validation Gate
(see PROJECT_PLAN.md). Functions raise NotImplementedError until they can be
implemented against the real, supplied dataset without fabricating schema
assumptions.
"""
