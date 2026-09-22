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

# 1. Title & Scope
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
    run_sensitivity_diagnostics,
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

# 3. Feature Selection & Distribution Inspection
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
- **Silhouette Coefficient**: Measures how well-separated and cohesive clusters are.
- **Cluster Size Distribution**: Monitors cluster fragmentation and tiny groups ($n \\le 2$).
"""))

cells.append(make_code_cell("""# Evaluate K from 2 to 8
eval_df = evaluate_k_range(X_scaled, k_range=range(2, 9), random_state=42)

print("--- K-Means Clustering Evaluation Table ---")
display(eval_df[['K', 'inertia', 'silhouette_score', 'min_cluster_size', 'max_cluster_size', 'clusters_n_le_2', 'cluster_sizes']])
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

# 5. Selected K Rationale & Diagnostic Checks
cells.append(make_markdown_cell("""---
## Section D — Selected K Rationale & Sensitivity Diagnostics

### Selection Justification for $K = 4$:
- **Elbow Inflection**: Inertia drops by $34.9\\%$ from $K=3$ to $K=4$ ($76.35 \\to 49.68$), after which marginal inertia reduction slows.
- **Silhouette Coefficient Step-Up**: The silhouette coefficient steps up significantly from $0.2635$ ($K=3$) to **$0.3497$ ($K=4$)** ($+32.7\\%$ gain).
- **Interpretable Compromise**: While $K=5$, $7$, and $8$ yield marginally higher silhouette scores ($0.3632$, $0.3688$, $0.3771$), they introduce additional micro-clusters ($n \\le 2$) and over-fragment the small sample of $36$ jurisdictions without adding distinct profile interpretations. $K=4$ was selected as an interpretable compromise between cluster separation, elbow structure, and cluster fragmentation.
"""))

cells.append(make_code_cell("""# Diagnostic 1: Two-State Small-Denominator Cluster Inspection
print("--- Two-State Cluster Diagnostic (Cluster 2) ---")
two_states = raw_df[raw_df['state_name'].isin(['Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'])]
display(two_states[['state_name', 'total_cases', 'it_act_cases', 'motive_total', 'motive_fraud',
                    'motive_sexual_exploitation', 'it_act_share', 'sexual_exploitation_motive_share']])
"""))

cells.append(make_code_cell("""# Diagnostic 2: Sensitivity Analysis & Hungarian Membership Stability Audit
sens_df, stability_df = run_sensitivity_diagnostics(raw_df, X_scaled, feature_cols)
print("--- Clustering Sensitivity Summary Table ---")
display(sens_df[['model_name', 'sample_size', 'features_count', 'K', 'inertia', 'silhouette_score', 'cluster_sizes', 'agreement_vs_primary']])

print("\\n--- State-by-State Membership Stability Table (Hungarian Label Alignment) ---")
display(stability_df)
"""))

cells.append(make_code_cell("""# Membership Stability Summary Metrics
ablation_unchanged = (stability_df['ablation_changed'] == 'No').sum()
ablation_changed = (stability_df['ablation_changed'] == 'Yes').sum()
ablation_pct = (ablation_unchanged / 36) * 100

n34_sub = stability_df[stability_df['n34_changed'] != 'Excluded']
n34_unchanged = (n34_sub['n34_changed'] == 'No').sum()
n34_changed = (n34_sub['n34_changed'] == 'Yes').sum()
n34_pct = (n34_unchanged / 34) * 100

print(f"Feature Ablation (3-Feature K=4 vs Primary 4-Feature K=4):")
print(f"  - Unchanged: {ablation_unchanged} / 36 ({ablation_pct:.1f}%)")
print(f"  - Changed:   {ablation_changed} / 36 ({100 - ablation_pct:.1f}%)")
reassigned_ablation = stability_df[stability_df['ablation_changed'] == 'Yes']['state_name'].tolist()
print(f"  - Reassigned States/UTs: {', '.join(reassigned_ablation)}")

print(f"\\nSample Exclusion (N=34 vs Primary N=36):")
print(f"  - Unchanged: {n34_unchanged} / 34 ({n34_pct:.1f}%)")
print(f"  - Changed:   {n34_changed} / 34 ({100 - n34_pct:.1f}%)")
reassigned_n34 = n34_sub[n34_sub['n34_changed'] == 'Yes']['state_name'].tolist()
print(f"  - Reassigned States/UTs: {', '.join(reassigned_n34)}")
"""))

# 6. Final Model & Profile Generation
cells.append(make_markdown_cell("""---
## Section E — Final Cluster Model & Profiles ($K = 4$)
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

cells.append(make_code_cell("""# Cluster Membership Breakdown (State/UT Members)
print("--- Cluster Membership Breakdown (State/UT Members) ---")
for cid in range(selected_k):
    sub = assignments_df[assignments_df['cluster_id'] == cid]
    c_name = CLUSTER_DESCRIPTIONS_K4[cid]
    print(f"\\nCluster {cid}: {c_name} (n = {len(sub)}, {len(sub)/36*100:.1f}%):")
    print("  State/UT Members: " + ", ".join(sub['state_name'].tolist()))
"""))

# 7. Visualizations
cells.append(make_markdown_cell("""---
## Section F — Cluster Visualizations & Projections
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

cells.append(make_code_cell("""# Plot 2D PCA Projection of Cluster Space (Visualization Aid)
fig_proj = plot_cluster_projection(
    X_scaled,
    assignments_df,
    cluster_names=CLUSTER_DESCRIPTIONS_K4,
    save_path=str(project_root / 'outputs' / 'figures' / '19_cluster_projection.png')
)
plt.show()
"""))

# 8. Descriptive Interpretation
cells.append(make_markdown_cell("""---
## Section G — Descriptive Profile Interpretation

### Cluster 0 ($n = 15$ States/UTs, $41.67\\%$): *Lower IT Act Share / Moderate Fraud Share Profile*
- **Key Feature Characteristics**: Lowest mean IT Act share ($32.67\\%$, indicating predominance of IPC registrations such as Sec. 420 cheating), moderate mean Fraud motive share ($44.42\\%$), low mean Extortion motive share ($2.76\\%$), and moderate Sexual Exploitation motive share ($11.03\\%$).
- **State/UT Members**: Maharashtra, Telangana, Bihar, Andhra Pradesh, Gujarat, Madhya Pradesh, Rajasthan, Delhi, West Bengal, Odisha, Chhattisgarh, Haryana, Manipur, Ladakh, Andaman and Nicobar Islands.

---

### Cluster 1 ($n = 12$ States/UTs, $33.33\\%$): *Higher IT Act Share / Higher Fraud Share Profile*
- **Key Feature Characteristics**: Highest mean IT Act share ($88.68\\%$) and highest mean Fraud motive share ($71.61\\%$), with low mean Extortion motive share ($1.94\\%$) and moderate Sexual Exploitation motive share ($10.53\\%$).
- **State/UT Members**: Karnataka, Tamil Nadu, Jharkhand, Goa, Himachal Pradesh, Arunachal Pradesh, Mizoram, Nagaland, Meghalaya, Tripura, Jammu and Kashmir, Puducherry.

---

### Cluster 2 ($n = 2$ States/UTs, $5.56\\%$): *High Sexual-Exploitation Share / Small-Denominator Profile*
- **Key Feature Characteristics**: Highest mean Sexual Exploitation motive share ($91.67\\%$) and $100.00\\%$ IT Act share, with $0.00\\%$ Fraud motive share.
- **State/UT Members**: Dadra and Nagar Haveli and Daman and Diu ($6$ total reported cases), Lakshadweep ($1$ total reported case).
- **Substantive Caution**: This cluster reflects high proportional concentration in jurisdictions with very small total case counts ($N=6$ and $N=1$), **not high crime volume**.

---

### Cluster 3 ($n = 7$ States/UTs, $19.44\\%$): *Higher Extortion Motive Share Profile*
- **Key Feature Characteristics**: Distinctly elevated mean Extortion motive share ($12.54\\%$, approximately $3\\times$ the national state average of $4.24\\%$), moderate-to-high mean IT Act share ($74.40\\%$), moderate Fraud motive share ($33.25\\%$), and moderate Sexual Exploitation motive share ($14.38\\%$).
- **State/UT Members**: Uttar Pradesh, Assam, Punjab, Kerala, Uttarakhand, Sikkim, Chandigarh.
"""))

# 9. Export & Validation
cells.append(make_code_cell("""# Export Tables for Downstream Analysis and Power BI
exported_tables = export_clustering_outputs(
    eval_df=eval_df,
    assignments_df=assignments_df,
    profiles_df=profiles_df,
    sens_df=sens_df,
    stability_df=stability_df,
    output_dir=str(project_root / 'outputs' / 'tables')
)

print("Exported Clustering Output Tables:")
for k, v in exported_tables.items():
    p = Path(v)
    print(f"  - {k:<15}: {p.name} ({p.stat().st_size:,} bytes)")
"""))

# 10. Methodological Limitations
cells.append(make_markdown_cell("""---
## Section H — Methodological Limitations & Analytical Boundaries

### Explicit Constraints:
1. **Sample Size ($N = 36$)**: Observations represent aggregate State/UT jurisdictions for the single reporting year 2023. Small sample size limits the geometric complexity of cluster boundaries.
2. **Composition vs. Absolute Volume**: These clusters group states based on *relative legal and motivational composition*. States with vastly different absolute case totals (e.g., Karnataka vs. Mizoram) belong to the same cluster because their proportional profiles are similar.
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
