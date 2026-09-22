import json
from pathlib import Path

cells = []

def make_markdown_cell(source: str):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": source.splitlines(keepends=True)
    }

def make_code_cell(source: str):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": source.splitlines(keepends=True)
    }

# 1. Title & Context
cells.append(make_markdown_cell("""# Stage 6: State-Level Cybercrime Profile Clustering
**Project**: Cyber Crime Analytics for National Security  
**Data Source**: National Crime Records Bureau (NCRB) 2023 Master Dataset (`master_state_2023.csv`)  
**Methodological Position**: Unsupervised Profile Clustering on Standardized Composition Indicators ($N = 36$)

---

## 1. Objective & Scope

### Methodological Framing:
The objective of this stage is to identify **descriptive State/UT cybercrime profile groups** in the validated 2023 NCRB dataset using **K-Means clustering**.

### Critical Methodological Guardrails:
1. **Scale vs. Composition**: Clustering directly on raw case counts causes total crime volume / state population scale to dominate the Euclidean distance metric. To capture genuine *crime typology and motive composition*, clustering is performed on **non-redundant proportions and motive share indicators**.
2. **Descriptive Profile Groups**: Clusters describe groups of States/UTs with similar composition profiles in the observed 2023 cross-sectional dataset. They **do not** imply causality, geographic determinism, homogeneous intra-state behavior, or value judgments (e.g., no "high-risk" or "criminal" labels).
3. **Sample Size ($N = 36$)**: With 36 aggregate State/UT observations, clustering is evaluated across $K = 2$ through $8$ to balance silhouette cohesion and cluster granularity.
"""))

# 2. Setup and imports
cells.append(make_code_cell("""# Setup environment and imports
import os
import sys
from pathlib import Path

project_root = Path.cwd().resolve()
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Import Stage 6 clustering module
from src.clustering import (
    load_and_prepare_features,
    evaluate_k_range,
    fit_final_kmeans,
    generate_cluster_assignments,
    generate_cluster_profiles,
    plot_clustering_elbow,
    plot_clustering_silhouette,
    plot_cluster_sizes,
    plot_cluster_feature_profiles,
    plot_cluster_projection,
    export_clustering_outputs,
    CLUSTERING_FEATURES,
    FEATURE_DESCRIPTIONS,
    CLUSTER_DESCRIPTIONS_K4
)

print(f"Working Directory: {project_root}")
print("Clustering module loaded successfully.")
"""))

# 3. Dataset loading and feature inspection
cells.append(make_markdown_cell("""---
## Section B — Feature Selection & Distribution Inspection

### Feature Selection Rationale:
We select 4 non-overlapping, composition-based indicators that represent distinct legal and motivational dimensions:
1. **`it_act_share`**: Proportion of cases registered under the Information Technology Act vs. IPC (Legal framework composition).
2. **`fraud_motive_share`**: Proportion of cases driven by financial fraud motive (Dominant economic crime dimension).
3. **`extortion_motive_share`**: Proportion of cases driven by extortion / coercive threat motives (Violent/coercive dimension).
4. **`sexual_exploitation_motive_share`**: Proportion of cases driven by sexual exploitation / harassment motives (Interpersonal/morals dimension).
"""))

cells.append(make_code_cell("""# Load master dataset and prepare clustering features
data_path = project_root / 'data' / 'processed' / 'master_state_2023.csv'
raw_df, feature_summary, X_scaled, scaler, feature_cols = load_and_prepare_features(data_path)

print(f"Prepared clustering dataset with shape: {raw_df.shape} (36 States/UTs)")
print("\\n--- Candidate Feature Distribution Summary ---")
display(feature_summary[['feature_name', 'min', 'mean', 'median', 'max', 'std', 'skewness', 'description']])
"""))

cells.append(make_code_cell("""# Feature Correlation Matrix
corr_matrix = raw_df[feature_cols].corr()
print("--- Feature Correlation Matrix ---")
display(corr_matrix.round(3))
"""))

# 4. K-Means Evaluation
cells.append(make_markdown_cell("""---
## Section C — Candidate K Evaluation (Elbow & Silhouette Analysis)

To identify a reasonable number of clusters, we evaluate $K \\in [2, 8]$ using:
- **Inertia (Within-Cluster Sum of Squares)**: Measures cluster compactness.
- **Silhouette Coefficient**: Measures how well-separated and cohesive clusters are (ranges from $-1$ to $+1$).
- **Cluster Size Distribution**: Checks for excessive fragmentation or degenerate singletons.
"""))

cells.append(make_code_cell("""# Evaluate K from 2 to 8
eval_df = evaluate_k_range(X_scaled, k_range=range(2, 9), random_state=42)

print("--- K-Means Clustering Evaluation Table ---")
display(eval_df[['K', 'inertia', 'silhouette_score', 'cluster_sizes']])
"""))

cells.append(make_code_cell("""# Plot Elbow Method (K vs. Inertia)
fig_elbow = plot_clustering_elbow(
    eval_df,
    selected_k=4,
    save_path=str(project_root / 'outputs' / 'figures' / '15_clustering_elbow.png')
)
plt.show()
"""))

cells.append(make_code_cell("""# Plot Silhouette Analysis (K vs. Silhouette Score)
fig_silhouette = plot_clustering_silhouette(
    eval_df,
    selected_k=4,
    save_path=str(project_root / 'outputs' / 'figures' / '16_clustering_silhouette.png')
)
plt.show()
"""))

# 5. Selected K Rationale & Final Model
cells.append(make_markdown_cell("""---
## Section D — Selected K Rationale & Final Model Fitting

### Selection Justification for $K = 4$:
1. **Elbow Inflection**: Inertia drops sharply from $106.97$ ($K=2$) to $76.35$ ($K=3$) and $49.68$ ($K=4$), representing a $34.9\\%$ reduction from $K=3$ to $K=4$, after which marginal inertia reduction flattens.
2. **Silhouette Step-Up**: Silhouette score increases significantly from $0.2635$ ($K=3$) to **$0.3497$ ($K=4$)** ($+32.7\\%$ improvement).
3. **Substantive Interpretability**: $K=4$ segments the 36 State/UT observations into 4 distinct, interpretable profile archetypes without over-fragmenting the small sample.
"""))

cells.append(make_code_cell("""# Fit final K-Means model with K = 4
selected_k = 4
km_model, labels = fit_final_kmeans(X_scaled, n_clusters=selected_k, random_state=42)

# Generate assignments and profiles
assignments_df = generate_cluster_assignments(
    raw_df, X_scaled, labels, feature_cols, cluster_names=CLUSTER_DESCRIPTIONS_K4
)
profiles_df = generate_cluster_profiles(
    raw_df, labels, feature_cols, cluster_names=CLUSTER_DESCRIPTIONS_K4
)

print("--- Final Cluster Profiles (K = 4) ---")
display(profiles_df[['cluster_id', 'cluster_label', 'state_count', 'state_pct',
                     'it_act_share_mean', 'fraud_motive_share_mean',
                     'extortion_motive_share_mean', 'sexual_exploitation_motive_share_mean']])
"""))

cells.append(make_code_cell("""# Cluster Membership Breakdown
print("--- Cluster Members (States/UTs per Cluster) ---")
for cid in range(selected_k):
    sub = assignments_df[assignments_df['cluster_id'] == cid]
    c_name = CLUSTER_DESCRIPTIONS_K4[cid]
    print(f"\\nCluster {cid}: {c_name} (n = {len(sub)}, {len(sub)/36*100:.1f}%):")
    print("  " + ", ".join(sub['state_name'].tolist()))
"""))

# 6. Visualizations
cells.append(make_markdown_cell("""---
## Section E — Cluster Visualizations & Projections
"""))

cells.append(make_code_cell("""# Plot Cluster Sizes
fig_sizes = plot_cluster_sizes(
    assignments_df,
    cluster_names=CLUSTER_DESCRIPTIONS_K4,
    save_path=str(project_root / 'outputs' / 'figures' / '17_cluster_sizes.png')
)
plt.show()
"""))

cells.append(make_code_cell("""# Plot Comparative Feature Means Across Clusters
fig_profiles = plot_cluster_feature_profiles(
    profiles_df,
    feature_cols,
    save_path=str(project_root / 'outputs' / 'figures' / '18_cluster_feature_profiles.png')
)
plt.show()
"""))

cells.append(make_code_cell("""# Plot 2D PCA Projection of Cluster Space
fig_proj = plot_cluster_projection(
    X_scaled,
    assignments_df,
    cluster_names=CLUSTER_DESCRIPTIONS_K4,
    save_path=str(project_root / 'outputs' / 'figures' / '19_cluster_projection.png')
)
plt.show()
"""))

# 7. Descriptive Interpretation
cells.append(make_markdown_cell("""---
## Section F — Descriptive Profile Interpretation

### Cluster 0 ($n = 15$ States/UTs, $41.67\\%$): *IPC-Dominant, Moderate Fraud Profile*
- **Key Characteristics**: Characterized by lower IT Act share (mean $32.67\\%$, indicating predominance of IPC registrations such as Sec. 420 cheating), moderate Fraud motive share (mean $44.42\\%$), and low Extortion motive share ($2.76\\%$).
- **Representative Jurisdictions**: Maharashtra, Telangana, Bihar, Andhra Pradesh, Gujarat, Madhya Pradesh, Rajasthan, Delhi, West Bengal.

---

### Cluster 1 ($n = 12$ States/UTs, $33.33\\%$): *IT Act-Dominant, High Fraud Profile*
- **Key Characteristics**: Characterized by high IT Act share (mean $88.68\\%$) and high Fraud motive share (mean $71.61\\%$), with low Extortion ($1.94\\%$) and moderate Sexual Exploitation ($10.53\\%$).
- **Representative Jurisdictions**: Karnataka, Tamil Nadu, Jharkhand, Goa, Himachal Pradesh, Arunachal Pradesh, Mizoram, Nagaland, Puducherry.

---

### Cluster 2 ($n = 2$ States/UTs, $5.56\\%$): *Sexual Exploitation-Dominant Micro-Profile*
- **Key Characteristics**: Characterized by $100.00\\%$ IT Act share, $0.00\\%$ Fraud motive, and high Sexual Exploitation motive share (mean $91.67\\%$).
- **Representative Jurisdictions**: Dadra and Nagar Haveli and Daman and Diu ($6$ total cases), Lakshadweep ($1$ total case).

---

### Cluster 3 ($n = 7$ States/UTs, $19.44\\%$): *Elevated Extortion Motive Profile*
- **Key Characteristics**: Characterized by moderate-to-high IT Act share (mean $74.40\\%$), moderate Fraud motive ($33.25\\%$), and distinctly elevated Extortion motive share (mean $12.54\\%$, approximately $3\\times$ the national state average).
- **Representative Jurisdictions**: Uttar Pradesh, Assam, Punjab, Kerala, Uttarakhand, Sikkim, Chandigarh.
"""))

# 8. Export and validation
cells.append(make_code_cell("""# Export Tables for Downstream Analysis and Power BI
exported_tables = export_clustering_outputs(
    eval_df=eval_df,
    assignments_df=assignments_df,
    profiles_df=profiles_df,
    output_dir=str(project_root / 'outputs' / 'tables')
)

print("Exported Clustering Output Tables:")
for k, v in exported_tables.items():
    p = Path(v)
    print(f"  - {k:<15}: {p.name} ({p.stat().st_size:,} bytes)")
"""))

# 9. Methodological Limitations
cells.append(make_markdown_cell("""---
## Section G — Methodological Limitations & Analytical Boundaries

### Explicit Constraints:
1. **Sample Size ($N = 36$)**: Observations are aggregate State/UT jurisdictions for the single reporting year 2023. Small sample size limits the complexity of cluster boundaries.
2. **Composition vs. Absolute Volume**: These clusters group states based on *relative legal and motivational composition*. States with vastly different absolute case totals (e.g. Karnataka vs. Mizoram) can belong to the same cluster if their proportional profiles are similar.
3. **K-Means Geometric Assumptions**: K-Means assumes spherical clusters of approximately equal variance in standardized space.
4. **Descriptive, Non-Causal Nature**: Clusters represent statistical groupings in the observed cross-sectional dataset. They do not test causal mechanisms or explain why specific profiles emerge.
"""))

nb_dict = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.13.0"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 5
}

nb_path = Path('notebooks/05_clustering.ipynb')
nb_path.parent.mkdir(parents=True, exist_ok=True)
with open(nb_path, 'w', encoding='utf-8') as f:
    json.dump(nb_dict, f, indent=2)

print(f'Wrote notebook to {nb_path}')
